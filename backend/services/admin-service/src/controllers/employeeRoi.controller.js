import pool from "../config/db.js";

export const getEmployeeRoiReport = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id AS project_id,
        p.name AS project,
        e.id AS employee_id,
        e.name AS employee_name,
        e.email,

        -- COST = BASIC PAY FROM salary_structure
        COALESCE(s.basic_pay::INTEGER, 0) AS cost,

        -- PROJECT VALUE (ESTIMATED)
        COALESCE(p.cost_estimated, 0) AS value,

        -- PROJECT DURATION
        CASE
          WHEN p.start_date IS NULL OR p.end_date IS NULL THEN 0
          ELSE (p.end_date::date - p.start_date::date)
        END AS duration_days,

        -- REMAINING DAYS
        CASE
          WHEN p.end_date IS NULL THEN 0
          ELSE (p.end_date::date - CURRENT_DATE)
        END AS remaining_days

      FROM project_assignments pa
      JOIN projects p ON p.id = pa.project_id
      JOIN user_employees_master e ON e.id = pa.employee_id

      LEFT JOIN salary_structure s
        ON s.employee_id = e.id

      -- ✔ FILTER ONLY FULL-TIME EMPLOYEES
      WHERE LOWER(pa.employee_type) IN ('fulltime', 'full_time');
    `;

    const result = await pool.query(query);

    return res.json({
      success: true,
      data: result.rows
    });

  } catch (err) {
    console.error("Employee ROI Error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

