import nodemailer from "nodemailer";

// ==========================
// Zoho SMTP Transport
// ==========================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,          // smtp.zoho.com.cn
  port: Number(process.env.SMTP_PORT),  // 465
  secure: process.env.SMTP_SECURE === "true", // true
  auth: {
    user: process.env.SMTP_USER,        // hello@easternalchemy.one
    pass: process.env.SMTP_PASS,        // Zoho App Password
  },
  tls: {
    // ⭐ 关键：解决 Zoho 中国区 + Vercel TLS 证书问题
    rejectUnauthorized: false,
  },
});

// ==========================
// API Handler
// ==========================
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      name,
      birth_date,
      email,
      mode = "PAID",
    } = req.body;

    // 基础校验
    if (!name || !birth_date) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    // =========================
    // ===== TEST MODE =========
    // =========================
    if (mode === "TEST") {
      const content = `TEST MODE: ${name}, your Five-Element energy shows a Water-dominant signature.`;

      if (email) {
        await transporter.sendMail({
          from: `"Eastern Alchemy" <${process.env.SMTP_USER}>`,
          to: email,
          subject: "Eastern Alchemy · TEST Report",
          html: `
            <div style="font-family: Arial, sans-serif; line-height:1.6;">
              <h2>Eastern Alchemy · Test Delivery</h2>
              <p>Hello ${name},</p>
              <p>${content}</p>
              <p style="color:#888;font-size:12px;">
                This is a TEST email.
              </p>
            </div>
          `,
        });
      }

      return res.status(200).json({
        success: true,
        version: "ORDER_API_V3_ZOHO_SMTP",
        order_status: "TEST_COMPLETED",
        next_step: "CONTENT_READY",
        content,
        mail_sent: !!email,
      });
    }

    // =========================
    // ===== PAID MODE =========
    // =========================
    const generateResponse = await fetch(
      `${process.env.BASE_URL}/api/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          birth_date,
          mode: "PAID",
        }),
      }
    );

    if (!generateResponse.ok) {
      throw new Error("Generate API failed");
    }

    const generateResult = await generateResponse.json();

    return res.status(200).json({
      success: true,
      order_status: "PAID_COMPLETED",
      next_step: "CONTENT_READY",
      content: generateResult.content,
    });
  } catch (err) {
    console.error("ORDER ERROR:", err);
    return res.status(500).json({
      error: "Order processing failed",
      message: err.message,
    });
  }
}

