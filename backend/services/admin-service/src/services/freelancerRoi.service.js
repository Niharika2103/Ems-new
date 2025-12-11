import pool from "../config/db.js";

export const fetchFreelancerRoiReport = async () => {
  const query = `
    SELECT 
      p.id AS project_id,
      p.name AS project_name,
      u.id AS freelancer_id,
      u.name AS freelancer_name,
      u.email AS freelancer_email,

      -- ⭐ Fetch freelancer cost from freelancer_responses (only approved)
      COALESCE(fr.project_cost::INTEGER, 0) AS cost,

      -- ⭐ Fetch cost_estimated from projects table
      COALESCE(p.cost_estimated, 0) AS value,

      -- ⭐ ROI CALCULATED HERE (no other changes)
      CASE
        WHEN COALESCE(fr.project_cost::INTEGER, 0) = 0 THEN 0
        ELSE ROUND(((p.cost_estimated - fr.project_cost::INTEGER) / fr.project_cost::INTEGER) * 100)
      END AS roi,

      -- Total project duration in DAYS
      CASE
        WHEN p.start_date IS NULL OR p.end_date IS NULL THEN 0
        ELSE (p.end_date::date - p.start_date::date)
      END AS duration_days,

      -- Remaining days from TODAY
      CASE
        WHEN p.end_date IS NULL THEN 0
        ELSE (p.end_date::date - CURRENT_DATE)
      END AS remaining_days

    FROM project_assignments pa
    JOIN projects p ON p.id = pa.project_id
    JOIN user_employees_master u ON u.id = pa.employee_id

    -- ⭐ FIXED: correct table name is freelancer_responses
    LEFT JOIN freelancer_responses fr
      ON LOWER(fr.email) = LOWER(u.email)
     AND LOWER(fr.status) = 'approved'

    -- ⭐ ONLY CHANGE DONE HERE (AS YOU ASKED)
    WHERE LOWER(pa.employee_type) = 'freelancer'
  `;

  const result = await pool.query(query);

  return result.rows.map((row) => ({
    project: row.project_name,
    freelancer: row.freelancer_name,

    // cost from freelancer_responses
    cost: row.cost,

    // value from project table
    value: row.value,

    // ROI returns correctly
    roi: row.roi,

    duration: `${row.duration_days} days`,

    // return number, UI will format
    remaining_days: row.remaining_days,
  }));
};
