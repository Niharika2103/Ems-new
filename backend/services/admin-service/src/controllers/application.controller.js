// application.controller.js
import pool from "../config/db.js";
import fs from "fs";
//import OpenAI from "openai";

// ============================================================
// pdf-parse import (works with ES modules / Node v24)
// ============================================================
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

// ============================================================
// DOCX + DOC support
// ============================================================
import mammoth from "mammoth";
import textract from "textract";


/* ============================================================
   APPLY FOR JOB
   ============================================================ */
export const applyForJob = async (req, res) => {
  try {
    const {
      job_id,
      candidate_name,
      email,
      phone,
      skills,
      experience
    } = req.body;

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
        skills,
        experience,
        resume_url,
        status,
        applied_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'APPLIED', NOW())
      RETURNING *
    `;

    const values = [
      job_id,
      candidate_name,
      email,
      phone,
      skills || null,
      experience || null,
      resume_url
    ];

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
   GET ALL APPLICATIONS
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
        a.skills,
        a.experience,
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
   GET APPLICATIONS BY JOB
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
        a.skills,
        a.experience,
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
   — Simple Status Update Only
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

    // --------- SIMPLE STATUS UPDATE ONLY ----------
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

    return res.json({
      success: true,
      message: "Application status updated successfully",
      data: result.rows[0],
    });

  } catch (error) {
    console.error("Status Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


/* ============================================================
   FILTER APPLICATIONS  
   ============================================================ */
export const filterApplications = async (req, res) => {
  try {
    const {
      status,
      experience,
      location,
      startDate,
      endDate,
      skills
    } = req.query;

    let query = `
      SELECT
        a.application_id,
        a.job_id,
        a.candidate_name,
        a.email,
        a.phone,
        a.skills,
        a.experience,
        a.resume_url,
        a.applied_date,
        a.status,
        j.job_title,
        j.company,
        j.location,
        j.experience_level,
        j.requirements,
        j.employment_type
      FROM applications a
      JOIN job_posts j
        ON a.job_id = j.job_id
      WHERE 1 = 1
    `;

    let values = [];
    let i = 1;

    if (status) {
      query += ` AND a.status = $${i++}`;
      values.push(status.toUpperCase());
    }

    if (experience) {
      const expNum = Number(experience);
      if (!Number.isNaN(expNum)) {
        if (expNum >= 0 && expNum <= 2) {
          query += ` AND j.experience_level ILIKE '%0-2%'`;
        }
      }
    }

    if (location) {
      query += ` AND j.location ILIKE $${i++}`;
      values.push(`%${location}%`);
    }

    if (skills) {
      const skillList = skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length);

      if (skillList.length > 0) {
        const cond = skillList
          .map(() => `j.requirements ILIKE $${i++}`)
          .join(" OR ");
        query += ` AND (${cond})`;
        skillList.forEach((s) => values.push(`%${s}%`));
      }
    }

    if (startDate && endDate) {
      query += ` AND a.applied_date BETWEEN $${i++} AND $${i++}`;
      values.push(startDate, endDate);
    }

    const result = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      applications: result.rows,
    });

  } catch (error) {
    console.error("FilterApplications Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   PARSE RESUME  
   ============================================================ */
export const parseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file missing",
      });
    }

    const fileBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;

    let text = "";

    if (mimeType === "application/pdf") {
      const pdf = await pdfParse(fileBuffer);
      text = pdf.text || "";
    }

    else if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      text = result.value || "";
    }

    else if (mimeType === "application/msword") {
      text = await new Promise((resolve, reject) => {
        textract.fromBufferWithName(req.file.originalname, fileBuffer, (err, txt) => {
          if (err) reject(err);
          resolve(txt);
        });
      });
    }

    else {
      return res.status(400).json({
        success: false,
        message: "Only PDF, DOCX or DOC files are supported",
      });
    }

    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length);

    const name = lines[0] || "";

    const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const email = emailMatch ? emailMatch[0] : "";

    const phoneMatch = text.match(/(\+?\d[\d\s\-()]{8,}\d)/);
    const phone = phoneMatch ? phoneMatch[0] : "";

    let skills = "";
    const skillsIndex = lines.findIndex((l) => /skills?/i.test(l));
    if (skillsIndex !== -1) {
      const skillsLines = [];
      for (let i = skillsIndex + 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line) break;
        if (/experience/i.test(line)) break;
        skillsLines.push(line);
        if (skillsLines.length >= 3) break;
      }
      skills = skillsLines.join(", ");
    }

    const expMatch = text.match(/(\d+)\s*\+?\s*(years|year|yrs|yr)/i);
    const experience = expMatch ? expMatch[1] : "";

    return res.json({
      success: true,
      detected_type: mimeType,
      data: {
        name,
        email,
        phone,
        skills,
        experience,
      },
    });

  } catch (error) {
    console.error("Resume Parse Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to parse resume",
    });
  }
};
