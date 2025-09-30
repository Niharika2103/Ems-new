// import sgMail from "@sendgrid/mail";
// import dotenv from "dotenv";

// dotenv.config();

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// const VERIFIED_SENDER = process.env.FROM_EMAIL;

// export async function sendEmail(to, subject, html) {
//   try {
//     const msg = {
//       to,
//       from: VERIFIED_SENDER,
//       subject,
//       html,
//     };

//     const response = await sgMail.send(msg);
//     console.log(`📧 Email sent to ${to}`);
//     console.log(response);
//   } catch (err) {
//     console.error("❌ Email error:", err.response?.body || err.message);
//     throw err;
//   }
// }



// services/emailService.js
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const VERIFIED_SENDER = process.env.FROM_EMAIL; // e.g., no-reply@yourdomain.com

/**
 * Send email using Resend
 * @param {string} to - Receiver email
 * @param {string} subject - Email subject
 * @param {string} html - Email body (HTML)
 */
export async function sendEmail(to, subject, html) {
  try {
    const response = await resend.emails.send({
      from: VERIFIED_SENDER, // must be verified sender in Resend
      to,
      subject,
      html,
    });

    console.log(`📧 Email sent to ${to}`, response);
  } catch (err) {
    console.error("❌ Email error:", err.message);
    throw err;
  }
}

