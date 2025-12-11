import nodemailer from "nodemailer";
import dotenv from "dotenv";
 
dotenv.config();
 
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),  // Must use 465 for Gmail
  secure: true,                         // Gmail SMTP requires secure:true on 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,        // MUST BE 16-digit app password without spaces
  },
  tls: {
    rejectUnauthorized: false,
  },
});
 
export async function sendEmail(
  to,
  subject,
  html,
  attachmentPath = null,
  attachmentName = null
) {
  try {
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
    };
 
    if (attachmentPath && attachmentName) {
      mailOptions.attachments = [
        {
          filename: attachmentName,
          path: attachmentPath,
          contentType: "application/pdf",
        },
      ];
    }
 
    await transporter.sendMail(mailOptions);
    console.log(
      `📧 Email sent to ${to} ${
        attachmentName ? `with attachment: ${attachmentName}` : ""
      }`
    );
  } catch (err) {
    console.error("❌ Email error:", err.message);
    throw err;
  }
}
