import pool from "../config/db.js";

// Create job
export const createJobPost = async (req, res) => {
  try {
    const {
      job_title,
      company,
      experience,
      description,
      requirements,
      salary_range,
      location,
      created_by,
      department,
      employment_type,
      status
    } = req.body;

    const result = await pool.query(
      `INSERT INTO job_posts
       (job_title, company, experience_level, description, requirements, salary_range,
        location, department, employment_type, created_by, posted_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11)
       RETURNING *`,
      [
        job_title,
        company,
        experience,
        description,
        requirements,
        salary_range,
        location,
        department,
        employment_type,
        created_by,
        status || "DRAFT"
      ]
    );

    res.status(201).json({ success: true, job: result.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error creating job",
      error: err.message
    });
  }
};


// Get all jobs — Admin (including drafts)
export const getAdminJobPosts = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM job_posts ORDER BY created_at DESC`);
    res.json({ success: true, jobs: result.rows });
  } catch (err) {
    res.status(500).json({ message: "Error loading jobs" });
  }
};

// Get Published jobs — Candidates
export const getPublishedJobPosts = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM job_posts WHERE status = 'PUBLISHED' ORDER BY created_at DESC`);
    res.json({ success: true, jobs: result.rows });
  } catch (err) {
    res.status(500).json({ message: "Error loading jobs" });
  }
};

// Unpublished jobs (Admin view)
export const getUnpublishedJobPosts = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM job_posts WHERE status = 'UNPUBLISHED' ORDER BY created_at DESC"
    );
    res.json({ success: true, jobs: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching unpublished jobs" });
  }
};

// Archived jobs (Admin view)
export const getArchivedJobPosts = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM job_posts WHERE status = 'ARCHIVED' ORDER BY created_at DESC"
    );
    res.json({ success: true, jobs: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching archived jobs" });
  }
};

// Edit job
export const updateJobPost = async (req, res) => {
  try {
    const id = req.params.id;
    const { job_title, description, requirements, salary_range, location, updated_by } = req.body;

    const result = await pool.query(
      `UPDATE job_posts SET 
        job_title = $1,
        description = $2,
        requirements = $3,
        salary_range = $4,
        location = $5,
        updated_by = $6,
        updated_at = NOW()
      WHERE job_id = $7 RETURNING *`,
      [job_title, description, requirements, salary_range, location, updated_by, id]
    );

    res.json({ success: true, job: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Error updating job" });
  }
};

// Update job status (publish/unpublish/archive)
export const updateJobStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status, updated_by } = req.body;

    const result = await pool.query(
      `UPDATE job_posts SET status = $1, updated_by = $2, updated_at = NOW()
       WHERE job_id = $3 RETURNING *`,
      [status, updated_by, id]
    );

    res.json({ success: true, job: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Error updating status" });
  }
};
//to get draft job for admin
export const getDraftJobPosts = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM job_posts WHERE status = 'DRAFT' ORDER BY created_at DESC"
    );
    res.json({ success: true, jobs: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching draft jobs" });
  }
};
//