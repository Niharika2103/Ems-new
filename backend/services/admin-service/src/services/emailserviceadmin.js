import nodemailer from "nodemailer";
import dotenv from "dotenv";
 
dotenv.config();
 
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // set to true if using port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // allow self-signed certificates
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
 
    // Add attachment if provided
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

// emailservice