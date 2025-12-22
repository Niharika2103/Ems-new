import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { sendEmail } from "../services/emailserviceadmin.js";
import multer from "multer";
import path from "path";
import fs from "fs";

import axios from "axios";
import { getBrandingForContext } from "../utils/brandingHelper.js";
import { loadTemplate } from "../utils/templateLoader.js";
// import pdf from "html-pdf";

import puppeteer from "puppeteer";

//import { USER_MASTER_TABLE } from '../config/constants.js';

// ✅ Updated table names
const USER_MASTER_TABLE = "user_employees_master";
const REGISTRATIONS_TABLE = "registrations";
const SUPERADMINS_TABLE = "super_admins";
const REFERRALS_TABLE = "referrals";
const PROBATION ="probation";
const PANEL_MEMBERS_TABLE = "panel_members";
const INTERVIEWS_TABLE = "interviews"

// ================== Multer Config ==================
const uploadDir = path.join(process.cwd(), "src/uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Export upload so routes can use it
export const upload = multer({ storage });
// Helper to issue JWT
function issueJwt({ email, role, is_temp_admin = false, id, name }) {
  return jwt.sign(
    { email, role, is_temp_admin, id, name },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

// ================== Decode JWT Helper ==================
function getUserFromToken(req) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No token provided");
  }
  const token = authHeader.split(" ")[1];
  return jwt.verify(token, process.env.JWT_SECRET);
}

/**
 * Admin Registration (with MFA setup)
 * Body: { name, email, password }  <-- ✅ CHANGED from "fullName" to "name"
 */
// export const adminRegister = async (req, res) => {
//   try {
//     const { fullName, email, password } = req.body; // ✅ Use "name", not "fullName"
//     const role = "admin";

//     // ✅ Validate required fields
//     if (!fullName || !email || !password) {
//       return res.status(400).json({
//         error: "Name, email, and password are required",
//       });
//     }

//     // Check if admin already exists
//     const { data: existing, error: fetchError } = await supabase
//       .from(USER_MASTER_TABLE)
//       .select("*")
//       .eq("email", email)
//       .eq("role", role)
//       .maybeSingle();


//     if (fetchError) throw fetchError;
//     if (existing) {
//       return res.status(400).json({ error: "Admin already registered" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Generate MFA secret during registration
//     const secret = speakeasy.generateSecret({
//       name: `EMS-${email}`,
//       issuer: "EMS Admin",
//     });

//     // Save user with MFA secret (disabled until verified)
//     const { data: newUser, error: insertError } = await supabase
//       .from(USER_MASTER_TABLE)
//       .insert([
//         {
//           name: fullName,
//           email,
//           password: hashedPassword,
//           role,
//           mfa_secret: secret.base32,
//           mfa_enabled: false,
//           is_email_verified: false,
//           access_flag: "y",
//         },
//       ])
//       .select()
//       .single();

//     if (insertError) throw insertError;

//     // Create registration record
//     const { error: regError } = await supabase
//       .from(REGISTRATIONS_TABLE)
//       .insert([
//         {
//           user_id: newUser.id,
//           is_approved: false, // default: not approved yet
//           is_temp_admin: false,
//           temp_admin_expiry: null,
//         },
//       ]);

//     if (regError) throw regError;
//     // Generate QR code for authenticator apps
//     const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

//     res.status(201).json({
//       message: "Admin registered successfully. Complete MFA setup.",
//       qrCodeUrl,
//       secret: secret.base32, // optional backup
//     });
//   } catch (err) {
//     console.error("Admin Register Error:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// };

// export const adminRegister = async (req, res) => {
//   try {
//     const { fullName, email, password } = req.body;
//     const role = "admin";

//     // ✅ Validate required fields
//     if (!fullName || !email || !password) {
//       return res.status(400).json({
//         error: "Name, email, and password are required",
//       });
//     }

//     // ✅ Check if user already exists (any role)
//     const { data: existingUser, error: fetchError } = await supabase
//       .from(USER_MASTER_TABLE)
//       .select("*")
//       .eq("email", email)
//       .maybeSingle();

//     if (fetchError) throw fetchError;

//     // ✅ If superadmin exists with this email → block registration
//     if (existingUser && existingUser.role === "superadmin") {
//       return res.status(400).json({
//         error: "Email already exists. Please login instead.",
//       });
//     }

//     // ✅ If admin exists with this email → block
//     if (existingUser && existingUser.role === "admin") {
//       return res.status(400).json({
//         error: "Admin already registered. Please login instead.",
//       });
//     }

//     // ✅ Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // ✅ Generate MFA secret
//     const secret = speakeasy.generateSecret({
//       name: `EMS-${email}`,
//       issuer: "EMS Admin",
//     });

//     // ✅ Insert new Admin with role_2 = employee
//     const { data: newUser, error: insertError } = await supabase
//       .from(USER_MASTER_TABLE)
//       .insert([
//         {
//           name: fullName,
//           email,
//           password: hashedPassword,
//           role: "admin",     // 🔹 Admin role
//           role_1: null,      // 🔹 No role_1 for Admin
//           role_2: "employee",// 🔹 Always employee
//           mfa_secret: secret.base32,
//           mfa_enabled: false,
//           is_email_verified: false,
//           access_flag: "y",
//         },
//       ])
//       .select()
//       .single();

//     if (insertError) throw insertError;

//     // ✅ Create registration record (child table)
//     const { error: regError } = await supabase
//       .from(REGISTRATIONS_TABLE)
//       .insert([
//         {
//           user_id: newUser.id,
//           is_approved: false,
//           is_temp_admin: false,
//           temp_admin_expiry: null,
//         },
//       ]);

//     if (regError) throw regError;

//     // ✅ Generate QR code
//     const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

//     res.status(201).json({
//       message: "Admin registered successfully. Complete MFA setup.",
//       qrCodeUrl,
//       secret: secret.base32,
//     });

//   } catch (err) {
//     console.error("Admin Register Error:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// };



export const adminRegister = async (req, res) => {
  const client = await pool.connect();
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    // Check if user exists
    const existingUserResult = await client.query(
      `SELECT * FROM ${USER_MASTER_TABLE} WHERE email = $1`,
      [email]
    );
    const existingUser = existingUserResult.rows[0];

    if (existingUser && existingUser.role === "superadmin") {
      return res.status(400).json({ error: "Email belongs to a SuperAdmin." });
    }

    // CASE 1: New admin
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const secret = speakeasy.generateSecret({ name: `EMS-${email}`, issuer: "EMS Admin" });

      const insertUser = await client.query(
        `INSERT INTO ${USER_MASTER_TABLE} 
         (name, email, password, role, role_1, role_2, mfa_secret, mfa_enabled, is_email_verified, access_flag, is_promoted)
         VALUES ($1,$2,$3,'admin',NULL,'employee',$4,false,false,'y',false)
         RETURNING id`,
        [fullName, email, hashedPassword, secret.base32]
      );

      const newUserId = insertUser.rows[0].id;

      await client.query(
        `INSERT INTO ${REGISTRATIONS_TABLE} 
         (user_id, is_approved, is_temp_admin, temp_admin_expiry)
         VALUES ($1,false,false,NULL)`,
        [newUserId]
      );

      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

      return res.status(201).json({
        message: "Admin registered. Complete MFA setup.",
        qrCodeUrl,
        secret: secret.base32,
      });
    }

    // CASE 2: Existing user (promoted)
    if (
      existingUser.is_promoted &&
      !existingUser.mfa_enabled &&
      (existingUser.role === "employee" || existingUser.role === "admin")
    ) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const secret = speakeasy.generateSecret({ name: `EMS-${email}`, issuer: "EMS Admin" });

      await client.query(
        `UPDATE ${USER_MASTER_TABLE}
         SET name=$1, password=$2, role='admin', role_1=NULL, role_2='employee', mfa_secret=$3
         WHERE id=$4`,
        [fullName, hashedPassword, secret.base32, existingUser.id]
      );

      const regCheck = await client.query(
        `SELECT * FROM ${REGISTRATIONS_TABLE} WHERE user_id=$1`,
        [existingUser.id]
      );

      if (regCheck.rowCount === 0) {
        await client.query(
          `INSERT INTO ${REGISTRATIONS_TABLE} 
           (user_id, is_approved, is_temp_admin, temp_admin_expiry)
           VALUES ($1,false,false,NULL)`,
          [existingUser.id]
        );
      }

      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
      return res.status(200).json({
        message: "Promoted employee. Complete MFA setup.",
        qrCodeUrl,
        secret: secret.base32,
      });
    }

    return res.status(400).json({
      error: "User already registered as admin or not eligible for promotion.",
    });
  } catch (err) {
    console.error("Admin Register Error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};


/**
 * Admin Login (requires MFA if enabled)
 * Body: { email, password, otp }
 */

export const adminLogin = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, password, otp } = req.body;

    const userResult = await client.query(
      `SELECT * FROM ${USER_MASTER_TABLE} WHERE email=$1`,
      [email]
    );
    const user = userResult.rows[0];

    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid password" });

    if (!(user.role === "admin" || user.role_1 === "admin")) {
      return res.status(403).json({ error: "Not authorized as Admin" });
    }

    if (!user.mfa_enabled)
      return res.status(403).json({ error: "MFA setup not completed. Please verify OTP first." });

    if (!otp) return res.status(400).json({ error: "OTP required for login" });

    const verified = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: "base32",
      token: otp,
      window: 1,
    });

    if (!verified) return res.status(401).json({ error: "Invalid OTP" });

    const regDataResult = await client.query(
      `SELECT is_temp_admin, temp_admin_expiry, is_approved 
       FROM ${REGISTRATIONS_TABLE} WHERE user_id=$1`,
      [user.id]
    );
    const regData = regDataResult.rows[0];

    if (!regData?.is_approved)
      return res.status(403).json({
        error: "Access denied. Permission not granted by SuperAdmin."
      });

    const isTempAdmin =
      regData.is_temp_admin && new Date(regData.temp_admin_expiry) > new Date();

    const token = issueJwt({
      email: user.email,
      role: user.role === "admin" ? "admin" : user.role_1,
      id: user.id,
      is_temp_admin: isTempAdmin,
      name: user.name,
    });

    // AUDIT LOG – LOGIN ENTRY
