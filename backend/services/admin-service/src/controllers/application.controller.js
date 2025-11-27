// application.controller.js
import pool from "../config/db.js";

/* ============================================================
   APPLY FOR JOB (Employee)
   ============================================================ */
export const applyForJob = async (req, res) => {
  try {
    const { job_id, candidate_name, email, phone } = req.body;

    if (!job_id) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const resume_url = req.file ? req.file.filename : null;

    const query = `
      INSERT INTO applications (
        job_id,
        candidate_name,
        email,
        phone,
        resume_url,
        status,
        applied_date
      )
      VALUES ($1, $2, $3, $4, $5, 'APPLIED', NOW())
      RETURNING *
    `;

    const values = [job_id, candidate_name, email, phone, resume_url];

    const result = await pool.query(query, values);

    res.json({
      success: true,
      message: "Application submitted successfully",
      data: result.rows[0],
    });

  } catch (error) {
    console.error("Apply Job Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ============================================================
   GET ALL APPLICATIONS (ADMIN)
   Includes job title + company name from job_posts
   ============================================================ */
export const getAllApplications = async (req, res) => {
  try {
    const query = `
      SELECT
        a.application_id,
        a.job_id,
        a.candidate_name,
        a.email,
        a.phone,
        a.resume_url,
        a.applied_date,
        a.status,
        j.job_title,
        j.company,
        j.location,
        j.employment_type
      FROM applications a
      LEFT JOIN job_posts j
        ON a.job_id = j.job_id
      ORDER BY a.applied_date DESC
    `;

    const result = await pool.query(query);
    res.json({ success: true, applications: result.rows });

  } catch (error) {
    console.error("GetAllApplications Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ============================================================
   GET APPLICATIONS FOR A SPECIFIC JOB (ADMIN)
   ============================================================ */
export const getApplicationsByJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    const query = `
      SELECT
        a.application_id,
        a.job_id,
        a.candidate_name,
        a.email,
        a.phone,
        a.resume_url,
        a.applied_date,
        a.status,
        j.job_title,
        j.company,
        j.location,
        j.employment_type
      FROM applications a
      LEFT JOIN job_posts j
        ON a.job_id = j.job_id
      WHERE a.job_id = $1
      ORDER BY a.applied_date DESC
    `;

    const result = await pool.query(query, [jobId]);

    res.json({ success: true, applications: result.rows });

  } catch (error) {
    console.error("GetApplicationsByJob Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ============================================================
   UPDATE APPLICATION STATUS (ADMIN)
   Accepts only VALID uppercase values
   ============================================================ */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { application_id } = req.params;
    let { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    // Convert to uppercase always
    status = status.toUpperCase();

    const allowedStatuses = [
      "APPLIED",
      "SCREENING",
      "INTERVIEW",
      "DECISION",
      "HIRED",
      "REJECTED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const query = `
      UPDATE applications
      SET status = $1, updated_at = NOW()
      WHERE application_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [status, application_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.json({
      success: true,
      message: "Application status updated successfully",
      data: result.rows[0],
    });

  } catch (error) {
    console.error("Status Update Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
