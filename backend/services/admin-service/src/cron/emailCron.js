import cron from "node-cron";
import db from "../config/db.js";
import { sendEmail, sendTemplateEmailToAll } from "../services/emailserviceadmin.js";

/* --------------------------------------------------------------
   GET COMPANY NAME FROM SYSTEM SETTINGS
-------------------------------------------------------------- */
async function getCompanyName() {
  const settingsRes = await db.query("SELECT settings FROM system_settings LIMIT 1");
  const settings = settingsRes.rows[0]?.settings || {};
  return settings.company_name || "Zentrix"; // Default fallback
}

/* ==============================================================
   🎂 DAILY BIRTHDAY + ANNIVERSARY CRON (RUNS AT 9:00 AM)
============================================================== */
cron.schedule("0 9 * * *", async () => {
  console.log("⏰ Birthday & Anniversary Cron Started...");

  try {
    const companyName = await getCompanyName();

    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    /* ----------------------------------------------------
       🎂 1) BIRTHDAY EMPLOYEES 
    ---------------------------------------------------- */
    const birthdayQuery = await db.query(
      `SELECT * FROM user_employees_master 
       WHERE is_active = true 
       AND dob IS NOT NULL
       AND EXTRACT(MONTH FROM dob) = $1
       AND EXTRACT(DAY FROM dob) = $2`,
      [month, day]
    );

    const birthdayEmployees = birthdayQuery.rows;

    if (birthdayEmployees.length > 0) {
      const templateRes = await db.query(
        `SELECT * FROM email_templates 
         WHERE category='wishes' 
         AND template_name ILIKE '%birthday%' 
         AND status='active'
         LIMIT 1`
      );

      if (templateRes.rows.length > 0) {
        const template = templateRes.rows[0];

        for (const emp of birthdayEmployees) {
          let body = template.body_html
            .replace(/{employee_name}/g, emp.name)
            .replace(/{company_name}/g, companyName)
            .replace(/{occasion}/g, "Birthday");

          let subject = template.subject.replace(/{employee_name}/g, emp.name);

          await sendEmail(emp.email, subject, body);
          console.log(`🎂 Birthday Mail Sent → ${emp.email}`);
        }
      }
    }

    /* ----------------------------------------------------
       🎊 2) WORK ANNIVERSARY EMPLOYEES
    ---------------------------------------------------- */
    const anniversaryQuery = await db.query(
      `SELECT * FROM user_employees_master
       WHERE is_active = true 
       AND date_of_joining IS NOT NULL
       AND EXTRACT(MONTH FROM date_of_joining) = $1
       AND EXTRACT(DAY FROM date_of_joining) = $2`,
      [month, day]
    );

    const anniversaryEmployees = anniversaryQuery.rows;

    if (anniversaryEmployees.length > 0) {
      const templateRes = await db.query(
        `SELECT * FROM email_templates 
         WHERE category='wishes' 
         AND template_name ILIKE '%anniversary%' 
         AND status='active'
         LIMIT 1`
      );

      if (templateRes.rows.length > 0) {
        const template = templateRes.rows[0];

        for (const emp of anniversaryEmployees) {
          let body = template.body_html
            .replace(/{employee_name}/g, emp.name)
            .replace(/{company_name}/g, companyName)
            .replace(/{occasion}/g, "Work Anniversary");

          let subject = template.subject.replace(/{employee_name}/g, emp.name);

          await sendEmail(emp.email, subject, body);
          console.log(`🎊 Anniversary Mail Sent → ${emp.email}`);
        }
      }
    }

    console.log("✅ Birthday & Anniversary Cron Completed.");

  } catch (err) {
    console.error("❌ Birthday/Anniversary Cron Error:", err.message);
  }
});

