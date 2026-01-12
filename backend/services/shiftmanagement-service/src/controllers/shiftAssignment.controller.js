import pool from "../../config/db.js";


import { sendShiftMail } from "../utils/sendMail.js";

export const assignShift = async (req, res) => {
  try {
    const {
      employee_id,
      shift_id,
      effective_from,
      effective_to,
      ot_allowed,
      max_ot_hours,
      reason
    } = req.body;

    //  Prevent overlapping assignments
    const overlap = await pool.query(
      `
      SELECT 1
      FROM employee_shift_assignment
      WHERE employee_id = $1
      AND daterange(effective_from, effective_to, '[)')
          && daterange($2, $3, '[)')
      `,
      [employee_id, effective_from, effective_to]
    );

    if (overlap.rowCount > 0) {
      return res
        .status(400)
        .json({ message: "Shift already assigned for this period" });
    }

    // Insert assignment
    const { rows } = await pool.query(
      `
      INSERT INTO employee_shift_assignment
      (employee_id, shift_id, effective_from, effective_to,
       ot_allowed, max_ot_hours, reason)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        employee_id,
        shift_id,
        effective_from,
        effective_to,
        ot_allowed,
        max_ot_hours,
        reason
      ]
    );

    const assignment = rows[0];

    // Get employee details
    const emp = await pool.query(
      `SELECT name, email FROM user_employees_master WHERE id=$1`,
      [employee_id]
    );

    // Get shift details
    const shift = await pool.query(
      `SELECT shift_name FROM shift_master WHERE id=$1`,
      [shift_id]
    );

    const empName = emp.rows[0].name;
    const email = emp.rows[0].email;
    const shiftName = shift.rows[0].shift_name;

    // Date checks
    const effDate = new Date(effective_from);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    effDate.setHours(0, 0, 0, 0);

    // CASE 1 — Effective today -> send email immediately
    if (effDate.getTime() === today.getTime()) {
      await sendShiftMail(
        email,
        "Shift Assigned",
        `
        Hi ${empName},<br/><br/>

        Your shift <b>${shiftName}</b> has been assigned and is effective from <b>today</b>.<br/><br/>

        <b>Shift Details</b><br/>
        • Effective From: ${effective_from}<br/>
        • Effective To: ${effective_to}<br/>
        • OT Allowed: ${ot_allowed ? "Yes" : "No"}<br/>
        • Max OT Hours: ${ot_allowed ? max_ot_hours : "Not Applicable"}<br/>
        • Reason: ${reason || "Not Provided"}<br/><br/>

        Regards,<br/>
        HR Team
        `
      );
    }

    // CASE 2 — Future date, reminder email handled by cron job automatically
    res.status(201).json(assignment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to assign shift" });
  }
};


/* ASSIGNMENT HISTORY */
export const getAssignmentHistory = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        esa.id,
        esa.employee_id,
        esa.shift_id,
        u.name AS employee_name,
        s.shift_name,
        esa.effective_from,
        esa.effective_to,
        esa.ot_allowed,
        esa.max_ot_hours,
        CASE
          WHEN CURRENT_DATE < esa.effective_from THEN 'PENDING'
          WHEN CURRENT_DATE BETWEEN esa.effective_from AND esa.effective_to THEN 'CURRENT'
          ELSE 'PAST'
        END AS status
      FROM employee_shift_assignment esa
      JOIN user_employees_master u ON u.id = esa.employee_id
      JOIN shift_master s ON s.id = esa.shift_id
      ORDER BY esa.effective_from DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load history" });
  }
};


export const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      shift_id,
      effective_from,
      effective_to,
      ot_allowed,
      max_ot_hours,
      reason
    } = req.body;

    // 1️⃣ Fetch existing assignment
    const { rows } = await pool.query(
      `
      SELECT employee_id, effective_from
      FROM employee_shift_assignment
      WHERE id = $1
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const existingFrom = rows[0].effective_from;

    // 2️⃣ Block edit if not PENDING
    if (new Date(existingFrom) <= new Date()) {
      return res
        .status(400)
        .json({ message: "Only PENDING shifts can be edited" });
    }

    // 3️⃣ Update allowed fields only
    await pool.query(
      `
      UPDATE employee_shift_assignment
      SET shift_id = $1,
          effective_from = $2,
          effective_to = $3,
          ot_allowed = $4,
          max_ot_hours = $5,
          reason = $6
      WHERE id = $7
      `,
      [
        shift_id,
        effective_from,
        effective_to,
        ot_allowed,
        max_ot_hours,
        reason,
        id
      ]
    );

    res.json({ message: "Shift updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update assignment" });
  }
};

/* GET CURRENT SHIFT BY EMPLOYEE ID + DATE */
export const getCurrentShiftByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const { rows } = await pool.query(
      `
      SELECT
        esa.id,
        esa.employee_id,
        esa.shift_id,
        s.shift_name,
        s.start_time,
        s.end_time,
        esa.effective_from,
        esa.effective_to,
        esa.ot_allowed,
        esa.max_ot_hours
      FROM employee_shift_assignment esa
      JOIN shift_master s ON s.id = esa.shift_id
      WHERE esa.employee_id = $1
        AND $2::date BETWEEN esa.effective_from::date AND esa.effective_to::date
      ORDER BY esa.effective_from DESC
      LIMIT 1
      `,
      [employeeId, date]
    );

    res.json(rows[0] || null);
  } catch (err) {
    console.error("Failed to fetch current shift", err);
    res.status(500).json({ message: "Failed to fetch current shift" });
  }
};