await client.query(
  `
    INSERT INTO audit_logs (
      id,
      super_admin_id,
      employee_id,
      created_by,
      created_at,
      updated_by,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      NULL,
      $1,
      'login',
      NOW(),
      NULL,
      NULL
    )
  `,
  [user.id]          // MUST be the same "id" used in adminLogout
);



    res.json({
      message: "Admin login successful with MFA",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role === "admin" ? "admin" : user.role_1,
        mfa_enabled: user.mfa_enabled,
        is_temp_admin: isTempAdmin,
      },
    });

  } catch (err) {
    console.error("Admin Login Error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

/**
 * Verify Admin MFA Setup (after registration)
 * Body: { email, otp }
 */
export const verifyAdminMfaSetup = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, otp } = req.body;

    const userResult = await client.query(
      `SELECT * FROM ${USER_MASTER_TABLE} WHERE email=$1 AND role='admin'`,
      [email]
    );
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.mfa_enabled) return res.json({ message: "MFA already enabled" });

    const verified = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: "base32",
      token: otp,
      window: 1,
    });

    if (!verified) return res.status(400).json({ error: "Invalid OTP, setup failed" });

    await client.query(`UPDATE ${USER_MASTER_TABLE} SET mfa_enabled=true WHERE id=$1`, [user.id]);

    res.json({ message: "MFA setup verified and enabled" });
  } catch (err) {
    console.error("MFA Setup Error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

// export const getAllAdmins = async (req, res) => {
//   try {
//  const { data, error } = await supabase
//   .from(USER_MASTER_TABLE)
//   .select(`
//     *,
//     registrations (*)
//   `)
//   .in("role", ["admin", "superadmin"]);
//     if (error) throw error;

//     return res.json(data);
//   } catch (err) {
//     console.error("Get admin Error:", err.message);
//     res.status(500).json({ message: err.message });
//   }
// };

export const getAllAdmins = async (req, res) => {
  try {
    // SQL query: fetch all users with role 'admin' or 'superadmin'
    // and join with registrations table
    const query = `
      SELECT u.*, r.*
      FROM user_employees_master u
      LEFT JOIN registrations r ON u.id = r.user_id
      WHERE u.role = ANY($1::text[])
    `;

    const roles = ["admin", "superadmin"];
    const { rows } = await pool.query(query, [roles]);

    return res.json(rows);
  } catch (err) {
    console.error("Get admin Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// using Id delete Admin
export const deleteAdmin = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || id === "undefined") {
      return res.status(400).json({ error: "Invalid or missing admin ID" });
    }

    // Convert status to boolean or 'y'/'n' based on your DB column type
    await client.query(
      `UPDATE ${USER_MASTER_TABLE} SET is_active = $1 WHERE id = $2`,
      [status, id]
    );

    return res.json({
      message: `Admin ${status ? "activated" : "deactivated"} successfully`,
    });
  } catch (err) {
    console.error("Delete Admin Error:", err.message);
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
};
// SuperAdmin gave Permission to admin (via registrations table)
export const approveAdmin = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { is_approved } = req.body;

    // 🧩 Validate input
    if (!id || id === "undefined") {
      return res.status(400).json({ error: "Invalid or missing admin ID" });
    }

    if (typeof is_approved !== "boolean") {
      return res.status(400).json({ error: "is_approved must be boolean" });
    }

    // 🛠️ Update admin approval status
    const updateQuery = `
      UPDATE ${REGISTRATIONS_TABLE}
      SET is_approved = $1
      WHERE id = $2
      RETURNING *;
    `;

    const { rows } = await client.query(updateQuery, [is_approved, id]);

    // ⚠️ If no admin found
    if (rows.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // ✅ Response
    res.json({
      message: is_approved
        ? "SuperAdmin approved successfully"
        : "SuperAdmin access revoked",
      admin: rows[0],
    });

  } catch (err) {
    console.error("Approve SuperAdmin Error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
// export const getAdminById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!id || id === "undefined") {
//       return res.status(400).json({ error: "Invalid or missing admin ID" });
//     }

//     const { data, error } = await supabase
//       .from(USER_MASTER_TABLE)
//       .select("*")
//       .eq("id", id)
//       .eq("role", "admin")
//       .maybeSingle();

//     if (error) throw error;
//     if (!data) return res.status(404).json({ error: "Admin not found" });

//     // Optionally: remove sensitive fields before sending
//     const { password, mfa_secret, reset_token, ...safeData } = data;

//     return res.json(safeData);
//   } catch (err) {
//     console.error("Get Admin By ID Error:", err.message);
//     res.status(500).json({ message: err.message });
//   }
// };

export const getAdminById = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    // ✅ Validate ID
    if (!id || id === "undefined") {
      return res.status(400).json({ error: "Invalid or missing admin ID" });
    }

    // ✅ Fetch admin (role = admin)
    const query = `
      SELECT * FROM ${USER_MASTER_TABLE}
      WHERE id = $1 AND role = 'admin'
    `;
    const result = await client.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const data = result.rows[0];

    // ✅ Build full URLs for uploaded files
    
      const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT}`;

    const responseData = {
      ...data,
      profile_photo: data.profile_photo
        ? `${BASE_URL}/uploads/${data.profile_photo}`
        : null,
      resume: data.resume ? `${BASE_URL}/uploads/${data.resume}` : null,
    };

    // ✅ Remove sensitive data
    delete responseData.password;
    delete responseData.mfa_secret;
    delete responseData.reset_token;

    return res.json(responseData);
  } catch (err) {
    console.error("Get Admin By ID Error:", err.message);
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
};

// ================== Update Admin Profile ==================
export const updateAdminProfile = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    // ✅ Fetch existing admin
    const existing = await client.query(
      `SELECT * FROM ${USER_MASTER_TABLE} WHERE id = $1 AND role = 'admin'`,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // ✅ Whitelist of allowed database columns (snake_case)
    const allowedFields = [
      'name',
      'dob',
      'gender',
      'email',
      'phone',
      'department',
      'address',
      'permanent_address',
      'emergency_contact',
      'profile_photo',
      'resume',
      'password'
    ];

    // ✅ Initialize updates with existing values
    const updates = {};
    for (const field of allowedFields) {
      updates[field] = existing.rows[0][field];
    }

    // ✅ Override with text fields from req.body (excluding file-related fields)
    for (const field of allowedFields) {
      if (field !== 'profile_photo' && field !== 'resume' && req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // 🔐 Hash password if provided
    if (req.body.password) {
      updates.password = await bcrypt.hash(req.body.password, 10);
    }

    // 📂 Handle file uploads
    if (req.files?.profilePhoto?.[0]) {
      updates.profile_photo = req.files.profilePhoto[0].filename;
    }
    if (req.files?.resume?.[0]) {
      updates.resume = req.files.resume[0].filename;
    }

    // ✅ Build dynamic query using only valid DB columns
    const setFields = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");
    const values = Object.values(updates);

    const updateQuery = `
      UPDATE ${USER_MASTER_TABLE}
      SET ${setFields}
      WHERE id = $${values.length + 1}
      RETURNING *;
    `;

    const updated = await client.query(updateQuery, [...values, id]);
    const admin = updated.rows[0];

    // ✅ Remove sensitive fields before sending response
    delete admin.password;
    delete admin.mfa_secret;
    delete admin.reset_token;

    return res.json({
      message: "Admin profile updated successfully",
      admin,
    });
  } catch (err) {
    console.error("Update Admin Profile Error:", err.message);
    console.error("Full error:", err); // For debugging
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};
/**
 * Grant Temporary Admin Access to an Employee
 * POST /api/admin/grant-temp
 * Body: { email, durationHours }
 */
// export const grantTempAdminAccess = async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const { email, durationHours = 24 } = req.body;

//     if (!email) {
//       return res.status(400).json({ error: "Employee email is required" });
//     }

//     // ✅ Find employee
//     const userQuery = `
//       SELECT * FROM ${USER_MASTER_TABLE}
//       WHERE email = $1 AND role = 'employee'
//     `;
//     const userResult = await client.query(userQuery, [email]);
//     if (userResult.rows.length === 0) {
//       return res.status(404).json({ error: "Employee not found" });
//     }
//     const user = userResult.rows[0];

//     // ✅ Get registration record
//     const regQuery = `
//       SELECT is_temp_admin, temp_admin_expiry 
//       FROM ${REGISTRATIONS_TABLE} 
//       WHERE user_id = $1
//     `;
//     const regResult = await client.query(regQuery, [user.id]);
//     const reg = regResult.rows[0];

//     // ✅ Already active temporary admin check
//     if (reg?.is_temp_admin && new Date(reg.temp_admin_expiry) > new Date()) {
//       return res.status(400).json({
//         error: `Employee already has temporary admin access until ${new Date(
//           reg.temp_admin_expiry
//         ).toLocaleString()}.`,
//       });
//     }

//     const expiry = new Date(Date.now() + durationHours * 60 * 60 * 1000);

//     // ✅ Update registration record
//     const updateQuery = `
//       UPDATE ${REGISTRATIONS_TABLE}
//       SET is_temp_admin = true, is_approved = true, temp_admin_expiry = $1
//       WHERE user_id = $2
//     `;
//     await client.query(updateQuery, [expiry, user.id]);

//     // ✅ Send email notification
//     try {
//       await sendEmail(
//         user.email,
//         "Temporary Admin Access Granted",
//         `
//           <p>Hello ${user.name},</p>
//           <p>You have been granted temporary admin access until ${expiry.toLocaleString()}.</p>
//           <p>Please use this privilege responsibly.</p>
//         `
//       );
//     } catch (emailErr) {
//       console.warn("Failed to send email notification:", emailErr.message);
//     }

//     res.status(200).json({
//       message: `Temporary admin access granted to ${user.name} until ${expiry.toLocaleString()}.`,
//       employee: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         temp_admin_expiry: expiry,
//       },
//     });
//   } catch (err) {
//     console.error("Grant Temp Admin Error:", err.message);
//     res.status(500).json({ error: err.message });
//   } finally {
//     client.release();
//   }
// };


export const grantTempAdminAccess = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, durationHours = 24 } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Employee email is required" });
    }

    const userResult = await client.query(
      `SELECT * FROM ${USER_MASTER_TABLE} WHERE email = $1 AND role = 'employee'`,
      [email]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    const user = userResult.rows[0];

    const regResult = await client.query(
      `SELECT is_temp_admin, temp_admin_expiry FROM ${REGISTRATIONS_TABLE} WHERE user_id = $1`,
      [user.id]
    );
    const reg = regResult.rows[0];

    if (reg?.is_temp_admin && new Date(reg.temp_admin_expiry) > new Date()) {
      return res.status(400).json({
        error: `Employee already has temporary admin access until ${new Date(reg.temp_admin_expiry).toLocaleString()}.`,
      });
    }

    const expiry = new Date(Date.now() + durationHours * 60 * 60 * 1000);
    await client.query(
      `UPDATE ${REGISTRATIONS_TABLE} SET is_temp_admin = true, is_approved = true, temp_admin_expiry = $1 WHERE user_id = $2`,
      [expiry, user.id]
    );

    // ✅ Get branding for EMAIL
    const branding = await getBrandingForContext("email");

    let emailBody = `<p>Hello ${user.name},</p>
      <p>You have been granted temporary admin access until ${expiry.toLocaleString()}.</p>
      <p>Please use this privilege responsibly.</p>`;

    if (branding) {
      emailBody = `
        <div style="text-align:center; margin-bottom:20px;">
          ${branding.logoUrl ? `<img src="${branding.logoUrl}" style="max-height:60px;">` : ''}
          <p style="color:${branding.primaryColor}; margin-top:8px;">${branding.companyName}</p>
        </div>
        ${emailBody}
      `;
    }

    try {
      await sendEmail(user.email, "Temporary Admin Access Granted", emailBody);
    } catch (emailErr) {
      console.warn("Failed to send email notification:", emailErr.message);
    }

    res.status(200).json({
      message: `Temporary admin access granted to ${user.name} until ${expiry.toLocaleString()}.`,
      employee: { id: user.id, name: user.name, email: user.email, temp_admin_expiry: expiry },
    });
  } catch (err) {
    console.error("Grant Temp Admin Error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
/**
 * Revoke Temporary Admin Access from an Employee
 * DELETE /api/admin/revoke-temp/:email
 */
export const revokeTempAdminAccess = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email } = req.params;

    const userQuery = `
      SELECT * FROM ${USER_MASTER_TABLE} WHERE email = $1
    `;
    const userResult = await client.query(userQuery, [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    const user = userResult.rows[0];

    const updateQuery = `
      UPDATE ${REGISTRATIONS_TABLE}
      SET is_temp_admin = false, is_approved = false, temp_admin_expiry = NULL
      WHERE user_id = $1
    `;
    await client.query(updateQuery, [user.id]);

    try {
      await sendEmail(
        user.email,
        "Temporary Admin Access Revoked",
        `<p>Hello ${user.name},</p><p>Your temporary admin access has been revoked.</p>`
      );
    } catch (emailErr) {
      console.warn("Failed to send revocation email:", emailErr.message);
    }

    res.json({
      message: `Temporary admin access revoked for ${user.name}.`,
    });
  } catch (err) {
    console.error("Revoke Temp Admin Error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
/**
 * List All Active Temporary Admins
 * GET /api/admin/temp-admins
 */
export const listTempAdmins = async (req, res) => {
  const client = await pool.connect();
  try {
    const regQuery = `
      SELECT user_id, is_temp_admin, temp_admin_expiry
      FROM ${REGISTRATIONS_TABLE}
      WHERE is_temp_admin = true AND temp_admin_expiry >= NOW()
    `;
    const regResult = await client.query(regQuery);
    const regs = regResult.rows;

    if (regs.length === 0) {
      return res.json({
        message: "Active temporary admins fetched successfully.",
        count: 0,
        tempAdmins: [],
      });
    }

    const userIds = regs.map((r) => r.user_id);
    const userQuery = `
      SELECT id, name, email, role FROM ${USER_MASTER_TABLE}
      WHERE id = ANY($1)
    `;
    const userResult = await client.query(userQuery, [userIds]);

    const tempAdmins = regs.map((r) => {
      const user = userResult.rows.find((u) => u.id === r.user_id);
      return { ...r, ...user };
    });

    res.json({
      message: "Active temporary admins fetched successfully.",
      count: tempAdmins.length,
      tempAdmins,
    });
  } catch (err) {
    console.error("List Temp Admins Error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const sendEmailVerification = async (req, res) => {
  const client = await pool.connect();
  try {
    const decoded = getUserFromToken(req);
    const email = decoded.email;

    const userQuery = `
      SELECT id, name FROM ${USER_MASTER_TABLE} WHERE email = $1
    `;
    const userResult = await client.query(userQuery, [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = userResult.rows[0];

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    const updateQuery = `
      UPDATE ${REGISTRATIONS_TABLE}
      SET email_otp = $1, otp_expiry = $2
      WHERE user_id = $3
    `;
    await client.query(updateQuery, [otp, expiry, user.id]);

    await sendEmail(
      email,
      "Verify your Email",
      `<p>Hello ${user.name},</p>
       <p>Your email verification code is <b>${otp}</b></p>
       <p>Valid for 10 minutes.</p>`
    );

    res.json({ message: "Verification OTP sent to your email." });
  } catch (err) {
    console.error("Send Email Verification Error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const verifyEmail = async (req, res) => {
  const client = await pool.connect();
  try {
    const decoded = getUserFromToken(req);
    const email = decoded.email;
    const { otp } = req.body;

    const userResult = await client.query(
      `SELECT id FROM ${USER_MASTER_TABLE} WHERE email = $1`,
      [email]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = userResult.rows[0];

    const regResult = await client.query(
      `SELECT email_otp, otp_expiry FROM ${REGISTRATIONS_TABLE} WHERE user_id = $1`,
      [user.id]
    );
    if (regResult.rows.length === 0) {
      return res.status(400).json({ error: "No OTP found. Please request again." });
    }

    const reg = regResult.rows[0];
    const isValidOtp = String(reg.email_otp) === String(otp);
    const isExpired = new Date() > new Date(reg.otp_expiry);

    if (!isValidOtp || isExpired) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    await client.query(
      `UPDATE ${USER_MASTER_TABLE} SET is_email_verified = true WHERE id = $1`,
      [user.id]
    );

    await client.query(
      `UPDATE ${REGISTRATIONS_TABLE} SET email_otp = NULL, otp_expiry = NULL WHERE user_id = $1`,
      [user.id]
    );

    res.json({ message: "Email verified successfully." });
  } catch (err) {
    console.error("Verify Email Error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
/**
 * Promote an Employee to Admin (by Admin or SuperAdmin)
 * POST /api/admin/promote/:employeeId
 * No SuperAdmin required for promotion — only for final approval
 */
export const promoteEmployee = async (req, res) => {
  const client = await pool.connect();
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    const empResult = await client.query(
      `SELECT * FROM ${USER_MASTER_TABLE} WHERE id = $1 AND role = 'employee'`,
      [employeeId]
    );
    if (empResult.rows.length === 0) {
      return res.status(404).json({ error: "Employee not found or already promoted" });
    }
    const employee = empResult.rows[0];

    await client.query(
      `UPDATE ${USER_MASTER_TABLE}
       SET role = 'admin', role_1 = NULL, role_2 = 'employee', is_promoted = true
       WHERE id = $1`,
      [employeeId]
    );

    const regResult = await client.query(
      `SELECT * FROM ${REGISTRATIONS_TABLE} WHERE user_id = $1`,
      [employeeId]
    );

    if (regResult.rows.length === 0) {
      await client.query(
        `INSERT INTO ${REGISTRATIONS_TABLE}
         (user_id, is_approved, is_temp_admin, temp_admin_expiry)
         VALUES ($1, false, false, NULL)`,
        [employeeId]
      );
    }

    try {
      await sendEmail(
        employee.email,
        "You've Been Promoted to Admin!",
        `
          <p>Hello ${employee.name},</p>
          <p>You have been promoted to <strong>Admin</strong>.</p>
          <p>Please complete your admin registration by setting a password and enabling MFA.</p>
          <p>Note: Full access will be granted after SuperAdmin approval.</p>
        `
      );
    } catch (emailErr) {
      console.warn("Promotion email failed:", emailErr.message);
    }

    res.json({
      message:
        "Employee promoted successfully. Awaiting registration and SuperAdmin approval.",
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        is_promoted: true,
      },
    });
  } catch (err) {
    console.error("Promote Employee Error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const getPendingWeeklyApprovals = async (req, res) => {
  const client = await pool.connect();
  try {
    const { employeeId, from, to } = req.query;

    if (!employeeId || !from || !to) {
      return res.status(400).json({
        error: "Missing required query parameters (employeeId, from, to)",
      });
    }


    const query = `
      SELECT a.*, u.id AS user_id, u.name, u.email
      FROM attendance a
      JOIN user_employees_master u ON a.employee_id = u.id
      WHERE a.employee_id = $1
        AND a.weekly_status IN ('Pending_approval', 'approved')
        AND a.date BETWEEN $2 AND $3
    `;

    const result = await client.query(query, [employeeId, from, to]);



    // ✅ Format the date to remove time (YYYY-MM-DD)
    const formattedData = result.rows.map(row => {
      if (!row.date) return row;
      const localDate = new Date(row.date);
      const dateOnly = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0];
      return { ...row, date: dateOnly };
    });

    res.status(200).json({
      message: "Pending weekly approvals fetched successfully",
      count: formattedData.length,
      data: formattedData,
    });
  } catch (err) {
    console.error("Get Pending Weekly Approvals Error:", err.message);
    res.status(500).json({ error: "Failed to fetch pending weekly approvals" });
  } finally {
    client.release();
  }
};



/* -------------------------------------------------------------------------- */
/*                          ADMIN APPROVE / REJECT WEEK                   */
/* -------------------------------------------------------------------------- */
// export const updateWeeklyApprovalStatus = async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const { employeeId, from, to } = req.body;
//     const status = "approved"; // default status

//     const query = `
//       UPDATE attendance
//       SET weekly_status = $1
//       WHERE employee_id = $2
//         AND date BETWEEN $3 AND $4
//         AND weekly_status = 'Pending_approval'
//       RETURNING *;
//     `;

//     const result = await client.query(query, [status, employeeId, from, to]);

//     res.status(200).json({
//       message: `Weekly attendance ${status} successfully`,
//       updated_count: result.rows.length,
//       data: result.rows,
//     });
//   } catch (err) {
//     console.error("Update Weekly Status Error:", err.message);
//     res.status(500).json({ error: "Failed to update weekly attendance" });
//   } finally {
//     client.release();
//   }
// };

export const updateWeeklyApprovalStatus = async (req, res) => {
  const client = await pool.connect();

  try {
    const { employeeId, from, to } = req.body;
    const status = "approved"; 

    // Extract admin name
    let adminName = "System Admin";
    const authHeader = req.headers["authorization"];

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        adminName = decoded.name || decoded.email || "System Admin";
      } catch (err) {
        console.warn("Invalid or expired token:", err.message);
      }
    } else if (req.body.updatedBy) {
      adminName = req.body.updatedBy;
    }

    const updatedBy = adminName.substring(0, 255);

    // Update only weekly status
    const query = `
      UPDATE attendance
      SET weekly_status = $1,
          updated_by = $5,
          updated_at = NOW()
      WHERE employee_id = $2
        AND "date" BETWEEN $3 AND $4
        AND weekly_status = 'Pending_approval'
      RETURNING *;
    `;

    const result = await client.query(query, [
      status,
      employeeId,
      from,
      to,
      updatedBy,
    ]);

    if (result.rows.length === 0) {
      return res.status(200).json({
        message: "No pending weekly approvals found.",
        updated_count: 0,
      });
    }

  

    res.status(200).json({
      message: `Weekly attendance approved by ${updatedBy}`,
      updated_count: result.rows.length,
      data: result.rows,
    });

  } catch (err) {
    console.error("Update Weekly Status Error:", err.message);
    res.status(500).json({ error: "Failed to update weekly attendance" });
  } finally {
    client.release();
  }
};

/* -------------------------------------------------------------------------- */
/*                      GET PENDING MONTHLY APPROVALS (ADMIN)                 */
/* -------------------------------------------------------------------------- */
export const getPendingMonthlyApprovals = async (req, res) => {
  const client = await pool.connect();
  try {
    const { employeeId, from, to } = req.query;

    if (!employeeId || !from || !to) {
      return res.status(400).json({
        error: "Missing required query parameters (employeeId, from, to)",
      });
    }

    const query = `
      SELECT a.*, u.id AS user_id, u.name, u.email
      FROM attendance a
      JOIN user_employees_master u ON a.employee_id = u.id
      WHERE a.employee_id = $1
        AND a.monthly_status IN ('Pending_approval', 'approved')
        AND a.date BETWEEN $2 AND $3
    `;

    const result = await client.query(query, [employeeId, from, to]);

    res.status(200).json({
      message: "Pending monthly approvals fetched successfully",
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error("Get Pending Monthly Approvals Error:", err.message);
    res.status(500).json({ error: "Failed to fetch pending monthly approvals" });
  } finally {
    client.release();
  }
};

/* -------------------------------------------------------------------------- */
/*                       ADMIN APPROVES MONTHLY ATTENDANCE                    */
/* -------------------------------------------------------------------------- */
// export const updateMonthlyApprovalStatus = async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const { employeeId, from, to } = req.body;
//     const status = "approved";

//     const query = `
//       UPDATE attendance
//       SET monthly_status = $1
//       WHERE employee_id = $2
//         AND date BETWEEN $3 AND $4
//         AND monthly_status = 'Pending_approval'
//       RETURNING *;
//     `;

//     const result = await client.query(query, [status, employeeId, from, to]);

//     res.status(200).json({
//       message: `Monthly attendance ${status} successfully`,
//       updated_count: result.rows.length,
//       data: result.rows,
//     });
//   } catch (err) {
//     console.error("Update Monthly Status Error:", err.message);
//     res.status(500).json({ error: "Failed to update monthly attendance" });
//   } finally {
//     client.release();
//   }
// };

// export const updateMonthlyApprovalStatus = async (req, res) => {
//   const client = await pool.connect();

//   try {
//     const { employeeId, from, to } = req.body;
//     const status = "approved";

//     // ✅ Extract admin name from JWT token or body
//     let adminName = "System Admin";
//     const authHeader = req.headers["authorization"];

//     if (authHeader && authHeader.startsWith("Bearer ")) {
//       const token = authHeader.split(" ")[1];
//       try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         adminName = decoded.name || decoded.email || "System Admin";
//       } catch (err) {
//         console.warn("Invalid or expired token:", err.message);
//       }
//     } else if (req.body.updatedBy) {
//       adminName = req.body.updatedBy;
//     }

//     const updatedBy = adminName.substring(0, 255);

//     // ✅ Update query for monthly status
//     const query = `
//       UPDATE attendance
//       SET monthly_status = $1,
//           updated_by = $5,
//           updated_at = NOW()
//       WHERE employee_id = $2
//         AND "date" BETWEEN $3 AND $4
//         AND monthly_status = 'Pending_approval'
//       RETURNING *;
//     `;

//     const result = await client.query(query, [
//       status,
//       employeeId,
//       from,
//       to,
//       updatedBy,
//     ]);

//     // ✅ Response handling
//     if (result.rows.length === 0) {
//       return res.status(200).json({
//         message: "No pending approvals found for the given month.",
//         updated_count: 0,
//       });
//     }

//     res.status(200).json({
//       message: `Monthly attendance ${status} successfully by ${updatedBy}`,
//       updated_count: result.rows.length,
//       data: result.rows,
//     });
//   } catch (err) {
//     console.error("Update Monthly Status Error:", err.message);
//     res.status(500).json({ error: "Failed to update monthly attendance" });
//   } finally {
//     client.release();
//   }
// };

export const updateMonthlyApprovalStatus = async (req, res) => {
  const client = await pool.connect();

  try {
    const { employeeId, from, to } = req.body;
    const status = "approved";

    // Extract admin name
    let adminName = "System Admin";
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        adminName = decoded.name || decoded.email || "System Admin";
      } catch (err) {}
    }
    const updatedBy = adminName.substring(0, 255);

    // 1️⃣ Update monthly status in DB
    const query = `
      UPDATE attendance
      SET monthly_status = $1,
          updated_by = $5,
          updated_at = NOW()
      WHERE employee_id = $2
        AND date BETWEEN $3 AND $4
        AND monthly_status = 'Pending_approval'
      RETURNING *;
    `;

    const result = await client.query(query, [
      status,
      employeeId,
      from,
      to,
      updatedBy,
    ]);

    if (result.rows.length === 0) {
      return res.status(200).json({
        message: "No pending approvals found for this month.",
        updated_count: 0,
      });
    }

    // 2️⃣ CALL JAVA MONTHLY LEAVE ENGINE HERE
    try {  
      await axios.post(
        "http://localhost:9191/api/attendance/apply-default-leaves-on-approval",
        {
          employeeId,
          from,
          to,
          adminName: updatedBy,
        }
      );
    } catch (err) {
      console.error("⚠️ Monthly leave calculation failed:", err.message);
    }

    // 3️⃣ Return Response
    res.status(200).json({
      message: `Monthly attendance approved by ${updatedBy}`,
      updated_count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error("❌ Update Monthly Status Error:", err.message);
    res.status(500).json({ error: "Failed to update monthly attendance" });
  } finally {
    client.release();
  }
};

/* -------------------------------------------------------------------------- */
/*        ADMIN UPDATES WORKED HOURS (Weekly or Monthly Pending Record)       */
/* -------------------------------------------------------------------------- */
export const adminUpdateWorkedHours = async (req, res) => {
  try {
    const updates = Array.isArray(req.body) ? req.body : [req.body]; // handle both single & multiple
    const updatedRows = [];

    for (const update of updates) {
      const { employeeId, date, worked_hours, type } = update;

      // ✅ Validate required fields
      if (!employeeId || !date || worked_hours === undefined || !type) {
        console.warn("⚠️ Skipping invalid update record:", update);
        continue;
      }

      const statusField = type === "monthly" ? "monthly_status" : "weekly_status";

      const query = `
        UPDATE attendance
        SET worked_hours = $1
        WHERE employee_id = $2
          AND date = $3
          AND ${statusField} = 'Pending_approval'
        RETURNING *;
      `;

      const { rows } = await pool.query(query, [worked_hours, employeeId, date]);

      if (rows.length > 0) {
        updatedRows.push(rows[0]);
      }
    }

    // ✅ If no records updated, respond accordingly
    if (updatedRows.length === 0) {
      return res.status(400).json({
        message: `No pending records found for the provided dates (already approved or invalid).`,
      });
    }

    // ✅ Final success response
    res.status(200).json({
      message: `Worked hours updated successfully for ${updatedRows.length} record(s).`,
      updatedCount: updatedRows.length,
      data: updatedRows,
    });

  } catch (err) {
    console.error("Admin Update Worked Hours Error:", err.message);
    res.status(500).json({ error: "Failed to update worked hours" });
  }
};




export const rejectWeeklyApproval = async (req, res) => {
  try {
    const { employeeId, from, to } = req.body;
    const status = "rejected";

    const query = `
     UPDATE attendance
  SET weekly_status = $1
  WHERE employee_id = $2
    AND date BETWEEN $3 AND $4
    AND weekly_status = 'Pending_approval'
  RETURNING *, TO_CHAR(date, 'YYYY-MM-DD') AS formatted_date;
    `;

    const { rows } = await pool.query(query, [status, employeeId, from, to]);



    res.status(200).json({
      message: `Weekly attendance ${status} successfully`,
      updated_count: rows.length,
      data: rows.map(r => ({
        ...r,
        date: r.formatted_date, // ✅ Pure YYYY-MM-DD from DB
      })),
    });
  } catch (err) {
    console.error("Reject Weekly Status Error:", err.message);
    res.status(500).json({ error: "Failed to reject weekly attendance" });
  }
};

export const rejectMonthlyApproval = async (req, res) => {
  try {
    const { employeeId, from, to } = req.body;
    const status = "rejected";

    const query = `
      UPDATE attendance
      SET monthly_status = $1
      WHERE employee_id = $2
        AND date BETWEEN $3 AND $4
        AND monthly_status = 'Pending_approval'
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [status, employeeId, from, to]);

    res.status(200).json({
      message: `Monthly attendance ${status} successfully`,
      updated_count: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("Reject Monthly Status Error:", err.message);
    res.status(500).json({ error: "Failed to reject monthly attendance" });
  }
};

export const approveParentalLeave = async (req, res) => {
  try {
    const { attendance_id, action } = req.body;

    if (!attendance_id || !action) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Fetch existing record
    const fetchQuery = `
      SELECT leave_type, date
      FROM attendance
      WHERE id = $1;
    `;
    const { rows: recordRows } = await pool.query(fetchQuery, [attendance_id]);
    const record = recordRows[0];

    if (!record) {
      return res.status(404).json({ error: "Leave record not found" });
    }

    const { leave_type, date: start_date } = record;

    const leaveDays =
      action === "approve"
        ? leave_type === "maternity"
          ? 180
          : 5
        : 0;

    const startDateObj = new Date(start_date);
    const endDate = new Date(startDateObj);
    endDate.setDate(startDateObj.getDate() + leaveDays - 1);

    const updateData =
      action === "approve"
        ? {
          weekly_status: "approved",
          monthly_status: "approved",
          maternity_leave: leave_type === "maternity" ? leaveDays : 0,
          paternity_leave: leave_type === "paternity" ? leaveDays : 0,
        }
        : {
          weekly_status: "rejected",
          monthly_status: "rejected",
        };

    const updateQuery = `
      UPDATE attendance
      SET weekly_status = $1,
          monthly_status = $2,
          maternity_leave = $3,
          paternity_leave = $4
      WHERE id = $5
      RETURNING *;
    `;

    const { rows } = await pool.query(updateQuery, [
      updateData.weekly_status,
      updateData.monthly_status,
      updateData.maternity_leave || 0,
      updateData.paternity_leave || 0,
      attendance_id,
    ]);

    return res.status(200).json({
      message:
        action === "approve"
          ? `${leave_type} leave approved (${leaveDays} days from ${start_date} to ${endDate.toISOString().split("T")[0]})`
          : `${leave_type} leave rejected`,
      record: rows[0],
    });
  } catch (err) {
    console.error("Error approving parental leave:", err.message);
    return res.status(500).json({ error: "Error approving parental leave" });
  }
};

/**
 * Fetch all pending parental leave requests (for Admin dashboard)
 * GET /attendance/pending-parental
 */
export const getPendingParentalLeaves = async (req, res) => {
  try {
    const query = `
      SELECT 
        a.id,
        a.employee_id,
        a.leave_type,
        a.date,
        a.weekly_status,
        e.name,
        e.email,
        e.role
      FROM attendance a
      INNER JOIN user_employees_master e ON a.employee_id = e.id
      WHERE a.leave_type IN ('maternity', 'paternity')
        AND a.weekly_status = 'Pending_approval';
    `;

    const { rows } = await pool.query(query);

    const formatted = rows.map((r) => ({
      id: r.id,
      employeeId: r.employee_id,
      name: r.name,
      email: r.email,
      role: r.role,
      leaveType: r.leave_type.charAt(0).toUpperCase() + r.leave_type.slice(1),
      status: "Pending",
      startDate: r.date,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Error fetching pending parental leaves:", err.message);
    res.status(500).json({ error: "Failed to fetch pending parental leave requests" });
  }
};


export const getAuditLogs = async (req, res) => {
  const client = await pool.connect();

  try {
    const query = `
      SELECT 
        a.id,
        e.name AS employee_name,
        a.employee_id,
        a.created_by,
        a.updated_by,
        a.created_at,
        a.updated_at,
        a.weekly_status,
        a.monthly_status
      FROM attendance a
      LEFT JOIN user_employees_master e ON a.employee_id = e.id
      WHERE 
        (
          a.weekly_status = 'Pending_approval' 
          OR a.monthly_status = 'Pending_approval'
        )
      ORDER BY a.updated_at DESC
    `;

    const result = await client.query(query);

    res.status(200).json({
      message: "✅ All audit logs fetched successfully",
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error("❌ Error fetching audit logs:", err.message);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  } finally {
    client.release();
  }
};
// Template mapping (already exists in your file)
const templateFileMap = {
  "Offer Letter": "offerLetter.html",
  "Appointment Letter": "appointmentLetter.html",
  "Experience Letter": "experienceLetter.html",
  "Relieving Letter": "relievingLetter.html",
  "Confirmation Letter": "confirmationLetter.html",
  "Promotion Letter": "promotionLetter.html",
  "Salary Increment Letter": "salaryIncrementLetter.html",
  "Warning Letter": "warningLetter.html",
  "freelancer contract": "freelancerContract.html",
  "invoice Template": "invoiceTemplate.html",
};

// Replace {{placeholders}}
function fillTemplate(template, data) {
  return template.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()] || "");
}

// PDF generator
async function generatePDF(htmlContent, outputPath) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });
  await page.pdf({ path: outputPath, format: "A4", printBackground: true });
  await browser.close();
}

// ✅ FULLY UPDATED generateLetter
export const generateLetter = async (req, res) => {
  const client = await pool.connect();
  try {
    const { employeeId, letterType } = req.body;
    if (!employeeId || !letterType) {
      return res.status(400).json({ error: "employeeId and letterType are required" });
    }
    const empResult = await client.query(
      `SELECT * FROM user_employees_master WHERE id = $1`,
      [employeeId]
    );
    const emp = empResult.rows[0];
    if (!emp) return res.status(404).json({ error: "Employee not found" });
    const salResult = await client.query(
      `SELECT * FROM salary_structure WHERE employee_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [employeeId]
    );
    const sal = salResult.rows[0] || {};

    // ✅ GET BRANDING (this was missing!)
    const branding = await getBrandingForContext("letters");

    const selectedTemplate = templateFileMap[letterType];
    if (!selectedTemplate)
      return res.status(400).json({ error: "Invalid letter type selected" });
    const templateContent = loadTemplate(selectedTemplate);
    if (!templateContent) {
      return res.status(500).json({ error: "Template file missing" });
    }

    // ✅ Inject company_name from branding or fallback
    const data = {
      name: emp.name,
      designation: emp.designation,
      department: emp.department,
      employee_code: emp.employee_id,
      address: emp.address,
      permanent_address: emp.permanent_address,
      date_of_joining: emp.date_of_joining,
      effective_from: sal.effective_from,
      effective_to: sal.effective_to,
      location: sal.location,
      basic_pay: sal.basic_pay,
      hra: sal.hra,
      special_allowance: sal.special_allowance,
      other_allowances: sal.other_allowances,
      gross_salary: sal.gross_salary,
      net_salary: sal.net_salary,
      pan_number: sal.pan_number,
      bank_name: sal.bank_name,
      ifsc_code: sal.ifsc_code,
      account_number: sal.account_number,
      company_name: branding?.companyName || "Zigma People Private Limited (An AI India Venture)",
      ctc: sal.gross_salary,
    };

    let filledHTML = fillTemplate(templateContent, data);

    // ✅ INJECT LOGO + HEADER (this was missing!)
    if (branding) {
      const logoHtml = branding.logoUrl
        ? `<img src="${branding.logoUrl}" style="max-height:60px; margin-bottom:10px;" />`
        : "";
      const headerHtml = `
        <div style="text-align:center; margin-bottom:20px;">
          ${logoHtml}
          <h2 style="color:${branding.primaryColor || '#000'}; text-decoration:underline;">
            ${letterType.toUpperCase()}
          </h2>
        </div>
      `;
      filledHTML = filledHTML.replace('<h2>LETTER_HEADER_PLACEHOLDER</h2>', headerHtml);
    } else {
      // Fallback if branding is disabled
      filledHTML = filledHTML.replace(
        '<h2>LETTER_HEADER_PLACEHOLDER</h2>',
        `<h2 style="text-align:center; text-decoration:underline;">${letterType.toUpperCase()}</h2>`
      );
    }

    // Generate PDF
    const lettersDir = path.join(process.cwd(), "src/uploads/letters");
    if (!fs.existsSync(lettersDir)) fs.mkdirSync(lettersDir, { recursive: true });
    const fileName = `${letterType.replace(/ /g, "_")}_${Date.now()}.pdf`;
    const filePath = path.join(lettersDir, fileName);
    await generatePDF(filledHTML, filePath);

    // Save to DB
    const docResult = await client.query(
      `SELECT document_url FROM user_employees_master WHERE id=$1`,
      [employeeId]
    );
    let existingDocs = docResult.rows[0]?.document_url || [];
    if (!Array.isArray(existingDocs)) existingDocs = [];
    existingDocs.push(fileName);
    await client.query(
      `UPDATE user_employees_master
         SET document_url = $1::jsonb,
             updated_at = NOW()
         WHERE id = $2`,
      [JSON.stringify(existingDocs), employeeId]
    );

    return res.json({
      message: "Letter generated successfully",
      pdf_url: `/uploads/letters/${fileName}`,
      file_name: fileName,
      documents: existingDocs
    });
  } catch (err) {
    console.error("Generate Letter Error:", err.message);
    return res.status(500).json({ error: "Failed to generate letter" });
  } finally {
    client.release();
  }
};
// export const getEmployeeLetters = async (req, res) => {
//   const client = await pool.connect();

//   try {
//     const { employeeId } = req.params;

//     const result = await client.query(
//       `SELECT document_url FROM user_employees_master WHERE id = $1`,
//       [employeeId]
//     );

//     // ✅ Safely extract and normalize document_url
//     let docs = result.rows[0]?.document_url;

//     // If docs is not an array, treat as empty
//     if (!Array.isArray(docs)) {
//       docs = [];
//     }

//     const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5002}`;

//     const files = docs.map((file) => ({
//       name: file,
//       url: `${BASE_URL}/uploads/letters/${file}`,
//     }));

//     res.json({
//       message: "Employee letters retrieved successfully",
//       files,
//     });
//   } catch (err) {
//     console.error("Get Employee Letters Error:", err);
//     res.status(500).json({ error: err.message });
//   } finally {
//     client.release();
//   }
// };

export const getEmployeeLetters = async (req, res) => {
  const client = await pool.connect();

  try {
    const { employeeId } = req.params;

    // 1️⃣ Validate input
    if (!employeeId) {
      return res.status(400).json({
        error: "Employee ID is required"
      });
    }

    // 2️⃣ Fetch employee record
    const result = await client.query(
      `SELECT document_url
       FROM user_employees_master
       WHERE id = $1`,
      [employeeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Employee not found"
      });
    }

    let docs = result.rows[0].document_url;

    // 3️⃣ Normalize document_url safely
    let letterFiles = [];

    if (Array.isArray(docs)) {
      // letters stored as array
      letterFiles = docs;
    } 
    else if (docs && typeof docs === "object") {
      // ignore non-letter documents
      letterFiles = [];
    }

    // 4️⃣ Build URLs
    const BASE_URL =
      process.env.BASE_URL ||
      `http://localhost:${process.env.PORT || 5002}`;

    const files = letterFiles.map(file => ({
      name: file,
      url: `${BASE_URL}/uploads/letters/${file}`
    }));

    // 5️⃣ Success response
    return res.status(200).json({
      success: true,
      total: files.length,
      files
    });

  } catch (err) {
    console.error("Get Employee Letters Error:", err);
    return res.status(500).json({
      error: "Failed to fetch employee letters"
    });
  } finally {
    client.release();
  }
};


export const downloadEmployeeLetter = async (req, res) => {
  const client = await pool.connect();

  try {
    const { employeeId, fileName } = req.params;

    if (!employeeId || !fileName) {
      return res.status(400).json({
        error: "Employee ID and file name are required"
      });
    }

    // 1️⃣ Verify employee + letter ownership
    const result = await client.query(
      `SELECT document_url
       FROM user_employees_master
       WHERE id = $1`,
      [employeeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Employee not found"
      });
    }

    const docs = result.rows[0].document_url || [];

    if (!Array.isArray(docs) || !docs.includes(fileName)) {
      return res.status(403).json({
        error: "You are not authorized to access this file"
      });
    }

    // 2️⃣ File path
    const filePath = path.join(
      process.cwd(),
      "src/uploads/letters",
      fileName
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: "File not found on server"
      });
    }

    // 3️⃣ Send file for download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );
    res.setHeader("Content-Type", "application/pdf");

    return res.sendFile(filePath);

  } catch (err) {
    console.error("Download Letter Error:", err);
    return res.status(500).json({
      error: "Failed to download letter"
    });
  } finally {
    client.release();
  }
};


export const documentUpload = upload.fields([
  { name: "passbook", maxCount: 1 },
  { name: "aadhaar", maxCount: 1 },
  { name: "pan", maxCount: 1 },
  { name: "educational_docs", maxCount: 10 },
  { name: "experience_docs", maxCount: 10 }
]);


export const uploadEmployeeDocuments = async (req, res) => {
  const client = await pool.connect();

  try {
    const admin = getUserFromToken(req);

    if (admin.role !== "admin") {
      return res.status(403).json({ error: "Only admin can upload documents." });
    }

    const employeeId = req.params.id;
    if (!employeeId) {
      return res.status(400).json({ error: "Employee ID required" });
    }

    const files = req.files;

    // Get existing document_url from DB
    const existingDataResult = await client.query(
      `SELECT document_url FROM user_employees_master WHERE id = $1`,
      [employeeId]
    );

    let existingData = existingDataResult.rows[0]?.document_url || {};

    //  Create a copy to update
    let updatedDocuments = { ...existingData };

    //  Add ONLY the newly uploaded files — merge instead of overwrite
    if (files.passbook) {
      updatedDocuments.passbook = files.passbook[0].filename;
    }

    if (files.aadhaar) {
      updatedDocuments.aadhaar = files.aadhaar[0].filename;
    }

    if (files.pan) {
      updatedDocuments.pan = files.pan[0].filename;
    }

    if (files.educational_docs) {
      updatedDocuments.educational_docs = [
        ...(existingData.educational_docs || []),
        ...files.educational_docs.map(f => f.filename)
      ];
    }

    if (files.experience_docs) {
      updatedDocuments.experience_docs = [
        ...(existingData.experience_docs || []),
        ...files.experience_docs.map(f => f.filename)
      ];
    }

    //  Save merged JSON back to DB
    await client.query(
      `UPDATE user_employees_master 
       SET document_url = $1,
       status = 'uploaded',
           updated_at = NOW()
       WHERE id = $2`,
      [updatedDocuments, employeeId]
    );

    return res.json({
      message: "Documents uploaded successfully",
      documents: updatedDocuments
    });

  } catch (err) {
    console.error("Doc Upload Error:", err.message);
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};



export const getAllEmployeesWithDocs = async (req, res) => {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT 
        id,
        name,
        email,
        phone,
        department,
        designation,
        employment_type,
        date_of_joining,
        document_url,
        status
      FROM user_employees_master
      WHERE status = 'uploaded'
      ORDER BY created_at DESC
    `);

    return res.json({
      success: true,
      total: result.rows.length,
      employees: result.rows
    });

  } catch (err) {
    console.error("Error fetching employees with documents:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};


export const downloadEmployeeDocument = async (req, res) => {
  const { employeeId, docType, index } = req.params;
  const client = await pool.connect();

  try {
    const result = await client.query(
      "SELECT document_url FROM user_employees_master WHERE id = $1",
      [employeeId]
    );

    if (!result.rows[0]) return res.status(404).json({ error: "Employee not found" });

    const docs = result.rows[0].document_url || {};
    let filename;

    if (docType === "educational_docs" || docType === "experience_docs") {
      filename = docs[docType] ? docs[docType][parseInt(index)] : null;
    } else {
      filename = docs[docType];
    }

    if (!filename) return res.status(404).json({ error: "File not found" });

    const filePath = path.resolve(`./src/uploads/${filename}`);
    return res.download(filePath);  // <-- triggers browser download
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};




// DELETE /letters/:employeeId/:filename
export const deleteLetter = async (req, res) => {
  const client = await pool.connect();
  const { employeeId, filename } = req.params;

  try {
    // Validate input
    if (!employeeId || !filename) {
      return res.status(400).json({ error: "employeeId and filename are required" });
    }

    //  Fetch current document list
    const docResult = await client.query(
      `SELECT document_url FROM user_employees_master WHERE id = $1`,
      [employeeId]
    );

    const existingDocs = docResult.rows[0]?.document_url || [];

    if (!Array.isArray(existingDocs) || !existingDocs.includes(filename)) {
      return res.status(404).json({ error: "Letter not found" });
    }

    //  Remove filename from array
    const updatedDocs = existingDocs.filter((file) => file !== filename);

    //  Update DB
    await client.query(
      `UPDATE user_employees_master
       SET document_url = $1::jsonb,
           updated_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(updatedDocs), employeeId]
    );

    //  Delete file from filesystem
    const filePath = path.join(process.cwd(), "src/uploads/letters", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Synchronous delete (or use fs.promises.unlink for async)
    }

    return res.json({
      message: "Letter deleted successfully",
      documents: updatedDocs
    });

  } catch (err) {
    console.error("Delete Letter Error:", err.message);
    return res.status(500).json({ error: "Failed to delete letter" });
  } finally {
    client.release();
  }
};


export const sendLetterEmail = async (req, res) => {
  const client = await pool.connect();
  try {
    const { employeeId, fileName } = req.body;
    if (!employeeId || !fileName) {
      return res.status(400).json({ error: "employeeId and fileName are required" });
    }

    const empResult = await client.query(
      `SELECT name, email FROM user_employees_master WHERE id=$1`,
      [employeeId]
    );
    const emp = empResult.rows[0];
    if (!emp) return res.status(404).json({ error: "Employee not found" });

    const filePath = path.join(process.cwd(), "src/uploads/letters", fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on server" });
    }

    // ✅ Get branding for EMAIL
    const branding = await getBrandingForContext("email");

    let emailBody = `<p>Hello ${emp.name},</p>
      <p>Please find your <strong>${fileName.split("_")[0]}</strong> attached.</p>`;

    // ✅ Inject logo + company name if branding is active
    if (branding) {
      emailBody = `
        <div style="text-align:center; margin-bottom:20px;">
          ${branding.logoUrl ? `<img src="${branding.logoUrl}" style="max-height:60px;">` : ''}
          <p style="color:${branding.primaryColor}; margin-top:8px;">${branding.companyName}</p>
        </div>
        ${emailBody}
      `;
    }

    emailBody += `<p>Regards,<br/>HR Team</p>`;

    await sendEmail(emp.email, `Your ${fileName.split("_")[0]} Letter`, emailBody, filePath, fileName);

    return res.json({
      message: "📧 Email sent successfully with attachment",
      sent_to: emp.email,
      file: fileName
    });
  } catch (err) {
    console.error("Send Letter Email Error:", err);
    return res.status(500).json({ error: "Failed to send email with attachment" });
  } finally {
    client.release();
  }
};
export const getAllReferralsAdmin = async (req, res) => {
  const client = await pool.connect();

  try {
    const query = `
      SELECT 
        r.id,
        r.referral_id,
        r.candidate_name,
        r.candidate_email,
        r.phone_number,
        r.position,
        r.work_exp,
        r.resume,
        r.status,
        r.referred_at,
        u.employee_id AS referrer_employee_id,
        u.name AS referrer_name,
        u.email AS referrer_email
      FROM ${REFERRALS_TABLE} r
      LEFT JOIN ${USER_MASTER_TABLE} u
      ON r.referred_by = u.id
      ORDER BY r.referred_at DESC
    `;

    const result = await client.query(query);

    return res.status(200).json({
      total: result.rowCount,
      referrals: result.rows,
    });

  } catch (err) {
    console.error("Get All Referrals (Admin) Error:", err.message);
    return res.status(500).json({ error: "Internal server error." });
  } finally {
    client.release();
  }
};

export const getReferralByIdAdmin = async (req, res) => {
  const client = await pool.connect();

  try {
    const { referral_id } = req.params;

    const query = `
      SELECT r.*, u.employee_id, u.name AS referrer_name, u.email AS referrer_email
      FROM ${REFERRALS_TABLE} r
      LEFT JOIN ${USER_MASTER_TABLE} u ON r.referred_by = u.id
      WHERE r.referral_id = $1
    `;

    const result = await client.query(query, [referral_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Referral not found." });
    }

    return res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error("Get Referral By ID Error:", err.message);
    return res.status(500).json({ error: "Internal server error." });
  } finally {
    client.release();
  }
};

export const updateReferralStatusAdmin = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params; // referral UUID
    const {
      status,
      interview_date,
      interview_time,
      meeting_link,
      interview_round,
      interviewers = []
    } = req.body;

    const VALID_STATUSES = ["Shortlisted", "Interview", "Hired", "Rejected"];

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Invalid status." });
    }

    // Fetch referral
    const selectQuery = `
      SELECT r.*, u.email AS referrer_email, u.name AS referrer_name
      FROM ${REFERRALS_TABLE} r
      LEFT JOIN ${USER_MASTER_TABLE} u ON r.referred_by = u.id
      WHERE r.id = $1
    `;
    const result = await client.query(selectQuery, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Referral not found." });
    }

    const referral = result.rows[0];

    // ======================================
    // INTERVIEW STATUS → append new round
    // ======================================
    let updatedInterviewDetails = referral.inteview_details || [];

    if (status === "Interview") {
      if (!interview_date || !interview_time || !meeting_link || !interview_round) {
        return res.status(400).json({
          error: "Interview date, time, meeting link, and round are required for Interview status."
        });
      }

      const newRound = {
        round_name: interview_round,
        date: interview_date,
        time: interview_time,
        interviewers,
        meeting_link
      };

      updatedInterviewDetails.push(newRound);
    }

    // -----------------------------------
    // Update referral
    // -----------------------------------
    const updateQuery = `
      UPDATE ${REFERRALS_TABLE}
      SET status = $1,
          inteview_details = $2::jsonb,
          updated_by = 'Admin',
          updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;

    const updateRes = await client.query(updateQuery, [
  status,
  JSON.stringify(updatedInterviewDetails),   // <-- FIX
  id
]);

    const updatedReferral = updateRes.rows[0];

    // ======================================================
    // EMAIL 1 → EMPLOYEE (Referrer)
    // ======================================================
    await sendEmail(
      referral.referrer_email,
      `Referral Status Update - ${status}`,
      `
        <h2>Your Referral Status Updated</h2>
        <p><strong>Candidate:</strong> ${referral.candidate_name}</p>
        <p><strong>Referral ID:</strong> ${referral.referral_id}</p>
        <p><strong>New Status:</strong> ${status}</p>
      `
    );

    // ======================================================
    // EMAIL 2 → Candidate (latest interview round only)
    // ======================================================
    if (status === "Interview") {
      const latestRound = updatedInterviewDetails[updatedInterviewDetails.length - 1];

      await sendEmail(
        referral.candidate_email,
        `Interview Scheduled - ${latestRound.round_name}`,
        `
          <h2>Your Interview is Scheduled</h2>
          <p>Dear ${referral.candidate_name},</p>
          <p>Your <strong>${latestRound.round_name}</strong> has been scheduled.</p>

          <p><strong>Date:</strong> ${latestRound.date}</p>
          <p><strong>Time:</strong> ${latestRound.time}</p>
          <p><strong>Meeting Link:</strong> <a href="${latestRound.meeting_link}">Join Meeting</a></p>

          <p><strong>Interviewers:</strong></p>
          <ul>
            ${latestRound.interviewers.map(i => `<li>${i}</li>`).join("")}
          </ul>
        `
      );
    }

    // HIRED EMAIL
    if (status === "Hired") {
      await sendEmail(
        referral.candidate_email,
        "Congratulations! You Are Hired",
        `
          <h2>Congratulations 🎉</h2>
          <p>Dear ${referral.candidate_name},</p>
          <p>You have been selected for <strong>${referral.position}</strong>.</p>
          <p>Our HR team will contact you with onboarding details.</p>
        `
      );
    }

    // REJECTED EMAIL
    if (status === "Rejected") {
      await sendEmail(
        referral.candidate_email,
        "Application Status - Not Selected",
        `
          <h2>Thank You For Your Time</h2>
          <p>Dear ${referral.candidate_name},</p>
          <p>We regret to inform you that you were not selected for the position of <strong>${referral.position}</strong>.</p>
        `
      );
    }

    return res.status(200).json({
      message: "Status updated successfully.",
      updated_referral: updatedReferral
    });

  } catch (err) {
    console.error("Update Referral Status Error:", err.message);
    return res.status(500).json({ error: "Internal server error." });
  } finally {
    client.release();
  }
};



export const createFreelancerContract = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      freelancer_id,
      contract_title,
      contract_start_date,
      contract_end_date,
      payment_type,
      payment_amount,
      payment_terms,
      scope_of_work
    } = req.body;

    const freelancerResult = await client.query(`SELECT * FROM user_employees_master WHERE id=$1`, [freelancer_id]);
    if (freelancerResult.rowCount === 0) return res.status(404).json({ error: "Freelancer not found" });
    const freelancer = freelancerResult.rows[0];
    if (freelancer.employment_type !== "freelancer") return res.status(400).json({ error: "User is not a freelancer" });

    const salaryRes = await client.query(`SELECT * FROM salary_structure WHERE employee_id=$1 ORDER BY created_at DESC LIMIT 1`, [freelancer_id]);
    const salary = salaryRes.rows[0] || {};

    // ✅ Get branding for LETTERS (to inject company name in contract)
    const branding = await getBrandingForContext("letters");

    const data = {
      name: freelancer.name,
      email: freelancer.email,
      phone: freelancer.phone,
      gst: freelancer.gst,
      designation: freelancer.designation,
      address: freelancer.address,
      permanent_address: freelancer.permanent_address,
      date_of_joining: freelancer.date_of_joining,
      payment_method: salary.payment_method,
      bank_name: salary.bank_name,
      account_number: salary.account_number,
      ifsc_code: salary.ifsc_code,
      pan_number: salary.pan_number,
      location: salary.location,
      gross_salary: salary.gross_salary,
      net_salary: salary.net_salary,
      contract_title,
      contract_start_date,
      contract_end_date,
      payment_type,
      payment_amount,
      payment_terms,
      scope_of_work,
      company_name: branding?.companyName || "Your Company Pvt Ltd", // ← Inject company name
    };

    let htmlTemplate = loadTemplate("freelancerContract.html");
    let filledHTML = fillTemplate(htmlTemplate, data);

    // ✅ Inject logo + header if branding is active (for "letters")
    if (branding?.logoUrl || branding?.primaryColor) {
      const logoHtml = branding.logoUrl
        ? `<img src="${branding.logoUrl}" style="max-height:60px; margin-bottom:10px;">`
        : "";
      const headerHtml = `
        <div style="text-align:center; margin-bottom:20px;">
          ${logoHtml}
          <h1 style="color:${branding.primaryColor || '#000'};">FREELANCER CONTRACT AGREEMENT</h1>
          <h3 style="color:${branding.primaryColor || '#000'};">${contract_title}</h3>
          <hr />
        </div>
      `;
      filledHTML = filledHTML.replace(/<h1>FREELANCER CONTRACT AGREEMENT<\/h1>\s*<h3>.*?<\/h3>\s*<hr \/>/, headerHtml);
    }

    const dir = path.join(process.cwd(), "src/uploads/contracts");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const fileName = `Contract_${freelancer_id}_${Date.now()}.pdf`;
    const filePath = path.join(dir, fileName);
    await generatePDF(filledHTML, filePath);

    await client.query(
      `INSERT INTO freelancer_contracts (freelancer_id, contract_title, contract_start_date, contract_end_date, payment_type, payment_amount, payment_terms, scope_of_work, pdf_file, version)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,1)`,
      [freelancer_id, contract_title, contract_start_date, contract_end_date, payment_type, payment_amount, payment_terms, scope_of_work, fileName]
    );

    // ✅ Send branded email
    const emailBranding = await getBrandingForContext("email");
    let emailBody = `<p>Hello <strong>${freelancer.name}</strong>,</p>
      <p>Your freelancer contract has been created successfully.</p>
      <p>Please find the attached PDF for your reference.</p>`;

    if (emailBranding) {
      emailBody = `
        <div style="text-align:center; margin-bottom:20px;">
          ${emailBranding.logoUrl ? `<img src="${emailBranding.logoUrl}" style="max-height:60px;">` : ''}
          <p style="color:${emailBranding.primaryColor}; margin-top:8px;">${emailBranding.companyName}</p>
        </div>
        ${emailBody}
      `;
    }

    await sendEmail(freelancer.email, `Your Contract - ${contract_title}`, emailBody, filePath, fileName);

    res.json({
      message: "Contract created successfully and email sent.",
      pdf_url: `/uploads/contracts/${fileName}`
    });
  } catch (err) {
    console.error("Contract Create Error:", err);
    res.status(500).json({ error: "Failed to create contract" });
  } finally {
    client.release();
  }
};
export const updateContract = async (req, res) => {
  const client = await pool.connect();

  try {
    const { contract_id } = req.params;

    const existing = await client.query(
      `SELECT * FROM freelancer_contracts WHERE id=$1`,
      [contract_id]
    );

    if (existing.rowCount === 0) {
      return res.status(404).json({ error: "Contract not found" });
    }

    const old = existing.rows[0];
    const newVersion = old.version + 1;

    const {
      contract_title,
      contract_start_date,
      contract_end_date,
      payment_type,
      payment_amount,
      payment_terms,
      scope_of_work
    } = req.body;

    // Fetch freelancer
    const freelancerRes = await client.query(
      `SELECT * FROM user_employees_master WHERE id=$1`,
      [old.freelancer_id]
    );
    const freelancer = freelancerRes.rows[0];

    // Salary details
    const salaryRes = await client.query(
      `SELECT * FROM salary_structure WHERE employee_id=$1 ORDER BY created_at DESC LIMIT 1`,
      [old.freelancer_id]
    );
    const salary = salaryRes.rows[0] || {};

    // HTML
    const htmlTemplate = loadTemplate("freelancerContract.html");
    const filled = fillTemplate(htmlTemplate, {
      ...freelancer,
      ...salary,
      contract_title,
      contract_start_date,
      contract_end_date,
      payment_type,
      payment_amount,
      payment_terms,
      scope_of_work
    });

    // PDF path
    const dir = path.join(process.cwd(), "src/uploads/contracts");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const fileName = `Contract_${old.freelancer_id}_V${newVersion}_${Date.now()}.pdf`;
    const filePath = path.join(dir, fileName);

    await generatePDF(filled, filePath);

    // Update contract
    await client.query(
      `
        UPDATE freelancer_contracts
        SET contract_title=$1, contract_start_date=$2, contract_end_date=$3,
            payment_type=$4, payment_amount=$5, payment_terms=$6, scope_of_work=$7,
            pdf_file=$8, version=$9, contract_status='Active', updated_at=NOW()
        WHERE id=$10
      `,
      [
        contract_title,
        contract_start_date,
        contract_end_date,
        payment_type,
        payment_amount,
        payment_terms,
        scope_of_work,
        fileName,
        newVersion,
        contract_id
      ]
    );

    // ✅ Email updated contract with attachment
    await sendEmail(
      freelancer.email,
      `Updated Contract (Version ${newVersion})`,
      `
        <p>Hello <strong>${freelancer.name}</strong>,</p>
        <p>Your freelancer contract has been updated.</p>
        <p>Please find the updated contract attached as PDF.</p>
      `,
      filePath,
      fileName
    );

    res.json({
      message: "Contract updated successfully and email sent.",
      version: newVersion,
      pdf_url: `/uploads/contracts/${fileName}`
    });

  } catch (err) {
    console.error("Update Contract Error:", err);
    res.status(500).json({ error: "Failed to update contract" });
  } finally {
    client.release();
  }
};


export const cancelContract = async (req, res) => {
  try {
    const { contract_id } = req.params;

    const contract = await pool.query(
      `SELECT freelancer_id FROM freelancer_contracts WHERE id=$1`,
      [contract_id]
    );

    if (contract.rowCount === 0) {
      return res.status(404).json({ error: "Contract not found" });
    }

    const freelancerRes = await pool.query(
      `SELECT name, email FROM user_employees_master WHERE id=$1`,
      [contract.rows[0].freelancer_id]
    );
    const freelancer = freelancerRes.rows[0];

    await pool.query(
      `UPDATE freelancer_contracts 
       SET contract_status='Cancelled', updated_at=NOW()
       WHERE id=$1`,
      [contract_id]
    );

    // ✅ Notify via email
    await sendEmail(
      freelancer.email,
      "Your Contract Has Been Cancelled",
      `
        <p>Hello <strong>${freelancer.name}</strong>,</p>
        <p>Your freelancer contract has been <strong>cancelled</strong> by the admin.</p>
      `
    );

    res.json({ message: "Contract cancelled successfully and email sent." });
  } catch (err) {
    console.error("Cancel Contract Error:", err);
    res.status(500).json({ error: "Failed to cancel contract" });
  }
};

export const updateContractStatus = async (req, res) => {
  try {
    const { contract_id } = req.params;
    const { status } = req.body;

    const contract = await pool.query(
      `SELECT freelancer_id FROM freelancer_contracts WHERE id=$1`,
      [contract_id]
    );

    if (contract.rowCount === 0) {
      return res.status(404).json({ error: "Contract not found" });
    }

    const freelancerRes = await pool.query(
      `SELECT name, email FROM user_employees_master WHERE id=$1`,
      [contract.rows[0].freelancer_id]
    );
    const freelancer = freelancerRes.rows[0];

    await pool.query(
      `UPDATE freelancer_contracts 
       SET contract_status=$1, updated_at=NOW()
       WHERE id=$2`,
      [status, contract_id]
    );

    await sendEmail(
      freelancer.email,
      `Contract Status Updated - ${status}`,
      `
        <p>Hello <strong>${freelancer.name}</strong>,</p>
        <p>Your contract status has been updated to <strong>${status}</strong>.</p>
      `
    );

    res.json({ message: "Status updated successfully and email sent." });
  } catch (err) {
    console.error("Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
};

export const renewContract = async (req, res) => {
  try {
    const { contract_id } = req.params;
    const { new_end_date } = req.body;

    const existing = await pool.query(
      `SELECT * FROM freelancer_contracts WHERE id=$1`,
      [contract_id]
    );

    if (existing.rowCount === 0) {
      return res.status(404).json({ error: "Contract not found" });
    }

    const old = existing.rows[0];
    const newVersion = old.version + 1;

    const freelancerRes = await pool.query(
      `SELECT name, email FROM user_employees_master WHERE id=$1`,
      [old.freelancer_id]
    );
    const freelancer = freelancerRes.rows[0];

    await pool.query(
      `UPDATE freelancer_contracts 
       SET version=$1, contract_end_date=$2, contract_status='Renewed', updated_at=NOW()
       WHERE id=$3`,
      [newVersion, new_end_date, contract_id]
    );

    await sendEmail(
      freelancer.email,
      "Your Contract Has Been Renewed",
      `
        <p>Hello <strong>${freelancer.name}</strong>,</p>
        <p>Your freelancer contract has been successfully renewed.</p>
        <p>New End Date: <strong>${new_end_date}</strong></p>
      `
    );

    res.json({ message: "Contract renewed successfully and email sent.", version: newVersion });
  } catch (err) {
    console.error("Renew Contract Error:", err);
    res.status(500).json({ error: "Failed to renew contract" });
  }
};

export const getAllContracts = async (req, res) => {
  try {
    const serverUrl = process.env.SERVER_URL || "http://localhost:5002";

    const result = await pool.query(`
      SELECT c.*, u.name AS freelancer_name, u.email AS freelancer_email
      FROM freelancer_contracts c
      LEFT JOIN user_employees_master u ON u.id = c.freelancer_id
      ORDER BY c.created_at DESC
    `);

    const updated = result.rows.map(row => ({
      ...row,
      pdf_url: row.pdf_file
        ? `${serverUrl}/uploads/contracts/${row.pdf_file}`
        : null
    }));

    res.json(updated);
  } catch (err) {
    console.error("Fetch Contracts Error:", err);
    res.status(500).json({ error: "Failed to fetch contracts" });
  }
};


export const getContractsByFreelancer = async (req, res) => {
  try {
    const { freelancer_id } = req.params;
    const serverUrl = process.env.SERVER_URL || "http://localhost:5002";

    const result = await pool.query(
      `SELECT * FROM freelancer_contracts WHERE freelancer_id=$1 ORDER BY created_at DESC`,
      [freelancer_id]
    );

    const updated = result.rows.map(row => ({
      ...row,
      pdf_url: row.pdf_file
        ? `${serverUrl}/uploads/contracts/${row.pdf_file}`
        : null
    }));

    res.json(updated);
  } catch (err) {
    console.error("Fetch Freelancer Contracts Error:", err);
    res.status(500).json({ error: "Failed to fetch freelancer contracts" });
  }
};


export const getContractById = async (req, res) => {
  try {
    const { contract_id } = req.params;
    const serverUrl = process.env.SERVER_URL || "http://localhost:5002";

    const result = await pool.query(
      `SELECT * FROM freelancer_contracts WHERE id=$1`,
      [contract_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Contract not found" });
    }

    const contract = result.rows[0];

    contract.pdf_url = contract.pdf_file
      ? `${serverUrl}/uploads/contracts/${contract.pdf_file}`
      : null;

    res.json(contract);

  } catch (err) {
    console.error("Get Contract Error:", err);
    res.status(500).json({ error: "Failed to fetch contract" });
  }
};




import { createZohoInvoice, createZohoCustomer } from "../services/zohoInvoiceService.js";


/* -----------------------------------------------------
   1. CREATE INVOICE (LOCAL + ZOHO CUSTOMER + ZOHO INVOICE + PDF)
----------------------------------------------------- */

export const createInvoice = async (req, res) => {
  try {
    const {
      freelancer_id,
      contract_id,
      amount,
      invoice_date,
      due_date,
      created_by,
      freelancer_name,
      freelancer_email
    } = req.body;

    const GST_PERCENT = 18;
    const TDS_PERCENT = 10;
    const tax_amount = (amount * GST_PERCENT) / 100;
    const tds_amount = (amount * TDS_PERCENT) / 100;
    const net_payable = amount + tax_amount - tds_amount;

    /* -----------------------------------------------------
       A. Generate Invoice Number (Local EMS)
    ----------------------------------------------------- */
    const dateObj = new Date(invoice_date);
    const ym = `${dateObj.getFullYear()}${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
    const seqQuery = await pool.query(
      `SELECT COUNT(*) + 1 AS seq 
       FROM invoices 
       WHERE to_char(invoice_date, 'YYYYMM') = $1`,
      [ym]
    );
    const seq = seqQuery.rows[0].seq;
    const invoice_number = `INV-${ym}-${String(seq).padStart(4, "0")}`;

    /* -----------------------------------------------------
       B. Insert into EMS Database
    ----------------------------------------------------- */
    const insertQuery = `
      INSERT INTO invoices (
        freelancer_id, contract_id, invoice_number,
        amount, tax_amount, tds_amount, net_payable,
        invoice_date, due_date, status, created_by
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending',$10)
      RETURNING *
    `;
    const result = await pool.query(insertQuery, [
      freelancer_id,
      contract_id,
      invoice_number,
      amount,
      tax_amount,
      tds_amount,
      net_payable,
      invoice_date,
      due_date,
      created_by,
    ]);
    const localInvoice = result.rows[0];

    /* -----------------------------------------------------
       C. Create Invoice in Zoho (if configured)
    ----------------------------------------------------- */
    const ZOHO_CUSTOMER_ID = process.env.DEFAULT_ZOHO_CUSTOMER_ID;
    let zohoInvoiceId = null, zohoInvoiceNumber = null, zohoInvoiceUrl = null;

    if (ZOHO_CUSTOMER_ID) {
      const zohoInvoicePayload = {
        customer_id: ZOHO_CUSTOMER_ID,
        date: invoice_date,
        due_date: due_date,
        reference_number: invoice_number,
        line_items: [
          {
            item_name: "Freelancer Payment",
            rate: amount,
            quantity: 1
          }
        ]
      };
      try {
        const zohoResp = await createZohoInvoice(zohoInvoicePayload);
        zohoInvoiceId = zohoResp.invoice?.invoice_id || null;
        zohoInvoiceNumber = zohoResp.invoice?.invoice_number || null;
        zohoInvoiceUrl = zohoResp.invoice?.invoice_url || null;
      } catch (err) {
        console.error("Zoho Invoice ERROR:", err.response?.data || err);
      }
    }

    /* -----------------------------------------------------
       D. Generate Branded PDF
    ----------------------------------------------------- */
    // ✅ Get branding for "letters" context (used in PDF)
    const branding = await getBrandingForContext("letters");

    const templatePath = path.join(process.cwd(), "src/templates/invoiceTemplate.html");
    let html = fs.readFileSync(templatePath, "utf-8");

    // Replace placeholders
    html = html
      .replace(/{{company_name}}/g, branding?.companyName || "Your Company Pvt Ltd")
      .replace(/{{company_address}}/g, "Hyderabad, Telangana, India") // ⚠️ Consider making dynamic if needed
      .replace(/{{company_email}}/g, "contact@company.com")
      .replace(/{{invoice_number}}/g, invoice_number)
      .replace(/{{invoice_date}}/g, invoice_date)
      .replace(/{{due_date}}/g, due_date)
      .replace(/{{freelancer_name}}/g, freelancer_name)
      .replace(/{{freelancer_email}}/g, freelancer_email)
      .replace(/{{amount}}/g, amount)
      .replace(/{{tax_amount}}/g, tax_amount)
      .replace(/{{tds_amount}}/g, tds_amount)
      .replace(/{{net_payable}}/g, net_payable);

    // ✅ Inject logo and style if branding is active
    if (branding?.logoUrl || branding?.primaryColor) {
      const logoHtml = branding.logoUrl
        ? `<img src="${branding.logoUrl}" style="max-height:50px; margin-bottom:10px;" />`
        : "";
      const headerHtml = `
        <div style="text-align:center; margin-bottom:15px;">
          ${logoHtml}
          <h2 style="color:${branding.primaryColor || '#000'};">Invoice</h2>
        </div>
      `;
      html = html.replace(/<h2>Invoice<\/h2>/, headerHtml);
    }

    const pdfDir = "uploads/invoices";
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
    const fileName = `Invoice_${invoice_number}.pdf`;
    const filePath = path.join(pdfDir, fileName);

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.pdf({ path: filePath, format: "A4", printBackground: true });
    await browser.close();

    await pool.query(
      `UPDATE invoices SET pdf_file=$1 WHERE id=$2`,
      [fileName, localInvoice.id]
    );

    /* -----------------------------------------------------
       E. Save Zoho Info (if applicable)
    ----------------------------------------------------- */
    await pool.query(
      `UPDATE invoices
       SET zoho_invoice_id=$1,
           zoho_invoice_number=$2,
           zoho_invoice_url=$3
       WHERE id=$4`,
      [zohoInvoiceId, zohoInvoiceNumber, zohoInvoiceUrl, localInvoice.id]
    );

    /* -----------------------------------------------------
       F. Send Branded Email with Attachment
    ----------------------------------------------------- */
    const emailBranding = await getBrandingForContext("email");
    let emailBody = `
      <p>Hello <strong>${freelancer_name}</strong>,</p>
      <p>Your invoice <strong>${invoice_number}</strong> has been generated.</p>
      <p><strong>Net Payable:</strong> ₹${net_payable}</p>
      <p>Please find the attached PDF for your records.</p>
    `;

    if (emailBranding) {
      emailBody = `
        <div style="text-align:center; margin-bottom:20px;">
          ${emailBranding.logoUrl ? `<img src="${emailBranding.logoUrl}" style="max-height:60px;">` : ''}
          <p style="color:${emailBranding.primaryColor}; margin-top:8px;">${emailBranding.companyName}</p>
        </div>
        ${emailBody}
      `;
    }

    try {
      await sendEmail(
        freelancer_email,
        `Invoice ${invoice_number}`,
        emailBody,
        filePath,
        fileName
      );
    } catch (emailErr) {
      console.warn("Failed to send invoice email:", emailErr.message);
    }

    /* -----------------------------------------------------
       G. Final Response
    ----------------------------------------------------- */
    res.json({
      success: true,
      message: "Invoice created in EMS + Zoho + PDF generated + Email sent",
      invoice: {
        ...localInvoice,
        pdf_file: fileName,
        pdf_url: `${process.env.SERVER_URL}/uploads/invoices/${fileName}`,
        zoho_invoice_id: zohoInvoiceId,
        zoho_invoice_number: zohoInvoiceNumber,
        zoho_invoice_url: zohoInvoiceUrl
      }
    });

  } catch (err) {
    console.error("Invoice Create Error:", err);
    res.status(500).json({ error: "Failed to create invoice" });
  }
};

/* -----------------------------------------------------
   2. GET ALL INVOICES
----------------------------------------------------- */
export const getAllInvoices = async (req, res) => {
  try {
    const serverUrl = process.env.SERVER_URL;

    const sql = `
      SELECT inv.*, u.name AS freelancer_name, u.email AS freelancer_email
      FROM invoices inv
      LEFT JOIN user_employees_master u ON u.id = inv.freelancer_id
      ORDER BY inv.created_at DESC
    `;

    const { rows } = await pool.query(sql);

    const updated = rows.map((inv) => ({
      ...inv,
      pdf_url: inv.pdf_file
        ? `${serverUrl}/uploads/invoices/${inv.pdf_file}`
        : null,
      zoho: {
        id: inv.zoho_invoice_id,
        number: inv.zoho_invoice_number,
        url: inv.zoho_invoice_url
      }
    }));

    res.json(updated);
  } catch (err) {
    console.error("Get All Invoice Error:", err);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
};

/* -----------------------------------------------------
   3. GET INVOICE BY ID
----------------------------------------------------- */
export const getInvoiceById = async (req, res) => {
  try {
    const { invoice_id } = req.params;
    const serverUrl = process.env.SERVER_URL;

    const sql = `SELECT * FROM invoices WHERE id=$1`;
    const { rows } = await pool.query(sql, [invoice_id]);

    if (rows.length === 0)
      return res.status(404).json({ error: "Invoice not found" });

    const invoice = rows[0];

    invoice.pdf_url = invoice.pdf_file
      ? `${serverUrl}/uploads/invoices/${invoice.pdf_file}`
      : null;

    invoice.zoho = {
      id: invoice.zoho_invoice_id,
      number: invoice.zoho_invoice_number,
      url: invoice.zoho_invoice_url
    };

    res.json(invoice);
  } catch (err) {
    console.error("Get Invoice Error:", err);
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
};

/* -----------------------------------------------------
   4. UPDATE INVOICE STATUS
----------------------------------------------------- */
export const updateInvoiceStatus = async (req, res) => {
  try {
    const { invoice_id } = req.params;
    const { status, updated_by } = req.body;

    const valid = ["pending", "approved", "rejected", "paid"];
    if (!valid.includes(status)) {
      return res.status(400).json({ error: "Invalid invoice status" });
    }

    await pool.query(
      `UPDATE invoices SET status=$1, updated_by=$2, updated_at=NOW() WHERE id=$3`,
      [status, updated_by, invoice_id]
    );

    res.json({ success: true, message: "Status updated" });
  } catch (err) {
    console.error("Update Invoice Status Error:", err);
    res.status(500).json({ error: "Failed to update invoice status" });
  }
};

/* -----------------------------------------------------
   5. GENERATE PDF (PUPPETEER)
----------------------------------------------------- */
export const generateInvoicePDF = async (req, res) => {
  try {
    const { invoice_id } = req.params;

    const sql = `
      SELECT inv.*, u.name AS freelancer_name, u.email AS freelancer_email
      FROM invoices inv
      LEFT JOIN user_employees_master u ON u.id = inv.freelancer_id
      WHERE inv.id=$1
    `;
    const { rows } = await pool.query(sql, [invoice_id]);

    if (rows.length === 0)
      return res.status(404).json({ error: "Invoice not found" });

    const invoice = rows[0];

    // Load template
    const templatePath = path.join(process.cwd(), "src/templates/invoiceTemplate.html");

    let html = fs.readFileSync(templatePath, "utf-8");

    html = html
      .replace(/{{company_name}}/g, "Your Company Pvt Ltd")
      .replace(/{{company_address}}/g, "Hyderabad, Telangana, India")
      .replace(/{{company_email}}/g, "contact@company.com")
      .replace(/{{invoice_number}}/g, invoice.invoice_number)
      .replace(/{{invoice_date}}/g, invoice.invoice_date)
      .replace(/{{due_date}}/g, invoice.due_date)
      .replace(/{{freelancer_name}}/g, invoice.freelancer_name)
      .replace(/{{freelancer_email}}/g, invoice.freelancer_email)
      .replace(/{{amount}}/g, invoice.amount)
      .replace(/{{tax_amount}}/g, invoice.tax_amount)
      .replace(/{{tds_amount}}/g, invoice.tds_amount)
      .replace(/{{net_payable}}/g, invoice.net_payable);

    const pdfDir = "uploads/invoices";
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

    const fileName = `Invoice_${invoice.invoice_number}.pdf`;
    const filePath = path.join(pdfDir, fileName);

    // Generate PDF
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    // Update DB
    await pool.query(`UPDATE invoices SET pdf_file=$1 WHERE id=$2`, [
      fileName,
      invoice_id,
    ]);

    res.json({
      success: true,
      pdf_file: fileName,
      pdf_url: `${process.env.SERVER_URL}/uploads/invoices/${fileName}`,
    });
  } catch (err) {
    console.error("Invoice PDF Error:", err);
    res.status(500).json({ error: "Failed to generate invoice PDF" });
  }
};

/* -----------------------------------------------------
   6. SEND REMINDER EMAIL
----------------------------------------------------- */
export const sendInvoiceReminder = async (req, res) => {
  try {
    const { invoice_id } = req.params;

    const sql = `
      SELECT 
        inv.invoice_number,
        inv.net_payable,
        u.name AS freelancer_name,
        u.email AS freelancer_email
      FROM invoices inv
      LEFT JOIN user_employees_master u 
        ON u.id = inv.freelancer_id
      WHERE inv.id = $1
    `;

    const { rows } = await pool.query(sql, [invoice_id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const invoice = rows[0];

    console.log("DEBUG EMAIL:", {
      to: invoice.freelancer_email,
      name: invoice.freelancer_name
    });

    if (!invoice.freelancer_email) {
      return res.status(400).json({ error: "Freelancer email not found" });
    }

    // Send Reminder
    await sendEmail({
      to: invoice.freelancer_email,
      subject: `Payment Reminder - Invoice ${invoice.invoice_number}`,
      text: `
        Dear ${invoice.freelancer_name},
        This is a reminder for Invoice ${invoice.invoice_number}.
        Net Payable: ₹${invoice.net_payable}
      `
    });

    res.json({ success: true, message: "Reminder sent!" });

  } catch (err) {
    console.error("Reminder Error:", err);
    res.status(500).json({ error: "Failed to send reminder" });
  }
};


/* -----------------------------------------------------
   7. DELETE INVOICE
----------------------------------------------------- */
export const deleteInvoice = async (req, res) => {
  try {
    const { invoice_id } = req.params;

    await pool.query(`DELETE FROM invoices WHERE id=$1`, [invoice_id]);

    res.json({ success: true, message: "Invoice deleted" });
  } catch (err) {
    console.error("Delete Invoice Error:", err);
    res.status(500).json({ error: "Failed to delete invoice" });
  }
};

/*----------------------------Probation ------------------------------*/
// get a new employee (who joined within 3 months )
export const getNewEmployees = async (req, res) => {
  const client = await pool.connect();

  try {
    const query = `
      SELECT id,email, name, department, designation, date_of_joining
      FROM user_employees_master
      WHERE date_of_joining >= NOW() - INTERVAL '3 months'
      ORDER BY date_of_joining DESC
    `;

    const result = await client.query(query);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });

  } catch (err) {
    console.error("Error fetching new employees:", err);
    return res.status(500).json({ message: "Database error" });
  } finally {
    client.release();
  }
};
//creating probation period 
export const createProbation = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      employee_id,
      startDate,
      endDate,
      reportingManager,
      notes,
      status = "active",
    } = req.body;

    // ---------------- VALIDATION ----------------
    if (!employee_id) {
      return res.status(400).json({ error: "Employee (employee_id) is required" });
    }

    if (!startDate) {
      return res.status(400).json({ error: "Start date is required" });
    }

    if (!endDate) {
      return res.status(400).json({ error: "End date is required" });
    }

    if (!reportingManager) {
      return res.status(400).json({ error: "Reporting Manager is required" });
    }

    if (notes && notes.length > 300) {
      return res.status(400).json({ error: "Notes cannot exceed 300 characters" });
    }

    // ----------------- PROGRESS CALC -----------------
    // const start = new Date(startDate);
    // const end = new Date(endDate);

    // const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    // ----------------- INSERT QUERY ------------------
    const insertQuery = `
      INSERT INTO probation (
        employee_id,
        startdate,
        enddate,
        status,
        manager,
        notes,
        createdat,
        updatedat
      )
      VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW())
      RETURNING *;
    `;

    const result = await client.query(insertQuery, [
     
       employee_id,
  startDate,
  endDate,
  status,
  reportingManager,
  notes || ""
    ]);

    return res.status(201).json({
      message: "Probation assigned successfully",
      probation: result.rows[0],
    });

  } catch (err) {
    console.error("Create Probation Error:", err);
    return res.status(500).json({ error: "Failed to assign probation" });
    } finally {
    client.release();
  }
};
//Audit log -logout
export const adminLogout = async (req, res) => {
  const client = await pool.connect();

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required for logout" });
    }

    // 1) Get admin user from USERS table
    const { rows: userRows } = await client.query(
      `
        SELECT id, email FROM ${USER_MASTER_TABLE}
        WHERE email ILIKE $1 AND role = 'admin'
      `,
      [email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const user = userRows[0]; // must match the one used at login

    // 2) Update latest login audit record for this admin
    const result = await client.query(
      `
        UPDATE audit_logs AS a
        SET updated_by = 'logout',
            updated_at = NOW()
        FROM (
          SELECT id
          FROM audit_logs
          WHERE employee_id = $1
            AND created_by = 'login'
            AND updated_by IS NULL
          ORDER BY created_at DESC
          LIMIT 1
        ) AS t
        WHERE a.id = t.id
      `,
      [user.id]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "No login session found to update" });
    }

    return res.status(200).json({
      success: true,
      message: "Admin logged out successfully",
    });
  } catch (err) {
    console.error("Admin Logout Error:", err.message);
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
// fecth assigned Probation details
export const getProbationWithUser = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id AS user_id,
        u.name,
        u.email,
        u.department,
        u.designation,
        p.*
      FROM ${PROBATION} p
      JOIN ${USER_MASTER_TABLE} u 
        ON u.id = p.employee_id
      ORDER BY p.probationid DESC
    `;

    const result = await pool.query(query);

    res.status(200).json(result.rows);

  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const getAllAdminAuditLogs = async (req, res) => {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT 
        al.id AS audit_id,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        al.created_at AS login_time,
        CASE 
          WHEN al.updated_by = 'logout' THEN al.updated_at 
          ELSE NULL 
        END AS logout_time
      FROM audit_logs al
      LEFT JOIN ${USER_MASTER_TABLE} u 
        ON u.id = al.employee_id
      WHERE al.created_by = 'login'  -- Only login-initiated audit rows
      ORDER BY al.created_at DESC;
    `);

    res.json({
      success: true,
      count: result.rowCount,
      audits: result.rows
    });

  } catch (err) {
    console.error("Fetch audit logs error:", err.message);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  } finally {
    client.release();
  }
};


export const assignPanelMembers = async (req, res) => {
  const client = await pool.connect();
  try {
    const { panel_name, member_ids } = req.body;

    if (!panel_name) {
      return res.status(400).json({ error: "Panel name is required" });
    }

    if (!Array.isArray(member_ids) || member_ids.length === 0) {
      return res.status(400).json({ error: "No members selected" });
    }

    // Clear existing members for the same panel (optional)
    await client.query(
  `DELETE FROM ${PANEL_MEMBERS_TABLE} WHERE panel_name = $1`,
  [panel_name]
);

    // Insert new members
    const insertQuery = `
      INSERT INTO panel_members (panel_name, employee_id)
      SELECT $1, id 
      FROM user_employees_master 
      WHERE id = ANY($2)
      RETURNING *;
    `;

    const { rows } = await client.query(insertQuery, [panel_name, member_ids]);

    res.status(200).json({
      message: "Panel members assigned successfully",
      panel_name,
      assigned_members: rows
    });

  } catch (error) {
    console.error("Assign Panel Error:", error);
    res.status(500).json({ error: "Failed to assign panel members" });
  } finally {
    client.release();
  }
};


export const getAllPanels = async (req, res) => {
  const client = await pool.connect();
  try {
    const query = `
      SELECT 
        pm.panel_name,
        json_agg(
          json_build_object(
            'employee_id', pm.employee_id,
            'fullname', u.name,
            'email', u.email,
            'designation', u.designation
          )
        ) AS members
      FROM panel_members pm
      LEFT JOIN user_employees_master u 
        ON u.id = pm.employee_id
      GROUP BY pm.panel_name;
    `;

    const { rows } = await client.query(query);

    res.status(200).json(rows);

  } catch (err) {
    console.error("Get Panels Error:", err);
    res.status(500).json({ error: "Failed to fetch panels" });
  } finally {
    client.release();
  }
};


export const scheduleInterviewReferral = async (req, res) => {
  const client = await pool.connect();

  try {
    const { referral_id } = req.params;
    let {
      round_name,
      interview_date,
      interview_time,
      meeting_link,
      interviewer_ids = []
    } = req.body;

    if (!round_name || !interview_date || !interview_time) {
      return res.status(400).json({ error: "Round name, date and time required" });
    }

    // Ensure interviewer_ids is an array of UUID strings
    if (!Array.isArray(interviewer_ids) || interviewer_ids.length === 0) {
      return res.status(400).json({ error: "At least one interviewer must be selected" });
    }

    // Convert any empty string or invalid values
    interviewer_ids = interviewer_ids.filter(id => id && id.trim() !== "");

    if (interviewer_ids.length === 0) {
      return res.status(400).json({ error: "No valid interviewer IDs provided" });
    }

    // 1) Fetch referral details
    const { rows: refRows } = await client.query(
      `SELECT candidate_name, candidate_email FROM referrals WHERE id = $1`,
      [referral_id]
    );

    if (refRows.length === 0)
      return res.status(404).json({ error: "Referral not found" });

    const referral = refRows[0];

    // 2) Fetch interviewers (names + emails)
    const { rows: interviewerList } = await client.query(
      `SELECT name, email FROM user_employees_master WHERE id = ANY($1::uuid[])`,
      [interviewer_ids]
    );

    if (interviewerList.length === 0) {
      return res.status(400).json({ error: "No interviewers found with the given IDs" });
    }

    const interviewerNames = interviewerList.map(i => i.name);

    // 3) Insert into interviews
    const insertQuery = `
      INSERT INTO interviews (
        application_id,
        referral_id,
        interview_date,
        interview_type,
        interviewer,
        location,
        status,
        created_by
      )
      VALUES (NULL, $1, $2, $3, $4, $5, 'scheduled', 'Admin')
      RETURNING *
    `;

    const fullDateTime = `${interview_date} ${interview_time}`;

    const insertRes = await client.query(insertQuery, [
      referral_id,
      fullDateTime,
      round_name,
      interviewerNames,
      meeting_link
    ]);

    await client.query(
  `UPDATE referrals
   SET status = 'Interview',
       updated_by = 'Admin',
       updated_at = NOW()
   WHERE id = $1`,
  [referral_id]
);
console.log("Candidate Email:", referral.candidate_email);

    // 4) Candidate email
    await sendEmail(
      referral.candidate_email,
      `Interview Scheduled - ${round_name}`,
      `
        <h3>Your Interview Is Scheduled</h3>
        <p><strong>Round:</strong> ${round_name}</p>
        <p><strong>Date:</strong> ${interview_date}</p>
        <p><strong>Time:</strong> ${interview_time}</p>
        <p><a href="${meeting_link}">Join Meeting</a></p>
      `
    );

    // 5) Interviewers email
    for (let member of interviewerList) {
      await sendEmail(
        member.email,
        `You are assigned as Interviewer - ${round_name}`,
        `
          <h3>New Interview Assigned</h3>
          <p><strong>Candidate:</strong> ${referral.candidate_name}</p>
          <p><strong>Date:</strong> ${interview_date}</p>
          <p><strong>Time:</strong> ${interview_time}</p>
          <p><a href="${meeting_link}">Join Meeting</a></p>
        `
      );
    }

    return res.status(200).json({
      message: "Interview scheduled successfully",
      interview: insertRes.rows[0]
    });

  } catch (err) {
    console.error("Schedule Error:", err);
    return res.status(500).json({ error: "Failed to schedule interview" });
  } finally {
    client.release();
  }
};

export const rescheduleInterviewReferral = async (req, res) => {
  const client = await pool.connect();

  try {
    const { referral_id } = req.params;

    const {
      round_name,
      interview_date,
      interview_time,
      location,             // meeting link
      interviewer_ids = []
    } = req.body;

    if (!round_name || !interview_date || !interview_time || !location) {
      return res.status(400).json({ error: "Round, date, time, and location are required" });
    }

    if (interviewer_ids.length === 0) {
      return res.status(400).json({ error: "At least one interviewer must be selected" });
    }

    // 1) Fetch referral details
    const { rows: refRows } = await client.query(
      `SELECT candidate_name, candidate_email FROM referrals WHERE id = $1`,
      [referral_id]
    );
    if (refRows.length === 0)
      return res.status(404).json({ error: "Referral not found" });

    const referral = refRows[0];

    // 2) Fetch interviewers
    const { rows: interviewerList } = await client.query(
      `SELECT id, name, email FROM user_employees_master WHERE id = ANY($1)`,
      [interviewer_ids]
    );

    const interviewerNames = interviewerList.map(i => i.name);

    // 3) Insert new interview row with status 'rescheduled'
    const fullDateTime = `${interview_date} ${interview_time}`;

    const insertQuery = `
      INSERT INTO ${INTERVIEWS_TABLE}  (
        referral_id,
        application_id,
        interview_date,
        interview_type,
        interviewer,
        location,
        status,
        created_by
      )
      VALUES ($1, NULL, $2, $3, $4, $5, 'rescheduled', 'Admin')
      RETURNING *
    `;

    const insertRes = await client.query(insertQuery, [
      referral_id,
      fullDateTime,
      round_name,
      interviewerNames,
      location
    ]);

    await client.query(
  `UPDATE referrals
   SET status = 'Interview',
       updated_by = 'Admin',
       updated_at = NOW()
   WHERE id = $1`,
  [referral_id]
);


    // 4) Send email to candidate
    await sendEmail(
      referral.candidate_email,
      `Interview Rescheduled - ${round_name}`,
      `
        <h3>Your Interview Has Been Rescheduled</h3>
        <p><strong>Round:</strong> ${round_name}</p>
        <p><strong>Date:</strong> ${interview_date}</p>
        <p><strong>Time:</strong> ${interview_time}</p>
        <p><a href="${location}">Join Meeting</a></p>
      `
    );

    // 5) Send emails to interviewers
    for (let member of interviewerList) {
      await sendEmail(
        member.email,
        `You are assigned as Interviewer - Rescheduled ${round_name}`,
        `
          <h3>Interview Rescheduled</h3>
          <p><strong>Candidate:</strong> ${referral.candidate_name}</p>
          <p><strong>Date:</strong> ${interview_date}</p>
          <p><strong>Time:</strong> ${interview_time}</p>
          <p><a href="${location}">Join Meeting</a></p>
        `
      );
    }

    return res.status(200).json({
      message: "Interview rescheduled successfully",
      interview: insertRes.rows[0]
    });

  } catch (err) {
    console.error("Reschedule Error:", err);
    return res.status(500).json({ error: "Failed to reschedule interview" });
  } finally {
    client.release();
  }
};

export const getAllInterviewsWithDetails = async (req, res) => {
  const client = await pool.connect();

  try {
    const query = `
      SELECT 
        i.interview_id,
        i.interview_date,
        i.interview_type AS round_name,
        i.location,
        i.status,
        i.created_at,

        CASE 
          WHEN i.referral_id IS NOT NULL THEN 'referral'
          WHEN i.application_id IS NOT NULL THEN 'job_application'
        END AS source,

        COALESCE(r.candidate_name, a.candidate_name) AS candidate_name,
        COALESCE(r.candidate_email, a.email) AS candidate_email,
        COALESCE(r.phone_number, a.phone) AS phone_number,
        COALESCE(r.position, jp.job_title) AS position,

        i.referral_id,
        i.application_id,

        -- ✅ PANEL MEMBERS (FIXED FOR BOTH FLOWS)
        (
          SELECT COALESCE(
            json_agg(
              json_build_object(
                'id', u.id,
                'name', u.name,
                'email', u.email
              )
            ),
            '[]'::json
          )
          FROM user_employees_master u
          WHERE EXISTS (
            SELECT 1
            FROM unnest(i.interviewer) AS iv(val)
            WHERE
              -- Referral flow (names)
              u.name = iv.val
              OR
              -- Job-post flow (comma-separated emails inside array)
              u.email = ANY(string_to_array(iv.val, ','))
          )
        ) AS panel_members

      FROM interviews i
      LEFT JOIN referrals r ON r.id = i.referral_id
      LEFT JOIN applications a ON a.application_id = i.application_id
      LEFT JOIN job_posts jp ON jp.job_id = a.job_id
      ORDER BY i.interview_date DESC;
    `;

    const { rows } = await client.query(query);

    return res.status(200).json({
      message: "All interviews fetched successfully",
      data: rows,
    });

  } catch (err) {
    console.error("Get Interviews Error:", err);
    return res.status(500).json({ error: "Failed to get interviews" });
  } finally {
    client.release();
  }
};



export const getMyInterviews = async (req, res) => {
  const client = await pool.connect();

  try {
    // 1️⃣ Decode JWT (you already have helper)
    const user = getUserFromToken(req);
    const interviewerId = user.id;

    // 2️⃣ Get interviewer name
    const { rows: empRows } = await client.query(
      `SELECT name FROM user_employees_master WHERE id = $1`,
      [interviewerId]
    );

    if (empRows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const interviewerName = empRows[0].name;

    // 3️⃣ Fetch only interviews THIS interviewer attended
    const query = `
      SELECT
        i.interview_id,
        i.interview_date,
        i.interview_type AS round_name,
        i.location,
        i.status,
        r.candidate_name,
        r.position,
        EXISTS (
          SELECT 1
          FROM panel_feedback pf
          WHERE pf.interview_id = i.interview_id
          AND pf.panel_member = $2
        ) AS feedback_submitted
      FROM interviews i
      JOIN referrals r ON r.id = i.referral_id
      WHERE $1 = ANY(i.interviewer)
      ORDER BY i.interview_date DESC;
    `;

    const { rows } = await client.query(query, [
      interviewerName,
      interviewerId
    ]);

    return res.status(200).json(rows);

  } catch (err) {
    console.error("getMyInterviews error:", err);
    return res.status(500).json({ error: "Failed to fetch interviews" });
  } finally {
    client.release();
  }
};



export const addPanelFeedback = async (req, res) => {
  const client = await pool.connect();

  try {
    const { interview_id } = req.params;
    const { panel_member, rating, comments } = req.body;

    if (!panel_member || !rating) {
      return res.status(400).json({ error: "Panel member and rating are required" });
    }

    // Validate rating
    if (rating < 1 || rating > 10) {
      return res.status(400).json({ error: "Rating must be between 1 and 10" });
    }

    // Check if interview exists
    const { rows: interviewRows } = await client.query(
      `SELECT interview_id FROM interviews WHERE interview_id = $1`,
      [interview_id]
    );

    if (interviewRows.length === 0) {
      return res.status(404).json({ error: "Interview not found" });
    }

    // Insert feedback
    const insertQuery = `
      INSERT INTO panel_feedback (
        interview_id,
        panel_member,
        rating,
        comments,
        created_by,
        updated_by
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const insertRes = await client.query(insertQuery, [
      interview_id,
      panel_member,
      rating,
      comments,
      panel_member,
      panel_member
    ]);

    return res.status(200).json({
      message: "Feedback submitted successfully",
      feedback: insertRes.rows[0]
    });

  } catch (err) {
    console.error("Panel Feedback Error:", err);
    return res.status(500).json({ error: "Failed to submit feedback" });
  } finally {
    client.release();
  }
};


export const getPanelFeedback = async (req, res) => {
  const client = await pool.connect();

  try {
    const { interview_id } = req.params;

    // Validate interview exists (optional but recommended)
    const { rows: interviewRows } = await client.query(
      `SELECT interview_id FROM interviews WHERE interview_id = $1`,
      [interview_id]
    );

    if (interviewRows.length === 0) {
      return res.status(404).json({ error: "Interview not found" });
    }

    // Fetch only panel_feedback table data
    const query = `
      SELECT 
        feedback_id,
        interview_id,
        panel_member,
        rating,
        comments,
        created_at
      FROM panel_feedback
      WHERE interview_id = $1
      ORDER BY created_at DESC
    `;

    const { rows } = await client.query(query, [interview_id]);

    return res.status(200).json({
      message: "Panel feedback fetched successfully",
      feedback: rows
    });

  } catch (err) {
    console.error("Get Panel Feedback Error:", err);
    return res.status(500).json({ error: "Failed to fetch panel feedback" });
  } finally {
    client.release();
  }
};

export const getMonthlyFinalSummary = async (req, res) => {
  const client = await pool.connect();

  try {
    const { employeeId, year, month } = req.params;

    if (!employeeId || !year || !month) {
      return res.status(400).json({ error: "employeeId, year, month required" });
    }

    const monthNumber = parseInt(month, 10);

    // Get last day of that month
    const lastDateObj = new Date(year, monthNumber, 0);

    // FIX: Local timezone format — NOT UTC
    const lastDay = lastDateObj.toLocaleDateString("en-CA"); // YYYY-MM-DD
    
    const query = `
      SELECT lop, working_days
      FROM attendance
      WHERE employee_id = $1
      AND date = $2
      LIMIT 1
    `;

    const result = await client.query(query, [employeeId, lastDay]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No final month entry found" });
    }

    return res.json({
      employeeId,
      year,
      month,
      final_lop: result.rows[0].lop,
      final_working_days: result.rows[0].working_days,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
}};
export const updateTLReview = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params; // review_id
    const { tl_rating, tl_comments, status } = req.body;

    if (!tl_rating || !status) {
      return res.status(400).json({ error: "TL Rating and Status are required" });
    }

    const query = `
      UPDATE performance_reviews
      SET 
        tl_rating = $1,
        tl_comments = $2,
        status = $3,
        updated_at = NOW()
      WHERE id = $4
      RETURNING *;
    `;

    const { rows } = await client.query(query, [
      tl_rating,
      tl_comments || null,
      status,
      id
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.status(200).json({
      message: "TL Review updated successfully",
      review: rows[0],
    });

  } catch (err) {
    console.error("TL Review Update Error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
export const fetchAllReviews = async (req, res) => {
  const client = await pool.connect();
  try {
    const query = `
      SELECT 
        pr.id AS review_id,
        ue.id AS employee_uuid,
        ue.employee_id AS employee_code,
        ue.name AS employee_name,
        ue.designation,
        pr.self_rating,
        pr.tl_rating,
        pr.status
      FROM performance_reviews pr
      JOIN user_employees_master ue
        ON ue.id = pr.employee_id
      ORDER BY pr.updated_at DESC;
    `;

    const { rows } = await client.query(query);
    res.json(rows);

  } catch (err) {
    console.error("Fetch Review Error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
export const getFinalRatingsForEmployees = async (req, res) => {
  const client = await pool.connect();
  try {
    const query = `
      SELECT 
        ue.id AS employee_uuid,
        ue.employee_id AS employee_code,
        ue.name AS employee_name,
        ue.designation,
        ue.date_of_joining,
        pr.self_rating,
        pr.tl_rating,
        pr.status
      FROM performance_reviews pr
      JOIN user_employees_master ue
        ON ue.id = pr.employee_id
      WHERE pr.status = 'Approved';
    `;

    const { rows } = await client.query(query);

    // --- calculate tenure ---
    const calculateTenure = (joinDate) => {
      const join = new Date(joinDate);
      const now = new Date();

      let years = now.getFullYear() - join.getFullYear();
      let months = now.getMonth() - join.getMonth();

      if (months < 0) {
        years--;
        months += 12;
      }

      if (years <= 0) return `${months} months`;
      if (months === 0) return `${years} years`;

      return `${years} years ${months} months`;
    };

    const calcTurnoverRisk = (rating) => {
      if (rating <= 2) return "High";
      if (rating === 3) return "Medium";
      return "Low";
    };

    const formatted = rows.map((emp) => {
      const finalRating = Math.round(((emp.self_rating || 0) + (emp.tl_rating || 0)) / 2);

      return {
        employee_uuid: emp.employee_uuid,
        employee_code: emp.employee_code,
        employee_name: emp.employee_name,
        designation: emp.designation,
        self_rating: emp.self_rating,
        tl_rating: emp.tl_rating,
        final_rating: finalRating,
        turnover_risk: calcTurnoverRisk(finalRating),
        tenure: calculateTenure(emp.date_of_joining)
      };
    });

    res.status(200).json(formatted);

  } catch (err) {
    console.error("Fetch Ratings Error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

// export const validatePayroll = async (req, res) => {
//   const client = await pool.connect();

//   try {
//     const { startDate, endDate, month, year } = req.body;

//     // 1️⃣ Validate input
//     if ((!startDate || !endDate) && (!month || !year)) {
//       return res.status(400).json({ error: "Provide startDate/endDate or month+year" });
//     }

//     // 2️⃣ Build date range
//     let fromDate, toDate;
//     if (startDate && endDate) {
//       fromDate = startDate;
//       toDate = endDate;
//     } else {
//       const m = Number(month);
//       const y = Number(year);
//       fromDate = `${y}-${String(m).padStart(2, '0')}-01`;
//       const lastDay = new Date(y, m, 0).getDate();
//       toDate = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
//     }

//     // 3️⃣ Fetch all active employees + their active salary structure
//     const { rows: employees } = await client.query(`
//       SELECT u.id AS employee_id, u.name AS name,
//              s.status AS salary_status, s.basic_pay
//       FROM user_employees_master u
//       LEFT JOIN salary_structure s
//         ON s.employee_id = u.id AND s.status = 'Active'
//       WHERE u.is_active = true
//     `);

//     // 4️⃣ Fetch monthly_status from attendance
//     const { rows: attendanceRows } = await client.query(`
//       SELECT employee_id,
//              MIN(monthly_status) AS monthly_status
//       FROM attendance
//       WHERE date BETWEEN $1 AND $2
//       GROUP BY employee_id
//     `, [fromDate, toDate]);

//     // 5️⃣ Create map of attendance per employee
//     const attendanceMap = {};
//     attendanceRows.forEach(r => {
//       attendanceMap[r.employee_id] = r.monthly_status || "Pending_approval";
//     });

//     // 6️⃣ Validate each employee
//     const issues = [];
//     let approvedCount = 0;
//     let pendingCount = 0;

//     employees.forEach(emp => {

//       if (!attendanceMap[emp.employee_id]) {
//     return;
//   }
//       // Check salary structure
//       if (!emp.basic_pay || emp.salary_status !== 'Active') {
//         issues.push(`${emp.name} does not have an active salary structure`);
//       }

//       // Check attendance status
//       const status = (attendanceMap[emp.employee_id] || "Pending_approval").toLowerCase();
//       if (status === "approved") {
//         approvedCount++;
//       } else {
//         pendingCount++;
//         issues.push(`${emp.name} attendance is Pending_approval`);
//       }
//     });

//     // 7️⃣ Return response
//     return res.json({
//       status: pendingCount === 0 && issues.length === 0 ? "ready" : "warning",
//       attendance_summary: {
//         approved: approvedCount,
//         pending_approval: pendingCount
//       },
//       total_employees: employees.length,
//       issues
//     });

//   } catch (err) {
//     console.error("VALIDATE PAYROLL ERROR", err);
//payroll analytics

// ===============================
// ⭐ PAYROLL ANALYTICS (READ-ONLY, GET REQUEST)
// ===============================
// export const getPayrollAnalytics = async (req, res) => {
//   const client = await pool.connect();

//   try {
//     // Auto detect current month & year
//     const month = new Date().getMonth() + 1;
//     const year = new Date().getFullYear();

//     const query = `
//       SELECT 
//         u.department,
//         SUM(s.gross_salary) AS total_payroll,
//         COUNT(s.employee_id) AS headcount
//       FROM salary_structure s
//       JOIN user_employees_master u 
//           ON u.id = s.employee_id
//       WHERE EXTRACT(MONTH FROM s.created_at) = $1
//         AND EXTRACT(YEAR FROM s.created_at) = $2
//       GROUP BY u.department;
//     `;

//     const { rows } = await client.query(query, [month, year]);

//     const formatted = rows.map((row) => ({
//       department: row.department,
//       total_payroll: Number(row.total_payroll),
//       headcount: Number(row.headcount)
//     }));

//     return res.status(200).json({
//       success: true,
//       month,
//       year,
//       total_departments: formatted.length,
//       departments: formatted
//     });

//   } catch (err) {
//     console.error("Payroll Analytics Error:", err);
//     return res.status(500).json({ error: err.message });
//   } finally {
//     client.release();
//   }
// };

export const validatePayroll = async (req, res) => {
  const client = await pool.connect();

  try {
    const { startDate, endDate, month, year } = req.body;

    // 1️⃣ Validate input
    if ((!startDate || !endDate) && (!month || !year)) {
      return res.status(400).json({ error: "Provide startDate/endDate or month+year" });
    }

    // 2️⃣ Build date range
    let fromDate, toDate;
    if (startDate && endDate) {
      fromDate = startDate;
      toDate = endDate;
    } else {
      const m = Number(month);
      const y = Number(year);
      fromDate = `${y}-${String(m).padStart(2, '0')}-01`;
      const lastDay = new Date(y, m, 0).getDate();
      toDate = `${y}-${String(m).padStart(2, '0')}-${lastDay}`;
    }

    // 3️⃣ Fetch all ACTIVE employees and their salary structure
    const { rows: employees } = await client.query(`
      SELECT u.id AS employee_id, u.name AS name,
             s.status AS salary_status, s.basic_pay
      FROM user_employees_master u
      LEFT JOIN salary_structure s
        ON s.employee_id = u.id AND s.status = 'Active'
      WHERE u.is_active = true
    `);

    // 4️⃣ Get direct APPROVED count from DB
    const { rows: approvedRows } = await client.query(`
      SELECT COUNT(DISTINCT employee_id) AS approved
      FROM attendance
      WHERE date BETWEEN $1 AND $2
        AND LOWER(monthly_status) = 'approved'
    `, [fromDate, toDate]);

    // 5️⃣ Get direct PENDING count from DB
    const { rows: pendingRows } = await client.query(`
      SELECT COUNT(DISTINCT employee_id) AS pending
      FROM attendance
      WHERE date BETWEEN $1 AND $2
        AND LOWER(monthly_status) = 'pending_approval'
    `, [fromDate, toDate]);

    const approvedCount = Number(approvedRows[0].approved);
    const pendingCount = Number(pendingRows[0].pending);

    // 6️⃣ Collect issues per employee
    const issues = [];

    employees.forEach(emp => {
      // Salary validation
      if (!emp.basic_pay || emp.salary_status !== "Active") {
        issues.push(`${emp.name} does not have an active salary structure`);
      }
    });

    // 7️⃣ Response
    const canGenerate = pendingCount === 0 && issues.length === 0;

    return res.json({
      status: canGenerate ? "ready" : "warning",
      can_generate: canGenerate,
      attendance_summary: {
        approved: approvedCount,
        pending_approval: pendingCount
      },
      total_employees: employees.length,
      issues
    });

  } catch (err) {
    console.error("VALIDATE PAYROLL ERROR", err);
    return res.status(500).json({ error: err.message });
    } finally {
    client.release();
  }
};
export const getDepartmentWisePayroll = async (req, res) => {
  const client = await pool.connect();
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ success: false, message: "month and year are required" });
    }

    // Convert month names (e.g., "MARCH") to month numbers
    const monthLower = String(month).trim().toLowerCase();

    const monthNames = {
      january: "1",
      february: "2",
      march: "3",
      april: "4",
      may: "5",
      june: "6",
      july: "7",
      august: "8",
      september: "9",
      october: "10",
      november: "11",
      december: "12",
    };

    let monthNum = monthNames[monthLower] || monthLower; // if "3" keep "3", if "march" → "3"

    const m1 = String(monthNum);             // "3"
    const m2 = m1.padStart(2, "0");          // "03"

    const query = `
      SELECT 
        u.department,
        COUNT(s.employee_id) AS total_employees,
        SUM(s.gross_salary) AS total_gross,
        SUM(s.total_deductions) AS total_deductions,
        SUM(s.net_salary) AS total_net
      FROM salary_structure s
      JOIN user_employees_master u 
        ON u.id = s.employee_id
      WHERE (
        LOWER(s.month) = LOWER($1) OR 
        LOWER(s.month) = LOWER($2) OR 
        s.month = $3 OR 
        s.month = $4
      )
      AND s.year = $5
      GROUP BY u.department
      ORDER BY total_gross DESC;
    `;

    const { rows } = await client.query(query, [
      monthLower,    // "march"
      monthNum,      // "3"
      m1,            // "3"
      m2,            // "03"
      Number(year),
    ]);

    return res.json({
      success: true,
      departmentPayroll: rows,
    });

  } catch (err) {
    console.error("DEPT PAYROLL ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
};

async function generatePayrollId(client) {
  // Fetch all existing payroll IDs
  const { rows } = await client.query(
    `SELECT payroll_id FROM payroll WHERE payroll_id IS NOT NULL`
  );

  const nums = rows
    .map(r => r.payroll_id)
    .filter(Boolean)
    .map(id => {
      const m = id.match(/PR0*([0-9]+)$/i); // match PR001, PR012, etc.
      return m ? parseInt(m[1], 10) : NaN;
    })
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b);

  // Find first missing number in sequence
  let next = 1;
  for (const n of nums) {
    if (n === next) next++;
    else if (n > next) break;
  }

  return `PR${next.toString().padStart(3, "0")}`;
}


export const runPayroll = async (req, res) => {
  const client = await pool.connect();

  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ error: "month and year are required" });
    }

    const monthNames = [
      "JANUARY", "FEBRUARY", "MARCH", "APRIL",
      "MAY", "JUNE", "JULY", "AUGUST",
      "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    ];

    let normalizedMonth;

    // If frontend sends number → convert to month name
    if (/^\d+$/.test(month)) {
      const m = parseInt(month);
      if (m < 1 || m > 12) {
        return res.status(400).json({ error: "Invalid month number" });
      }
      normalizedMonth = monthNames[m - 1]; // Convert to JANUARY
    } else {
      normalizedMonth = month.toUpperCase();
    }

    const payrollId = await generatePayrollId(client);

    // 2️⃣ Fetch active salary structure rows
    const { rows: employees } = await client.query(
      `
      SELECT 
        id,
        employee_id,
        basic_pay,
        gross_salary,
        total_deductions,
        net_salary
      FROM salary_structure
      WHERE status = 'Active'
        AND month ILIKE $1
        AND year = $2
      ORDER BY created_at DESC;
      `,
      [normalizedMonth, year]
    );

    if (employees.length === 0) {
      return res.status(400).json({ error: "No active employees found in salary structure" });
    }

    let totalGross = 0;
    let totalNet = 0;
    let totalDeductions = 0;

    const processed = employees.map(emp => {
      if (emp.gross_salary == null || emp.total_deductions == null || emp.net_salary == null) {
        throw new Error(`Missing salary fields for employee_id=${emp.employee_id}`);
      }

      const gross = Number(emp.gross_salary) || 0;
      const net = Number(emp.net_salary) || 0;
      const deduct = Number(emp.total_deductions) || 0;

      totalGross += gross;
      totalNet += net;
      totalDeductions += deduct;

      return {
        employee_id: emp.employee_id,
        gross_salary: gross,
        total_deductions: deduct,
        net_salary: net
      };
    });

    // 3️⃣ Insert into payroll table
    const history = await client.query(
      `
      INSERT INTO payroll
        (payroll_id, year, month, total_employees, total_gross, total_deductions, total_net, status, run_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Completed', NOW())
      RETURNING *;
      `,
      [payrollId, year, month, processed.length, totalGross, totalDeductions, totalNet]
    );

    return res.json({
      message: "Payroll run completed successfully",
      payrollId,
      status: "Completed",
      runDate: history.rows[0].run_date,
      totalEmployees: processed.length,
      totalGross,
      totalDeductions,
      totalNet,
      history: history.rows[0]
    });

  } catch (err) {
    console.error("RUN PAYROLL ERROR:", err);
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};


