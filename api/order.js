// pages/api/order.js
import nodemailer from "nodemailer";
import { google } from "googleapis";

function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

async function getGmailAccessToken() {
  const clientId = required("GMAIL_OAUTH_CLIENT_ID");
  const clientSecret = required("GMAIL_OAUTH_CLIENT_SECRET");
  const refreshToken = required("GMAIL_OAUTH_REFRESH_TOKEN");

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oAuth2Client.setCredentials({ refresh_token: refreshToken });

  const tokenResp = await oAuth2Client.getAccessToken();
  const accessToken = tokenResp?.token;

  if (!accessToken) {
    throw new Error("Failed to obtain Gmail access token from refresh token.");
  }
  return accessToken;
}

function buildTransporter({ accessToken }) {
  const gmailUser = required("GMAIL_USER"); // 例如 ruby@easternalchemy.one 或你的gmail地址

  // ✅ 关键：明确 OAuth2 参数，迫使 Nodemailer 走 XOAUTH2
  // ✅ 不要传 pass / SMTP_PASS
  // ✅ 不要用 createTransport({host, port, authMethod:'PLAIN'}) 这类写法
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: gmailUser,
      clientId: required("GMAIL_OAUTH_CLIENT_ID"),
      clientSecret: required("GMAIL_OAUTH_CLIENT_SECRET"),
      refreshToken: required("GMAIL_OAUTH_REFRESH_TOKEN"),
      accessToken,
    },
  });
}

function isTestOrder(payload) {
  // 你可以按你项目逻辑修改：例如 email 包含 +test / 或者 payload.is_test = true
  return Boolean(payload?.is_test) || String(payload?.email || "").includes("+test");
}

export default async function handler(req, res) {
  const requestId = `EA_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, requestId, error: "Method Not Allowed" });
    }

    const {
      full_name,
      birth_date,
      birth_time,
      birth_place,
      email,
      is_test,
    } = req.body || {};

    if (!full_name || !birth_date || !birth_time || !birth_place || !email) {
      return res.status(400).json({
        ok: false,
        requestId,
        error: "Missing required fields: full_name, birth_date, birth_time, birth_place, email",
      });
    }

    // 你现阶段先把“内容生成/PDF”留空也没关系：先把 Gmail OAuth 发信跑通
    const testFlag = isTestOrder({ is_test, email });

    // 1) 获取 access token（每次请求可拿一次，简单可靠）
    const accessToken = await getGmailAccessToken();

    // 2) 建 transporter
    const transporter = buildTransporter({ accessToken });

    // 3) verify（可选但强烈建议：能直接看出有没有还在走 PLAIN / 或者 token 问题）
    //    verify 不会发邮件，只做 SMTP/OAuth2 握手验证
    await transporter.verify();

    const gmailUser = required("GMAIL_USER");
    const fromName = process.env.MAIL_FROM_NAME || "Eastern Alchemy";
    const fromEmail = process.env.MAIL_FROM_EMAIL || gmailUser;

    // ⚠️ Gmail 的 fromEmail 建议 = gmailUser 或者 Gmail 已设置的 “Send mail as” 别名
    // 否则可能被 Gmail 改写 from 或直接拒绝
    const from = `${fromName} <${fromEmail}>`;

    const subject = testFlag
      ? `✅ [TEST] Eastern Alchemy Order Received (${requestId})`
      : `✅ Eastern Alchemy Order Received (${requestId})`;

    const text = [
      `Hi ${full_name},`,
      ``,
      `We received your information successfully.`,
      `Order ID: ${requestId}`,
      `Name: ${full_name}`,
      `Birth: ${birth_date} ${birth_time}`,
      `Place: ${birth_place}`,
      `Email: ${email}`,
      ``,
      `Status: ${testFlag ? "TEST (skip payment)" : "RECEIVED (pending payment / generation)"}`,
      ``,
      `— Eastern Alchemy`,
    ].join("\n");

    const info = await transporter.sendMail({
      from,
      to: email,
      replyTo: process.env.MAIL_REPLY_TO || fromEmail,
      subject,
      text,
    });

    return res.status(200).json({
      ok: true,
      requestId,
      messageId: info?.messageId || null,
      accepted: info?.accepted || null,
    });
  } catch (err) {
    // 把关键错误信息完整打到 Vercel Logs
    console.error("ORDER_API_ERROR", {
      requestId,
      message: err?.message,
      code: err?.code,
      response: err?.response,
      responseCode: err?.responseCode,
      stack: err?.stack,
    });

    return res.status(500).json({
      ok: false,
      requestId,
      error: err?.message || "Internal Server Error",
    });
  }
}
