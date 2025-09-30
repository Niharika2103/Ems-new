import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const VERIFIED_SENDER = process.env.FROM_EMAIL;

export async function sendEmail(to, subject, html) {
  try {
    const msg = {
      to,
      from: VERIFIED_SENDER,
      subject,
      html,
    };

    const response = await sgMail.send(msg);
    console.log(`📧 Email sent to ${to}`);
    console.log(response);
  } catch (err) {
    console.error("❌ Email error:", err.response?.body || err.message);
    throw err;
  }
}
