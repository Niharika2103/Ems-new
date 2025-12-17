import db from "../config/db.js";
import { sendTemplateEmailToAll } from "../services/emailserviceadmin.js";

/* ============================================================
   SEND EMAIL TO ALL EMPLOYEES
============================================================ */
export const sendBulkEmailToAllEmployees = async (req, res) => {
  try {
    const { template_id } = req.body;

    if (!template_id) {
      return res.status(400).json({ message: "Template ID is required" });
    }

    const templateRes = await db.query(
      "SELECT * FROM email_templates WHERE id = $1 AND status = 'active'",
      [template_id]
    );

    if (templateRes.rows.length === 0) {
      return res.status(404).json({ message: "Template not found or inactive" });
    }

    const template = templateRes.rows[0];
    const result = await sendTemplateEmailToAll(template);

    res.json({
      success: true,
      message: `Emails sent to ${result.count} employees`,
    });

  } catch (err) {
    console.error("❌ Email sending error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ============================================================
   GET ALL TEMPLATES
============================================================ */
export const getAllEmailTemplates = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM email_templates ORDER BY id DESC"
    );

    res.json(result.rows);

  } catch (err) {
    console.error("❌ Error fetching templates:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ============================================================
   GET TEMPLATE BY ID
============================================================ */
export const getEmailTemplateById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "SELECT * FROM email_templates WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error("❌ Error fetching template:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ============================================================
   CREATE EMAIL TEMPLATE
============================================================ */
export const createEmailTemplate = async (req, res) => {
  try {
    const {
      template_name,
      category,
      subject,
      body_html,
      language,
      status,
      variables
    } = req.body;

    if (!template_name || !subject || !body_html) {
      return res.status(400).json({ message: "Template name, subject & body required" });
    }

    // Convert boolean → ENUM
    const dbStatus = status ? "active" : "inactive";

    const result = await db.query(
      `INSERT INTO email_templates 
        (template_name, category, subject, body_html, language, status, variables)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        template_name,
        category,
        subject,
        body_html,
        language,
        dbStatus,
        JSON.stringify(variables || [])  // 🔥 FIXED JSON
      ]
    );

    res.status(201).json({
      success: true,
      message: "Template created successfully",
      template: result.rows[0],
    });

  } catch (err) {
    console.error("❌ Error creating template:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ============================================================
   UPDATE EMAIL TEMPLATE
============================================================ */
export const updateEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      template_name,
      category,
      subject,
      body_html,
      language,
      status,
      variables
    } = req.body;

    const dbStatus = status ? "active" : "inactive";

    const result = await db.query(
      `UPDATE email_templates 
       SET template_name=$1, category=$2, subject=$3, body_html=$4, 
           language=$5, status=$6, variables=$7, updated_at = NOW()
       WHERE id=$8
       RETURNING *`,
      [
        template_name,
        category,
        subject,
        body_html,
        language,
        dbStatus,
        JSON.stringify(variables || []),  // 🔥 FIXED JSON
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.json({
      success: true,
      message: "Template updated successfully",
      template: result.rows[0],
    });

  } catch (err) {
    console.error("❌ Error updating template:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ============================================================
   DELETE EMAIL TEMPLATE
============================================================ */
export const deleteEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM email_templates WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.json({
      success: true,
      message: "Template deleted successfully"
    });

  } catch (err) {
    console.error("❌ Error deleting template:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleEmailTemplateStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch current status
    const getRes = await db.query(
      "SELECT status FROM email_templates WHERE id = $1",
      [id]
    );

    if (getRes.rows.length === 0) {
      return res.status(404).json({ message: "Template not found" });
    }

    const currentStatus = getRes.rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // Update status
    const updateRes = await db.query(
      "UPDATE email_templates SET status = $1 WHERE id = $2 RETURNING *",
      [newStatus, id]
    );

    res.json({
      success: true,
      message: `Template is now ${newStatus}`,
      template: updateRes.rows[0],
    });

  } catch (err) {
    console.error("❌ Toggle status error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

