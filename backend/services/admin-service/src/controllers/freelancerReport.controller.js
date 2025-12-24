import pool from "../config/db.js";

/* =========================================
   FIELD → SQL COLUMN MAP
========================================= */
const FIELD_SQL_MAP = {
  "Employee Name": "u.name",
  "Department": "u.department::text",
  "Date of Joining": "u.date_of_joining",
  "Salary": "COALESCE(s.net_salary, 0)",
  "Attendance":
    "ROUND(((a.total_working_days::numeric / NULLIF(a.total_days::numeric, 0)) * 100), 2)",
};

/* =========================================
   GET DEPARTMENTS (STRICT FREELANCER ONLY)
========================================= */
export const getDepartments = async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT LOWER(TRIM(u.department::text)) AS department
      FROM user_employees_master u
      WHERE
        u.department IS NOT NULL
        AND TRIM(u.department::text) <> ''
        AND u.department::text !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
        AND u.employment_type IS NOT NULL
        AND LOWER(TRIM(u.employment_type)) = 'freelancer'
      ORDER BY department
    `;

    const { rows } = await pool.query(query);
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Get Departments Error:", error);
    return res.status(500).json({ message: "Failed to fetch departments" });
  }
};

/* =========================================
   GENERATE CUSTOM REPORT (STRICT FREELANCER)
========================================= */
export const generateCustomReport = async (req, res) => {
  try {
    const { fields, department } = req.body;

    if (!Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({ message: "Fields are required" });
    }

    const invalidFields = fields.filter((f) => !FIELD_SQL_MAP[f]);
    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: "Invalid fields selected",
        invalidFields,
      });
    }

    const selectClause = fields
      .map((f) => `${FIELD_SQL_MAP[f]} AS "${f}"`)
      .join(", ");

    let query = `
      SELECT ${selectClause}
      FROM user_employees_master u

      /* Latest salary */
      LEFT JOIN (
        SELECT DISTINCT ON (employee_id)
          employee_id,
          net_salary
        FROM salary_structure
        ORDER BY employee_id, year DESC, month DESC
      ) s ON u.id = s.employee_id

      /* Attendance aggregation */
      LEFT JOIN (
        SELECT
          employee_id,
          SUM(working_days) AS total_working_days,
          SUM(total_days) AS total_days
        FROM attendance
        GROUP BY employee_id
      ) a ON u.id = a.employee_id

      WHERE
        u.employment_type IS NOT NULL
        AND LOWER(TRIM(u.employment_type)) = 'freelancer'
    `;

    const values = [];

    if (department) {
      query += ` AND LOWER(TRIM(u.department::text)) = $1`;
      values.push(department.toLowerCase());
    }

    console.log("REPORT QUERY:", query);
    console.log("VALUES:", values);

    const { rows } = await pool.query(query, values);

    return res.status(200).json({
      fields,
      data: rows,
    });
  } catch (error) {
    console.error("Generate Custom Report Error:", error);
    return res.status(500).json({
      message: "Failed to generate report",
      error: error.message,
    });
  }
};
