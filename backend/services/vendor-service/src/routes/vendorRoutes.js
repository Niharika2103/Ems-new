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
  resetPasswordAfterLogin,
  uploadVendorMoU,
  getVendorMoU,
  acceptVendorMoU,
  rejectVendorMoU,
  getAllMoUDocuments,
  uploadSignedMoU,
  downloadSignedMoU
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
router.get("/download/:filename", (req, res) => {
  try {
    const fileName = path.basename(req.params.filename); // ✅ prevents path traversal
    const filePath = path.join(process.cwd(), "uploads/vendors", fileName);
    return res.download(filePath);
  } catch (err) {
    console.error("Download error:", err);
    res.status(404).json({ error: "File not found" });
  }
});



/* ===================== MoU APIs ===================== */

/* 📤 ADMIN UPLOAD MoU */
router.post(
  "/upload-mou",
  upload.fields([{ name: "mou_file", maxCount: 1 }]),
  (err, req, res, next) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  },
  uploadVendorMoU
);

router.get("/admin/mou-documents", getAllMoUDocuments);


/* 📄 VENDOR GET MoU */
router.get("/:id/mou", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
}, getVendorMoU);


/* ✅ VENDOR ACCEPT MoU */
router.post(
  "/:id/mou/accept",
  acceptVendorMoU
);

router.post(
  "/:id/mou/reject",
  rejectVendorMoU
);

router.post(
  "/:id/mou/upload-signed",
  upload.single("signed_mou_file"),
  uploadSignedMoU
);

router.get("/admin/mou/:id/download-signed", downloadSignedMoU);



export default router;
