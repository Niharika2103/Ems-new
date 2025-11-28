import pool from "../config/db.js";

/* ================= CREATE JOB POST ================= */
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

    const query = `
      INSERT INTO job_posts
        (job_title, company, experience_level, description, requirements,
         salary_range, location, department, employment_type, created_by,
         posted_date, status)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11)
      RETURNING *
    `;

    const values = [
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
      (status || "draft").toLowerCase()
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      job: result.rows[0]
    });
  } catch (err) {
    console.error("Create Job Error:", err);
    res.status(500).json({
      success: false,
      message: "Error creating job",
      error: err.message
    });
  }
};

/* ================= GET ALL JOB POSTS (ADMIN) ================= */
export const getAdminJobPosts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM job_posts
      ORDER BY posted_date DESC
    `);

    res.json({ success: true, jobs: result.rows });

  } catch (err) {
    console.error("GetAdminJobPosts Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= GET PUBLISHED JOB POSTS ================= */
export const getPublishedJobPosts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM job_posts
      WHERE LOWER(status) = 'published'
      ORDER BY posted_date DESC
    `);

    res.json({ success: true, jobs: result.rows });

  } catch (err) {
    console.error("PublishedJobs Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= GET UNPUBLISHED JOB POSTS ================= */
export const getUnpublishedJobPosts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM job_posts 
      WHERE LOWER(status) = 'unpublished'
      ORDER BY posted_date DESC
    `);

    res.json({ success: true, jobs: result.rows });

  } catch (err) {
    console.error("UnpublishedJobs Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= GET ARCHIVED JOB POSTS ================= */
export const getArchivedJobPosts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM job_posts 
      WHERE LOWER(status) = 'archived'
      ORDER BY posted_date DESC
    `);

    res.json({ success: true, jobs: result.rows });

  } catch (err) {
    console.error("ArchivedJobs Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= UPDATE JOB POST ================= */
export const updateJobPost = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      job_title,
      company,
      experience,
      description,
      requirements,
      salary_range,
      location,
      department,
      employment_type
    } = req.body;

    const query = `
      UPDATE job_posts
      SET job_title=$1, company=$2, experience_level=$3, description=$4,
          requirements=$5, salary_range=$6, location=$7, department=$8,
          employment_type=$9, updated_at=NOW()
      WHERE job_id=$10
      RETURNING *
    `;

    const values = [
      job_title,
      company,
      experience,
      description,
      requirements,
      salary_range,
      location,
      department,
      employment_type,
      id
    ];

    const result = await pool.query(query, values);

    res.json({
      success: true,
      message: "Job updated successfully",
      job: result.rows[0]
    });

  } catch (err) {
    console.error("UpdateJobPost Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= UPDATE JOB STATUS ================= */
export const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["draft", "published", "unpublished", "archived"];

    if (!allowed.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const result = await pool.query(
      `
      UPDATE job_posts
      SET status=$1, updated_at=NOW()
      WHERE job_id=$2
      RETURNING *
    `,
      [status.toLowerCase(), id]
    );

    res.json({
      success: true,
      message: "Status updated successfully",
      job: result.rows[0]
    });

  } catch (err) {
    console.error("UpdateJobStatus Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= GET ONLY DRAFT JOB POSTS ================= */
export const getDraftJobPosts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM job_posts
      WHERE LOWER(status) = 'draft'
      ORDER BY posted_date DESC
    `);

    res.json({ success: true, jobs: result.rows });

  } catch (err) {
    console.error("DraftJobs Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
