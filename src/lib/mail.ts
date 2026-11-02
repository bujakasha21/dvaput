import nodemailer from "nodemailer";

type Mail = { to: string; subject: string; html: string; text: string };

export async function sendMail(mail: Mail) {
  if (!process.env.SMTP_HOST) {
    // Dev fallback: bez SMTP-a mail ide u terminal
    console.log(`\n📧 [mail] To: ${mail.to}\nSubject: ${mail.subject}\n${mail.text}\n`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({ from: process.env.MAIL_FROM, ...mail });
}
