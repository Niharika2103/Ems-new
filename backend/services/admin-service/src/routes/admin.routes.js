import { Router } from "express";
import {
  adminRegister,
  adminLogin,
  verifyAdminMfaSetup,
  getAdminById,
  updateAdminProfile,
   upload,
  deleteAdmin,
  getAllAdmins,
   approveAdmin, 
   grantTempAdminAccess,
  revokeTempAdminAccess,
  listTempAdmins,
  sendEmailVerification,
  verifyEmail,
  promoteEmployee,
  getPendingWeeklyApprovals,
  updateWeeklyApprovalStatus,
  getPendingMonthlyApprovals,
  updateMonthlyApprovalStatus,
  adminUpdateWorkedHours,
  rejectWeeklyApproval,
  rejectMonthlyApproval,
   approveParentalLeave,
getPendingParentalLeaves,
getAuditLogs,
generateLetter,
getEmployeeLetters,
documentUpload,
uploadEmployeeDocuments
} from "../controllers/admin.controller.js";
const router = Router();
// Admin Register and login
router.post("/register", adminRegister);

router.post("/verify-mfa", verifyAdminMfaSetup);

// Admin Login
router.post("/login", adminLogin);
// ========== Admin CRUD Routes ==========
router.get("/fetchall",getAllAdmins);
router.put("/status/:id", deleteAdmin);
router.patch("/approve/:id", approveAdmin);
router.get("/get/:id", getAdminById); // Get admin by ID

router.put(
  "/adminprofile-update/:id",
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  updateAdminProfile
);

// ========== Temporary Admin Management Routes ==========
router.post("/grant-temp", grantTempAdminAccess);        // Grant temp admin to employee
router.delete("/revoke-temp/:email", revokeTempAdminAccess); // Revoke by email
router.get("/temp-admins", listTempAdmins);              // List all active temp admins

// Email Verification
router.post("/send-email-verification", sendEmailVerification);
router.post("/verify-email", verifyEmail);
router.post("/promote/:employeeId", promoteEmployee);

router.get("/attendance/pending-weekly", getPendingWeeklyApprovals);
router.put("/attendance/weekly/approve", updateWeeklyApprovalStatus);
router.get("/attendance/pending-monthly", getPendingMonthlyApprovals);
router.put("/attendance/monthly/approve", updateMonthlyApprovalStatus);
router.put("/attendance/update-worked-hours", adminUpdateWorkedHours);
router.post("/attendance/weekly/reject", rejectWeeklyApproval);
router.post("/attendance/monthly/reject", rejectMonthlyApproval);

router.put("/attendance/approve-parental", approveParentalLeave);
router.get("/attendance/pending-parental", getPendingParentalLeaves);

router.get("/audit-logs", getAuditLogs);

router.post("/letters/generate", generateLetter);
router.get("/letters/:employeeId", getEmployeeLetters);

router.post(
  "/employees/:id/upload-documents",
  documentUpload,
  uploadEmployeeDocuments
);

export default router;
