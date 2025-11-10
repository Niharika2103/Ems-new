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

// ✅ Updated table names
const USER_MASTER_TABLE = "user_employees_master";
const REGISTRATIONS_TABLE = "registrations";
const SUPERADMINS_TABLE = "super_admins";

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
function issueJwt({ email, role, is_temp_admin = false, id ,name}) {
  return jwt.sign(
    { email, role, is_temp_admin, id ,name},
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
      `SELECT is_temp_admin, temp_admin_expiry, is_approved FROM ${REGISTRATIONS_TABLE} WHERE user_id=$1`,
      [user.id]
    );
    const regData = regDataResult.rows[0];

    if (!regData?.is_approved)
      return res.status(403).json({ error: "Access denied. Permission not granted by SuperAdmin." });

    const isTempAdmin =
      regData.is_temp_admin && new Date(regData.temp_admin_expiry) > new Date();

    const token = issueJwt({
      email: user.email,
      role: user.role === "admin" ? "admin" : user.role_1,
      id: user.id,
      is_temp_admin: isTempAdmin,
      name: user.name,
    });

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
    const BASE_URL =
      process.env.BASE_URL || `http://localhost:${process.env.PORT || 5002}`;

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

    let updates = { ...existing.rows[0], ...req.body };

    // 🚫 Remove restricted fields
    delete updates.role;
    delete updates.mfa_secret;
    delete updates.mfa_enabled;
    delete updates.employee_id;
    delete updates.date_of_joining;
    delete updates.access_flag;

    // 🔐 Hash password if updated
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

    // ✅ Build dynamic query for updates
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
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
};
/**
 * Grant Temporary Admin Access to an Employee
 * POST /api/admin/grant-temp
 * Body: { email, durationHours }
 */
export const grantTempAdminAccess = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, durationHours = 24 } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Employee email is required" });
    }

    // ✅ Find employee
    const userQuery = `
      SELECT * FROM ${USER_MASTER_TABLE}
      WHERE email = $1 AND role = 'employee'
    `;
    const userResult = await client.query(userQuery, [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    const user = userResult.rows[0];

    // ✅ Get registration record
    const regQuery = `
      SELECT is_temp_admin, temp_admin_expiry 
      FROM ${REGISTRATIONS_TABLE} 
      WHERE user_id = $1
    `;
    const regResult = await client.query(regQuery, [user.id]);
    const reg = regResult.rows[0];

    // ✅ Already active temporary admin check
    if (reg?.is_temp_admin && new Date(reg.temp_admin_expiry) > new Date()) {
      return res.status(400).json({
        error: `Employee already has temporary admin access until ${new Date(
          reg.temp_admin_expiry
        ).toLocaleString()}.`,
      });
    }

    const expiry = new Date(Date.now() + durationHours * 60 * 60 * 1000);

    // ✅ Update registration record
    const updateQuery = `
      UPDATE ${REGISTRATIONS_TABLE}
      SET is_temp_admin = true, is_approved = true, temp_admin_expiry = $1
      WHERE user_id = $2
    `;
    await client.query(updateQuery, [expiry, user.id]);

    // ✅ Send email notification
    try {
      await sendEmail(
        user.email,
        "Temporary Admin Access Granted",
        `
          <p>Hello ${user.name},</p>
          <p>You have been granted temporary admin access until ${expiry.toLocaleString()}.</p>
          <p>Please use this privilege responsibly.</p>
        `
      );
    } catch (emailErr) {
      console.warn("Failed to send email notification:", emailErr.message);
    }

    res.status(200).json({
      message: `Temporary admin access granted to ${user.name} until ${expiry.toLocaleString()}.`,
      employee: {
        id: user.id,
        name: user.name,
        email: user.email,
        temp_admin_expiry: expiry,
      },
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
    const formattedData = result.rows.map((row) => ({
      ...row,
      date: row.date ? row.date.toISOString().split("T")[0] : null, // only date part
    }));

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
    const status = "approved"; // default status

    // ✅ Extract admin name from JWT token or request body
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

    // ✅ 1. Update weekly attendance status
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

    // ✅ 2. Handle if no records to approve
    if (result.rows.length === 0) {
      return res.status(200).json({
        message: "No pending approvals found for the given week.",
        updated_count: 0,
      });
    }

    console.log(`✅ Weekly records approved for employee: ${employeeId}`);


    try {
      await axios.post("http://localhost:9091/api/initialize-default-leaves", {
        employeeId,
        adminName: updatedBy,
      });
      console.log("✅ Default leaves initialized in Java service");
    } catch (err) {
      console.warn("⚠️ Default leaves may already exist or failed:", err.message);
    }
    //  Call Java API to deduct leaves for that week
    try {
      await axios.post("http://localhost:9091/api/attendance/deduct-leaves", {
        employeeId,
        from,
        to,
      });
      console.log("✅ Leave balance updated in Java service");
    } catch (err) {
      console.error("⚠️ Failed to update leave balance in Java service:", err.message);
    }

    // ✅ 4. Send success response to frontend
    res.status(200).json({
      message: `Weekly attendance ${status} successfully by ${updatedBy}`,
      updated_count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error("❌ Update Weekly Status Error:", err.message);
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

export const updateMonthlyApprovalStatus = async (req, res) => {
  const client = await pool.connect();

  try {
    const { employeeId, from, to } = req.body;
    const status = "approved";

    // ✅ Extract admin name from JWT token or body
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

    // ✅ Update query for monthly status
    const query = `
      UPDATE attendance
      SET monthly_status = $1,
          updated_by = $5,
          updated_at = NOW()
      WHERE employee_id = $2
        AND "date" BETWEEN $3 AND $4
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

    // ✅ Response handling
    if (result.rows.length === 0) {
      return res.status(200).json({
        message: "No pending approvals found for the given month.",
        updated_count: 0,
      });
    }

    res.status(200).json({
      message: `Monthly attendance ${status} successfully by ${updatedBy}`,
      updated_count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error("Update Monthly Status Error:", err.message);
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
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [status, employeeId, from, to]);

    res.status(200).json({
      message: `Weekly attendance ${status} successfully`,
      updated_count: rows.length,
      data: rows,
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