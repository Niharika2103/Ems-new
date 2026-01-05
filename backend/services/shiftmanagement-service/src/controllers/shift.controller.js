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
