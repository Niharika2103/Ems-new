// interview.controller.js
import pool from "../config/db.js";
import { sendEmail } from "../services/emailserviceadmin.js";
// import { sendInterviewScheduledSMS } from "../services/smsserviceadmin.js";
// import { sendSMS, cleanPhone } from "../services/smsserviceadmin.js";

/* ============================================================
   1️⃣ Schedule Interview (Email + SMS)
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
       1️⃣ Fetch application + job
    ------------------------------------------------ */
    const appResult = await pool.query(
      `SELECT application_id, job_id, candidate_name, email, phone
       FROM applications
       WHERE application_id = $1`,
      [application_id]
    );

    if (appResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const application = appResult.rows[0];
    const jobId = application.job_id;

    /* ------------------------------------------------
       2️⃣ Prevent duplicate interview
    ------------------------------------------------ */
    const duplicateCheck = await pool.query(
      `SELECT 1 FROM interviews
       WHERE application_id = $1 AND interview_date = $2`,
      [application_id, finalDateTime]
    );

    if (duplicateCheck.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: "Interview already scheduled for this date and time",
      });
    }

    /* ------------------------------------------------
       3️⃣ Fetch panel members
    ------------------------------------------------ */
    let panelContacts = [];
    if (panel_member_ids.length > 0) {
      const panelResult = await pool.query(
        `SELECT id, name, email, phone
         FROM user_master
         WHERE id = ANY($1)`,
        [panel_member_ids]
      );
      panelContacts = panelResult.rows;
    }

    const panelEmails = panelContacts.map(p => p.email).filter(Boolean);

    /* ------------------------------------------------
       4️⃣ Prepare interview data
    ------------------------------------------------ */
    const finalMeetingLink = meeting_link || "Online";

    const savedInterviewer =
      panelEmails.length > 0
        ? panelEmails               // text[] (correct for DB)
        : interviewer
        ? [interviewer]
        : null;

    /* ------------------------------------------------
       5️⃣ Insert interview
    ------------------------------------------------ */
    const insertResult = await pool.query(
      `
      INSERT INTO interviews (
        application_id,
        interview_date,
        interview_type,
        interviewer,
        location,
        status,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, 'scheduled', NOW())
      RETURNING *;
      `,
      [
        application_id,
        finalDateTime,
        interview_type,
        savedInterviewer,
        finalMeetingLink,
      ]
    );

    const interview = insertResult.rows[0];

    await pool.query(
      `UPDATE applications
       SET status = 'interview', updated_at = NOW()
       WHERE application_id = $1`,
      [application_id]
    );

    /* ------------------------------------------------
       6️⃣ Send EMAIL + SMS to candidate
    ------------------------------------------------ */
    if (application.email) {
      try {
        await sendEmail(
          application.email,
          "Interview Scheduled",
          `
          <h2>Hello ${application.candidate_name},</h2>
          <p>Your interview has been scheduled.</p>
          <p><strong>Date:</strong> ${interview_date}</p>
          <p><strong>Time:</strong> ${interview_time}</p>
          <p><strong>Type:</strong> ${interview_type}</p>
          <p><strong>Meeting Link:</strong>
            <a href="${finalMeetingLink}" target="_blank">${finalMeetingLink}</a>
          </p>
        `
        );
      } catch (e) {
        console.error("❌ Failed to send email:", application.email, e.message);
      }
    }

    if (application.phone) {
      try {
        await sendSMS(
          cleanPhone(application.phone),
          `Hi ${application.candidate_name}, your interview for ${interview_type} is scheduled on ${interview_date} at ${interview_time}. Link: ${finalMeetingLink} - HR Team`
        );
      } catch (e) {
        console.error("❌ Failed to send SMS:", application.phone, e.message);
      }
    }

    /* ------------------------------------------------
       7️⃣ Send Panel EMAIL + SMS
    ------------------------------------------------ */
    for (const panel of panelContacts) {
      if (panel.email) {
        try {
          await sendEmail(
            panel.email,
            "Interview Panel Assignment",
            `
            <h2>Hello ${panel.name},</h2>
            <p>You have been added as a panel member.</p>
            <p><strong>Date:</strong> ${interview_date}</p>
            <p><strong>Time:</strong> ${interview_time}</p>
            <p><strong>Type:</strong> ${interview_type}</p>
            <p><strong>Candidate:</strong> ${application.candidate_name}</p>
            <p><strong>Link:</strong> ${finalMeetingLink}</p>
          `
          );
        } catch (e) {
          console.error("❌ Failed to send panel email:", panel.email, e.message);
        }
      }

      if (panel.phone) {
        try {
          await sendSMS(
            cleanPhone(panel.phone),
            `Hi ${panel.name}, you are assigned to an interview panel on ${interview_date} at ${interview_time}. Candidate: ${application.candidate_name}. Link: ${finalMeetingLink} - HR Team`
          );
        } catch (e) {
          console.error("❌ Failed to send panel SMS:", panel.phone, e.message);
        }
      }
    }

    /* ------------------------------------------------
       8️⃣ Final response
    ------------------------------------------------ */
    return res.json({
      success: true,
      message: "Interview scheduled successfully",
      interview,
      meet_link: finalMeetingLink,
      job_id: jobId,
    });
  } catch (err) {
    console.error("Schedule Interview Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


/* ============================================================
   OTHER ENDPOINTS
   ============================================================ */

export const getInterviewsByApplication = async (req, res) => {
  try {
    const { application_id } = req.params;

    const result = await pool.query(
      `SELECT * FROM interviews 
       WHERE application_id = $1 
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

    const allowedStatuses = ["scheduled", "rescheduled", "cancelled"];


    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const response = await pool.query(
      `UPDATE interviews 
       SET status = $1, updated_at = NOW()
       WHERE interview_id = $2 
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

    const oldInterview = await pool.query(
      `SELECT application_id FROM interviews WHERE interview_id = $1`,
      [interview_id]
    );

    if (oldInterview.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    const application_id = oldInterview.rows[0].application_id;

    const appResult = await pool.query(
      `SELECT candidate_name, email, phone 
       FROM applications 
       WHERE application_id = $1`,
      [application_id]
    );

    const candidate = appResult.rows[0];

    const result = await pool.query(
      `UPDATE interviews
       SET interview_date = $1,
           location = $2,
           status = 'rescheduled',
           updated_at = NOW()
       WHERE interview_id = $3 
       RETURNING *`,
      [newDateTime, meeting_link, interview_id]
    );

    // EMAIL
    try {
      await sendEmail(
        candidate.email,
        "Interview Rescheduled",
        `
        <h2>Hello ${candidate.candidate_name},</h2>
        <p>Your interview has been rescheduled.</p>
        <p><strong>New Date:</strong> ${interview_date}</p>
        <p><strong>New Time:</strong> ${interview_time}</p>
        <p><strong>Meeting Link:</strong>
          <a href="${meeting_link}" target="_blank">${meeting_link}</a>
        </p>
      `
      );
    } catch (e) {
      console.error("❌ Failed email:", candidate.email, e.message);
    }

    // SMS
    if (candidate.phone) {
      try {
        await sendSMS(
          cleanPhone(candidate.phone),
          `Hi ${candidate.candidate_name}, your interview has been rescheduled to ${interview_date} at ${interview_time}. New link: ${meeting_link} - HR Team`

        );
      } catch (e) {
        console.error("❌ Failed SMS:", candidate.phone, e.message);
      }
    }

    return res.json({
      success: true,
      message: "Interview rescheduled (email + SMS sent)",
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

    const oldInterview = await pool.query(
      `SELECT application_id FROM interviews WHERE interview_id = $1`,
      [interview_id]
    );

    if (oldInterview.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    const application_id = oldInterview.rows[0].application_id;

    const app = await pool.query(
      `SELECT candidate_name, email, phone
       FROM applications 
       WHERE application_id = $1`,
      [application_id]
    );

    const candidate = app.rows[0];

    const result = await pool.query(
      `UPDATE interviews
       SET status = 'cancelled', updated_at = NOW()
       WHERE interview_id = $1
       RETURNING *`,
      [interview_id]
    );

    // EMAIL
    try {
      await sendEmail(
        candidate.email,
        "Interview Cancelled",
        `
        <h2>Hello ${candidate.candidate_name},</h2>
        <p>Your interview has been cancelled.</p>
      `
      );
    } catch (e) {
      console.error("❌ Failed email:", candidate.email, e.message);
    }

    // SMS
    if (candidate.phone) {
      try {
        await sendSMS(
          cleanPhone(candidate.phone),
          `Hi ${candidate.candidate_name}, your interview has been cancelled. We will inform you if it is rescheduled. - HR Team`

        );
      } catch (e) {
        console.error("❌ Failed SMS:", candidate.phone, e.message);
      }
    }

    return res.json({
      success: true,
      message: "Interview cancelled (email + SMS sent)",
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


// export const notifyInterviewCandidate = async (req, res) => {
//   const { interview_id } = req.body;

//   if (!interview_id) {
//     return res.status(400).json({ error: "interview_id required" });
//   }

//   const result = await sendInterviewScheduledSMS(interview_id);

//   if (!result.success) {
//     return res.status(500).json(result);
//   }

//   res.json({ message: "Interview scheduled SMS sent successfully" });
// };
export const sendInterviewSMS = async (req, res) => {
  const { interview_id } = req.params;

  if (!interview_id) {
    return res.status(400).json({ error: "interview_id is required" });
  }

  const result = await sendInterviewScheduledSMS(interview_id);

  if (!result.success) {
    return res.status(500).json(result);
  }

  res.json({ message: "Interview SMS sent successfully" });
};