export const reversePayroll = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "id is required" });
    }

    // 1️⃣ Check if payroll exists
    const { rows } = await client.query(
      `SELECT * FROM payroll WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Payroll ID not found" });
    }

    const payroll = rows[0];

    if (payroll.status === "Reversed") {
      return res.status(400).json({ error: "Payroll is already reversed" });
    }

    // 2️⃣ Update status to Reversed
    await client.query(
      `UPDATE payroll SET status = 'Reversed', run_date = NOW()  WHERE id = $1`,
      [id]
    );

    return res.json({
      message: `Payroll ${id} has been reversed successfully`,
      payrollId: id
    });

  } catch (err) {
    console.error("REVERSE PAYROLL ERROR:", err);
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};


export const rerunPayroll = async (req, res) => {
  const client = await pool.connect();

  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ error: "month and year are required" });
    }

    // 1️⃣ Reverse any previous payroll for this month/year (optional)
    await client.query(
      `UPDATE payroll SET status = 'Reversed', run_date = NOW()
       WHERE month = $1 AND year = $2 AND status = 'Completed'`,
      [month, year]
    );

    

    const payrollId = await generatePayrollId(client);

    // 3️⃣ Fetch active salary structure
    const { rows: employees } = await client.query(`
      SELECT
        employee_id, gross_salary, total_deductions, net_salary
      FROM salary_structure
      WHERE status = 'Active'
    `);

    if (employees.length === 0) {
      return res.status(400).json({ error: "No active employees found in salary structure" });
    }

    let totalGross = 0, totalNet = 0, totalDeductions = 0;

    employees.forEach(emp => {
      totalGross += Number(emp.gross_salary) || 0;
      totalNet += Number(emp.net_salary) || 0;
      totalDeductions += Number(emp.total_deductions) || 0;
    });

    // 4️⃣ Insert new payroll
    const history = await client.query(
      `INSERT INTO payroll
        (payroll_id, year, month, total_employees, total_gross, total_deductions, total_net, status, run_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'Completed',NOW())
       RETURNING *`,
      [payrollId, year, month, employees.length, totalGross, totalDeductions, totalNet]
    );

    return res.json({
      message: `Payroll rerun completed successfully with ID ${payrollId}`,
      payrollId,
      totalEmployees: employees.length,
      totalGross,
      totalDeductions,
      totalNet,
      status: "Completed",
      history: history.rows[0]
    });

  } catch (err) {
    console.error("RERUN PAYROLL ERROR:", err);
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};


export const getAllPayroll = async (req, res) => {
  const client = await pool.connect();

  try {
    const { rows } = await client.query(`
      SELECT 
        id,
        payroll_id,
        year,
        month,
        total_employees,
        total_gross,
        total_deductions,
        total_net,
        status,
        run_date
        
      FROM payroll
      ORDER BY run_date DESC;
    `);

    return res.json({
      count: rows.length,
      payroll: rows
    });

  } catch (err) {
    console.error("GET ALL PAYROLL ERROR:", err);
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const getMonthlyPayrollSummary = async (req, res) => {
  const client = await pool.connect();

  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "month and year are required" });
    }

    // Normalize month
    const monthInt = parseInt(month, 10);
    const monthStr = String(monthInt);
    const monthZero = monthStr.padStart(2, "0");

    const query = `
      SELECT 
        total_employees,
        total_gross,
        total_deductions,
        total_net
      FROM payroll
      WHERE month IN ($1, $2)
        AND year = $3
        AND status = 'Completed'
      ORDER BY run_date DESC
      LIMIT 1;
    `;

    const { rows } = await client.query(query, [
      monthStr,
      monthZero,
      year
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "No payroll found for this month/year" });
    }

    res.json({
      month: monthInt,
      year,
      totalEmployees: rows[0].total_employees,
      totalGross: rows[0].total_gross,
      totalDeductions: rows[0].total_deductions,
      totalNet: rows[0].total_net,
    });

  } catch (err) {
    console.error("MONTHLY PAYROLL SUMMARY ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};


export const getPayrollTrend = async (req, res) => {
  const client = await pool.connect();
  try {
    let limit = parseInt(req.query.limit) || 6;

    if (limit < 1 || limit > 36) limit = 6;

    const query = `
      SELECT DISTINCT ON (year, month::int)
        month,
        year,
        total_gross,
        total_net,
        total_employees
      FROM payroll
      WHERE status = 'Completed'
      ORDER BY year DESC, month::int DESC, run_date DESC
      LIMIT $1;
    `;

    const { rows } = await client.query(query, [limit]);

    res.json({
      success: true,
      months_requested: limit,
      trend: rows.reverse() // oldest → latest
    });

  } catch (err) {
    console.error("PAYROLL TREND ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
};


export const getFreelancerAnalytics = async (req, res) => {
  try {
    const query = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.department,
 
        c.contract_title,
        c.contract_start_date,
        c.contract_end_date,
        c.version,
        c.contract_status,
 
        r.project_cost
 
      FROM user_employees_master u
      LEFT JOIN freelancer_contracts c ON u.id = c.freelancer_id
      LEFT JOIN freelancer_responses r ON u.email = r.email  -- matching based on email
      WHERE u.employment_type = 'freelancer'
      ORDER BY u.created_at DESC;
    `;
 
    const result = await pool.query(query);
    return res.json(result.rows);
 
  } catch (error) {
    console.error("Error fetching freelancer analytics:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const fetchAuthSettings = async () => {
  const { data } = await axios.get(
    `${process.env.SETTINGS_SERVICE_URL}/api/settings/get`
  );
  return data;
};