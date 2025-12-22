import express from "express";
import {
  getAuthSettings,
  updateAuthSettings,
  createAuthSettings
} from "../controllers/authSettings.controller.js";

const router = express.Router();

router.post("/settings/create", createAuthSettings);

// Fetch current auth settings
router.get("/settings/get", getAuthSettings);

// Update auth settings (admin / superadmin UI)
router.post("/settings/update", updateAuthSettings);

export default router;
