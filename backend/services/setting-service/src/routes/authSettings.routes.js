import express from "express";
import {
  getAuthSettings,
  updateAuthSettings,
  createAuthSettings,
  createSalaryCycle,
  updateSalaryCycle,
  getAllSalaryCycles
} from "../controllers/authSettings.controller.js";

const router = express.Router();

router.post("/settings/create", createAuthSettings);

// Fetch current auth settings
router.get("/settings/get", getAuthSettings);

// Update auth settings (admin / superadmin UI)
router.post("/settings/update", updateAuthSettings);


router.post("/salary-cycle", createSalaryCycle);
router.patch("/salary-cycle", updateSalaryCycle);
router.get("/settings/salary-cycle", getAllSalaryCycles);


export default router;
