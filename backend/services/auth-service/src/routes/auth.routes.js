import express from "express";
import {
  superAdminRegister,
  checkEmail,
  superAdminLogin,
  verifyMfaSetup, 
  updateSuperAdminProfile,
  getSuperadminById, 
} from "../controllers/auth.controller.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

// SuperAdmin Auth Routes
router.post("/superadmin/register", superAdminRegister);
router.post("/superadmin/check-email", checkEmail);
router.post("/superadmin/login", superAdminLogin);
// Verify MFA setup (first-time QR confirmation)
router.post("/superadmin/mfa/verify", verifyMfaSetup);
 router.put(
  "/superadmin/profile/:id",
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "resume", maxCount: 1 },   
  ]),
  updateSuperAdminProfile
);

router.get("/superadmin/get/:id", getSuperadminById); 


export default router;
