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
uploadEmployeeDocuments,
getAllEmployeesWithDocs,
downloadEmployeeDocument,
deleteLetter,
sendLetterEmail,
// getUploadedEmployeeDocuments
getAllReferralsAdmin,
getReferralByIdAdmin,
updateReferralStatusAdmin
} from "../controllers/admin.controller.js";
//import for jobpost

import {
  createJobPost,
  getAdminJobPosts,
  getPublishedJobPosts,
  getUnpublishedJobPosts,
  getArchivedJobPosts,
  updateJobPost,
  updateJobStatus,
   getDraftJobPosts 
} from "../controllers/jobPost.controller.js";

//Job Application Controllers and status tracking 

import {
  applyForJob,
  getAllApplications,
  updateApplicationStatus,
  getApplicationsByJob
} from "../controllers/application.controller.js";

import { uploadResume } from "../middleware/uploadResume.js";

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

router.get("/employees-with-docs", getAllEmployeesWithDocs);
// Single file (no index)
router.get("/download/:employeeId/:docType", downloadEmployeeDocument);

// Multiple files (with index)
router.get("/download/:employeeId/:docType/:index", downloadEmployeeDocument);

// router.get("/fetch/status" ,getUploadedEmployeeDocuments);
router.delete("/letters/:employeeId/:filename", deleteLetter);

router.post("/letters/send-email", sendLetterEmail);

// Get all referrals
router.get("/referrals", getAllReferralsAdmin);

// Get a referral by referral_id
router.get("/referrals/:referral_id", getReferralByIdAdmin);

// Update referral status (Shortlisted / Interview / Hired / Rejected)
router.put("/referrals/status/:id", updateReferralStatusAdmin);

// ================= Job Posting Module =================

// Create job post
router.post("/admin/job-posts", createJobPost);

// Get all job posts (Admin view — Draft + Published + Archived)
router.get("/admin/job-posts", getAdminJobPosts);

// Get only published job posts (Candidate view)
router.get("/jobs", getPublishedJobPosts);

//Get only unpublished job posts(Admin view)
router.get("/admin/job-posts/unpublished", getUnpublishedJobPosts);

//Get only archived job posts(Admin view)
router.get("/admin/job-posts/archived", getArchivedJobPosts);


// Edit job post
router.put("/admin/job-posts/:id", updateJobPost);

// Update job status (Publish / Unpublish / Archive)
router.patch("/admin/job-posts/:id/status", updateJobStatus);

//get only draft job for admin
router.get("/admin/job-posts/draft", getDraftJobPosts);

// JOB APPLICATION MODULE

// Candidate apply for job
router.post(
  "/applications/apply",
  uploadResume.single("resume"),
  applyForJob
);

// Admin: Get ALL applications
router.get("/applications/all", getAllApplications);

// Admin: Get applications for specific job
router.get("/applications/job/:jobId", getApplicationsByJob);

// Admin: Update application status (APPLIED → SCREENING → INTERVIEW → DECISION)
router.put("/applications/status/:application_id", updateApplicationStatus);

export default router;
