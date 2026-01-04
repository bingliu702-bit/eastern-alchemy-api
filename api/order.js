import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

// 初始化 MailerSend
const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      name,
      birth_date,
      email,
      mode = "PAID"
    } = req.body;

    // 基础校验
    if (!name || !birth_date) {
      return res.status(400).json({
        error: "Missing required fields"
      });
    }

    // =========================
    // ===== TEST MODE =========
    // =========================
    if (mode === "TEST") {
      const content = `TEST MODE: ${name}, your Five-Element energy shows a Water-dominant signature.`;

      // 👉 TEST 模式：发测试邮件
      if (email) {
        const from = new Sender(
          process.env.MAILERSEND_FROM,
          process.env.MAILERSEND_FROM_NAME || "Eastern Alchemy"
        );

        const recipients = [
          new Recipient(email, name)
        ];

        const emailParams = new EmailParams()
          .setFrom(from)
          .setTo(recipients)
          .setSubject("Eastern Alchemy · TEST Report")
          .setHtml(`
            <div style="font-family: Arial, sans-serif; line-height:1.6;">
              <h2>Eastern Alchemy · Test Delivery</h2>
              <p>Hello ${name},</p>
              <p>${content}</p>
              <p style="color:#888;font-size:12px;">This is a TEST email.</p>
            </div>
          `);

        await mailerSend.email.send(emailParams);
      }

      return res.status(200).json({
  success: true,
  version: "ORDER_API_V2_WITH_MAILERSEND",
  order_status: "TEST_COMPLETED",
  next_step: "CONTENT_READY",
  content,
  mail_sent: !!email
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
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          birth_date,
          mode: "PAID"
        })
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
      content: generateResult.content
    });

  } catch (err) {
    console.error("ORDER ERROR:", err);
    return res.status(500).json({
      error: "Order processing failed",
      message: err.message
    });
  }
}
