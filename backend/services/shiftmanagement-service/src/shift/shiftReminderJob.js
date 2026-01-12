import cron from "node-cron";
import pool from "../../config/db.js";
import { sendShiftMail } from "../utils/sendMail.js";

// Runs every day 9:00 AM
cron.schedule("0 9 * * *", async () => {
  const result = await pool.query(`
    SELECT 
      esa.effective_from,
      u.name,
      u.email,
      s.shift_name
    FROM employee_shift_assignment esa
    JOIN user_employees_master u ON u.id = esa.employee_id
    JOIN shift_master s ON s.id = esa.shift_id
    WHERE esa.effective_from = CURRENT_DATE + INTERVAL '1 day'
  `);

  for (const r of result.rows) {
    await sendShiftMail(
      r.email,
      "Shift Reminder",
      `
      Hi ${r.name},<br/><br/>
      This is a reminder that your shift <b>${r.shift_name}</b> starts from <b>tomorrow (${r.effective_from})</b>.
      `
    );
  }
});
