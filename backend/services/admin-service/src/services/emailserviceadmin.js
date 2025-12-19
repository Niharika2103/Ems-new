import nodemailer from "nodemailer";
import dotenv from "dotenv";
import db from "../config/db.js";

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
   ⭐ FIXED FUNCTION — BRANDING + WHITE LABEL SUPPORT ADDED
   (FULL FINAL VERSION)
========================================================== */
export async function sendTemplateEmailToAll(template) {
  try {
    console.log(`➡ Processing template category: ${template.category}`);

    /* -----------------------------------------------------
       1) FETCH BRANDING + WHITE LABEL SETTINGS
    ------------------------------------------------------ */
    const settingsQuery = await db.query(
      "SELECT settings FROM system_settings LIMIT 1"
    );
    const settings = settingsQuery.rows[0]?.settings || {};

    let brandingCompany = "Zentrix";
    let brandingLogo = null;

    /* --------------------------
       CASE 1 → branding usage.email = "true"
    --------------------------- */
    if (settings.branding?.usage?.email === "true") {
      if (settings.branding.companyName) {
        brandingCompany = settings.branding.companyName;
      }
      if (settings.branding.logoUrl) {
        brandingLogo = settings.branding.logoUrl;
      }
    }

    /* --------------------------
       CASE 2 → White-label enabled
    --------------------------- */
    else if (settings.whiteLabel?.enabled === true) {
      const tenantKey = settings.whiteLabel.activeTenant;

      if (tenantKey) {
        const tenantData = await db.query(
          `SELECT * FROM tenant_branding WHERE tenant_key=$1 LIMIT 1`,
          [tenantKey]
        );

        if (tenantData.rows.length > 0) {
          brandingCompany =
            tenantData.rows[0].company_name || brandingCompany;
          brandingLogo = tenantData.rows[0].logo_url || brandingLogo;
        }
      }
    }

    /* ---- FINAL BRAND VARIABLES ---- */
    const companyName = brandingCompany;
    const companyLogo = brandingLogo;

    let employees = [];

    /* -----------------------------------------------------
       🎂 BIRTHDAY TEMPLATE
    ------------------------------------------------------ */
    if (
      template.category === "wishes" &&
      template.template_name.toLowerCase().includes("birthday")
    ) {
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

      if (employees.length === 0)
        return { count: 0, message: "No birthdays today" };
    }

    /* -----------------------------------------------------
       🎉 ANNIVERSARY TEMPLATE
    ------------------------------------------------------ */
    else if (
      template.category === "wishes" &&
      template.template_name.toLowerCase().includes("anniversary")
    ) {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();

      const result = await db.query(
        `SELECT * FROM user_employees_master 
         WHERE is_active = true AND email IS NOT NULL
         AND EXTRACT(MONTH FROM date_of_joining) = $1
         AND EXTRACT(DAY FROM date_of_joining) = $2`,
        [month, day]
      );

      employees = result.rows;

      if (employees.length === 0)
        return { count: 0, message: "No anniversaries today" };
    }

    /* -----------------------------------------------------
       💰 PAYSLIP TEMPLATE (manual send)
    ------------------------------------------------------ */
    else if (template.category === "payslip") {
      const result = await db.query(
        `SELECT * FROM user_employees_master
         WHERE is_active = true AND email IS NOT NULL`
      );

      employees = result.rows;

      if (employees.length === 0)
        return { count: 0, message: "No employees found for payslip" };
    }

    /* -----------------------------------------------------
       🟩 ONBOARDING TEMPLATE (joining tomorrow)
    ------------------------------------------------------ */
    else if (template.category === "onboarding") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const tomorrowDate = tomorrow.toISOString().split("T")[0];

      const result = await db.query(
        `SELECT * FROM user_employees_master 
         WHERE is_active = true AND date_of_joining = $1`,
        [tomorrowDate]
      );

      employees = result.rows;

      if (employees.length === 0)
        return { count: 0, message: "No onboarding emails today" };
    }

    /* -----------------------------------------------------
       🟦 ALL OTHER TEMPLATES → Send to all employees
    ------------------------------------------------------ */
    else {
      const result = await db.query(
        `SELECT * FROM user_employees_master 
         WHERE is_active = true AND email IS NOT NULL`
      );

      employees = result.rows;
    }

    /* -----------------------------------------------------
       ✉ SEND EMAILS
    ------------------------------------------------------ */
    // ADD THIS ABOVE THE FUNCTION
function decodeHtmlEntities(text) {
  if (!text) return "";
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

 for (const emp of employees) {
  let body = decodeHtmlEntities(template.body_html); // FIX #1
  let subject = decodeHtmlEntities(template.subject);

  const today = new Date();
  const month = today.toLocaleString("en-US", { month: "long" });
  const year = today.getFullYear();

  /* ---- VARIABLE REPLACEMENTS ---- */
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

  /* -------------------------------------------
     FINAL EMAIL WRAPPER (Gmail Compatible)
  --------------------------------------------*/
  const finalHTML = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.7; font-size: 15px; color: #000; padding:20px;">

        ${companyLogo ? `
          <div style="text-align:center; margin-bottom:20px;">
            <img src="${companyLogo}" style="max-width:180px; height:auto;" />
          </div>
        ` : ""}

        ${body}

        <br><br>

        <p style="font-size:14px; color:#333;">
          Regards,<br>
          <strong>${companyName}</strong>
        </p>

      </body>
    </html>
  `;

  await sendEmail(emp.email, subject, finalHTML);

  await db.query(
    `INSERT INTO email_logs 
      (template_id, employee_id, email, subject, body_html, status, sent_at)
     VALUES ($1, $2, $3, $4, $5, 'sent', NOW())`,
    [template.id, emp.id, emp.email, subject, finalHTML]
  );
}


    return { count: employees.length, message: "Emails sent successfully" };
  } catch (err) {
    console.error("❌ Bulk email sending failed:", err.message);
    throw err;
  }
}
