// src/models/Freelancer.models.js
import pool from "../config/db.js";

// Update document_url JSON for an employee
export const updateFreelancerDocuments = async (id, documentJsonString,gstNumber) => {
  const query = `
    UPDATE user_employees_master
    SET document_url = $1,
    gst=$2
    WHERE id = $3
    RETURNING id, employee_id, document_url,gst;
  `;

  const result = await pool.query(query, [documentJsonString,gstNumber, id]);
  return result.rows[0];
};

// Get document_url JSON for an employee (optional GET API)
export const getFreelancerDocuments = async (id) => {
  const query = `
    SELECT id, document_url ,gst
    FROM user_employees_master
    WHERE id = $1;
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};
