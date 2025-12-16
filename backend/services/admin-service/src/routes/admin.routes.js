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
  getAllReferralsAdmin,
  getReferralByIdAdmin,
  updateReferralStatusAdmin,
  assignPanelMembers,
  getAllPanels,
  scheduleInterviewReferral,
  rescheduleInterviewReferral,
  getAllInterviewsWithDetails,
  addPanelFeedback,
  getPanelFeedback,
  // === EXTRA AUDIT LOG CONTROLLERS ===
  adminLogout,
  getAllAdminAuditLogs,

  // === FREELANCER CONTRACT FUNCTIONS ===
  createFreelancerContract,
  updateContract,
  cancelContract,
  updateContractStatus,
  renewContract,
  getAllContracts,
  getContractsByFreelancer,
  getContractById,
  createProbation,
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  generateInvoicePDF,
  sendInvoiceReminder,
  deleteInvoice,
  getNewEmployees,
  getProbationWithUser,
  getMonthlyFinalSummary,
  updateTLReview,
  fetchAllReviews,
  getFinalRatingsForEmployees,
  getDepartmentWisePayroll,
  getMonthlyPayrollSummary,
  getPayrollTrend,
  getPayrollTrend3Months,
  getPayrollTrend12Months
 
} from "../controllers/admin.controller.js";

// Job post imports
import {
  createJobPost,
  getAdminJobPosts,
  getPublishedJobPosts,
  getUnpublishedJobPosts,
  getArchivedJobPosts,
  updateJobPost,
  updateJobStatus,
  getDraftJobPosts,
 
} from "../controllers/jobPost.controller.js";

// Applications
import {
  applyForJob,
  getAllApplications,
  updateApplicationStatus,
  getApplicationsByJob,
  filterApplications,
  parseResume
} from "../controllers/application.controller.js";
//interview schedule for candidate
import {
  scheduleInterview,
  getInterviewsByApplication, 
  updateInterviewStatus,
  rescheduleInterview,     // <-- ADD THIS
  cancelInterview  
} from "../controllers/interview.controller.js";

//panel controller
// import { getPanelMembers } from "../controllers/panel.controller.js";

// ❗ Keep disk storage for actual job application resumes
import { uploadResume, uploadResumeBuffer } from "../middleware/uploadResume.js";

//freelancer and employee roi
import { getFreelancerRoiReport } from "../controllers/freelancerRoi.controller.js";
import { getEmployeeRoiReport } from "../controllers/employeeRoi.controller.js";


const router = Router();

/* ================= Admin Register/Login ================= */
router.post("/register", adminRegister);
router.post("/verify-mfa", verifyAdminMfaSetup);
router.post("/login", adminLogin);

/* ========== AUDIT LOGS ========== */
router.post("/logout", adminLogout);
router.get("/audit-logs", getAllAdminAuditLogs);
//



/* ========== Admin CRUD ========== */
router.get("/fetchall", getAllAdmins);
router.put("/status/:id", deleteAdmin);
router.patch("/approve/:id", approveAdmin);
router.get("/get/:id", getAdminById);

router.put(
  "/adminprofile-update/:id",
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "resume", maxCount: 1 }
  ]),
  updateAdminProfile
);

/* ========== Temporary Admin Management ========== */
router.post("/grant-temp", grantTempAdminAccess);
router.delete("/revoke-temp/:email", revokeTempAdminAccess);
router.get("/temp-admins", listTempAdmins);

/* ========== Email Verification ========== */
router.post("/send-email-verification", sendEmailVerification);
router.post("/verify-email", verifyEmail);
router.post("/promote/:employeeId", promoteEmployee);

/* ========== Attendance Approval ========== */
router.get("/attendance/pending-weekly", getPendingWeeklyApprovals);
router.put("/attendance/weekly/approve", updateWeeklyApprovalStatus);
router.post("/attendance/weekly/reject", rejectWeeklyApproval);

router.get("/attendance/pending-monthly", getPendingMonthlyApprovals);
router.put("/attendance/monthly/approve", updateMonthlyApprovalStatus);
router.post("/attendance/monthly/reject", rejectMonthlyApproval);

router.put("/attendance/update-worked-hours", adminUpdateWorkedHours);

/* ========== Parental Leaves ========== */
router.put("/attendance/approve-parental", approveParentalLeave);
router.get("/attendance/pending-parental", getPendingParentalLeaves);

/* ========== Letters ========== */
router.post("/letters/generate", generateLetter);
router.get("/letters/:employeeId", getEmployeeLetters);
router.delete("/letters/:employeeId/:filename", deleteLetter);
router.post("/letters/send-email", sendLetterEmail);

/* ========== Employee Document Upload ========== */
router.post(
  "/employees/:id/upload-documents",
  documentUpload,
  uploadEmployeeDocuments
);

