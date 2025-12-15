import express from "express";
import {
  getSystemSettings,
  updateBrandingSettings,
} from "../controllers/Branding.controller.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getSystemSettings);
router.put("/branding", upload.single("logo"), updateBrandingSettings);

export default router;
