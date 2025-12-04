// interview.controller.js
import pool from "../config/db.js";
import { sendEmail } from "../services/emailserviceadmin.js";
//import { sendSMS } from "../services/smsserviceadmin.js";

// helper to clean Indian phone numbers
const cleanPhone = (value) =>
  value ? value.toString().replace(/\s+/g, "").replace("+91", "") : null;

/* ============================================================
   1️⃣ Schedule Interview (Manual Google Meet Link + SMS)
   For ALL candidates who applied to the same job
   ============================================================ */
export const scheduleInterview = async (req, res) => {
  try {
    const {
      application_id,          // reference application
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
       1️⃣ Find job_id from the reference application
    ------------------------------------------------ */
    const jobResult = await pool.query(
      `SELECT job_id FROM applications WHERE application_id = $1`,
      [application_id]
    );

    if (jobResult.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Reference application not found" });
    }

    const jobId = jobResult.rows[0].job_id;

    /* ------------------------------------------------
       2️⃣ Fetch ALL applications for this job
    ------------------------------------------------ */
    const appsResult = await pool.query(
      `SELECT application_id, candidate_name, email, phone
       FROM applications
       WHERE job_id = $1`,
      [jobId]
    );

    if (appsResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No applications found for this job",
      });
    }

    const allApplications = appsResult.rows;

    /* ------------------------------------------------
       3️⃣ Fetch panel contacts (email + phone)
    ------------------------------------------------ */
    let panelContacts = [];

    if (panel_member_ids.length > 0) {
      const panelResult = await pool.query(
        `SELECT email, phone 
         FROM user_employees_master 
         WHERE id = ANY($1)`,
        [panel_member_ids]
      );
      panelContacts = panelResult.rows;
    }

    const panelEmails = panelContacts.map((p) => p.email).filter(Boolean);

    /* ------------------------------------------------
       4️⃣ Meeting link and interviewer info
    ------------------------------------------------ */
    const finalMeetingLink = meeting_link || "Online";

    const savedInterviewer =
      panelEmails.length > 0 ? panelEmails.join(",") : interviewer;

    /* ------------------------------------------------
       5️⃣ Create interview rows + update statuses
       for EVERY application of the job
    ------------------------------------------------ */
    const createdInterviews = [];

    for (const app of allApplications) {
      const insertQuery = `
        INSERT INTO interviews (
          application_id,
          interview_date,
          interview_type,
          interviewer,
          location,
          status,
          created_at
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

      // update each application status -> INTERVIEW
      await pool.query(
        `UPDATE applications 
         SET status='INTERVIEW', updated_at=NOW()
         WHERE application_id=$1`,
        [app.application_id]
      );
    }

    /* ------------------------------------------------
       6️⃣ Send EMAIL + SMS to EVERY candidate
    ------------------------------------------------ */
    try {
      for (const app of allApplications) {
        const candidateName = app.candidate_name;
        const candidateEmail = app.email;
        const candidatePhone = cleanPhone(app.phone);

        // email
        await sendEmail(
          candidateEmail,
          "Interview Scheduled",
          `
          <h2>Hello ${candidateName},</h2>
          <p>Your interview has been scheduled.</p>
          <p><strong>Date:</strong> ${interview_date}</p>
          <p><strong>Time:</strong> ${interview_time}</p>
          <p><strong>Type:</strong> ${interview_type}</p>
          <p><strong>Meeting Link:</strong> 
             <a href="${finalMeetingLink}" target="_blank">${finalMeetingLink}</a>
          </p>
          `
        );

        // sms
        if (candidatePhone) {
          await sendSMS(
            candidatePhone,
            `Hi ${candidateName}, your interview for job ${jobId} is on ${interview_date} at ${interview_time}. Meet link: ${finalMeetingLink}`
          );
        }
      }

      /* ------------------------------------------------
         7️⃣ Panel notifications (once per candidate)
      ------------------------------------------------ */
      for (const panel of panelContacts) {
        const panelEmail = panel.email;
        const panelPhone = cleanPhone(panel.phone);

        if (panelEmail) {
          await sendEmail(
            panelEmail,
            "Interviews Scheduled",
            `
            <h2>Multiple Interviews Scheduled</h2>
            <p>Job ID: ${jobId}</p>
            <p><strong>Date:</strong> ${interview_date}</p>
            <p><strong>Time:</strong> ${interview_time}</p>
            <p><strong>Type:</strong> ${interview_type}</p>
            <p>Number of candidates: ${allApplications.length}</p>
            <p><strong>Meeting Link:</strong> 
               <a href="${finalMeetingLink}" target="_blank">${finalMeetingLink}</a>
            </p>
            `
          );
        }

        if (panelPhone) {
          await sendSMS(
            panelPhone,
            `You have ${allApplications.length} interviews for job ${jobId} on ${interview_date} at ${interview_time}. Link: ${finalMeetingLink}`
          );
        }
      }

      console.log("📧 Emails + 📲 SMS sent for all candidates");

    } catch (notifyErr) {
      console.error("Notification Error:", notifyErr);
      // we don't fail the API here; DB work is already done
    }

    /* ------------------------------------------------
       8️⃣ Final response
    ------------------------------------------------ */
    return res.json({
      success: true,
      message: `Interview scheduled for ${allApplications.length} candidates`,
      interviews: createdInterviews,
      meet_link: finalMeetingLink,
      job_id: jobId,
    });

  } catch (err) {
    console.error("Schedule Interview Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
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
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
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
    const { interview_date, interview_time, meeting_link } = req.body;

    if (!interview_date || !interview_time || !meeting_link) {
      return res.status(400).json({
        success: false,
        message: "Date, time & meeting link are required",
      });
    }

    const newDateTime = `${interview_date} ${interview_time}`;

    // Fetch interview → to get application ID
    const oldInterview = await pool.query(
      `SELECT application_id FROM interviews WHERE interview_id=$1`,
      [interview_id]
    );

    if (oldInterview.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    const application_id = oldInterview.rows[0].application_id;

    // Fetch candidate details
    const appResult = await pool.query(
      `SELECT candidate_name, email 
       FROM applications 
       WHERE application_id=$1`,
      [application_id]
    );

    const candidate = appResult.rows[0];

    // Update interview
    const result = await pool.query(
      `UPDATE interviews
       SET interview_date=$1,
           location=$2,
           status='RESCHEDULED',
           updated_at=NOW()
       WHERE interview_id=$3 
       RETURNING *`,
      [newDateTime, meeting_link, interview_id]
    );

    // Send email
    await sendEmail(
      candidate.email,
      "Interview Rescheduled",
      `
        <h2>Hello ${candidate.candidate_name},</h2>
        <p>Your interview has been <b>rescheduled</b>.</p>
        <p><strong>New Date:</strong> ${interview_date}</p>
        <p><strong>New Time:</strong> ${interview_time}</p>
        <p><strong>Meeting Link:</strong>
           <a href="${meeting_link}" target="_blank">${meeting_link}</a>
        </p>
      `
    );

    return res.json({
      success: true,
      message: "Interview rescheduled & email sent",
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

    // Fetch interview → to get application ID
    const oldInterview = await pool.query(
      `SELECT application_id FROM interviews WHERE interview_id=$1`,
      [interview_id]
    );

    if (oldInterview.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    const application_id = oldInterview.rows[0].application_id;

    // Fetch candidate info
    const app = await pool.query(
      `SELECT candidate_name, email 
       FROM applications 
       WHERE application_id=$1`,
      [application_id]
    );

    const candidate = app.rows[0];

    // Cancel interview
    const result = await pool.query(
      `UPDATE interviews
       SET status='CANCELLED', updated_at=NOW()
       WHERE interview_id=$1
       RETURNING *`,
      [interview_id]
    );

    // Send cancellation email
    await sendEmail(
      candidate.email,
      "Interview Cancelled",
      `
        <h2>Hello ${candidate.candidate_name},</h2>
        <p>Your interview has been <b>cancelled</b>.</p>
        <p>You may be contacted again if it is rescheduled.</p>
      `
    );

    return res.json({
      success: true,
      message: "Interview cancelled & email sent",
      interview: result.rows[0],
    });
  } catch (err) {
    console.error("Cancel Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
