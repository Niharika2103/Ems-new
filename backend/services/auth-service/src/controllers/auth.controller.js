import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import supabase from "../supabaseClient.js";
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

    const { data: user, error } = await supabase
      .from(USERS_TABLE)
      .select("*")
      .ilike("email", email)
      .eq("role", "superadmin")
      .eq("access_flag", "y")
      .maybeSingle();

    if (error) throw error;

    if (!user) return res.status(200).json({ authorized: false });

    return res.status(200).json({ authorized: true, message: "Email authorized" });
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

    // Check if user exists in parent table
    const { data: existingUser, error: fetchError } = await supabase
      .from(USERS_TABLE)
      .select("*")
      .ilike("email", email)
      .eq("role", "superadmin")
      .eq("access_flag", "y")
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existingUser) {
      return res.status(400).json({
        error: "This email is not authorized as a SuperAdmin or access disabled.",
      });
    }

    // Check if already registered (password exists)
    if (existingUser.password && existingUser.password.trim() !== "") {
      return res.status(400).json({
        error: "SuperAdmin already registered with this email.",
      });
    }

    // Validate input
    const errors = validateInput(UserModel, { name: fullName, email, password });
    if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

    //  Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate MFA secret
    const secret = speakeasy.generateSecret({
      name: `EMS-${email}`,
      issuer: "EMS SuperAdmin",
    });

    // Update parent table (user_employees_master)
    const { data: updatedUser, error: updateError } = await supabase
      .from(USERS_TABLE)
      .update({
        name: fullName,
        password: hashedPassword,
        mfa_secret: secret.base32,
        mfa_enabled: false,
        is_email_verified: false,
      })
      .eq("id", existingUser.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Insert into super_admins table
    const { error: insertError } = await supabase
      .from(SUPERADMINS_TABLE)
      .insert({
        user_id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        password: hashedPassword, // must fill for NOT NULL
        role: "superadmin",
      });

    if (insertError) throw insertError;

    //  Generate MFA QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    return res.status(201).json({
      message: "SuperAdmin registered successfully. Complete MFA setup.",
      qrCodeUrl,
      secret: secret.base32,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    console.error("SuperAdmin Register Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * SuperAdmin Login (requires MFA if enabled)
 * Body: { email, password, otp }
 */
export const superAdminLogin = async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    const role = "superadmin";

    // Fetch user by email and role
    const { data: user, error } = await supabase
      .from(USERS_TABLE)
      .select("*")
      .ilike("email", email)
      .eq("role", role)
      .maybeSingle();

    if (error) throw error;

    //  Check if user exists → Invalid Email
    if (!user) {
      return res.status(401).json({ error: "Invalid email" });
    }

    //  Check password → Invalid Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    //  Prevent login until MFA setup is done
    if (!user.mfa_enabled) {
      return res.status(403).json({
        error: "MFA setup not completed. Please verify OTP first.",
      });
    }

    //  OTP required for login
    if (!otp) {
      return res.status(400).json({ error: "OTP required for login" });
    }

    // Verify OTP using speakeasy
    const verified = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: "base32",
      token: otp,
      window: 1, // allow 1 step before/after
    });

    if (!verified) {
      return res.status(401).json({ error: "Invalid OTP" });
    }

    // Issue JWT on successful login
    const token = issueJwt({ email: user.email, role: user.role, id: user.id ,name:user.name});

    return res.status(200).json({
      message: "SuperAdmin login Successful with MFA",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mfa_enabled: user.mfa_enabled,
      },
    });
  } catch (err) {
    console.error("SuperAdmin Login Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
/**
 * Verify MFA Setup (after registration)
 * Body: { email, otp }
 */
export const verifyMfaSetup = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const { data: user, error } = await supabase
      .from(USERS_TABLE)
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.mfa_enabled) {
      return res.json({ message: "MFA already enabled" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: "base32",
      token: otp,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ error: "Invalid OTP, setup failed" });
    }

    // Enable MFA after successful verification
    await supabase
      .from(USERS_TABLE)
      .update({ mfa_enabled: true })
      .eq("id", user.id);

    res.json({ message: "MFA setup verified and enabled", role: user.role });
  } catch (err) {
    console.error("MFA Setup Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
//SuperAdmin Get by id
export const getSuperadminById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === "undefined") {
      return res.status(400).json({ error: "Invalid or missing admin ID" });
    }

    const { data, error } = await supabase
      .from(USERS_TABLE)
      .select("*")
      .eq("id", id)
      .eq("role", "superadmin")
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Superadmin not found" });

    // Get BASE_URL from environment
        const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5001}`;

    // Construct response with full URLs
    const responseData = {
      ...data,
      profile_photo: data.profile_photo ? `${BASE_URL}${data.profile_photo}` : null,
      resume: data.resume ? `${BASE_URL}${data.resume}` : null,
    };

    return res.json(responseData);
  } catch (err) {
    console.error("Get Superadmin By ID Error:", err.message || err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

//SuperAdmin Profile Update
export const updateSuperAdminProfile = async (req, res) => {
  try {
    const { id } = req.params;

    //  Fetch existing user from parent table
    const { data: existingUser, error: userError } = await supabase
      .from(USERS_TABLE)
      .select("*")
      .eq("id", id)
      .eq("role", "superadmin")
      .maybeSingle(); // use maybeSingle to avoid "cannot coerce" error

    if (userError) throw userError;
    if (!existingUser) return res.status(404).json({ error: "SuperAdmin not found in parent table" });

    //  Prepare updates for parent table
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

    // Password update optional
    if (req.body.password) {
      userUpdates.password = await bcrypt.hash(req.body.password, 10);
    }

    // Only update allowed fields in parent table
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
      "permanent_address"
    ];
    const filteredUserUpdates = {};
    parentAllowedFields.forEach((key) => {
      if (userUpdates[key] !== undefined) filteredUserUpdates[key] = userUpdates[key];
    });

    //  Update parent table
    const { data: updatedUser, error: updateUserError } = await supabase
      .from(USERS_TABLE)
      .update(filteredUserUpdates)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (updateUserError) throw updateUserError;

    //  Update child table with only name & email
    const childUpdates = {};
    if (userUpdates.name) childUpdates.name = userUpdates.name;
    if (userUpdates.email) childUpdates.email = userUpdates.email;

    const { data: updatedChild, error: updateChildError } = await supabase
      .from(SUPERADMINS_TABLE)
      .update(childUpdates)
      .eq("user_id", id)
      .select("*")
      .maybeSingle();

    if (updateChildError) throw updateChildError;

    return res.json({
      message: "SuperAdmin updated successfully",
      superAdmin: updatedUser,
      superAdminChild: updatedChild
    });

  } catch (err) {
    console.error("Update SuperAdmin Error:", err.message || err);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
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

    // Ensure the request is from a logged-in superadmin
    if (!req.user) return res.status(401).json({ error: "Unauthorized: no user info" });

    // 1️⃣ Fetch admin
    const { data: admin, error: adminError } = await supabase
      .from(USERS_TABLE)
      .select("*")
      .eq("id", adminId)
      .eq("role", "admin")
      .maybeSingle();

    if (adminError) throw adminError;
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    // 2️⃣ Update role to superadmin
    const { data: updatedAdmin, error: updateError } = await supabase
      .from(USERS_TABLE)
      .update({ role: "superadmin" })
      .eq("id", adminId)
      .select()
      .maybeSingle();

    if (updateError) throw updateError;

    // 3️⃣ Add to SUPERADMINS_TABLE if not exists
    const { data: existingSuper, error: checkError } = await supabase
      .from(SUPERADMINS_TABLE)
      .select("*")
      .eq("email", updatedAdmin.email)
      .maybeSingle();

    if (checkError) throw checkError;

    if (!existingSuper) {
      const { error: insertError } = await supabase
        .from(SUPERADMINS_TABLE)
        .insert({
          user_id: updatedAdmin.id,
          name: updatedAdmin.name,
          email: updatedAdmin.email,
          password: updatedAdmin.password,
          role: "superadmin",
        });
      if (insertError) throw insertError;
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