/* ==============================================================
   🟩 DAILY ONBOARDING EMAIL CRON (RUNS AT 9:05 AM)
============================================================== */
cron.schedule("5 9 * * *", async () => {
  try {
    console.log("⏳ Onboarding Email Cron Started...");

    const result = await db.query(
      "SELECT * FROM email_templates WHERE category = 'onboarding' AND status = 'active' LIMIT 1"
    );

    if (result.rows.length === 0) {
      console.log("⚠ No active onboarding template found.");
      return;
    }

    const template = result.rows[0];

    // Uses updated service logic
    await sendTemplateEmailToAll(template);

    console.log("✔ Onboarding Emails Sent Successfully.");
  } catch (err) {
    console.error("❌ Onboarding Cron Error:", err.message);
  }
});
/* ==============================================================
   📄 MONTHLY PAYSLIP EMAIL CRON (Runs on 3rd day @ 9:00 AM)
============================================================== */
cron.schedule("0 9 3 * *", async () => {
  console.log("📄 Payslip Cron Started...");

  try {
    const companyName = await getCompanyName();

    // 1️⃣ Get active payslip template
    const templateRes = await db.query(
      `SELECT * FROM email_templates
       WHERE category='payslip' 
       AND status='active'
       LIMIT 1`
    );

    if (templateRes.rows.length === 0) {
      console.log("⚠ No active payslip template found.");
      return;
    }

    const template = templateRes.rows[0];

    // 2️⃣ Get all active employees
    const employeesRes = await db.query(
      `SELECT * FROM user_employees_master
       WHERE is_active = true 
       AND email IS NOT NULL`
    );

    const employees = employeesRes.rows;

    if (employees.length === 0) {
      console.log("⚠ No employees found for payslip email.");
      return;
    }

    console.log(`➡ Sending payslip emails to ${employees.length} employees...`);

    // 3️⃣ Get current month/year for template replacement
    const today = new Date();
    const month = today.toLocaleString("en-US", { month: "long" });
    const year = today.getFullYear();

    for (const emp of employees) {
      let body = template.body_html
        .replace(/{employee_name}/g, emp.name)
        .replace(/{employee_id}/g, emp.employee_id)
        .replace(/{department}/g, emp.department)
        .replace(/{position}/g, emp.position)
        .replace(/{company_name}/g, companyName)
        .replace(/{month}/g, month)
        .replace(/{year}/g, year);

      let subject = template.subject
        .replace(/{employee_name}/g, emp.name)
        .replace(/{month}/g, month)
        .replace(/{year}/g, year)
        .replace(/{company_name}/g, companyName);

      await sendEmail(emp.email, subject, body);
      console.log(`📄 Payslip Mail Sent → ${emp.email}`);
    }

    console.log("✔ Payslip Cron Completed.");

  } catch (err) {
    console.error("❌ Payslip Cron Error:", err.message);
  }
});
/* ==============================================================
   🟦 PROBATION COMPLETED EMAIL CRON (Runs Daily @ 12:10 AM)
   Category used: 'other'
============================================================== */
cron.schedule("10 0 * * *", async () => {
  console.log("⏳ Probation Completed Cron Started...");

  try {
    const companyName = await getCompanyName();

    const today = new Date().toISOString().split("T")[0];

    // 1️⃣ Get employees whose probation is completed
    const probationRes = await db.query(
      `
      SELECT 
        p.probationid,
        p.employee_id,
        u.name,
        u.email
      FROM probation p
      JOIN user_employees_master u ON u.id = p.employee_id
      WHERE p.status = 'active'
      AND p.enddate < $1
      AND u.email IS NOT NULL
      `,
      [today]
    );

    if (probationRes.rows.length === 0) {
      console.log("ℹ No completed probations found.");
      return;
    }

    // 2️⃣ Fetch probation completed template (category = other)
    const templateRes = await db.query(
      `
      SELECT * FROM email_templates
      WHERE category = 'other'
      AND template_name ILIKE '%Probation Completed%'
      AND status = 'active'
      LIMIT 1
      `
    );

    if (templateRes.rows.length === 0) {
      console.log("⚠ Probation completed template not found.");
      return;
    }

    const template = templateRes.rows[0];

    // 3️⃣ Send email to each employee
    for (const emp of probationRes.rows) {
      const body = template.body_html
        .replace(/{employee_name}/g, emp.name)
        .replace(/{company_name}/g, companyName);

      const subject = template.subject
        .replace(/{employee_name}/g, emp.name)
        .replace(/{company_name}/g, companyName);

      await sendEmail(emp.email, subject, body);

      console.log(`✅ Probation completed mail sent → ${emp.email}`);

      // OPTIONAL: mark probation as completed
      await db.query(
        `
        UPDATE probation
        SET status = 'completed', updatedat = NOW()
        WHERE probationid = $1
        `,
        [emp.probationid]
      );
    }

    console.log("✔ Probation Completed Cron Finished.");

  } catch (err) {
    console.error("❌ Probation Completed Cron Error:", err.message);
  }
});
