import pool from "../config/db.js";

export const applyForJob = async (req, res) => {
  try {
    const { job_id, candidate_name, email, phone } = req.body;
    const resume_url = req.file ? req.file.filename : null;

    const query = `
      INSERT INTO applications (job_id, candidate_name, email, phone, resume_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [job_id, candidate_name, email, phone, resume_url];

    const result = await pool.query(query, values);

    res.json({
      success: true,
      message: "Application submitted successfully",
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Apply Job Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin: Get all applications
export const getAllApplications = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM applications ORDER BY applied_date DESC"
    );
    res.json({ success: true, applications: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin: Get applications for specific job
export const getApplicationsByJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    const result = await pool.query(
      "SELECT * FROM applications WHERE job_id = $1 ORDER BY applied_date DESC",
      [jobId]
    );

    res.json({ success: true, applications: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update application status (APPLIED → SCREENING → INTERVIEW → DECISION → HIRED/REJECTED)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { application_id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "APPLIED",
      "SCREENING",
      "INTERVIEW",
      "DECISION",
      "HIRED",
      "REJECTED"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    const query = `
      UPDATE applications
      SET status = $1
      WHERE application_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [status, application_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    res.json({
      success: true,
      message: "Application status updated successfully",
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Status Update Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};