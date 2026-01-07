import pool from "../../config/db.js";

/* CREATE SHIFT */
export const createShift = async (req, res) => {
  try {
    const {
      shift_name,
      start_time,
      end_time,
      break_minutes,
      grace_minutes,
      is_night_shift,
      is_active
    } = req.body;

    const { rows } = await pool.query(
      `
      INSERT INTO shift_master
      (shift_name, start_time, end_time,
       break_minutes, grace_minutes,
       is_night_shift, is_active)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        shift_name,
        start_time,
        end_time,
        break_minutes,
        grace_minutes,
        is_night_shift,
        is_active
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create shift" });
  }
};

/* GET SHIFTS */
export const getShifts = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM shift_master ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch shifts" });
  }
};

/* UPDATE SHIFT */
export const updateShift = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      shift_name,
      start_time,
      end_time,
      break_minutes,
      grace_minutes,
      is_night_shift,
      is_active
    } = req.body;

    const { rows } = await pool.query(
      `
      UPDATE shift_master
      SET shift_name=$1,
          start_time=$2,
          end_time=$3,
          break_minutes=$4,
          grace_minutes=$5,
          is_night_shift=$6,
          is_active=$7
      WHERE id=$8
      RETURNING *
      `,
      [
        shift_name,
        start_time,
        end_time,
        break_minutes,
        grace_minutes,
        is_night_shift,
        is_active,
        id
      ]
    );

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to update shift" });
  }
};

/* HARD DELETE SHIFT */
export const deleteShift = async (req, res) => {
  try {
    const { id } = req.params;

    // Safety check: is shift used?
    const used = await pool.query(
      `
      SELECT 1
      FROM employee_shift_assignment
      WHERE shift_id = $1
      LIMIT 1
      `,
      [id]
    );

    if (used.rowCount > 0) {
      return res.status(400).json({
        message: "Cannot delete. Shift already assigned to employees."
      });
    }

    await pool.query(
      `
      DELETE FROM shift_master
      WHERE id = $1
      `,
      [id]
    );

    res.json({ message: "Shift deleted permanently" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete shift" });
  }
};
