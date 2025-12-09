import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { UserModel } from "../models/user.model.js";
import { validateInput } from "../utils/validateInput.js";
import { sendEmail } from "../services/emailservicesuperadmin.js";

import dotenv from "dotenv";
const USERS_TABLE = "user_employees_master";
const SUPERADMINS_TABLE = "super_admins";

// Helper: issue JWT
function issueJwt({ email, role, id,name }) {
  return jwt.sign({ email, role, id ,name}, process.env.JWT_SECRET, { expiresIn: "1h" });
}

// ----------- Email check endpoint -----------
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const { rows } = await pool.query(
      `SELECT * FROM ${USERS_TABLE} WHERE email ILIKE $1 AND role = $2 AND access_flag = 'y'`,
      [email, "superadmin"]
    );

    if (!rows[0]) return res.status(200).json({ authorized: false });

    return res
      .status(200)
      .json({ authorized: true, message: "Email authorized" });
  } catch (err) {
    console.error("CheckEmail Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};



// ----------- Registration endpoint -----------
export const superAdminRegister = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // Check if user exists
    const { rows: existingRows } = await pool.query(
      `SELECT * FROM ${USERS_TABLE} WHERE email ILIKE $1 AND role = $2 AND access_flag = 'y'`,
      [email, "superadmin"]
    );

    const existingUser = existingRows[0];

    if (!existingUser) {
      return res.status(400).json({
        error: "This email is not authorized as a SuperAdmin or access disabled.",
      });
    }

    // Check if already registered
    if (existingUser.password && existingUser.password.trim() !== "") {
      return res.status(400).json({
        error: "SuperAdmin already registered with this email.",
      });
    }

    // Validate input
    const errors = validateInput(UserModel, { name: fullName, email, password });
    if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

    const hashedPassword = await bcrypt.hash(password, 10);
    const secret = speakeasy.generateSecret({
      name: `EMS-${email}`,
      issuer: "EMS SuperAdmin",
    });

    // Update parent table
    const { rows: updatedRows } = await pool.query(
      `UPDATE ${USERS_TABLE} 
       SET name=$1, password=$2, mfa_secret=$3, mfa_enabled=false, is_email_verified=false 
       WHERE id=$4 RETURNING *`,
      [fullName, hashedPassword, secret.base32, existingUser.id]
    );

    const updatedUser = updatedRows[0];

    // Insert into super_admins table
    await pool.query(
      `INSERT INTO ${SUPERADMINS_TABLE} (user_id, name, email, password, role)
       VALUES ($1,$2,$3,$4,$5)`,
      [updatedUser.id, updatedUser.name, updatedUser.email, hashedPassword, "superadmin"]
    );

    // Generate MFA QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    return res.status(201).json({
      message: "SuperAdmin registered successfully. Complete MFA setup.",
      qrCodeUrl,
      secret: secret.base32,
      user: { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role },
    });
  } catch (err) {
    console.error("SuperAdmin Register Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * SuperAdmin Login (requires MFA if enabled)
 * Body: { email, password, otp }
 */
// export const superAdminLogin = async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const { email, password, otp } = req.body;

//     // 1️⃣ Fetch from USERS_TABLE → role = superadmin
//     const { rows } = await client.query(
//       `SELECT * FROM ${USERS_TABLE} WHERE email ILIKE $1 AND role=$2`,
//       [email, "superadmin"]
//     );

//     const user = rows[0];
//     if (!user)
//       return res.status(401).json({ error: "Invalid email or password" });

//     // 2️⃣ Password check
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch)
//       return res.status(401).json({ error: "Invalid email or password" });

//     // 3️⃣ Check MFA
//     if (!user.mfa_enabled)
//       return res.status(403).json({ error: "MFA setup not completed" });

//     if (!otp)
//       return res.status(400).json({ error: "OTP required" });

//     const verified = speakeasy.totp.verify({
//       secret: user.mfa_secret,
//       encoding: "base32",
//       token: otp,
//       window: 1,
//     });

//     if (!verified)
//       return res.status(401).json({ error: "Invalid OTP" });

//     // 4️⃣ Get super_admins.id using user.id
//     const superAdmin = await client.query(
//       `SELECT id FROM super_admins WHERE user_id = $1`,
//       [user.id]
//     );

//     if (superAdmin.rowCount === 0)
//       return res.status(500).json({
//         error: "Super Admin record missing in super_admins table"
//       });

//     const superAdminId = superAdmin.rows[0].id;

//     // 5️⃣ Insert Audit Log
// //    await client.query(
// //   `
// //   INSERT INTO audit_logs (
// //     id,
// //     super_admin_id,
// //     employee_id,
// //     created_by,
// //     created_at,
// //     updated_by,
// //     updated_at
// //   )
// //   VALUES (
// //     gen_random_uuid(),
// //     $1,
// //     $2,
// //     'login',
// //     NOW(),
// //     NULL,
// //     NULL
// //   )
// //   `,
// //   [superAdminId, user.id]
// // );

// await client.query(
//   `INSERT INTO audit_logs (super_admin_id, created_by)
//    VALUES ($1, 'login')`,
//   [user.super_admin_id]
// );



//     // 6️⃣ Issue JWT
//     const token = issueJwt({
//       id: user.id,
//       email: user.email,
//       role: user.role,
//       name: user.name,
//     });

//     return res.status(200).json({
//       message: "SuperAdmin login success",
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         mfa_enabled: user.mfa_enabled
//       }
//     });

//   } catch (err) {
//     console.error("SuperAdmin Login Error:", err.message);
//     return res.status(500).json({ error: "Internal Server Error" });
//   } finally {
//     client.release();
//   }
// };

export const superAdminLogin = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, password, otp } = req.body;

    // 1️⃣ Fetch user
    const { rows } = await client.query(
      `SELECT * FROM ${USERS_TABLE} WHERE email ILIKE $1 AND role=$2`,
      [email, "superadmin"]
    );

    const user = rows[0];
    if (!user)
      return res.status(401).json({ error: "Invalid email or password" });

    // 2️⃣ Password check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Invalid email or password" });

    // 3️⃣ MFA check
    if (!otp)
      return res.status(400).json({ error: "OTP required" });

    const verified = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: "base32",
      token: otp,
      window: 1,
    });

    if (!verified)
      return res.status(401).json({ error: "Invalid OTP" });

    // 4️⃣ Get super_admins.id
    const superAdmin = await client.query(
      `SELECT id FROM super_admins WHERE user_id = $1`,
      [user.id]
    );

    if (superAdmin.rowCount === 0)
      return res.status(500).json({
        error: "SuperAdmin record missing"
      });

    const superAdminId = superAdmin.rows[0].id;

    // 5️⃣ INSERT AUDIT LOG (CORRECTED)
    await client.query(
      `INSERT INTO audit_logs (super_admin_id, employee_id, created_by, created_at)
       VALUES ($1, $2, 'login', NOW())`,
      [superAdminId, user.id]
    );

    // 6️⃣ Issue JWT
    const token = issueJwt({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return res.status(200).json({
      message: "SuperAdmin login success",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("SuperAdmin Login Error:", err.message);
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};


/**
 * Verify MFA Setup (after registration)
 * Body: { email, otp }
 */
export const verifyMfaSetup = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, otp } = req.body;

    const { rows } = await pool.query(
      `SELECT * FROM ${USERS_TABLE} WHERE email ILIKE $1`,
      [email]
    );

    const user = rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.mfa_enabled) return res.json({ message: "MFA already enabled" });

    const verified = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: "base32",
      token: otp,
      window: 1,
    });

    if (!verified) return res.status(400).json({ error: "Invalid OTP, setup failed" });

    await pool.query(`UPDATE ${USERS_TABLE} SET mfa_enabled=true WHERE id=$1`, [user.id]);

    return res.json({ message: "MFA setup verified and enabled", role: user.role });
  } catch (err) {
    console.error("MFA Setup Error:", err.message);
    return res.status(500).json({ error: err.message });
  }finally {
    client.release();
  }
};
//SuperAdmin Get by id
export const getSuperadminById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === "undefined") {
      return res.status(400).json({ error: "Invalid or missing admin ID" });
    }

    const { rows } = await pool.query(
      `SELECT * FROM ${USERS_TABLE} WHERE id = $1 AND role = $2`,
      [id, "superadmin"]
    );

    const data = rows[0];
    if (!data) return res.status(404).json({ error: "Superadmin not found" });

    const BASE_URL =
      process.env.BASE_URL || `http://localhost:${process.env.PORT || 5001}`;

    const responseData = {
      ...data,
      profile_photo: data.profile_photo
        ? `${BASE_URL}${data.profile_photo}`
        : null,
      resume: data.resume ? `${BASE_URL}${data.resume}` : null,
    };

    return res.json(responseData);
  } catch (err) {
    console.error("Get Superadmin By ID Error:", err.message || err);
    res
      .status(500)
      .json({ message: err.message || "Internal Server Error" });
  }
};


