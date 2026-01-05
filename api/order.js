import nodemailer from "nodemailer";

// ==========================
// Zoho SMTP Transport
// ==========================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,          // smtp.zoho.com.cn
  port: Number(process.env.SMTP_PORT),  // 465
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
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
    // ✅ 和你前端 JSON 完全一致
    const {
      full_name,
      birth_date,
      birth_time,
      birth_place,
      email,
      is_test = false,
    } = req.body;

    // ✅ 正确校验
    if (!full_name || !birth_date) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["full_name", "birth_date"],
        received: req.body,
      });
    }

    // =========================
    // ===== TEST MODE =========
    // =========================
    if (is_test === true) {
      const content = `
        Name: ${full_name}<br/>
        Birth: ${birth_date} ${birth_time || ""}<br/>
        Place: ${birth_place || "Unknown"}<br/><br/>
        <strong>Five-Element Insight (TEST):</strong><br/>
        Your chart shows a Water-dominant signature with supportive Metal energy.
      `;

      if (email) {
        await transporter.sendMail({
          from: `"Eastern Alchemy" <${process.env.SMTP_USER}>`,
          to: email,
          subject: "Eastern Alchemy · TEST Report",
          html: `
            <div style="font-family: Arial, sans-serif; line-height:1.6;">
              <h2>Eastern Alchemy · Test Delivery</h2>
              <p>Hello ${full_name},</p>
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
        content,
        mail_sent: !!email,
      });
    }

    // =========================
    // ===== PAID MODE =========
    // =========================
    return res.status(200).json({
      success: true,
      order_status: "PAID_RECEIVED",
      message: "Payment confirmed. Content generation queued.",
    });

  } catch (err) {
    console.error("ORDER ERROR:", err);
    return res.status(500).json({
      error: "Order processing failed",
      message: err.message,
    });
  }
}
