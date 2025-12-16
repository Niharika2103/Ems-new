// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
 
// dotenv.config();
 
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT),  // Must use 465 for Gmail
//   secure: true,                         // Gmail SMTP requires secure:true on 465
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,        // MUST BE 16-digit app password without spaces
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });
 
// export async function sendEmail(
//   to,
//   subject,
//   html,
//   attachmentPath = null,
//   attachmentName = null
// ) {
//   try {
//     const mailOptions = {
//       from: process.env.FROM_EMAIL,
//       to,
//       subject,
//       html,
//     };
 
//     if (attachmentPath && attachmentName) {
//       mailOptions.attachments = [
//         {
//           filename: attachmentName,
//           path: attachmentPath,
//           contentType: "application/pdf",
//         },
//       ];
//     }
 
//     await transporter.sendMail(mailOptions);
//     console.log(
//       `📧 Email sent to ${to} ${
//         attachmentName ? `with attachment: ${attachmentName}` : ""
//       }`
//     );
//   } catch (err) {
//     console.error("❌ Email error:", err.message);
//     throw err;
//   }
// }



import nodemailer from "nodemailer";
import dotenv from "dotenv";
import db from "../config/db.js";  // Make sure path is correct

dotenv.config();

/* ==========================================================
   ORIGINAL TRANSPORTER (UNCHANGED)
========================================================== */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),  
  secure: true,                         
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,        
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/* ==========================================================
   ORIGINAL sendEmail FUNCTION (UNCHANGED)
========================================================== */
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

/* ==========================================================
   ⭐ FIXED FUNCTION: SEND TEMPLATE EMAIL TO ALL EMPLOYEES
   (Supports onboarding only for tomorrow, company name, variables)
========================================================== */
export async function sendTemplateEmailToAll(template) {
  try {
    console.log(`➡ Processing template category: ${template.category}`);

    // 1) Fetch company name
    const settingsQuery = await db.query("SELECT settings FROM system_settings LIMIT 1");
    let companyName = settingsQuery.rows[0]?.settings?.company_name || "Zentrix";

    let employees = [];

    /* ----------------------------------------------------
       🎂 BIRTHDAY TEMPLATE (using dob)
    ---------------------------------------------------- */
    if (template.category === "wishes" && template.template_name.toLowerCase().includes("birthday")) {

      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();

      const result = await db.query(
        `SELECT * FROM user_employees_master 
         WHERE is_active = true 
         AND email IS NOT NULL
         AND EXTRACT(MONTH FROM dob) = $1
         AND EXTRACT(DAY FROM dob) = $2`,
        [month, day]
      );

      employees = result.rows;

      if (employees.length === 0) {
        console.log("⚠ No birthdays today.");
        return { count: 0, message: "No birthdays today" };
      }
    }

    /* ----------------------------------------------------
       🎉 ANNIVERSARY TEMPLATE
    ---------------------------------------------------- */
    else if (template.category === "wishes" && template.template_name.toLowerCase().includes("anniversary")) {

      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();

      const result = await db.query(
        `SELECT * FROM user_employees_master 
         WHERE is_active = true
         AND email IS NOT NULL
         AND EXTRACT(MONTH FROM date_of_joining) = $1
         AND EXTRACT(DAY FROM date_of_joining) = $2`,
        [month, day]
      );

      employees = result.rows;

      if (employees.length === 0) {
        console.log("⚠ No anniversaries today.");
        return { count: 0, message: "No anniversaries today" };
      }
    }

    /* ----------------------------------------------------
       📄 PAYSLIP TEMPLATE
       Send to ALL employees when triggered manually
    ---------------------------------------------------- */
    else if (template.category === "payslip") {

      const result = await db.query(
        `SELECT * FROM user_employees_master
         WHERE is_active = true 
         AND email IS NOT NULL`
      );

      employees = result.rows;

      if (employees.length === 0) {
        console.log("⚠ No employees found for payslip.");
        return { count: 0, message: "No employees found for payslip" };
      }
    }

    /* ----------------------------------------------------
       🟩 ONBOARDING TEMPLATE → employees joining tomorrow
    ---------------------------------------------------- */
    else if (template.category === "onboarding") {

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDate = tomorrow.toISOString().split("T")[0];

      const result = await db.query(
        `SELECT * FROM user_employees_master 
         WHERE is_active = true 
         AND date_of_joining = $1`,
        [tomorrowDate]
      );

      employees = result.rows;

      if (employees.length === 0) {
        console.log("⚠ No employees joining tomorrow.");
        return { count: 0, message: "No onboarding emails today" };
      }
    }

    /* ----------------------------------------------------
       🟦 OTHER TEMPLATES → Send to all employees
    ---------------------------------------------------- */
    else {
      const result = await db.query(
        `SELECT * FROM user_employees_master 
         WHERE is_active = true 
         AND email IS NOT NULL`
      );

      employees = result.rows;
    }

    /* ----------------------------------------------------
       ✉ SEND EMAILS
    ---------------------------------------------------- */
    for (const emp of employees) {

      let body = template.body_html;
      let subject = template.subject;

      // Month + Year for payslip
      const today = new Date();
      const month = today.toLocaleString("en-US", { month: "long" });
      const year = today.getFullYear();

      // Replace variables
      body = body.replace(/{employee_name}/g, emp.name || "");
      body = body.replace(/{employee_id}/g, emp.employee_id || "");
      body = body.replace(/{department}/g, emp.department || "");
      body = body.replace(/{company_name}/g, companyName);
      body = body.replace(/{date_of_joining}/g, emp.date_of_joining || "");
      body = body.replace(/{occasion}/g, template.template_name);
      body = body.replace(/{month}/g, month);
      body = body.replace(/{year}/g, year);

      subject = subject.replace(/{employee_name}/g, emp.name || "");
      subject = subject.replace(/{company_name}/g, companyName);
      subject = subject.replace(/{month}/g, month);
      subject = subject.replace(/{year}/g, year);

      await sendEmail(emp.email, subject, body);

      await db.query(
        `INSERT INTO email_logs 
        (template_id, employee_id, email, subject, body_html, status, sent_at)
        VALUES ($1, $2, $3, $4, $5, 'sent', NOW())`,
        [template.id, emp.id, emp.email, subject, body]
      );
    }

    return { count: employees.length, message: "Emails sent successfully" };

  } catch (err) {
    console.error("❌ Bulk email sending failed:", err.message);
    throw err;
  }
}

