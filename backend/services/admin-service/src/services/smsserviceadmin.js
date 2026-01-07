// import twilio from "twilio";

// const client = twilio(
//   process.env.TWILIO_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// // Clean Indian numbers (ex: +91 90000 12345 → 9000012345)
// export const cleanPhone = (value) =>
//   value ? value.toString().replace(/\s+/g, "").replace("+91", "") : null;

// export const sendSMS = async (to, message) => {
//   try {
//     if (!to) {
//       console.log("❌ No phone number provided");
//       return;
//     }

//     const cleaned = cleanPhone(to);

//     const finalNumber = `+91${cleaned}`;

//     const response = await client.messages.create({
//       body: message,
//       from: process.env.TWILIO_PHONE,
//       to: finalNumber,
//     });

//     console.log("📲 SMS sent successfully:", response.sid);
//     return { success: true, sid: response.sid };
//   } catch (err) {
//     console.error("❌ SMS sending failed:", err.message);
//     return { success: false, error: err.message };
//   }
// };
// import mysql from "mysql2/promise";

// // EMS DB (not gammu DB)
// const emsDB = mysql.createPool({
//   host: "localhost",
//   user: "ems_user",
//   password: "ems_password",
//   database: "ems_db",
// });

// // Gammu SMSD DB
// const smsDB = mysql.createPool({
//   host: "localhost",
//   user: "smsuser",
//   password: "smspassword",
//   database: "smsd",
// });

// // Clean Indian phone number
// const cleanPhone = (value) =>
//   value
//     ?.toString()
//     .replace(/\s+/g, "")
//     .replace("+91", "")
//     .replace(/^0/, "");

// export const sendInterviewScheduledSMS = async (interviewId) => {
//   try {
//     // 1️⃣ Fetch interview + candidate + job details
//     const [rows] = await emsDB.query(
//       `
//       SELECT
//         a.candidate_name,
//         a.phone,
//         j.job_title,
//         i.interview_date,
//         i.interview_type,
//         i.location
//       FROM interviews i
//       JOIN applications a
//         ON i.application_id = a.application_id
//       JOIN job_posts j
//         ON a.job_id = j.job_id
//       WHERE i.interview_id = ?
//       `,
//       [interviewId]
//     );

//     if (rows.length === 0) {
//       return { success: false, error: "Interview not found" };
//     }

//     const {
//       candidate_name,
//       phone,
//       job_title,
//       interview_date,
//       interview_type,
//       location,
//     } = rows[0];

//     const cleaned = cleanPhone(phone);

//     if (!cleaned || !/^\d{10}$/.test(cleaned)) {
//       return { success: false, error: "Invalid phone number" };
//     }

//     // 2️⃣ Prepare SMS
//     const message = `Hi ${candidate_name}, your interview for ${job_title} is scheduled on ${new Date(
//       interview_date
//     ).toLocaleString()}.
// Mode: ${interview_type}.
// ${location ? `Location/Link: ${location}` : ""}
// - HR Team`;

//     // 3️⃣ Insert into Gammu outbox
//     await smsDB.query(
//       `
//       INSERT INTO outbox (DestinationNumber, TextDecoded, CreatorID)
//       VALUES (?, ?, ?)
//       `,
//       [`+91${cleaned}`, message, "INTERVIEW_SCHEDULE"]
//     );

//     console.log("📨 Interview SMS queued:", cleaned);

//     return { success: true };
//   } catch (err) {
//     console.error("❌ Interview SMS Error:", err.message);
//     return { success: false, error: err.message };
//   }
// };
