import express from "express";
import { upload } from "../utils/upload.js";
import path from "path";

import {
  registerVendor,
  loginVendor,
  submitVendor,
  getAllVendors,
  updateVendorStatus,
  requestPasswordReset,
  resetPassword,
  resetPasswordAfterLogin
} from "../controllers/vendorController.js";

const router = express.Router();

router.post("/register", registerVendor);
router.post("/login", loginVendor);

router.post(
  "/submit",
  upload.fields([
    { name: "businessLicense", maxCount: 1 },
    { name: "requiredDocuments", maxCount: 10 }
  ]),
  submitVendor
);

router.get("/", getAllVendors);
router.put("/:id/status", updateVendorStatus);

/* 🔐 FORGOT PASSWORD (SEND OTP) */
router.post("/forgot-password", requestPasswordReset);

/* 🔐 RESET PASSWORD USING OTP */
router.post("/reset-password-otp", resetPassword);

/* 🔐 RESET PASSWORD AFTER TEMP LOGIN */
router.post("/reset-password-after-login", resetPasswordAfterLogin);

/* 📥 FORCE FILE DOWNLOAD — KEEP LAST */
router.get("/download/*", (req, res) => {
  try {
    const filePath = req.params[0];
    const fullPath = path.join(process.cwd(), filePath);
    return res.download(fullPath);
  } catch (err) {
    console.error("Download error:", err);
    res.status(404).json({ error: "File not found" });
  }
});

export default router;
