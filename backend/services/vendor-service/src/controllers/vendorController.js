
// import pool from "../config/db.js";
// import bcrypt from "bcryptjs";
// import crypto from "crypto";
// import nodemailer from "nodemailer";


// // -------------------- Helper: Generate Random Password --------------------
// const generateRandomPassword = () => {
//   // Generates a 10-character random password
//   return crypto.randomBytes(6).toString("base64").slice(0, 10);
// };

// // -------------------- Email Transporter --------------------
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: process.env.SMTP_PORT,
//   secure: false, // true for 465, false for other ports
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// // ===========================================================================
// //                            REGISTER VENDOR
// // ===========================================================================
// export const registerVendor = async (req, res) => {
//   try {
//     const {
//       company_name,
//       email,
//       phone,
//       business_type,
//       years_in_business,
//       company_website,
//       bank_details,
//       tax_registration,
//       business_license,
//       required_documents,
//     } = req.body;

//     if (!company_name || !email || !phone || !business_type || !years_in_business) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     // Generate random password
//     const randomPassword = generateRandomPassword();
//     const hashedPassword = await bcrypt.hash(randomPassword, 10);

//     // Insert into DB
//     const query = `
//       INSERT INTO public.vendors
//       (company_name, email, phone, business_type, years_in_business, company_website,
//        bank_details, tax_registration, business_license, required_documents, password)
//       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
//       RETURNING *;
//     `;
//     const values = [
//       company_name,
//       email,
//       phone,
//       business_type,
//       years_in_business,
//       company_website || null,
//       bank_details || null,
//       tax_registration || null,
//       business_license || null,
//       required_documents || null,
//       hashedPassword,
//     ];

//     const result = await pool.query(query, values);

//     // Send the random password via email
//     await transporter.sendMail({
//       from: `"EMS" <${process.env.SMTP_USER}>`,
//       to: email,
//       subject: "Welcome to EMS – Vendor Account Created",
//       html: `
//         <h3>Your Vendor Account is Ready</h3>
//         <p><b>Email:</b> ${email}</p>
//         <p><b>Temporary Password:</b> ${randomPassword}</p>
//         <p>Please login using this password and update it after login.</p>
//       `,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Vendor registered successfully. Password sent to email.",
//       vendor: result.rows[0],
//     });
//   } catch (err) {
//     console.error("Vendor Registration Error:", err);
//     if (err.code === "23505") {
//       return res.status(400).json({ error: "Email already exists" });
//     }
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // ===========================================================================
// //                            LOGIN VENDOR
// // ===========================================================================
// export const loginVendor = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const result = await pool.query(
//       "SELECT * FROM public.vendors WHERE email=$1",
//       [email]
//     );

//     if (result.rows.length === 0)
//       return res.status(400).json({ error: "Invalid email or password" });

//     const vendor = result.rows[0];

//     const isMatch = await bcrypt.compare(password, vendor.password);
//     if (!isMatch)
//       return res.status(400).json({ error: "Invalid email or password" });

//     res.status(200).json({ success: true, vendor });
//   } catch (err) {
//     console.error("Vendor Login Error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// export const requestPasswordReset = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const result = await pool.query("SELECT * FROM public.vendors WHERE email=$1", [email]);

//     if (result.rows.length === 0)
//       return res.status(400).json({ error: "Vendor not found" });

//     // Generate token and expiry
//     const resetToken = crypto.randomBytes(32).toString("hex");
//     const expiry = new Date(Date.now() + 3600000); // 1 hour

//     await pool.query(
//       "UPDATE public.vendors SET reset_token=$1, reset_token_expiry=$2 WHERE email=$3",
//       [resetToken, expiry, email]
//     );

//     // Link to reset password page
//     const resetUrl = `${process.env.BASE_URL}/vendor/reset-password?token=${resetToken}`;

//     await transporter.sendMail({
//       from: `"EMS" <${process.env.SMTP_USER}>`,
//       to: email,
//       subject: "Password Reset Request",
//       html: `
//         <p>To reset your password, click the link below:</p>
//         <a href="${resetUrl}">${resetUrl}</a>
//         <p>This link will expire in 1 hour.</p>
//       `,
//     });

//     res.status(200).json({
//       success: true,
//       message: "Password reset email sent",
//     });
//   } catch (err) {
//     console.error("Password Reset Request Error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // ===========================================================================
// //                            RESET PASSWORD
// // ===========================================================================
// export const resetPassword = async (req, res) => {
//   try {
//     const { token, newPassword } = req.body;

