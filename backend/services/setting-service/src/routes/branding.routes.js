import express from "express";
import {
  getSystemSettings,
  updateBrandingSettings,
  updateWhiteLabelSettings,
  getTenantBranding,
  updateTenantBranding,
} from "../controllers/Branding.controller.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.get("/system-settings", getSystemSettings);
router.put("/system-settings/branding", upload.single("logo"), updateBrandingSettings);
router.put("/system-settings/white-label", updateWhiteLabelSettings);
router.get("/system-settings/tenants/:tenantKey/branding", getTenantBranding);
router.put(
  "/system-settings/tenants/:tenantKey/branding",
  upload.single("logo"),
  updateTenantBranding
);

export default router;