//SuperAdmin Profile Update
export const updateSuperAdminProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch existing user
    const { rows: existingRows } = await pool.query(
      `SELECT * FROM ${USERS_TABLE} WHERE id = $1 AND role = $2`,
      [id, "superadmin"]
    );
    const existingUser = existingRows[0];

    if (!existingUser)
      return res
        .status(404)
        .json({ error: "SuperAdmin not found in parent table" });

    // Prepare updates
    let userUpdates = { ...req.body };

    if (req.files?.profilePhoto?.[0]) {
      userUpdates.profile_photo = `/uploads/${req.files.profilePhoto[0].filename}`;
    }
    if (req.files?.resume?.[0]) {
      userUpdates.resume = `/uploads/${req.files.resume[0].filename}`;
    }

    delete userUpdates.role;
    delete userUpdates.mfa_secret;
    delete userUpdates.mfa_enabled;

    if (req.body.password) {
      userUpdates.password = await bcrypt.hash(req.body.password, 10);
    }

    const parentAllowedFields = [
      "name",
      "email",
      "dob",
      "date_of_joining",
      "gender",
      "phone",
      "address",
      "emergency_contact",
      "department",
      "profile_photo",
      "resume",
      "permanent_address",
      "password",
    ];

    const filteredUserUpdates = {};
    const updateValues = [];
    const updateSet = [];

    parentAllowedFields.forEach((key, index) => {
      if (userUpdates[key] !== undefined) {
        filteredUserUpdates[key] = userUpdates[key];
        updateSet.push(`${key} = $${updateSet.length + 1}`);
        updateValues.push(userUpdates[key]);
      }
    });

    if (updateSet.length === 0)
      return res.status(400).json({ error: "No valid fields to update" });

    updateValues.push(id); // for WHERE id=$n

    const { rows: updatedRows } = await pool.query(
      `UPDATE ${USERS_TABLE} SET ${updateSet.join(", ")} WHERE id = $${
        updateSet.length + 1
      } RETURNING *`,
      updateValues
    );

    const updatedUser = updatedRows[0];

    // Update child table (super_admins)
    const childUpdates = {};
    const childValues = [];
    const childSet = [];

    if (userUpdates.name) {
      childSet.push(`name = $${childSet.length + 1}`);
      childValues.push(userUpdates.name);
    }
    if (userUpdates.email) {
      childSet.push(`email = $${childSet.length + 1}`);
      childValues.push(userUpdates.email);
    }

    if (childSet.length > 0) {
      childValues.push(id);
      await pool.query(
        `UPDATE ${SUPERADMINS_TABLE} SET ${childSet.join(", ")} WHERE user_id = $${
          childSet.length + 1
        }`,
        childValues
      );
    }

    return res.json({
      message: "SuperAdmin updated successfully",
      superAdmin: updatedUser,
    });
  } catch (err) {
    console.error("Update SuperAdmin Error:", err.message || err);
    return res
      .status(500)
      .json({ message: err.message || "Internal Server Error" });
  }
};

