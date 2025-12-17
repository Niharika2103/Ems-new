import pool from "../config/db.js";

/* CREATE */
export const createLeaveType = async (req, res) => {
  const {
    name,
    code,
    category,
    accrual,
    carryForward,
    maxBalance,
    requiresCertificate
  } = req.body;

  if (!name || !code || !category || !accrual) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const result = await pool.query(
    `INSERT INTO leave_types
     (name, code, category, accrual_type, carry_forward, max_balance, requires_certificate)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      name,
      code,
      category,
      accrual,
      carryForward || false,
      maxBalance || null,
      requiresCertificate || false
    ]
  );

  res.status(201).json(result.rows[0]);
};

/* READ */
export const getLeaveTypes = async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM leave_types WHERE is_active=true ORDER BY created_at`
  );
  res.json(result.rows);
};

/* UPDATE */
export const updateLeaveType = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    code,
    category,
    accrual,
    carryForward,
    maxBalance,
    requiresCertificate
  } = req.body;

  const result = await pool.query(
    `UPDATE leave_types SET
      name=$1,
      code=$2,
      category=$3,
      accrual_type=$4,
      carry_forward=$5,
      max_balance=$6,
      requires_certificate=$7,
      updated_at=now()
     WHERE id=$8
     RETURNING *`,
    [
      name,
      code,
      category,
      accrual,
      carryForward,
      maxBalance,
      requiresCertificate,
      id
    ]
  );

  res.json(result.rows[0]);
};

/* ENABLE / DISABLE */
export const toggleLeaveTypeStatus = async (req, res) => {
  await pool.query(
    `UPDATE leave_types SET is_active=$1 WHERE id=$2`,
    [req.body.isActive, req.params.id]
  );

  res.json({ message: "Status updated" });
};
