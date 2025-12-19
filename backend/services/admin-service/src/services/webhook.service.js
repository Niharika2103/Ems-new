import axios from "axios";
import db from "../config/db.js";

/* ==========================================================
   CONSTANTS
========================================================== */
const MAX_RETRIES = 3;
const REQUEST_TIMEOUT = 5000;

/* ==========================================================
   CORE WEBHOOK SENDER
========================================================== */
async function sendWebhookRequest(webhook, payload, retryCount = 0) {
  try {
    const response = await axios.post(webhook.target_url, payload, {
      headers: {
        "Content-Type": "application/json",
        ...(webhook.auth_token && {
          Authorization: `Bearer ${webhook.auth_token}`,
        }),
      },
      timeout: REQUEST_TIMEOUT,
    });

    await saveWebhookLog(
      webhook.id,
      "success",
      response.status,
      null,
      payload,
      retryCount
    );
  } catch (error) {
    const statusCode = error.response?.status || 500;
    const errorMessage = error.message;

    await saveWebhookLog(
      webhook.id,
      "failed",
      statusCode,
      errorMessage,
      payload,
      retryCount
    );

    if (retryCount < MAX_RETRIES) {
      await sendWebhookRequest(webhook, payload, retryCount + 1);
    }
  }
}

/* ==========================================================
   SAVE DELIVERY LOG
========================================================== */
async function saveWebhookLog(
  webhookId,
  status,
  responseCode,
  errorMessage,
  payload,
  retryCount
) {
  await db.query(
    `
    INSERT INTO webhook_logs
    (webhook_id, status, response_code, error_message, payload, retry_count)
    VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      webhookId,
      status,
      responseCode,
      errorMessage,
      JSON.stringify(payload),
      retryCount,
    ]
  );
}

/* ==========================================================
   FETCH ACTIVE WEBHOOKS BY EVENT
========================================================== */
async function getActiveWebhooks(eventType) {
  const { rows } = await db.query(
    `
    SELECT * FROM webhooks
    WHERE event_type = $1 AND is_active = true
    `,
    [eventType]
  );
  return rows;
}

/* ==========================================================
   TEST WEBHOOK (UI TEST BUTTON)
========================================================== */
export async function testWebhook(webhookId) {
  const { rows } = await db.query(
    `SELECT * FROM webhooks WHERE id = $1`,
    [webhookId]
  );

  if (!rows.length) {
    throw new Error("Webhook not found");
  }

  const payload = {
    event: "test_webhook",
    timestamp: new Date().toISOString(),
    data: { message: "This is a test webhook" },
  };

  await sendWebhookRequest(rows[0], payload);
}

/* ==========================================================
   EMPLOYEE ONBOARDING WEBHOOK
========================================================== */
export async function triggerEmployeeOnboarding(employeeId) {
  const empResult = await db.query(
    `
    SELECT id, name, email, department, designation, date_of_joining
    FROM user_employees_master
    WHERE id = $1
    `,
    [employeeId]
  );

  if (!empResult.rows.length) {
    throw new Error("Employee not found");
  }

  const payload = {
    event: "employee_onboarding",
    timestamp: new Date().toISOString(),
    employee: empResult.rows[0],
  };

  const webhooks = await getActiveWebhooks("Employee Onboarding");

  for (const hook of webhooks) {
    await sendWebhookRequest(hook, payload);
  }
}

/* ==========================================================
   LEAVE APPROVAL WEBHOOK
========================================================== */
export async function triggerLeaveApproval(leaveId) {
  const leaveResult = await db.query(
    `
    SELECT
      l.id AS leave_id,
      l.leave_type,
      l.start_date,
      l.end_date,
      l.status,
      e.id AS employee_id,
      e.name,
      e.email,
      e.department
    FROM employee_leaves l
    JOIN user_employees_master e ON e.id = l.employee_id
    WHERE l.id = $1
    `,
    [leaveId]
  );

  if (!leaveResult.rows.length) {
    throw new Error("Leave record not found");
  }

  const payload = {
    event: "leave_approval",
    timestamp: new Date().toISOString(),
    leave: leaveResult.rows[0],
  };

  const webhooks = await getActiveWebhooks("Leave Approval");

  for (const hook of webhooks) {
    await sendWebhookRequest(hook, payload);
  }
}

/* ==========================================================
   PAYROLL RELEASE WEBHOOK
========================================================== */
export async function triggerPayrollRelease(payrollId) {
  const payrollResult = await db.query(
    `
    SELECT
      p.id AS payroll_id,
      p.month,
      p.year,
      p.net_salary,
      e.id AS employee_id,
      e.name,
      e.email,
      e.department
    FROM payroll p
    JOIN user_employees_master e ON e.id = p.employee_id
    WHERE p.id = $1
    `,
    [payrollId]
  );

  if (!payrollResult.rows.length) {
    throw new Error("Payroll record not found");
  }

  const payload = {
    event: "payroll_release",
    timestamp: new Date().toISOString(),
    payroll: payrollResult.rows[0],
  };

  const webhooks = await getActiveWebhooks("Payroll Release");

  for (const hook of webhooks) {
    await sendWebhookRequest(hook, payload);
  }
}
