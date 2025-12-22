import { Router } from "express";

import {
  createWebhook,
  getAllWebhooks,
  getWebhookById,
  updateWebhook,
  deleteWebhook,
  testWebhookById,
  getWebhookLogs,
  sendOnboardingWebhook,
  sendLeaveApprovalWebhook,
  sendPayrollReleaseWebhook

} from "../controllers/webhook.controller.js";

const router = Router();

/* ============================================================
   WEBHOOK CONFIGURATION ROUTES
============================================================ */

// Create webhook
router.post("/", createWebhook);

// Get all webhooks
router.get("/", getAllWebhooks);

// Get webhook by ID
router.get("/:id", getWebhookById);

// Update webhook
router.put("/:id", updateWebhook);

// Delete webhook
router.delete("/:id", deleteWebhook);

// Test webhook (UI Test button)
router.post("/test/:id", testWebhookById);

/* ============================================================
   WEBHOOK DELIVERY LOGS
============================================================ */

router.get("/logs/all", getWebhookLogs);

/* ============================================================
   REAL EVENT TRIGGERS (INTERNAL USE)
============================================================ */

// Employee onboarding trigger
router.post("/trigger/onboarding/:employeeId", sendOnboardingWebhook);

// Leave approval trigger
router.post("/trigger/leave-approval/:leaveId", sendLeaveApprovalWebhook);

// Payroll release trigger
router.post("/trigger/payroll-release/:payrollId", sendPayrollReleaseWebhook);

export default router;