router.get("/employees-with-docs", getAllEmployeesWithDocs);
router.get("/download/:employeeId/:docType", downloadEmployeeDocument);
router.get(
  "/download/:employeeId/:docType/:index",
  downloadEmployeeDocument
);

/* ========== Referrals ========== */
router.get("/referrals", getAllReferralsAdmin);
router.get("/referrals/:referral_id", getReferralByIdAdmin);
router.put("/referrals/status/:id", updateReferralStatusAdmin);

// Assign members to a panel
router.post("/panels/assign", assignPanelMembers);

// Get all panels with members
router.get("/panels", getAllPanels);

// Schedule interview (for referral)
router.post("/interviews/schedule/:referral_id", scheduleInterviewReferral);

// Reschedule interview (insert a new row)
router.post("/interviews/reschedule/:referral_id", rescheduleInterviewReferral);

router.get(
  "/interviews/all",
  getAllInterviewsWithDetails
);

router.post(
  "/interviews/:interview_id/feedback",
  addPanelFeedback
);

router.get("/panel-feedback/:interview_id", getPanelFeedback);
/* ========== Job Posting ========== */
router.post("/admin/job-posts", createJobPost);
router.get("/admin/job-posts", getAdminJobPosts);
router.get("/jobs", getPublishedJobPosts);
router.get("/admin/job-posts/unpublished", getUnpublishedJobPosts);
router.get("/admin/job-posts/archived", getArchivedJobPosts);
router.put("/admin/job-posts/:id", updateJobPost);
router.patch("/admin/job-posts/:id/status", updateJobStatus);
router.get("/admin/job-posts/draft", getDraftJobPosts);
router.get("/applications/filter", filterApplications);

/* ========== Job Applications ========== */
router.post("/applications/apply", uploadResume.single("resume"), applyForJob);

// INTERVIEW ROUTES
router.post("/interviews/schedule", scheduleInterview);
router.get("/interviews/:application_id", getInterviewsByApplication);
router.put("/interviews/status/:interview_id", updateInterviewStatus);
router.put("/interviews/reschedule/:interview_id", rescheduleInterview);
router.put("/interviews/cancel/:interview_id", cancelInterview);


// ==================================================
// ✅ FIXED — AI Resume Parser MUST use memory storage
// ==================================================
router.post("/applications/parse-resume", uploadResumeBuffer.single("resume"), parseResume);

router.get("/applications/all", getAllApplications);
router.get("/applications/job/:jobId", getApplicationsByJob);
router.put("/applications/status/:application_id", updateApplicationStatus);

// router.get("/panel-members", getPanelMembers);
//freelancerroireport
router.get("/reports/freelancer-roi", getFreelancerRoiReport);
router.get("/reports/employee-roi", getEmployeeRoiReport);

/* -------------------------------------------------------------------------- */
/*                       FREELANCER CONTRACT ROUTES                           */
/* -------------------------------------------------------------------------- */
router.post("/freelancer-contract/create", createFreelancerContract);
router.put("/freelancer-contract/update/:contract_id", updateContract);
router.patch("/freelancer-contract/cancel/:contract_id", cancelContract);
router.patch("/freelancer-contract/status/:contract_id", updateContractStatus);
router.patch("/freelancer-contract/renew/:contract_id", renewContract);
router.get("/freelancer-contract/all", getAllContracts);
router.get("/freelancer-contract/freelancer/:freelancer_id", getContractsByFreelancer);
router.get("/freelancer-contract/:contract_id", getContractById);

// CREATE INVOICE
router.post("/invoices/create", createInvoice);

// GET ALL INVOICES
router.get("/invoices/all", getAllInvoices);

// GET SINGLE INVOICE
router.get("/invoices/:invoice_id", getInvoiceById);

// UPDATE STATUS (pending → approved → paid → cancelled)
router.put("/invoices/status/:invoice_id", updateInvoiceStatus);

// GENERATE PDF & GET URL
router.get("/invoices/pdf/:invoice_id", generateInvoicePDF);

// SEND PAYMENT REMINDER EMAIL
router.post("/invoices/reminder/:invoice_id", sendInvoiceReminder);

// DELETE INVOICE
router.delete("/invoices/:invoice_id", deleteInvoice);

router.get("/new-employees", getNewEmployees);

router.post("/store-probation", createProbation);

router.get("/probation/user", getProbationWithUser);

router.get(
  "/monthly-final-summary/:employeeId/:year/:month",
  getMonthlyFinalSummary
);
router.put("/performance/update/:id", updateTLReview);           
router.get("/performance/all", fetchAllReviews);

router.get("/performance/final-ratings", getFinalRatingsForEmployees);

//payroll analytics
router.get("/payroll/summary", getMonthlyPayrollSummary);

router.get("/payroll/department-wise", getDepartmentWisePayroll);
router.get("/payroll/trend", getPayrollTrend);
router.get("/payroll/trend/3-months", getPayrollTrend3Months);
router.get("/payroll/trend/12-months", getPayrollTrend12Months);

export default router;
