import pool from "../../config/db.js";

/* ASSIGN SHIFT TO EMPLOYEE */
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

    // 🔒 Prevent overlapping assignments
    const overlap = await pool.query(
      `
      SELECT 1
      FROM employee_shift_assignment
      WHERE employee_id = $1
      AND daterange(effective_from, effective_to, '[]')
          && daterange($2, $3, '[]')
      `,
      [employee_id, effective_from, effective_to]
    );

    if (overlap.rowCount > 0) {
      return res
        .status(400)
        .json({ message: "Shift already assigned for this period" });
    }

    const { rows } = await pool.query(
      `
      INSERT INTO employee_shift_assignment
      (employee_id, shift_id,
       effective_from, effective_to,
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

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to assign shift" });
  }
};

/* ASSIGNMENT HISTORY */
export const getAssignmentHistory = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT esa.id,
             u.name AS employee_name,
             s.shift_name,
             esa.effective_from,
             esa.effective_to,
             esa.ot_allowed,
             esa.max_ot_hours
      FROM employee_shift_assignment esa
      JOIN user_employees_master u ON u.id = esa.employee_id
      JOIN shift_master s ON s.id = esa.shift_id
      ORDER BY esa.created_at DESC
      `
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to load history" });
  }
};
