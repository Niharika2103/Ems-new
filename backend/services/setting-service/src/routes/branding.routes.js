import express from "express";
import {
  getSystemSettings,
  updateBrandingSettings,
  updateWhiteLabelSettings,
} from "../controllers/Branding.controller.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getSystemSettings);
router.put("/branding", upload.single("logo"), updateBrandingSettings);
router.put("/white-label", updateWhiteLabelSettings);
router.get("/tenants/:tenantKey/branding", getTenantBranding);
router.put(
  "/tenants/:tenantKey/branding",
  upload.single("logo"),
  updateTenantBranding
);

export default router;
