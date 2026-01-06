import nodemailer from "nodemailer";

export default async function handler(req, res) {
  try {
    const user = process.env.SMTP2GO_USER;
    const pass = process.env.SMTP2GO_PASS;

    if (!user || !pass) {
      return res.status(500).json({ ok: false, error: "Missing SMTP2GO_USER/SMTP2GO_PASS" });
    }

    const transporter = nodemailer.createTransport({
      host: "mail.smtp2go.com",
      port: 587,
      secure: false,
      auth: { user, pass },
    });

    const to = req.query.to || "your_test_email@gmail.com";

    const info = await transporter.sendMail({
      from: '"Eastern Alchemy" <ruby@easternalchemy.one>',
      to,
      subject: "SMTP2GO Test – Eastern Alchemy",
      html: "<p>🎉 SMTP2GO is working from Vercel!</p>",
    });

    return res.status(200).json({ ok: true, messageId: info.messageId });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}

