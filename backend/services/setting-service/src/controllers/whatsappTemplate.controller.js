import pool from "../../config/db.js";


/* ===============================
   GET ALL TEMPLATES
================================ */
export const getAllTemplates = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM whatsapp_templates ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get templates error:", err);
    res.status(500).json({ message: "Failed to fetch templates" });
  }
};

/* ===============================
   CREATE TEMPLATE
================================ */
export const createTemplate = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      templateId,
      message,
      status,
      approval,
      consentRequired
    } = req.body;

    const result = await pool.query(
      `INSERT INTO whatsapp_templates
       (name, category, description, template_id, message, status, approval, consent_required)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        name,
        category,
        description,
        templateId,
        message,
        status,
        approval,
        consentRequired
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Create template error:", err);
    res.status(500).json({ message: "Failed to create template" });
  }
};

/* ===============================
   UPDATE TEMPLATE
================================ */
export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      description,
      templateId,
      message,
      status,
      approval,
      consentRequired
    } = req.body;

    const result = await pool.query(
      `UPDATE whatsapp_templates SET
        name=$1,
        category=$2,
        description=$3,
        template_id=$4,
        message=$5,
        status=$6,
        approval=$7,
        consent_required=$8,
        updated_at=NOW()
       WHERE id=$9
       RETURNING *`,
      [
        name,
        category,
        description,
        templateId,
        message,
        status,
        approval,
        consentRequired,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update template error:", err);
    res.status(500).json({ message: "Failed to update template" });
  }
};

/* ===============================
   ACTIVATE / DEACTIVATE TEMPLATE
================================ */
export const updateTemplateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      `UPDATE whatsapp_templates
       SET status=$1, updated_at=NOW()
       WHERE id=$2
       RETURNING *`,
      [status, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

/* ===============================
   DELETE TEMPLATE
================================ */
export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM whatsapp_templates WHERE id=$1",
      [id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Delete template error:", err);
    res.status(500).json({ message: "Failed to delete template" });
  }
};