function getUserFromToken(req) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No token provided");
  }
  const token = authHeader.split(" ")[1];
  return jwt.verify(token, process.env.JWT_SECRET);
}
dotenv.config();
// ----------- Promote Admin to SuperAdmin -----------
export const promoteAdminToSuperAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!req.user)
      return res.status(401).json({ error: "Unauthorized: no user info" });

    // 1️⃣ Fetch admin
    const { rows: adminRows } = await pool.query(
      `SELECT * FROM ${USERS_TABLE} WHERE id = $1 AND role = $2`,
      [adminId, "admin"]
    );
    const admin = adminRows[0];
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    // 2️⃣ Update role to superadmin
    const { rows: updatedRows } = await pool.query(
      `UPDATE ${USERS_TABLE} SET role = $1 WHERE id = $2 RETURNING *`,
      ["superadmin", adminId]
    );
    const updatedAdmin = updatedRows[0];

    // 3️⃣ Check if exists in SUPERADMINS_TABLE
    const { rows: superRows } = await pool.query(
      `SELECT * FROM ${SUPERADMINS_TABLE} WHERE email = $1`,
      [updatedAdmin.email]
    );
    const existingSuper = superRows[0];

    if (!existingSuper) {
      await pool.query(
        `INSERT INTO ${SUPERADMINS_TABLE} (user_id, name, email, password, role)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          updatedAdmin.id,
          updatedAdmin.name,
          updatedAdmin.email,
          updatedAdmin.password,
          "superadmin",
        ]
      );
    }

    // 4️⃣ Send promotion email
    await sendEmail(
      updatedAdmin.email,
      "🎉 Promotion to SuperAdmin",
      `Dear ${updatedAdmin.name},\n\nYou have been promoted to SuperAdmin.\nYou can now log in with your existing credentials and MFA setup.\n\nRegards,\nEMS Team`
    );

    return res.status(200).json({
      message: "Admin promoted to SuperAdmin successfully.",
      promotedUser: updatedAdmin,
    });
  } catch (err) {
    console.error("Promote Admin Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

//Audit log -super admin logout

export const superAdminLogout = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ error: "Email is required for logout" });

    // 1️⃣ Get user record  (FIX: USERS_TABLE instead of USER_MASTER_TABLE)
    const { rows: userRows } = await client.query(
      `SELECT * FROM ${USERS_TABLE} WHERE email ILIKE $1 AND role=$2`,
      [email, "superadmin"]
    );

    if (userRows.length === 0)
      return res.status(404).json({ error: "SuperAdmin not found" });

    const user = userRows[0];

    // 2️⃣ Get super_admin ID
    const { rows: saRows } = await client.query(
      `SELECT id FROM ${SUPERADMINS_TABLE} WHERE user_id=$1`,
      [user.id]
    );

    if (saRows.length === 0)
      return res.status(500).json({ error: "SuperAdmin record missing" });

    const superAdminId = saRows[0].id;

    // 3️⃣ Update latest login audit record
    const result =
     await client.query(
      `
      UPDATE audit_logs AS a
      SET updated_by='logout',
          updated_at=NOW()
      FROM (
        SELECT id
        FROM audit_logs
        WHERE super_admin_id=$1
          AND employee_id=$2
          AND created_by='login'
          AND updated_by IS NULL
        ORDER BY created_at DESC
        LIMIT 1
      ) AS t
      WHERE a.id = t.id
      `,
      [superAdminId, user.id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "No active login session found" });

    return res.status(200).json({
      success: true,
      message: "SuperAdmin logged out successfully"
    });

  } catch (err) {
    console.error("SuperAdmin Logout Error:", err.message);
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
export const getAllSuperAdminAuditLogs = async (req, res) => {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT
        al.id AS audit_id,
        sa.id AS user_id,           -- ✅ RETURN SUPERADMIN ID
        u.name AS user_name,
        u.email AS user_email,
        u.role AS user_role,
        al.created_at AS login_time,
        CASE 
          WHEN al.updated_by = 'logout' THEN al.updated_at
          ELSE NULL
        END AS logout_time
      FROM audit_logs al
      JOIN ${SUPERADMINS_TABLE} sa
        ON sa.id = al.super_admin_id        -- ✅ JOIN USING super_admin_id
      JOIN ${USERS_TABLE} u
        ON u.id = sa.user_id                -- get superadmin user details
      WHERE al.super_admin_id IS NOT NULL
        AND al.created_by = 'login'
      ORDER BY al.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: result.rowCount,
      audits: result.rows
    });

  } catch (err) {
    console.error("Fetch SuperAdmin Audit Logs Error:", err.message);
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
