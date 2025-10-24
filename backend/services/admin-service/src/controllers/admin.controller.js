import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { sendEmail } from "../services/emailserviceadmin.js";
import multer from "multer";
import path from "path";
import fs from "fs";
// ✅ Updated table names
const USER_MASTER_TABLE = "ems.user_employees_master";
const REGISTRATIONS_TABLE = "ems.registrations";
const SUPERADMINS_TABLE = "ems.super_admins";

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
  try {
    const { id } = req.params;
    const { status } = req.body; 
    if (!id || id === "undefined") {
      return res.status(400).json({ error: "Invalid or missing admin ID" });
    }

    const { error } = await supabase
      .from(USER_MASTER_TABLE)
        .update({ is_active: status })
      .eq("id", id);
    if (error) throw error;

 
    return res.json({ message: `Admin ${status ? "activated" : "deactivated"} successfully` });
  } catch (err) {
    console.error("Delete Admin Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// SuperAdmin gave Permission to admin (via registrations table)
export const approveAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_approved } = req.body;

    if (typeof is_approved !== "boolean") {
      return res.status(400).json({ error: "is_approved must be boolean" });
    }

    //  Update registrations table
    const { data: registration, error: regError } = await supabase
      .from(REGISTRATIONS_TABLE)
      .update({ is_approved })
      .eq('user_id', id)
      .select();

    if (regError) throw regError;

    if (!registration || registration.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json({
      message: is_approved
        ? "SuperAdmin approved successfully"
        : "SuperAdmin access revoked",
      admin: registration[0],
    });
  } catch (err) {
    console.error("Approve SuperAdmin Error:", err.message);
    res.status(500).json({ error: err.message });
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
  try {
    const { id } = req.params;

    // ✅ Validate ID
    if (!id || id === "undefined") {
      return res.status(400).json({ error: "Invalid or missing admin ID" });
    }

    // ✅ Fetch admin from DB (role = "admin")
    const { data, error } = await supabase
      .from(USER_MASTER_TABLE)
      .select("*")
      .eq("id", id)
      .eq("role", "admin")
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Admin not found" });

    // ✅ Build full URLs for files
    const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5002}`;

    const responseData = {
      ...data,
      profile_photo: data.profile_photo 
        ? `${BASE_URL}/uploads/${data.profile_photo}` 
        : null,
      resume: data.resume 
        ? `${BASE_URL}/uploads/${data.resume}` 
        : null,
    };

    // ✅ Optional: Remove sensitive fields before sending
    delete responseData.password;
    delete responseData.mfa_secret;
    delete responseData.reset_token;

    return res.json(responseData);
  } catch (err) {
    console.error("Get Admin By ID Error:", err.message || err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

// ================== Update Admin Profile ==================

export const updateAdminProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Fetch existing admin
    const { data: existingData, error: fetchError } = await supabase
      .from(USER_MASTER_TABLE)
      .select("*")
      .eq("id", id)
      .eq("role", "admin")
      .single();

    if (fetchError) throw fetchError;
    if (!existingData) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // ✅ Merge old data with new updates
    let updates = { ...existingData, ...req.body };

    // 🚫 Prevent restricted fields from being changed
    delete updates.role;
    delete updates.mfa_secret;
    delete updates.mfa_enabled;
    delete updates.employee_id;
    delete updates.date_of_joining;
    delete updates.access_flag;

    // 🔐 Hash password if it’s being updated
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

    // if (req.files?.profilePhoto?.[0]) {
    //   updates.profile_photo = `/uploads/${req.files.profilePhoto[0].filename}`;
    // }
    // if (req.files?.resume?.[0]) {
    //   updates.resume = `/uploads/${req.files.resume[0].filename}`;
    // }
    // ✅ Save merged data back into DB
    const { data, error } = await supabase
      .from(USER_MASTER_TABLE)
      .update(updates)
      .eq("id", id)
      .select("*");

    if (error) throw error;

    // Remove sensitive fields from response
    const { password, mfa_secret, reset_token, ...safeData } = data[0];

    return res.json({
      message: "Admin profile updated successfully",
      admin: safeData,
    });

  } catch (err) {
    console.error("Update Admin Profile Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};
/**
 * Grant Temporary Admin Access to an Employee
 * POST /api/admin/grant-temp
 * Body: { email, durationHours }
 */
export const grantTempAdminAccess = async (req, res) => {
  try {
    const { email, durationHours = 24 } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Employee email is required" });
    }

    const { data: user, error: fetchError } = await supabase
      .from(USER_MASTER_TABLE)
      .select("*")
      .eq("email", email)
      .eq("role", "employee")
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!user) {
      return res.status(404).json({ error: "Employee not found" });
    }
    const { data: reg, error: regError } = await supabase
      .from(REGISTRATIONS_TABLE)
      .select("is_temp_admin, temp_admin_expiry")
      .eq("user_id", user.id)
      .maybeSingle();

    if (regError) throw regError;

    // ✅ Check if employee already has active temporary admin access
    if (reg?.is_temp_admin && new Date(reg.temp_admin_expiry) > new Date()) {
      return res.status(400).json({
        error: `Employee already has temporary admin access until ${new Date(
          reg.temp_admin_expiry
        ).toLocaleString()}.`,
      });
    }

    const expiry = new Date(Date.now() + durationHours * 60 * 60 * 1000);

    // ✅ Update the specific registration row
    const { error: updateError } = await supabase
      .from(REGISTRATIONS_TABLE)
      .update({
        user_id: user.id,
        is_temp_admin: true,
        is_approved:true,
        temp_admin_expiry: expiry,
      })
      .eq("user_id", user.id);  // <-- Add condition here


    if (updateError) throw updateError;

    // Optional: Send email notification
    try {
      // ⚠️ Make sure sendEmail is implemented or mock it
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
  }
};

/**
 * Revoke Temporary Admin Access from an Employee
 * DELETE /api/admin/revoke-temp/:email
 */
export const revokeTempAdminAccess = async (req, res) => {
  try {
    const { email } = req.params;

    const { data: user, error: fetchError } = await supabase
      .from(USER_MASTER_TABLE)
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!user) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // ✅ Update registrations table
    const { error: updateError } = await supabase
      .from(REGISTRATIONS_TABLE)
      .update({
        is_temp_admin: false,
        is_approved:false,
        temp_admin_expiry: null,
      })
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    // Optional: Notify employee
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
  }
};

/**
 * List All Active Temporary Admins
 * GET /api/admin/temp-admins
 */
export const listTempAdmins = async (req, res) => {
  try {
    const { data: regs, error } = await supabase
      .from(REGISTRATIONS_TABLE)
      .select("user_id, is_temp_admin, temp_admin_expiry")
      .eq("is_temp_admin", true)
      .gte("temp_admin_expiry", new Date().toISOString());

    if (error) throw error;

    // Get user details
    const userIds = regs.map((r) => r.user_id);
    const { data: users, error: userError } = await supabase
      .from(USER_MASTER_TABLE)
      .select("id, name, email, role")
      .in("id", userIds);

    if (userError) throw userError;

    const tempAdmins = regs.map((reg) => {
      const user = users.find((u) => u.id === reg.user_id);
      return {
        ...reg,
        name: user?.name,
        email: user?.email,
        role: user?.role,
      };
    });

    res.json({
      message: "Active temporary admins fetched successfully.",
      count: tempAdmins.length,
      tempAdmins,
    });
  } catch (err) {
    console.error("List Temp Admins Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const sendEmailVerification = async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    const email = decoded.email;

    // 1️⃣ Get user id
    const { data: user, error: userError } = await supabase
      .from(USER_MASTER_TABLE)
      .select("id, name")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // 2️⃣ Save OTP in registrations
    // 2️⃣ Save OTP in registrations (update only)
    const { error: regError } = await supabase
    .from(REGISTRATIONS_TABLE)
    .update({ email_otp: otp, otp_expiry: expiry })
    .eq("user_id", user.id);

    if (regError) {
         return res.status(500).json({ error: "Failed to update OTP" });
   }


    // 3️⃣ Send email
    await sendEmail(
      email,
      "Verify your Email",
      `<p>Hello ${user?.name || "User"},</p>
       <p>Your email verification code is <b>${otp}</b></p>
       <p>Valid for 10 minutes.</p>`
    );

    res.json({ message: "Verification OTP sent to your email." });
  } catch (err) {
    console.error("Send Email Verification Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};


export const verifyEmail = async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    const email = decoded.email;
    const { otp } = req.body;

    // 1️⃣ Find user
    const { data: user, error: userError } = await supabase
      .from(USER_MASTER_TABLE)
      .select("id")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2️⃣ Get OTP from registrations
    const { data: reg, error: regError } = await supabase
      .from(REGISTRATIONS_TABLE)
      .select("email_otp, otp_expiry")
      .eq("user_id", user.id)
      .single();

    if (regError || !reg) {
      return res.status(400).json({ error: "No OTP found. Please request again." });
    }

    const isValidOtp = String(reg.email_otp) === String(otp);
    const isExpired = new Date() > new Date(reg.otp_expiry);

    if (!isValidOtp || isExpired) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // 3️⃣ Mark email verified in master
    await supabase
      .from(USER_MASTER_TABLE)
      .update({ is_email_verified: true })
      .eq("id", user.id);

    // 4️⃣ Clear OTP in registrations
    await supabase
      .from(REGISTRATIONS_TABLE)
      .update({ email_otp: null, otp_expiry: null })
      .eq("user_id", user.id);

    res.json({ message: "Email verified successfully." });
  } catch (err) {
    console.error("Verify Email Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Promote an Employee to Admin (by Admin or SuperAdmin)
 * POST /api/admin/promote/:employeeId
 * No SuperAdmin required for promotion — only for final approval
 */
export const promoteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    // Fetch employee
    const { data: employee, error: fetchError } = await supabase
      .from(USER_MASTER_TABLE)
      .select("*")
      .eq("id", employeeId)
      .eq("role", "employee")
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!employee) {
      return res.status(404).json({ error: "Employee not found or already promoted" });
    }

    // Update to admin + mark promoted
    const { error: updateError } = await supabase
      .from(USER_MASTER_TABLE)
      .update({
        role: "admin",
        role_1: null,
        role_2: "employee",
        is_promoted: true, // ✅ Key flag
        // mfa_secret and mfa_enabled will be set during registration
      })
      .eq("id", employeeId);

    if (updateError) throw updateError;

    // Ensure registration record exists
    const { data: reg, error: regErr } = await supabase
      .from(REGISTRATIONS_TABLE)
      .select("*")
      .eq("user_id", employeeId)
      .maybeSingle();

    if (regErr) throw regErr;

    if (!reg) {
      const { error: insertRegErr } = await supabase
        .from(REGISTRATIONS_TABLE)
        .insert([
          {
            user_id: employeeId,
            is_approved: false, // Will need SuperAdmin approval later
            is_temp_admin: false,
            temp_admin_expiry: null,
          },
        ]);
      if (insertRegErr) throw insertRegErr;
    }

    // Send email
    try {
      await sendEmail(
        employee.email,
        "You've Been Promoted to Admin!",
        `
          <p>Hello ${employee.name},</p>
          <p>You have been promoted to <strong>Admin</strong>.</p>
          <p>Please complete your admin registration by setting a password and enabling MFA.</p>
          <p>Visit the admin registration page to proceed.</p>
          <p>Note: Full access will be granted after SuperAdmin approval.</p>
        `
      );
    } catch (emailErr) {
      console.warn("Promotion email failed:", emailErr.message);
    }

    res.json({
      message: "Employee promoted successfully. Awaiting registration and SuperAdmin approval.",
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
  }
};

export const getPendingWeeklyApprovals = async (req, res) => {
  
  try {
    const { employeeId, from, to } = req.query;

    // Basic validation
    if (!employeeId || !from || !to) {
      return res.status(400).json({
        error: "Missing required query parameters (employeeId, from, to)"
      });
    }

    const { data, error } = await supabase
      .from("attendance")
      .select(`
        *,
        user_employees_master (id, name, email)
      `)
      .eq("employee_id", employeeId)
      .eq("weekly_status", "Pending_approval")
      .gte("date", from)
      .lte("date", to);

    if (error) throw error;

    res.status(200).json({
      message: "Pending weekly approvals fetched successfully",
      count: data.length,
      data,
    });
  } catch (err) {
    console.error("Get Pending Weekly Approvals Error:", err.message);
    res.status(500).json({ error: "Failed to fetch pending weekly approvals" });
  }
};


/* -------------------------------------------------------------------------- */
/*                          ADMIN APPROVE / REJECT WEEK                   */
/* -------------------------------------------------------------------------- */
export const updateWeeklyApprovalStatus = async (req, res) => {
  try {
    const { employeeId, from, to } = req.body;
    const status = "approved"; // (or "rejected" if that button clicked)

    const { data, error } = await supabase
      .from("attendance")
      .update({ weekly_status: status })
      .eq("employee_id", employeeId)
      .gte("date", from)
      .lte("date", to)
      .eq("weekly_status", "Pending_approval")
      .select();

    if (error) throw error;

    res.status(200).json({
      message: `Weekly attendance ${status} successfully`,
      updated_count: data.length,
      data,
    });
  } catch (err) {
    console.error("Update Weekly Status Error:", err.message);
    res.status(500).json({ error: "Failed to update weekly attendance" });
  }
};


/* -------------------------------------------------------------------------- */
/*                      GET PENDING MONTHLY APPROVALS (ADMIN)                 */
/* -------------------------------------------------------------------------- */
export const getPendingMonthlyApprovals = async (req, res) => {
  
  try {
    const { employeeId, from, to } = req.query;

    // Basic validation
    if (!employeeId || !from || !to) {
      return res.status(400).json({
        error: "Missing required query parameters (employeeId, from, to)"
      });
    }

    const { data, error } = await supabase
      .from("attendance")
      .select(`
        *,
        user_employees_master (id, name, email)
      `)
      .eq("employee_id", employeeId)
      .eq("monthly_status", "Pending_approval")
      .gte("date", from)
      .lte("date", to);

    if (error) throw error;

    res.status(200).json({
      message: "Pending monthly approvals fetched successfully",
      count: data.length,
      data,
    });
  } catch (err) {
    console.error("Get Pending Monthly Approvals Error:", err.message);
    res.status(500).json({ error: "Failed to fetch pending monthly approvals" });
  }
};

/* -------------------------------------------------------------------------- */
/*                       ADMIN APPROVES MONTHLY ATTENDANCE                    */
/* -------------------------------------------------------------------------- */
export const updateMonthlyApprovalStatus = async (req, res) => {
  try {
    const { employeeId, from, to } = req.body;
    const status = "approved"; // Automatically set to approved (triggered by Approve button)

    const { data, error } = await supabase
      .from("attendance")
      .update({ monthly_status: status })
      .eq("employee_id", employeeId)
      .gte("date", from)
      .lte("date", to)
      .eq("monthly_status", "Pending_approval")
      .select();

    if (error) throw error;

    res.status(200).json({
      message: `Monthly attendance ${status} successfully`,
      updated_count: data.length,
      data,
    });
  } catch (err) {
    console.error("Update Monthly Status Error:", err.message);
    res.status(500).json({ error: "Failed to update monthly attendance" });
  }
};


/* -------------------------------------------------------------------------- */
/*        ADMIN UPDATES WORKED HOURS (Weekly or Monthly Pending Record)       */
/* -------------------------------------------------------------------------- */
export const adminUpdateWorkedHours = async (req, res) => {
  try {
    const { employeeId, date, worked_hours, type } = req.body;

    if (!employeeId || !date || worked_hours === undefined || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Determine which status to check (weekly or monthly)
    const statusField = type === "monthly" ? "monthly_status" : "weekly_status";

    // Update only worked_hours if record is still pending approval
    const { data, error } = await supabase
      .from("attendance")
      .update({ worked_hours })
      .eq("employee_id", employeeId)
      .eq("date", date)
      .eq(statusField, "Pending_approval")
      .select();

    if (error) throw error;

    if (data.length === 0) {
      return res.status(400).json({
        message: `No pending ${type} record found for this date (already approved or invalid)`,
      });
    }

    res.status(200).json({
      message: `Worked hours updated successfully for ${type}`,
      data,
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

    const { data, error } = await supabase
      .from("attendance")
      .update({ weekly_status: status })
      .eq("employee_id", employeeId)
      .gte("date", from)
      .lte("date", to)
      .eq("weekly_status", "Pending_approval")
      .select();

    if (error) throw error;

    res.status(200).json({
      message: `Weekly attendance ${status} successfully`,
      updated_count: data.length,
      data,
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

    const { data, error } = await supabase
      .from("attendance")
      .update({ monthly_status: status })
      .eq("employee_id", employeeId)
      .gte("date", from)
      .lte("date", to)
      .eq("monthly_status", "Pending_approval")
      .select();

    if (error) throw error;

    res.status(200).json({
      message: `Monthly attendance ${status} successfully`,
      updated_count: data.length,
      data,
    });
  } catch (err) {
    console.error("Reject Monthly Status Error:", err.message);
    res.status(500).json({ error: "Failed to reject monthly attendance" });
  }
};

export const approveParentalLeave = async (req, res) => {
  try {
    const { attendance_id, action } = req.body; // "approve" or "reject"

    if (!attendance_id || !action) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Fetch existing record
    const { data: record, error: fetchError } = await supabase
      .from("attendance")
      .select("leave_type, date")
      .eq("id", attendance_id)
      .single();

    if (fetchError || !record) {
      return res.status(404).json({ error: "Leave record not found" });
    }

    const { leave_type, date: start_date } = record;

    const leaveDays =
      action === "approve"
        ? leave_type === "maternity"
          ? 180
          : 5
        : 0;

    // Calculate end date (for reference only, not stored)
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

    const { data, error } = await supabase
      .from("attendance")
      .update(updateData)
      .eq("id", attendance_id)
      .select();

    if (error) throw error;

    return res.status(200).json({
      message:
        action === "approve"
          ? `${leave_type} leave approved (${leaveDays} days from ${start_date} to ${endDate.toISOString().split("T")[0]})`
          : `${leave_type} leave rejected`,
      record: data[0],
    });
  } catch (error) {
    console.error("Error approving parental leave:", error.message);
    return res.status(500).json({ error: "Error approving parental leave" });
  }
};
