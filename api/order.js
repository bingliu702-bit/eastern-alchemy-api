import nodemailer from "nodemailer";

// ===== 强制使用 OAuth2（不允许 SMTP）=====
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.GMAIL_SENDER,
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
  },
});

// 🔒 防御性检查（非常重要）
if (!process.env.GMAIL_REFRESH_TOKEN) {
  throw new Error("GMAIL_REFRESH_TOKEN is missing");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { full_name, birth_date, email, is_test } = req.body;

    if (!full_name || !birth_date) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["full_name", "birth_date"],
        received: req.body,
      });
    }

    if (is_test === true) {
      const info = await transporter.sendMail({
        from: `"Eastern Alchemy" <${process.env.GMAIL_SENDER}>`,
        to: email,
        subject: "Eastern Alchemy · Test Report",
        html: `<p>Hello ${full_name}, this is a Gmail OAuth test email.</p>`,
      });

      return res.status(200).json({
        success: true,
        transport: "GMAIL_OAUTH2",
        messageId: info.messageId,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Paid flow not enabled",
    });
  } catch (err) {
    console.error("ORDER ERROR:", err);
    return res.status(500).json({
      error: "Order processing failed",
      message: err.message,
    });
  }
}