//     const result = await pool.query(
//       "SELECT * FROM public.vendors WHERE reset_token=$1 AND reset_token_expiry > NOW()",
//       [token]
//     );

//     if (result.rows.length === 0)
//       return res.status(400).json({ error: "Invalid or expired token" });

//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     await pool.query(
//       "UPDATE public.vendors SET password=$1, reset_token=NULL, reset_token_expiry=NULL WHERE id=$2",
//       [hashedPassword, result.rows[0].id]
//     );

//     res.status(200).json({ success: true, message: "Password reset successful" });
//   } catch (err) {
//     console.error("Reset Password Error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // ===========================================================================
// //                          SUBMIT VENDOR (FILES UPLOAD)
// // ===========================================================================
// export const submitVendor = async (req, res) => {
//   try {
//     console.log("BODY:", req.body);
//     console.log("FILES:", req.files);

//     const {
//       company_name,
//       email,
//       phone,
//       business_type,
//       years_in_business,
//       company_website,
//       pan,
//       gst,
//       tan,
//     } = req.body;

//     // 🔴 FILES (THIS WAS MISSING)
//     const businessLicense = req.files?.businessLicense?.[0];
//     const requiredDocuments = req.files?.requiredDocuments || [];

//     if (!businessLicense) {
//       return res.status(400).json({ message: "Business License is required" });
//     }

//     // 1️⃣ Insert vendor
//     const vendorResult = await pool.query(
//       `
//       INSERT INTO vendors
//       (company_name, email, phone, business_type, years_in_business, company_website)
//       VALUES ($1,$2,$3,$4,$5,$6)
//       RETURNING id
//       `,
//       [
//         company_name,
//         email,
//         phone,
//         business_type,
//         years_in_business,
//         company_website,
//       ]
//     );

//     const vendorId = vendorResult.rows[0].id;

//     // 2️⃣ Save tax details
//     await pool.query(
//       `
//       INSERT INTO vendor_tax_details (vendor_id, pan, gst, tan)
//       VALUES ($1,$2,$3,$4)
//       `,
//       [vendorId, pan, gst, tan]
//     );

//     // 3️⃣ Save business license
//     await pool.query(
//       `
//       INSERT INTO vendor_documents (vendor_id, document_type, file_path)
//       VALUES ($1,$2,$3)
//       `,
//       [vendorId, "BUSINESS_LICENSE", businessLicense.path]
//     );

//     // 4️⃣ Save required documents
//     for (const doc of requiredDocuments) {
//       await pool.query(
//         `
//         INSERT INTO vendor_documents (vendor_id, document_type, file_path)
//         VALUES ($1,$2,$3)
//         `,
//         [vendorId, "REQUIRED", doc.path]
//       );
//     }

//     res.status(201).json({
//       message: "Vendor submitted successfully",
//       vendorId,
//     });
//   } catch (err) {
//     console.error("Vendor submit error:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

/* ================== HELPERS ================== */
const generateRandomPassword = () =>
  crypto.randomBytes(6).toString("base64").slice(0, 10);

