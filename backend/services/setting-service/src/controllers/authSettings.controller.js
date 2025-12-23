import pool from "../../config/db.js";

export const createAuthSettings = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      min_password_length,
      require_uppercase,
      require_lowercase,
      require_number,
      require_special,
      otp_expiry_minutes,
      ip_restriction_enabled,
      allowed_ips
    } = req.body;

    // 🔒 Prevent multiple rows
    const existing = await client.query(
      `SELECT id FROM auth_settings LIMIT 1`
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        error: "Auth settings already exist"
      });
    }

    // 🔐 VALIDATIONS (STRICT)
    if (min_password_length < 6 || min_password_length > 32) {
      return res.status(400).json({
        error: "Password length must be between 6 and 32"
      });
    }

    if (otp_expiry_minutes < 1 || otp_expiry_minutes > 30) {
      return res.status(400).json({
        error: "OTP expiry must be between 1 and 30 minutes"
      });
    }

    if (!Array.isArray(allowed_ips)) {
      return res.status(400).json({
        error: "allowed_ips must be an array"
      });
    }

    // ✅ INSERT EVERYTHING EXPLICITLY
    const result = await client.query(
      `
      INSERT INTO auth_settings (
        min_password_length,
        require_uppercase,
        require_lowercase,
        require_number,
        require_special,
        otp_expiry_minutes,
        ip_restriction_enabled,
        allowed_ips,
        created_at,
        updated_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())
      RETURNING *
      `,
      [
        min_password_length,
        require_uppercase,
        require_lowercase,
        require_number,
        require_special,
        otp_expiry_minutes,
        ip_restriction_enabled,
        allowed_ips
      ]
    );

    res.status(201).json({
      message: "Auth settings created successfully",
      settings: result.rows[0]
    });

  } catch (err) {
    console.error("Create Auth Settings Error:", err.message);
    res.status(500).json({ error: "Failed to create auth settings" });
  } finally {
    client.release();
  }
};

export const getAuthSettings = async (req, res) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT * FROM auth_settings LIMIT 1`
    );

    res.json(rows[0]);
  } catch (err) {
    console.error("Get Auth Settings Error:", err.message);
    res.status(500).json({ error: "Failed to fetch settings" });
  } finally {
    client.release();
  }
};

export const updateAuthSettings = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      min_password_length,
      require_uppercase,
      require_lowercase,
      require_number,
      require_special,
      otp_expiry_minutes,
      ip_restriction_enabled,
      allowed_ips
    } = req.body;

    // 1️⃣ Fetch existing settings
    const { rows } = await client.query(
      `SELECT * FROM auth_settings LIMIT 1`
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Auth settings not initialized"
      });
    }

    const existing = rows[0];

    // 2️⃣ Merge old + new values (IMPORTANT)
    const updatedSettings = {
      min_password_length:
        min_password_length ?? existing.min_password_length,

      require_uppercase:
        require_uppercase ?? existing.require_uppercase,

      require_lowercase:
        require_lowercase ?? existing.require_lowercase,

      require_number:
        require_number ?? existing.require_number,

      require_special:
        require_special ?? existing.require_special,

      otp_expiry_minutes:
        otp_expiry_minutes ?? existing.otp_expiry_minutes,

      ip_restriction_enabled:
        ip_restriction_enabled ?? existing.ip_restriction_enabled,

      allowed_ips:
        allowed_ips ?? existing.allowed_ips
    };

    // 3️⃣ Validations AFTER merge
    if (
      updatedSettings.min_password_length < 6 ||
      updatedSettings.min_password_length > 32
    ) {
      return res.status(400).json({
        error: "Password length must be between 6 and 32"
      });
    }

    if (
      updatedSettings.otp_expiry_minutes < 1 ||
      updatedSettings.otp_expiry_minutes > 30
    ) {
      return res.status(400).json({
        error: "OTP expiry must be between 1 and 30 minutes"
      });
    }

    if (!Array.isArray(updatedSettings.allowed_ips)) {
      return res.status(400).json({
        error: "allowed_ips must be an array"
      });
    }

    // 4️⃣ Update safely
    await client.query(
      `
      UPDATE auth_settings SET
        min_password_length=$1,
        require_uppercase=$2,
        require_lowercase=$3,
        require_number=$4,
        require_special=$5,
        otp_expiry_minutes=$6,
        ip_restriction_enabled=$7,
        allowed_ips=$8,
        updated_at=NOW()
      `,
      [
        updatedSettings.min_password_length,
        updatedSettings.require_uppercase,
        updatedSettings.require_lowercase,
        updatedSettings.require_number,
        updatedSettings.require_special,
        updatedSettings.otp_expiry_minutes,
        updatedSettings.ip_restriction_enabled,
        updatedSettings.allowed_ips
      ]
    );

    res.json({
      message: "Auth settings updated successfully",
      settings: updatedSettings
    });

  } catch (err) {
    console.error("Update Auth Settings Error:", err.message);
    res.status(500).json({ error: "Failed to update settings" });
  } finally {
    client.release();
  }
};