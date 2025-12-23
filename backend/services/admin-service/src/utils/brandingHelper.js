// src/utils/brandingHelper.js
import pool from "../config/db.js";

/**
 * Fetches branding configuration based on white-label mode and usage context.
 *
 * @param {string} context - One of: "email", "letters", "payslip", "portal"
 * @returns {Object|null} Branding object with { companyName, logoUrl, primaryColor, secondaryColor, source }
 *                        or null if branding is disabled for this context.
 */
export const getBrandingForContext = async (context) => {
  try {
    // 1. Fetch system settings
    const { rows } = await pool.query(
      "SELECT settings FROM system_settings LIMIT 1"
    );

    const settings = rows[0]?.settings || {};
    const whiteLabel = settings.whiteLabel || { enabled: false };
    const systemBranding = settings.branding || {};

    // 2. White-label is OFF → use system branding ONLY if usage[context] === "true"
    if (!whiteLabel.enabled) {
      const usage = systemBranding.usage || {};
      if (usage[context] !== "true") {
        return null; // Branding disabled for this context
      }

      return {
        companyName: systemBranding.companyName || "Zigma People Private Limited (An AI India Venture)",
        logoUrl: systemBranding.logoUrl || null,
        primaryColor: systemBranding.primaryColor || "#007BFF",
        secondaryColor: systemBranding.secondaryColor || "#6c757d",
        source: "system",
      };
    }

    // 3. White-label is ON → fetch from tenant_branding table
    if (!whiteLabel.activeTenant) {
      console.warn("White-label enabled but activeTenant is missing");
      return null;
    }

    const { rows: tenantRows } = await pool.query(
      `SELECT company_name, logo_url, primary_color, secondary_color
       FROM tenant_branding
       WHERE tenant_key = $1`,
      [whiteLabel.activeTenant]
    );

    const tenant = tenantRows[0];
    if (!tenant) {
      console.warn(`No branding found for tenant_key: ${whiteLabel.activeTenant}`);
      return null;
    }

    return {
      companyName: tenant.company_name || "Zigma People Private Limited (An AI India Venture)",
      logoUrl: tenant.logo_url || null,
      primaryColor: tenant.primary_color || "#007BFF",
      secondaryColor: tenant.secondary_color || "#6c757d",
      source: "tenant",
      tenantKey: whiteLabel.activeTenant,
    };
  } catch (err) {
    console.error("Error in getBrandingForContext:", err.message);
    // Fail safely — return null so system falls back to defaults
    return null;
  }
};