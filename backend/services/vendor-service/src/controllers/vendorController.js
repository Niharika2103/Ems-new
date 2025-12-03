
import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

// -------------------- Helper: Generate Random Password --------------------
const generateRandomPassword = () => {
  // Generates a 10-character random password
  return crypto.randomBytes(6).toString("base64").slice(0, 10);
};

// -------------------- Email Transporter --------------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ===========================================================================
//                            REGISTER VENDOR
// ===========================================================================
export const registerVendor = async (req, res) => {
  try {
    const {
      company_name,
      email,
      phone,
      business_type,
      years_in_business,
      company_website,
      bank_details,
      tax_registration,
      business_license,
      required_documents,
    } = req.body;

    if (!company_name || !email || !phone || !business_type || !years_in_business) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Generate random password
    const randomPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Insert into DB
    const query = `
      INSERT INTO public.vendors
      (company_name, email, phone, business_type, years_in_business, company_website,
       bank_details, tax_registration, business_license, required_documents, password)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *;
    `;
    const values = [
      company_name,
      email,
      phone,
      business_type,
      years_in_business,
      company_website || null,
      bank_details || null,
      tax_registration || null,
      business_license || null,
      required_documents || null,
      hashedPassword,
    ];

    const result = await pool.query(query, values);

    // Send the random password via email
    await transporter.sendMail({
      from: `"EMS" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Welcome to EMS – Vendor Account Created",
      html: `
        <h3>Your Vendor Account is Ready</h3>
        <p><b>Email:</b> ${email}</p>
        <p><b>Temporary Password:</b> ${randomPassword}</p>
        <p>Please login using this password and update it after login.</p>
      `,
    });

    res.status(201).json({
      success: true,
      message: "Vendor registered successfully. Password sent to email.",
      vendor: result.rows[0],
    });
  } catch (err) {
    console.error("Vendor Registration Error:", err);
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// ===========================================================================
//                            LOGIN VENDOR
// ===========================================================================
export const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM public.vendors WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ error: "Invalid email or password" });

    const vendor = result.rows[0];

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid email or password" });

    res.status(200).json({ success: true, vendor });
  } catch (err) {
    console.error("Vendor Login Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await pool.query("SELECT * FROM public.vendors WHERE email=$1", [email]);

    if (result.rows.length === 0)
      return res.status(400).json({ error: "Vendor not found" });

    // Generate token and expiry
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await pool.query(
      "UPDATE public.vendors SET reset_token=$1, reset_token_expiry=$2 WHERE email=$3",
      [resetToken, expiry, email]
    );

    // Link to reset password page
    const resetUrl = `${process.env.BASE_URL}/vendor/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: `"EMS" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>To reset your password, click the link below:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (err) {
    console.error("Password Reset Request Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ===========================================================================
//                            RESET PASSWORD
// ===========================================================================
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const result = await pool.query(
      "SELECT * FROM public.vendors WHERE reset_token=$1 AND reset_token_expiry > NOW()",
      [token]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ error: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE public.vendors SET password=$1, reset_token=NULL, reset_token_expiry=NULL WHERE id=$2",
      [hashedPassword, result.rows[0].id]
    );

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
