import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

export async function sendTestEmail({ toEmail, name, content }) {
  const from = new Sender(
    process.env.MAILERSEND_FROM,
    process.env.MAILERSEND_FROM_NAME || "Eastern Alchemy"
  );

  const recipients = [new Recipient(toEmail, name || "")];

  const html = `
    <div style="font-family: Inter, Arial, sans-serif; line-height:1.6;">
      <h2>Eastern Alchemy · Test Delivery</h2>
      <p>Hello ${name || "friend"},</p>
      <p>${content}</p>
      <p style="color:#888; font-size:12px;">(TEST MODE)</p>
    </div>
  `;

  const params = new EmailParams()
    .setFrom(from)
    .setTo(recipients)
    .setSubject("Eastern Alchemy · TEST Report")
    .setHtml(html);

  return await mailerSend.email.send(params);
}