const normalizePath = (filePath) =>
  filePath.replace(/\\/g, "/").replace(/^.*uploads\//, "uploads/");

/* ================== MAIL ================== */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/* ===========================================================================
   REGISTER VENDOR (NO PASSWORD MAIL)
=========================================================================== */
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
    } = req.body;

    if (!company_name || !email || !phone || !business_type || !years_in_business) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // temporary password (NOT mailed)
    const tempPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const result = await pool.query(
  `
  INSERT INTO vendors (
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
    password,
    status
  )
  VALUES (
    $1,$2,$3,$4,$5,$6,
    $7::jsonb,
    $8::jsonb,
    '{}'::jsonb,
    '[]'::jsonb,
    $9,
    'Pending'
  )
  RETURNING id
  `,
  [
    company_name,
    email.toLowerCase(),
    phone,
    business_type,
    years_in_business,
    company_website || null,
    JSON.stringify(bank_details || {}),
    JSON.stringify(tax_registration || {}),
    hashedPassword,
  ]
);
    res.status(201).json({
      success: true,
      message: "Vendor registered successfully. Await admin approval.",
    });

  } catch (err) {
    console.error("Vendor Registration Error:", err);
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

/* ===========================================================================
   LOGIN VENDOR
=========================================================================== */
export const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `
      SELECT id, company_name, email, password, status, reset_token
      FROM vendors
      WHERE email = lower($1)
      `,
      [email]
    );

    if (!result.rows.length) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const vendor = result.rows[0];

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ✅ NORMALIZE STATUS (FIXES YOUR 403 ISSUE)
    const status = vendor.status?.trim().toLowerCase();
    if (status !== "approved") {
      return res.status(403).json({
        error: "Your account is pending admin approval.",
      });
    }

    // 🔐 FORCE PASSWORD CHANGE (TEMP PASSWORD LOGIN)
   if (vendor.reset_token && vendor.reset_token === "FORCE_CHANGE") {
      return res.status(200).json({
        changePasswordRequired: true,
        vendorId: vendor.id,
      });
    }

    // ✅ FINAL SUCCESS LOGIN
    res.json({
      success: true,
      vendor: {
        id: vendor.id,
        company_name: vendor.company_name,
        email: vendor.email,
      },
    });

  } catch (err) {
    console.error("Vendor Login Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


/* ===========================================================================
   RESET PASSWORD
=========================================================================== */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const result = await pool.query(
      `
      SELECT id, reset_token, reset_token_expiry
      FROM vendors
      WHERE email = lower($1)
      `,
      [email]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    const vendor = result.rows[0];

    // ❌ OTP mismatch
    if (vendor.reset_token !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // ❌ OTP expired
    if (new Date(vendor.reset_token_expiry) < new Date()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ update password + clear OTP
    await pool.query(
      `
      UPDATE vendors
      SET password = $1,
          reset_token = NULL,
          reset_token_expiry = NULL
      WHERE id = $2
      `,
      [hashedPassword, vendor.id]
    );

    res.json({
      success: true,
      message: "Password reset successful. Please login again.",
    });

  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


/* ===========================================================================
   SUBMIT VENDOR (FILES)
=========================================================================== */
export const submitVendor = async (req, res) => {
  const client = await pool.connect();

  try {
    const { email, pan, gst, tan } = req.body;
    const businessLicense = req.files?.businessLicense?.[0];
    const requiredDocuments = req.files?.requiredDocuments || [];

    if (!businessLicense) {
      return res.status(400).json({ error: "Business License required" });
    }

    await client.query("BEGIN");

    const vendorRes = await client.query(
      "SELECT id FROM vendors WHERE email=lower($1)",
      [email]
    );

    if (!vendorRes.rows.length) {
      throw new Error("Vendor not found");
    }

    const vendorId = vendorRes.rows[0].id;
    const licensePath = normalizePath(businessLicense.path);
    const docs = requiredDocuments.map(f => normalizePath(f.path));

    await client.query(
      `
      UPDATE vendors
      SET tax_registration=$1::jsonb,
          business_license=$2::jsonb,
          required_documents=$3::jsonb
      WHERE id=$4
      `,
      [
        JSON.stringify({ pan, gst, tan }),
        JSON.stringify(licensePath),
        JSON.stringify(docs),
        vendorId,
      ]
    );

    await client.query("COMMIT");
    res.json({ success: true });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Vendor submit error:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};

/* ===========================================================================
   UPDATE VENDOR STATUS (ADMIN)
=========================================================================== */
export const updateVendorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const vendorRes = await pool.query(
      "SELECT email FROM vendors WHERE id=$1",
      [id]
    );

    if (!vendorRes.rows.length) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    const email = vendorRes.rows[0].email;

    if (status === "Approved") {
      const tempPassword = generateRandomPassword();
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // internal flag using reset_token
      await pool.query(
        `
        UPDATE vendors
        SET
          status = 'Approved',
          password = $1,
          reset_token = 'FORCE_CHANGE',
          reset_token_expiry = NOW() + INTERVAL '1 day'
        WHERE id = $2
        `,
        [hashedPassword, id]
      );

      await transporter.sendMail({
        to: email,
        subject: "Vendor Approved – Temporary Password",
        html: `
          <p>Your vendor account has been approved.</p>
          <p><b>Temporary Password:</b> ${tempPassword}</p>
          <p>You must change this password after login.</p>
        `,
      });
    }

    if (status === "Rejected") {
      await pool.query(
        "UPDATE vendors SET status='Rejected' WHERE id=$1",
        [id]
      );

      await transporter.sendMail({
        to: email,
        subject: "Vendor Registration Rejected",
        html: `<p>Unfortunately your registration was rejected.</p>`,
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Update Vendor Status Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


    
/* =====================================================
   GET ALL VENDORS
===================================================== */
export const getAllVendors = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM vendors ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const result = await pool.query(
      `
      SELECT id, status, reset_token
      FROM vendors
      WHERE email = lower($1)
      `,
      [email]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    const vendor = result.rows[0];

    if (vendor.status !== "Approved") {
      return res.status(403).json({ error: "Account not approved" });
    }

    // 🚫 DO NOT ALLOW OTP DURING TEMP PASSWORD FLOW
    if (vendor.reset_token === "FORCE_CHANGE") {
      return res.status(400).json({
        error: "Please login with your temporary password and change it first",
      });
    }

    // ✅ GENERATE OTP (FORGOT PASSWORD ONLY)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 60 * 1000); // 1 minute

    await pool.query(
      `
      UPDATE vendors
      SET reset_token=$1,
          reset_token_expiry=$2
      WHERE id=$3
      `,
      [otp, expiry, vendor.id]
    );

    await transporter.sendMail({
      to: email,
      subject: "Vendor Password Reset OTP",
      html: `
        <h2>${otp}</h2>
        <p>This OTP is valid for 1 minute.</p>
      `,
    });

    res.json({ success: true });

  } catch (err) {
    console.error("OTP SEND ERROR:", err);
    res.status(500).json({ error: "Unable to send OTP" });
  }
};


export const resetPasswordAfterLogin = async (req, res) => {
  const { vendorId, newPassword } = req.body;

  if (!vendorId || !newPassword) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const hash = await bcrypt.hash(newPassword, 10);

  await pool.query(
    `
    UPDATE vendors
    SET password=$1,
        reset_token=NULL
    WHERE id=$2
    `,
    [hash, vendorId]
  );

  res.json({ success: true });
};


/* ===================================================================
   ADMIN UPLOAD MoU
=================================================================== */
export const uploadVendorMoU = async (req, res) => {
  try {
    const { vendor_id, mou_effective_from, mou_expires_at } = req.body;

    if (!vendor_id) {
      return res.status(400).json({
        success: false,
        message: "vendor_id is required",
      });
    }

    if (!req.files || !req.files.mou_file) {
      return res.status(400).json({
        success: false,
        message: "No MoU file uploaded",
      });
    }

    const mouFilePath = req.files.mou_file[0].path;

    const result = await pool.query(
      `
      UPDATE vendors
      SET
        mou_file = $1,
        mou_uploaded_at = NOW(),
        mou_effective_from = $2,
        mou_expires_at = $3,
        mou_accepted = false,
        mou_accepted_at = NULL,
        mou_status = 'pending'
      WHERE id = $4
      RETURNING *
      `,
      [mouFilePath, mou_effective_from, mou_expires_at, vendor_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    res.json({
      success: true,
      message: "MoU uploaded successfully",
      vendor: result.rows[0],
    });

  } catch (err) {
    console.error("MoU upload error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "MoU upload failed",
    });
  }
};

/* ===================================================================
   VENDOR GET MoU
=================================================================== */
export const getVendorMoU = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        mou_file,
        mou_uploaded_at,
        mou_effective_from,
        mou_expires_at,
        mou_accepted,
        mou_accepted_at,
        mou_status
      FROM vendors
      WHERE id = $1
      `,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    res.json({ success: true, mou: result.rows[0] });

  } catch (err) {
    console.error("Get MoU Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ===================================================================
   VENDOR ACCEPT MoU
=================================================================== */
export const acceptVendorMoU = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT mou_status, mou_expires_at
      FROM vendors
      WHERE id = $1
      `,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    const mou = result.rows[0];

    if (mou.mou_status?.toLowerCase() !== "pending") {
      return res.status(400).json({ error: "MoU not in pending state" });
    }

    if (new Date(mou.mou_expires_at) < new Date()) {
      return res.status(400).json({ error: "MoU already expired" });
    }

    await pool.query(
      `
      UPDATE vendors
      SET mou_accepted = true,
          mou_accepted_at = NOW(),
          mou_status = 'active'
      WHERE id = $1
      `,
      [id]
    );

    res.json({ success: true, message: "MoU accepted successfully" });

  } catch (err) {
    console.error("Accept MoU Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
