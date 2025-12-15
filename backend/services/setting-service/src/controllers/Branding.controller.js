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


