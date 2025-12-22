import db from "../config/db.js";
import {
  testWebhook,
  triggerEmployeeOnboarding,
  triggerLeaveApproval,
  triggerPayrollRelease
} from "../services/webhook.service.js";

/* ============================================================
   UUID VALIDATOR (NO npm PACKAGE REQUIRED)
============================================================ */
const isValidId = (value) =>
  /^[0-9]+$/.test(value) || // numeric
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);


/* ============================================================
   CREATE WEBHOOK
============================================================ */
export const createWebhook = async (req, res) => {
  try {
    const { event_type, target_url, auth_token, is_active } = req.body;

    if (!event_type || !target_url) {
      return res.status(400).json({
        message: "Event type and target URL are required",
      });
    }

    const result = await db.query(
      `
      INSERT INTO webhooks
      (event_type, target_url, auth_token, is_active)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        event_type,
        target_url,
        auth_token || null,
        is_active ?? true,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Webhook created successfully",
      webhook: result.rows[0],
    });

  } catch (err) {
    console.error("❌ Error creating webhook:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ============================================================
   GET ALL WEBHOOKS
============================================================ */
export const getAllWebhooks = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM webhooks ORDER BY created_at DESC`
    );

    res.json(result.rows);

  } catch (err) {
    console.error("❌ Error fetching webhooks:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ============================================================
   GET WEBHOOK BY ID
============================================================ */
export const getWebhookById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ UUID validation
    if (!isValidId(id)) {
  return res.status(400).json({ message: "Invalid webhook ID format" });
}


    const result = await db.query(
      `SELECT * FROM webhooks WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Webhook not found" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error("❌ Error fetching webhook:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};



/* ============================================================
   UPDATE WEBHOOK
============================================================ */
export const updateWebhook = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.body) {
      return res.status(400).json({
        message: "Request body is missing"
      });
    }

    const { event_type, target_url, auth_token, is_active } = req.body;

    if (!event_type || !target_url) {
      return res.status(400).json({
        message: "event_type and target_url are required"
      });
    }

    const result = await db.query(
      `
      UPDATE webhooks
      SET event_type=$1,
          target_url=$2,
          auth_token=$3,
          is_active=$4,
          updated_at=NOW()
      WHERE id=$5
      RETURNING *
      `,
      [event_type, target_url, auth_token || null, is_active, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Webhook not found" });
    }

    res.json({
      success: true,
      message: "Webhook updated successfully",
      webhook: result.rows[0],
    });

  } catch (err) {
    console.error("❌ Error updating webhook:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


/* ============================================================
   DELETE WEBHOOK
============================================================ */
export const deleteWebhook = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `DELETE FROM webhooks WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Webhook not found" });
    }

    res.json({
      success: true,
      message: "Webhook deleted successfully",
    });

  } catch (err) {
    console.error("❌ Error deleting webhook:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ============================================================
   TEST WEBHOOK (UI TEST BUTTON)
============================================================ */
export const testWebhookById = async (req, res) => {
  try {
    const { id } = req.params;

    await testWebhook(id);

    res.json({
      success: true,
      message: "Webhook test triggered successfully",
    });

  } catch (err) {
    console.error("❌ Webhook test error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/* ============================================================
   GET WEBHOOK DELIVERY LOGS
============================================================ */
export const getWebhookLogs = async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT
        wl.id,
        wl.status,
        wl.response_code,
        wl.error_message,
        wl.payload,
        wl.retry_count,
        wl.created_at,
        w.event_type,
        w.target_url
      FROM webhook_logs wl
      JOIN webhooks w ON w.id = wl.webhook_id
      ORDER BY wl.created_at DESC
      `
    );

    res.json(result.rows);

  } catch (err) {
    console.error("❌ Error fetching webhook logs:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ============================================================
   EVENT TRIGGERS (REAL BUSINESS EVENTS)
============================================================ */

// Employee Onboarding
export const sendOnboardingWebhook = async (req, res) => {
  try {
    const { employeeId } = req.params;

    await triggerEmployeeOnboarding(employeeId);

    res.json({
      success: true,
      message: "Employee onboarding webhook sent",
    });

  } catch (err) {
    console.error("❌ Onboarding webhook error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// Leave Approval
export const sendLeaveApprovalWebhook = async (req, res) => {
  try {
    const { leaveId } = req.params;

    await triggerLeaveApproval(leaveId);

    res.json({
      success: true,
      message: "Leave approval webhook sent",
    });

  } catch (err) {
    console.error("❌ Leave approval webhook error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// Payroll Release
export const sendPayrollReleaseWebhook = async (req, res) => {
  try {
    const { payrollId } = req.params;

    await triggerPayrollRelease(payrollId);

    res.json({
      success: true,
      message: "Payroll release webhook sent",
    });

  } catch (err) {
    console.error("❌ Payroll webhook error:", err.message);
    res.status(500).json({ message: err.message });
  }
};
