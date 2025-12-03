import express from "express";
import {
  registerVendor,
  loginVendor,
  requestPasswordReset,
  resetPassword,
} from "../controllers/vendorController.js";

const router = express.Router();

router.post("/register", registerVendor);
router.post("/login", loginVendor);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);

export default router;
