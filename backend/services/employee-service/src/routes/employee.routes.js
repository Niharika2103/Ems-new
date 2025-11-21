import { Router } from "express";
import {
  registerEmployee,
  employeeLogin,
  requestPasswordReset,
  resetPassword,
  uploadExcel,
  bulkInsertEmployees,
  updateEmployee,
  deleteEmployee,
  getEmployees,
  getEmployeeById,
  fetchEmployeeById,
  exportEmployees,
  upload,
  sendEmailVerification,
  verifyEmail,
  updateEmployeeProfile,
  applyParentalLeave,
  getFreelancers
} from "../controllers/employee.controller.js";

const router = Router();


// 🔐 Register Employee (Admin only)
router.post("/register", registerEmployee);

// 🚀 Employee login (with first login + OTP)
router.post("/login", employeeLogin);

// 🔄 Forgot password → reset link
router.post("/request-password-reset", requestPasswordReset);

// 🔑 Reset password
router.post("/reset-password", resetPassword);

// 📂 Upload Excel → Preview
router.post("/upload", upload.array("files"), uploadExcel);

// 📥 Insert bulk employees after preview
router.post("/bulk-insert", bulkInsertEmployees);

// 📋 CRUD
router.get("/get/:email", getEmployeeById);
router.get("/fetch/:email",fetchEmployeeById);
router.get("/get", getEmployees);
// router.get("/fetch", getEmployees);
router.put("/edit/:id", updateEmployee);
router.put("/status/:id", deleteEmployee);

// 📤 Export employees as Excel
router.get("/export", exportEmployees);

// Email Verification
router.post("/send-email-verification", sendEmailVerification);
router.post("/verify-email", verifyEmail);

router.put(
  "/profile-update/:id",
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  updateEmployeeProfile
);

// router.get("/profile", viewOwnProfile);
router.post("/attendance/apply-parental", applyParentalLeave);

router.get("/freelancers", getFreelancers);

export default router;

// dba