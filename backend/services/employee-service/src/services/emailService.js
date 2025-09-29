// emailService.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Convert port from string to number
const SMTP_PORT = Number(process.env.SMTP_PORT);

// Auto-set secure: true for port 465
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for 587/other
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // allow self-signed certificates
  },
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP connection error:", error.message);
  } else {
    console.log("✅ SMTP server is ready to send emails");
  }
});

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 */
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
