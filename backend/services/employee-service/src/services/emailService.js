import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ================= SMTP Transporter =================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  requireTLS: Number(process.env.SMTP_PORT) === 587, // STARTTLS for 587
  tls: {
    rejectUnauthorized: false, // allow self-signed certs
  },
});

// Verify connection on startup
transporter.verify((err, success) => {
  if (err) console.error("❌ SMTP verify failed:", err.message);
  else console.log("✅ SMTP server ready to send emails");
});

// ================== Send Email Function =================
export async function sendEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to} | Message ID: ${info.messageId}`);
  } catch (err) {
    console.error("❌ Email error:", err.message);
    throw err;
  }
}
