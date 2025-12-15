import pool from "../../config/db.js";

/**
 * GET system settings
 */
export const getSystemSettings = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT settings FROM system_settings LIMIT 1"
    );

    res.json(rows[0]?.settings || {});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * UPDATE branding settings only
 */

export const updateBrandingSettings = async (req, res) => {
  try {
    const {
      companyName,
      primaryColor,
      secondaryColor,
      usage, // 👈 ADD THIS
    } = req.body;

    let logoUrl;

    if (req.file) {
      const baseUrl =
        process.env.BASE_URL ||
        `${req.protocol}://${req.get("host")}`;

      logoUrl = `${baseUrl}/uploads/branding/${req.file.filename}`;
    }

    // 🔹 Build branding object dynamically
    const brandingData = {};

    if (companyName !== undefined) brandingData.companyName = companyName;
    if (primaryColor !== undefined) brandingData.primaryColor = primaryColor;
    if (secondaryColor !== undefined) brandingData.secondaryColor = secondaryColor;
    if (usage !== undefined) brandingData.usage = usage;
    if (logoUrl) brandingData.logoUrl = logoUrl;

    const query = `
      UPDATE system_settings
      SET settings = jsonb_set(
        settings,
        '{branding}',
        COALESCE(settings->'branding', '{}'::jsonb) || $1::jsonb,
        true
      ),
      updated_at = NOW()
    `;

    await pool.query(query, [JSON.stringify(brandingData)]);

    res.json({
      message: "Branding updated successfully",
      branding: brandingData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const updateWhiteLabelSettings = async (req, res) => {
  try {
    const { enabled, activeTenant } = req.body;

    const whiteLabelData = {
      enabled: !!enabled,
      activeTenant: enabled ? activeTenant : null,
    };

    const query = `
      UPDATE system_settings
      SET settings = jsonb_set(
        settings,
        '{whiteLabel}',
        $1::jsonb,
        true
      ),
      updated_at = NOW()
    `;

    await pool.query(query, [JSON.stringify(whiteLabelData)]);

    res.json({
      message: "White-label updated successfully",
      whiteLabel: whiteLabelData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


export const updateTenantBranding = async (req, res) => {
  try {
    const { tenantKey } = req.params;
    const { companyName, primaryColor, secondaryColor } = req.body;

    let logoUrl;

    if (req.file) {
      const baseUrl =
        process.env.BASE_URL ||
        `${req.protocol}://${req.get("host")}`;

      logoUrl = `${baseUrl}/uploads/branding/${req.file.filename}`;
    }

    const updates = [];
    const values = [];
    let idx = 1;

    if (companyName) {
      updates.push(`company_name = $${idx++}`);
      values.push(companyName);
    }

    if (primaryColor) {
      updates.push(`primary_color = $${idx++}`);
      values.push(primaryColor);
    }

    if (secondaryColor) {
      updates.push(`secondary_color = $${idx++}`);
      values.push(secondaryColor);
    }

    if (logoUrl) {
      updates.push(`logo_url = $${idx++}`);
      values.push(logoUrl);
    }

    values.push(tenantKey);

    const query = `
      UPDATE tenant_branding
      SET ${updates.join(", ")},
          updated_at = NOW()
      WHERE tenant_key = $${idx}
    `;

    await pool.query(query, values);

    res.json({ message: "Tenant branding updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


export const getTenantBranding = async (req, res) => {
  try {
    const { tenantKey } = req.params;

    const { rows } = await pool.query(
      `SELECT
        company_name,
        logo_url,
        primary_color,
        secondary_color
       FROM tenant_branding
       WHERE tenant_key = $1`,
      [tenantKey]
    );

    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



export const getTenants = async (req, res) => {
  const { rows } = await pool.query(
    "SELECT tenant_key, company_name FROM tenant_branding"
  );
  res.json({ tenants: rows });
};


