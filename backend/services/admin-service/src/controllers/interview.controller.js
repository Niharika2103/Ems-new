// interview.controller.js
import pool from "../config/db.js";
import { sendEmail } from "../services/emailserviceadmin.js";
// import { sendSMS } from "../services/smsserviceadmin.js";  // <-- SMS DISABLED

// helper to clean phone numbers (kept for future use)
const cleanPhone = (value) =>
  value ? value.toString().replace(/\s+/g, "").replace("+91", "") : null;

/* ============================================================
   1️⃣ Schedule Interview (Manual Google Meet Link)
   For ALL candidates who applied to the same job
   ============================================================ */
export const scheduleInterview = async (req, res) => {
  try {
    const {
      application_id,
      interview_date,
      interview_time,
      interview_type,
      panel_member_ids = [],
      meeting_link,
      interviewer,
    } = req.body;

    if (!application_id || !interview_date || !interview_time || !interview_type) {
      return res.status(400).json({
        success: false,
        message: "Application ID, date, time & type are required",
      });
    }

    const finalDateTime = `${interview_date} ${interview_time}`;

    /* ------------------------------------------------
       1️⃣ Fetch job_id of selected application
    ------------------------------------------------ */
    const jobResult = await pool.query(
      `SELECT job_id FROM applications WHERE application_id = $1`,
      [application_id]
    );

    if (jobResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Reference application not found",
      });
    }

    const jobId = jobResult.rows[0].job_id;

    /* ------------------------------------------------
       2️⃣ Fetch ALL applications for that job
    ------------------------------------------------ */
    const appsResult = await pool.query(
      `SELECT application_id, candidate_name, email, phone
       FROM applications
       WHERE job_id = $1`,
      [jobId]
    );

    const allApplications = appsResult.rows;

    if (allApplications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No applications found for this job",
      });
    }

    /* ------------------------------------------------
       3️⃣ Fetch panel contacts (if any)
    ------------------------------------------------ */
    let panelContacts = [];

    if (panel_member_ids.length > 0) {
      const panelResult = await pool.query(
        `SELECT email, phone FROM user_employees_master WHERE id = ANY($1)`,
        [panel_member_ids]
      );
      panelContacts = panelResult.rows;
    }

    const panelEmails = panelContacts.map((p) => p.email).filter(Boolean);

    /* ------------------------------------------------
       4️⃣ Meeting link + interviewer
    ------------------------------------------------ */
    const finalMeetingLink = meeting_link || "Online";

    const savedInterviewer =
      panelEmails.length > 0 ? panelEmails.join(",") : interviewer;

    /* ------------------------------------------------
       5️⃣ Create interview rows for ALL candidates
    ------------------------------------------------ */
    const createdInterviews = [];

    for (const app of allApplications) {
      const insertQuery = `
        INSERT INTO interviews (
          application_id, interview_date, interview_type,
          interviewer, location, status, created_at
        )
        VALUES ($1,$2,$3,$4,$5,'SCHEDULED',NOW())
        RETURNING *;
      `;

      const insertResult = await pool.query(insertQuery, [
        app.application_id,
        finalDateTime,
        interview_type,
        savedInterviewer,
        finalMeetingLink,
      ]);

      createdInterviews.push(insertResult.rows[0]);

      await pool.query(
        `UPDATE applications SET status='INTERVIEW', updated_at=NOW()
         WHERE application_id=$1`,
        [app.application_id]
      );
    }

    /* ------------------------------------------------
       6️⃣ Send EMAIL (SMS Disabled)
    ------------------------------------------------ */
    try {
      // ---- Candidate Emails ----
      for (const app of allApplications) {
        await sendEmail(
          app.email,
          "Interview Scheduled",
          `
          <h2>Hello ${app.candidate_name},</h2>
          <p>Your interview has been scheduled.</p>
          <p><strong>Date:</strong> ${interview_date}</p>
          <p><strong>Time:</strong> ${interview_time}</p>
          <p><strong>Type:</strong> ${interview_type}</p>
          <p><strong>Meeting Link:</strong>
             <a href="${finalMeetingLink}" target="_blank">${finalMeetingLink}</a>
          </p>
          `
        );

        /* --------------------------
           SMS DISABLED FOR CANDIDATES
        -------------------------- 
        const candidatePhone = cleanPhone(app.phone);
        if (candidatePhone) {
          await sendSMS(
            candidatePhone,
            \`Hi ${app.candidate_name}, your interview for job ${jobId} is on ${interview_date} at ${interview_time}. Link: ${finalMeetingLink}\`
          );
        }
        */
      }

      // ---- Panel Emails ----
      for (const panel of panelContacts) {
        await sendEmail(
          panel.email,
          "Interviews Scheduled",
          `
          <h2>Multiple Interviews Scheduled</h2>
          <p>Job ID: ${jobId}</p>
          <p><strong>Date:</strong> ${interview_date}</p>
          <p><strong>Time:</strong> ${interview_time}</p>
          <p><strong>Type:</strong> ${interview_type}</p>
          <p>Candidates: ${allApplications.length}</p>
          <p><strong>Meeting Link:</strong>
             <a href="${finalMeetingLink}" target="_blank">${finalMeetingLink}</a>
          </p>
          `
        );

        /* --------------------------
           SMS DISABLED FOR PANEL
        -------------------------- 
        const panelPhone = cleanPhone(panel.phone);
        if (panelPhone) {
          await sendSMS(
            panelPhone,
            \`You have ${allApplications.length} interviews for job ${jobId} on ${interview_date} at ${interview_time}. Link: ${finalMeetingLink}\`
          );
        }
        */
      }

      console.log("📧 Emails sent (SMS disabled)");

    } catch (notifyErr) {
      console.error("Notification Error:", notifyErr);
    }

    /* ------------------------------------------------
       7️⃣ Final Response
    ------------------------------------------------ */
    return res.json({
      success: true,
      message: `Interview scheduled for ${allApplications.length} candidates (SMS disabled)`,
      interviews: createdInterviews,
      meet_link: finalMeetingLink,
      job_id: jobId,
    });

  } catch (err) {
    console.error("Schedule Interview Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ============================================================
   Remaining Endpoints – No Change
   ============================================================ */

export const getInterviewsByApplication = async (req, res) => {
  try {
    const { application_id } = req.params;

    const result = await pool.query(
      `SELECT * FROM interviews 
       WHERE application_id=$1 
       ORDER BY interview_date ASC`,
      [application_id]
    );

    return res.json({ success: true, interviews: result.rows });
  } catch (err) {
    console.error("Get Interviews Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateInterviewStatus = async (req, res) => {
  try {
    const { interview_id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["SCHEDULED", "COMPLETED", "NO_SHOW", "CANCELLED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const response = await pool.query(
      `UPDATE interviews 
       SET status=$1, updated_at=NOW()
       WHERE interview_id=$2 
       RETURNING *`,
      [status, interview_id]
    );

    return res.json({
      success: true,
      message: "Interview status updated",
      interview: response.rows[0],
    });
  } catch (err) {
    console.error("Update Status Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const rescheduleInterview = async (req, res) => {
  try {
    const { interview_id } = req.params;
    const { interview_date, interview_time } = req.body;

    if (!interview_date || !interview_time) {
      return res.status(400).json({
        success: false,
        message: "New date & time required",
      });
    }

    const newDateTime = `${interview_date}T${interview_time}`;

    const result = await pool.query(
      `UPDATE interviews 
       SET interview_date=$1, status='RESCHEDULED', updated_at=NOW()
       WHERE interview_id=$2 RETURNING *`,
      [newDateTime, interview_id]
    );

    return res.json({
      success: true,
      message: "Interview rescheduled",
      interview: result.rows[0],
    });
  } catch (err) {
    console.error("Reschedule Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const cancelInterview = async (req, res) => {
  try {
    const { interview_id } = req.params;

    const result = await pool.query(
      `UPDATE interviews 
       SET status='CANCELLED', updated_at=NOW()
       WHERE interview_id=$1 RETURNING *`,
      [interview_id]
    );

    return res.json({
      success: true,
      message: "Interview cancelled",
      interview: result.rows[0],
    });

  } catch (err) {
    console.error("Cancel Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
