import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import crypto from "crypto";
import multer from "multer";
import ExcelJS from "exceljs";
import path from "path";
import { sendEmail } from "../services/emailService.js";
import fs from "fs";
import speakeasy from "speakeasy";
import dotenv from "dotenv";


const USERS_TABLE = "user_employees_master";
const REGISTRATIONS_TABLE = "registrations";
const REFERRALS_TABLE = "referrals";

// ================== JWT Helper ==================
function issueJwt({ email, role, employee_id,employment_type,id, is_temp_admin = false,name }) {
  return jwt.sign(
    { email, role, employee_id,employment_type,is_temp_admin ,id,name},
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


// ================== Multer Config ==================
const uploadDir = path.join(process.cwd(), "src/uploads");

// Create folder if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // folder where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

 // store file in memory
export const upload = multer({ storage });

//autogenerate the employee id
async function generateEmployeeId(client) {
  const { rows } = await client.query(`SELECT employee_id FROM ${USERS_TABLE}`);
  const existingIds = rows
    .map(e => e.employee_id)
    .filter(id => id)
    .map(id => parseInt(id.replace("EMP", ""), 10))
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b);

  let nextNum = 1;
  for (const num of existingIds) {
    if (num === nextNum) nextNum++;
    else if (num > nextNum) break;
  }

  return `EMP${nextNum.toString().padStart(3, "0")}`;
}

//autogenerate the referral id
async function generateReferralId(client) {
  // find numeric parts of existing referral_ids
  const { rows } = await client.query(
    `SELECT referral_id FROM ${REFERRALS_TABLE} WHERE referral_id IS NOT NULL`
  );

  const nums = rows
    .map(r => r.referral_id)
    .filter(Boolean)
    .map(id => {
      const m = id.match(/REF0*([0-9]+)$/i);
      return m ? parseInt(m[1], 10) : NaN;
    })
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b);

  let next = 1;
  for (const n of nums) {
    if (n === next) next++;
    else if (n > next) break;
  }
  return `REF${next.toString().padStart(3, "0")}`;
}

function validateEmployeeData(data) {
  const { fullName, email, phone, address } = data;

  if (!fullName || !/^[A-Za-z ]{2,50}$/.test(fullName)) {
    return "Full Name is required and must be 2–50 letters.";
  }
  if (!email || !/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,6}$/.test(email)) {
    return "Valid Email is required.";
  }
  if (!phone || !/^\d{10}$/.test(phone)) {
    return "Phone number is required and must be exactly 10 digits.";
  }
  if (address && address.length > 200) {
    return "Address cannot exceed 200 characters.";
  }

  return null;
}


// ================== Validation Helper ==================
// function validateEmployeeUpdate(data, files) {
//   const { fullName, dob, gender, phone, email, address, emergencyContact } = data;

//   // Full Name validation
//   if (fullName && !/^[A-Za-z ]{2,50}$/.test(fullName)) {
//     return "Full Name must be 2-50 letters only (no special characters or numbers).";
//   }

//   // Date of Birth validation
//   if (dob && isNaN(Date.parse(dob))) {
//     return "Date of Birth must be a valid date (format: YYYY-MM-DD).";
//   }

//   // Gender validation
//   if (gender && !["Male", "Female", "Other"].includes(gender)) {
//     return "Gender must be one of: Male, Female, or Other.";
//   }

//   // Phone validation
//   if (phone && !/^\d{10}$/.test(phone)) {
//     return "Contact Number must be exactly 10 digits.";
//   }

//   // Email validation
//   if (email && !/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,6}$/.test(email)) {
//     return "Email address format is invalid. Example: user@example.com";
//   }

//   // Emergency Contact validation
//   if (emergencyContact && !/^\d{10}$/.test(emergencyContact)) {
//     return "Emergency Contact must be exactly 10 digits.";
//   }

//   // Address validation
//   if (address && address.length > 200) {
//     return "Address cannot exceed 200 characters.";
//   }

//   // ✅ Profile Photo Validation
//   if (files?.profilePhoto) {
//     const photo = files.profilePhoto[0];
//     const allowedPhotoTypes = ["image/jpeg", "image/png"];
//     if (!allowedPhotoTypes.includes(photo.mimetype)) {
//       return "Profile Photo must be in JPG or PNG format.";
//     }
//     if (photo.size > 2 * 1024 * 1024) {
//       return "Profile Photo size must not exceed 2 MB.";
//     }
//   }

//   // ✅ Resume Validation
//   if (files?.resume) {
//     const resume = files.resume[0];
//     const allowedResumeTypes = [
//       "application/pdf",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//     ];
//     if (!allowedResumeTypes.includes(resume.mimetype)) {
//       return "Resume must be in PDF or DOCX format.";
//     }
//     if (resume.size > 5 * 1024 * 1024) {
//       return "Resume size must not exceed 5 MB.";
//     }
//   }a

//   return null;
// }


// ================== Register Employee ==================




dotenv.config();

export const registerEmployee = async (req, res) => {
  console.log("@174",req.body)
  const client = await pool.connect();
  try {
    const { fullName, email, phone, address, department,  designation,employmentType,dateOfJoining } = req.body;

    const validationError = validateEmployeeData({ fullName, email, phone, address });
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const employeeId = await generateEmployeeId(client);

    // Check if employee exists
    const existing = await client.query(
      `SELECT * FROM ${USERS_TABLE} WHERE email = $1 AND role = 'employee'`,
      [email]
    );
    if (existing.rows.length > 0)
      return res.status(400).json({ error: "Employee already registered" });

    // Generate password
    const randomPassword = crypto.randomBytes(6).toString("base64").slice(0, 10);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Insert employee
    const insertUser = await client.query(
      `INSERT INTO ${USERS_TABLE} 
        (employee_id, name, email, password, phone, address, department,  designation,employment_Type,date_of_joining, role, access_flag)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'employee','y')
       RETURNING id`,
      [employeeId, fullName, email, hashedPassword, phone, address, department, designation,employmentType,dateOfJoining]
    );

    const newUserId = insertUser.rows[0].id;

    // Insert registration record
    await client.query(
      `INSERT INTO ${REGISTRATIONS_TABLE} 
        (user_id, otp_code, otp_expiry, reset_token, reset_token_expiry, is_approved, is_temp_admin, temp_admin_expiry)
       VALUES ($1, NULL, NULL, $2, $3, false, false, NULL)`,
      [newUserId, resetToken, resetExpiry]
    );

 

    // Send email
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    await sendEmail(
      email,
      "Your EMS Employee Account Credentials",
      `
        <p>Hello ${fullName},</p>
        <p>Your EMS account has been created successfully.</p>
        <p><b>Login URL:</b> ${loginUrl}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Password:</b> ${randomPassword}</p>
        <p>⚠️ Please reset your password on first login for security reasons.</p>
      `
    );

    res.status(201).json({
      message: "Employee registered successfully. Credentials sent via email.",
    });
  } catch (err) {
    console.error("Register Employee Error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};




// export const registerEmployee = async (req, res) => {
//   try {
//     const { fullName, email, phone, address, department, dateOfJoining } = req.body;

//      // ✅ Validation
//     const validationError = validateEmployeeData({ fullName, email, phone, address });
//     if (validationError) {
//       return res.status(400).json({ error: validationError });
//     }

//     const employeeId = await generateEmployeeId();
//     console.log("Generated Employee ID:", employeeId);
//     // Check if employee exists
//     const { data: existing, error: fetchError } = await supabase
//       .from(USERS_TABLE)
//       .select("*")
//       .eq("email", email)
//       .eq("role", "employee")
//       .maybeSingle();

//     if (fetchError) throw fetchError;
//     if (existing) return res.status(400).json({ error: "Employee already registered" });

//     const randomPassword = crypto.randomBytes(6).toString("base64").slice(0, 10);
//     const hashedPassword = await bcrypt.hash(randomPassword, 10);

//     const resetToken = crypto.randomBytes(32).toString("hex");
//     const resetExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        
//   const { data: newEmployee, error: insertError } = await supabase
//   // .schema("ems")
//       .from(USERS_TABLE)
//       .insert([{
//         employee_id: employeeId,
//         name: fullName,
//         email,
//         password: hashedPassword,
//         phone,
//         address,
//         department,
//         date_of_joining: dateOfJoining,
//         role: "employee",
//         access_flag: "y",
//       }])
//       .select("*")
//       .single();
//     if (insertError) throw insertError;

//     // Insert into registrations
//     const { error: regInsertError } = await supabase
//     // .schema("ems")
//       .from(REGISTRATIONS_TABLE)
//       .insert([{
//         user_id: newEmployee.id,
//         otp_code: null,
//         otp_expiry: null,
//         reset_token: resetToken,
//         reset_token_expiry: resetExpiry,
//         is_approved: false,
//         is_temp_admin: false,
//         temp_admin_expiry: null,
//       }]);
//     if (regInsertError) throw regInsertError;


//     const loginUrl = `${process.env.FRONTEND_URL}/login`;

//     await sendEmail(
//       email,
//       "Your EMS Employee Account Credentials",
//       `
//         <p>Hello ${fullName},</p>
//         <p>Your EMS account has been created.</p>
//         <p><b>Login URL:</b> ${loginUrl}</p>
//         <p><b>Email:</b> ${email}</p>
//         <p><b>Password:</b> ${randomPassword}</p>
//         <p>⚠️ On your first login, you will be required to reset your password for security.</p>
//       `
//     );

//     res.status(201).json({ message: "Employee registered and credentials sent via email." });
//   } catch (err) {
//     console.error("Register Employee Error:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// };

// ================== Employee Login ==================
export const employeeLogin = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, password, employment_type,otp, } = req.body;

    const userRes = await client.query(
      `SELECT * FROM ${USERS_TABLE} WHERE email = $1 AND role IN ('employee','admin','superadmin')`,
      [email]
    );
    const user = userRes.rows[0];
    if (!user) return res.status(401).json({ error: "Invalid Email" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: "Invalid Password" });

      if (user.role === "employee") {
      if (!employment_type) {
        return res.status(400).json({ error: "Employment type is required" });
      }

      // DB match check: fulltime / contract / freelancer
      if (user.employment_type !== employment_type) {
        return res.status(401).json({ error: "Invalid employment type" });
      }
    }
    
    // Admin/Superadmin MFA flow
    if (["admin", "superadmin"].includes(user.role)) {
      if (!otp) {
        return res.json({
          message: "Enter OTP from your authenticator app",
          otpRequired: true,
        });
      }

      const verified = speakeasy.totp.verify({
        secret: user.mfa_secret,
        encoding: "base32",
        token: otp,
        window: 1,
      });
      if (!verified) return res.status(401).json({ error: "Invalid OTP" });

      const token = issueJwt({
        email: user.email,
        role: user.role,
        employment_type:user.employment_type,
        id: user.id,
        name: user.name,
      });
      return res.json({
        message: `${user.role} login successful with MFA`,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          mfa_enabled: user.mfa_enabled,
          employment_type:user.employment_type,
        },
      });
    }

    // Employee flow
    const regRes = await client.query(
      `SELECT * FROM ${REGISTRATIONS_TABLE} WHERE user_id = $1`,
      [user.id]
    );
    const reg = regRes.rows[0];
    if (!reg) return res.status(400).json({ error: "Registration record not found." });

    const now = new Date();
    if (reg.reset_token && now <= new Date(reg.reset_token_expiry)) {
      return res.status(202).json({
        message: "First login detected. Please reset your password.",
        firstLogin: true,
        resetToken: reg.reset_token,
      });
    }

    if (!otp) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
      await client.query(
        `UPDATE ${REGISTRATIONS_TABLE} SET otp_code=$1, otp_expiry=$2 WHERE user_id=$3`,
        [otpCode, otpExpiry, user.id]
      );

      await sendEmail(
        user.email,
        "Your EMS Login OTP",
        `<p>Hello ${user.name},</p><p>Your OTP is: <b>${otpCode}</b></p><p>Valid for 5 minutes.</p>`
      );

      return res.json({ message: "OTP sent to your email", otpRequired: true });
    }

    if (reg.otp_code !== otp || now > new Date(reg.otp_expiry)) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    await client.query(
      `UPDATE ${REGISTRATIONS_TABLE} SET otp_code=NULL, otp_expiry=NULL WHERE user_id=$1`,
      [user.id]
    );

    const isTempAdmin =
      reg.is_temp_admin && new Date(reg.temp_admin_expiry) > now;

    const token = issueJwt({
      email: user.email,
      role: user.role,
       employment_type: user.employment_type, 
      employee_id: user.employee_id,
      is_temp_admin: isTempAdmin,
      id: user.id,
    });

    res.json({
      message: "Employee login successful",
      token,
      employee: {
        employeeId: user.employee_id,
            employment_type:user.employment_type,
        fullName: user.name,
        email: user.email,
        is_temp_admin: isTempAdmin,
        temp_admin_expiry: reg.temp_admin_expiry,
      },
    });
  } catch (err) {
    console.error("Employee Login Error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

// ================== Request Password Reset ==================
export const requestPasswordReset = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email } = req.body;

    const userRes = await client.query(
      `SELECT * FROM ${USERS_TABLE} WHERE email=$1 AND role='employee'`,
      [email]
    );
    const user = userRes.rows[0];
    if (!user) return res.status(404).json({ error: "Employee not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await client.query(
      `UPDATE ${REGISTRATIONS_TABLE} SET reset_token=$1, reset_token_expiry=$2 WHERE user_id=$3`,
      [resetToken, resetExpiry, user.id]
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail(
      user.email,
      "Reset your EMS Password",
      `<p>Hello ${user.name},</p><p>Click below to reset password:</p><a href="${resetLink}">${resetLink}</a>`
    );

    res.json({ message: "Password reset link sent to your email." });
  } catch (err) {
    console.error("Request Password Reset Error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

// ================== Reset Password ==================
export const resetPassword = async (req, res) => {
  const client = await pool.connect();
  try {
    const { token, newPassword } = req.body;

    const regRes = await client.query(
      `SELECT * FROM ${REGISTRATIONS_TABLE} WHERE reset_token=$1`,
      [token]
    );
    const registration = regRes.rows[0];
    if (
      !registration ||
      new Date() > new Date(registration.reset_token_expiry)
    ) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await client.query(
      `UPDATE ${USERS_TABLE} SET password=$1 WHERE id=$2`,
      [hashedPassword, registration.user_id]
    );

    await client.query(
      `UPDATE ${REGISTRATIONS_TABLE} SET reset_token=NULL, reset_token_expiry=NULL WHERE id=$1`,
      [registration.id]
    );

    res.json({
      message: "Password reset successful. Please login with new password.",
    });
  } catch (err) {
    console.error("Reset Password Error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
// ================== Upload Excel (Preview) ==================
export const uploadExcel = async (req, res) => {
  try {
    if ((!req.file && !req.files) || (req.files && req.files.length === 0)) {
      return res.status(400).json({ message: "No file(s) uploaded" });
    }

    const files = req.file ? [req.file] : req.files;
    let allData = [];

    for (const file of files) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(file.path);

      const worksheet = workbook.worksheets[0];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        
        allData.push({
          fullName: row.getCell(1).value,   // Column A → Full Name
          email: row.getCell(2).value,      // Column B → Email
          phone: row.getCell(3).value,      // Column C → Phone
          address: row.getCell(4).value,    // Column D → Address
          date_of_joining: row.getCell(5).value?.toISOString?.() || row.getCell(5).value,
          department: row.getCell(6).value, // Column E → Department
          designation:row.getCell(7).value,
          employmentType:row.getCell(8).value,
        });
      });
    }

    

    return res.json({ preview: allData });
  } catch (err) {
    console.error("Upload Excel Error:", err.message);
    res.status(500).json({ message: "Error processing Excel file(s)", error: err.message });
  }
};

// ================== Bulk Insert Employees ==================
export const bulkInsertEmployees = async (req, res) => {
  const client = await pool.connect();
  try {
    const employees = req.body.employees;
    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({ message: "No employee data provided" });
    }

    // 1️⃣ Fetch existing employee IDs
    const existingEmployees = await client.query(
      `SELECT employee_id FROM ${USERS_TABLE} WHERE role = 'employee'`
    );

    const existingNumbers = existingEmployees.rows
      .map(e => e.employee_id)
      .filter(Boolean)
      .map(id => parseInt(id.replace("EMP", ""), 10))
      .filter(n => !isNaN(n));

    let nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

    // 2️⃣ Prepare employees
    const employeesPrepared = await Promise.all(
      employees.map(async (emp) => {
        const employeeId = `EMP${nextNumber.toString().padStart(3, "0")}`;
        nextNumber++;

        const randomPassword =
          emp.password || crypto.randomBytes(6).toString("base64").slice(0, 10);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        return {
          user: {
            employee_id: employeeId,
            name: emp.fullName,
            email: emp.email,
            password: hashedPassword,
            role: "employee",
            phone: emp.phone,
            address: emp.address,
            department: emp.department,
            designation:emp.designation,
            employmentType:emp.employmentType,
            date_of_joining: emp.dateOfJoining,
            access_flag: "y",
          },
          registration: {
            reset_token: resetToken,
            reset_token_expiry: resetExpiry,
            is_approved: false,
            is_temp_admin: false,
            temp_admin_expiry: null,
            plainPassword: randomPassword,
          },
        };
      })
    );

    // 3️⃣ Insert employees into user_employees_master
    const insertedUsers = [];
    for (const emp of employeesPrepared) {
      const result = await client.query(
        `INSERT INTO ${USERS_TABLE} 
          (employee_id, name, email, password, role, phone, address, date_of_joining,department,designation ,employmentType, access_flag)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         RETURNING id, email, name`,
        [
          emp.user.employee_id,
          emp.user.name,
          emp.user.email,
          emp.user.password,
          emp.user.role,
          emp.user.phone,
          emp.user.address,
          emp.user.date_of_joining,
          emp.user.department,
          emp.user.designation,
          emp.user.employmentType,
          emp.user.access_flag,
        ]
      );
      insertedUsers.push(result.rows[0]);

      // Insert registration
      await client.query(
        `INSERT INTO ${REGISTRATIONS_TABLE}
          (user_id, reset_token, reset_token_expiry, is_approved, is_temp_admin, temp_admin_expiry)
         VALUES ($1,$2,$3,false,false,NULL)`,
        [result.rows[0].id, emp.registration.reset_token, emp.registration.reset_token_expiry]
      );
    }

    // 4️⃣ Send credentials email
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    await Promise.all(
      employeesPrepared.map(async (emp) => {
        await sendEmail(
          emp.user.email,
          "Your EMS Employee Account Credentials",
          `
            <p>Hello ${emp.user.name},</p>
            <p>Your EMS account has been created.</p>
            <p><b>Login URL:</b> ${loginUrl}</p>
            <p><b>Email:</b> ${emp.user.email}</p>
            <p><b>Password:</b> ${emp.registration.plainPassword}</p>
            <p>⚠️ On your first login, you will be required to reset your password for security.</p>
          `
        );
      })
    );

    res.status(201).json({
      message: "Employees added successfully and credentials sent via email.",
      employees: insertedUsers,
    });
  } catch (err) {
    console.error("Bulk Insert Employees Error:", err.message);
    res.status(500).json({ message: "Failed to add employees", error: err.message });
  } finally {
    client.release();
  }
};

// ================== Get All Employees ==================
export const getEmployees = async (req, res) => {
  const client = await pool.connect();
  try {
    // Fetch all users with role in ['admin', 'superadmin', 'employee']
    // const query = `
    //   SELECT *
    //   FROM ${USERS_TABLE}
    //   WHERE role IN ('admin', 'superadmin', 'employee');
    // `;
    const query = `
      SELECT *
      FROM ${USERS_TABLE}
      WHERE 
        role IN ('admin', 'superadmin')
        OR (role = 'employee' AND employment_type = 'fulltime');
    `;

    const { rows } = await client.query(query);

    return res.status(200).json(rows);
  } catch (err) {
    console.error("Get Employees Error:", err.message);
    return res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
};

// ================== Get Employee by ID ==================
export const getEmployeeById = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const query = `
      SELECT *
      FROM ${USERS_TABLE}
      WHERE email = $1
      AND role = 'employee'
      LIMIT 1;
    `;

    const { rows } = await client.query(query, [email]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error("Get Employee By ID Error:", err.message);
    return res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
};

export const fetchEmployeeById = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ error: "ID is required" });
    }

    const query = `
      SELECT *
      FROM ${USERS_TABLE}
      WHERE email = $1
      LIMIT 1;
    `;

    const { rows } = await client.query(query, [email]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error("Get Employee By ID Error:", err.message);
    return res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
};

// ================== Update Employee ==================
export const updateEmployee = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    let updates = req.body;

    if (!id || id === "undefined") {
      return res.status(400).json({ error: "Invalid or missing employee ID" });
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const setClauses = Object.keys(updates)
      .map((key, i) => `${key}=$${i + 1}`)
      .join(", ");
    const values = Object.values(updates);

    const query = `
      UPDATE ${USERS_TABLE}
      SET ${setClauses}
      WHERE id=$${values.length + 1}
      RETURNING *;
    `;

    const { rows } = await client.query(query, [...values, id]);
    res.json({ message: "Employee updated successfully", employee: rows[0] });
  } catch (err) {
    console.error("Update Employee Error:", err.message);
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
};

// ================== Delete Employee ==================
export const deleteEmployee = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || id === "undefined") {
      return res.status(400).json({ error: "Invalid or missing employee ID" });
    }

    await client.query(
      `UPDATE ${USERS_TABLE} SET is_active=$1 WHERE id=$2`,
      [status, id]
    );

    res.json({
      message: `Employee ${status ? "activated" : "deactivated"} successfully`,
    });
  } catch (err) {
    console.error("Delete Employee Error:", err.message);
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
};


// ================== Export Employees ==================
export const exportEmployees = async (req, res) => {
  const client = await pool.connect();
  try {
    const { rows: employees } = await client.query(
      `SELECT * FROM ${USERS_TABLE} WHERE role='employee'`
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Employees");

    worksheet.columns = [
      { header: "Employee ID", key: "employee_id", width: 15 },
      { header: "Full Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 20 },
      { header: "Address", key: "address", width: 30 },
      { header: "Department", key: "department", width: 20 },
      { header: "Date of Joining", key: "date_of_joining", width: 20 },
    ];

    employees.forEach((emp) => worksheet.addRow(emp));

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=employees.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Export Employees Error:", err.message);
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
};


// ================== Email Verification ==================

export const sendEmailVerification = async (req, res) => {
  const client = await pool.connect();
  try {
    const decoded = getUserFromToken(req);
    const email = decoded.email;

    const { rows: userRes } = await client.query(
      `SELECT id, name FROM ${USERS_TABLE} WHERE email=$1`,
      [email]
    );

    const user = userRes[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await client.query(
      `UPDATE ${REGISTRATIONS_TABLE} 
       SET email_otp=$1, otp_expiry=$2
       WHERE user_id=$3`,
      [otp, expiry, user.id]
    );

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

    const { rows: userRes } = await client.query(
      `SELECT id FROM ${USERS_TABLE} WHERE email=$1`,
      [email]
    );
    const user = userRes[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    const { rows: regRes } = await client.query(
      `SELECT email_otp, otp_expiry FROM ${REGISTRATIONS_TABLE} WHERE user_id=$1`,
      [user.id]
    );
    const reg = regRes[0];
    if (!reg) {
      return res
        .status(400)
        .json({ error: "No OTP found. Please request again." });
    }

    const isValidOtp = String(reg.email_otp) === String(otp);
    const isExpired = new Date() > new Date(reg.otp_expiry);

    if (!isValidOtp || isExpired) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    await client.query(
      `UPDATE ${USERS_TABLE} SET is_email_verified=true WHERE id=$1`,
      [user.id]
    );

    await client.query(
      `UPDATE ${REGISTRATIONS_TABLE} SET email_otp=NULL, otp_expiry=NULL WHERE user_id=$1`,
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

export const updateEmployeeProfile = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    const { rows: existingRows } = await client.query(
      `SELECT * FROM ${USERS_TABLE} WHERE id=$1`,
      [id]
    );
    const existingData = existingRows[0];

    if (!existingData) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const updates = {};

    if (req.files?.profilePhoto?.[0]) {
      updates.profile_photo = req.files.profilePhoto[0].filename;
    }
    if (req.files?.resume?.[0]) {
      updates.resume = req.files.resume[0].filename;
    }

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ message: "You can only update profile photo or resume." });
    }

    const setClauses = Object.keys(updates)
      .map((key, i) => `${key}=$${i + 1}`)
      .join(", ");
    const values = Object.values(updates);

    const query = `
      UPDATE ${USERS_TABLE}
      SET ${setClauses}
      WHERE id=$${values.length + 1}
      RETURNING *;
    `;

    const { rows } = await client.query(query, [...values, id]);
    res.json({
      message: "Profile updated successfully.",
      employee: rows[0],
    });
  } catch (err) {
    console.error("Update Employee Profile Error:", err.message);
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
};

// // export const viewOwnProfile = async (req, res) => {
// //   try {
// //     const decoded = getUserFromToken(req); // Extract user info from JWT
// //     const email = decoded.email;

//     const { data, error } = await supabase
//       .from("user_employees_master")
//       .select(
//         "employee_id, name, email, phone, address, department, date_of_joining, permanent_address, emergency_contact, gender"
//       )
//       .eq("email", email)
//       .eq("role", "employee")
//       .maybeSingle();

//     if (error) throw error;
//     if (!data) {
//       return res.status(404).json({ error: "Employee profile not found" });
//     }

//     res.status(200).json({
//       message: "Profile fetched successfully",
//       profile: data,
//     });
//   } catch (err) {
//     console.error("View Own Profile Error:", err.message);
//     res.status(500).json({ error: "Failed to fetch profile" });
//   }
// };


 
export const applyParentalLeave = async (req, res) => {
  const client = await pool.connect();
  try {
    const { employee_id, leave_type, start_date } = req.body;

    // ✅ 1. Validation
    if (!employee_id || !leave_type || !start_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ 2. Default leave days
    let maternity_leave = 0;
    let paternity_leave = 0;

    if (leave_type === "maternity") {
      maternity_leave = 180;
    } else if (leave_type === "paternity") {
      paternity_leave = 5;
    } else {
      return res.status(400).json({ error: "Invalid leave type" });
    }

    const currentYear = new Date(start_date).getFullYear();

    // ✅ 3. Build leave record
    const leaveRecord = {
      employee_id,
      year: currentYear,
      maternity_leave,
      paternity_leave,
      weekly_status: "pending_approval",
      monthly_status: "pending_approval",
      total_hours: 0,
      worked_hours: 0,
      working_days: 0,
      work_from_home: 0,
      holidays: 10,
      optional_holidays: 0,
      el: 0,
      sl: 0,
      extra_milar: 0,
      leave_type,
      date: start_date,
    };

    console.log("Leave record to insert:", leaveRecord);

    // ✅ 4. Insert into PostgreSQL (attendance table)
    const insertQuery = `
      INSERT INTO attendance (
        employee_id, year, maternity_leave, paternity_leave, weekly_status, monthly_status,
        total_hours, worked_hours, working_days, work_from_home, holidays, optional_holidays,
        el, sl, extra_milar, leave_type, date
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17
      )
      RETURNING *;
    `;

    const values = [
      leaveRecord.employee_id,
      leaveRecord.year,
      leaveRecord.maternity_leave,
      leaveRecord.paternity_leave,
      leaveRecord.weekly_status,
      leaveRecord.monthly_status,
      leaveRecord.total_hours,
      leaveRecord.worked_hours,
      leaveRecord.working_days,
      leaveRecord.work_from_home,
      leaveRecord.holidays,
      leaveRecord.optional_holidays,
      leaveRecord.el,
      leaveRecord.sl,
      leaveRecord.extra_milar,
      leaveRecord.leave_type,
      leaveRecord.date,
    ];

    const { rows } = await client.query(insertQuery, values);

    // ✅ 5. Send response
    res.status(201).json({
      message: `${leave_type} leave applied successfully and pending admin approval`,
      leave_record: rows[0],
    });
  } catch (err) {
    console.error("Apply Parental Leave Error:", err.message);
    res.status(500).json({ error: "Error applying parental leave", details: err.message });
  } finally {
    client.release();
  }
};

export const getFreelancers = async (req, res) => {
  
  const client = await pool.connect();
  try {
    const query = `
      SELECT *
      FROM ${USERS_TABLE}
    WHERE role= 'employee'
and employment_type = 'freelancer';
    `;

    const { rows } = await client.query(query);
    return res.status(200).json(rows);

  } catch (err) {
    console.error("Get Freelancers Error:", err.message);
    return res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
};

// to create referrals
export const createReferral = async (req, res) => {
  const client = await pool.connect();

  try {
    // Get logged-in employee from JWT
    const user = getUserFromToken(req);
    const employeeId = user.id; // This is the employee's DB UUID

    // Get data from request
    const { candidate_name, candidate_email, phone_number, position, work_exp } = req.body;

    if (!candidate_name || !candidate_email || !phone_number || !position) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Resume (PDF) is required." });
    }

    // Fetch employee details from user_employees_master
    const empQuery = `
      SELECT id, employee_id, name, email 
      FROM ${USERS_TABLE}
      WHERE id = $1
    `;
    const empResult = await client.query(empQuery, [employeeId]);

    if (empResult.rowCount === 0) {
      return res.status(404).json({ error: "Employee not found." });
    }

    const employee = empResult.rows[0];

    const duplicateQuery = `
      SELECT *
      FROM ${REFERRALS_TABLE}
      WHERE (candidate_email = $1 OR phone_number = $2)
      AND position = $3
    `;
    const dupCheck = await client.query(duplicateQuery, [
      candidate_email,
      phone_number,
      position,
    ]);

    if (dupCheck.rowCount > 0) {
      return res.status(409).json({
        error: "Duplicate referral detected.",
        message: "This candidate is already referred for this position.",
        existing_referral: dupCheck.rows[0],
      });
    }

    // Create JSON for uploading resume
    const resumeJson = {
      resume: req.file.filename,
      
    };

    // Use your referral ID generator
    const referralId = await generateReferralId(client);

    // Insert referral into DB
    const insertQuery = `
      INSERT INTO ${REFERRALS_TABLE}
      (referred_by, candidate_name, candidate_email, phone_number, position, 
       work_exp, resume, referral_id, status, created_by, updated_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'Submitted',$9,$10)
      RETURNING *
    `;

    const values = [
      employee.id,              // referred_by (UUID)
      candidate_name,
      candidate_email,
      phone_number,
      position,
      work_exp,
      resumeJson,
      referralId,
      employee.name,
      employee.name,
    ];

    const insertRes = await client.query(insertQuery, values);
    const referral = insertRes.rows[0];

    // Send email to employee
    await sendEmail(
      employee.email,
      "Referral Submitted Successfully",
      `
        <h2>Your Referral Is Successfully Submitted</h2>
        <p><strong>Referral ID:</strong> ${referralId}</p>
        <p><strong>Candidate Name:</strong> ${candidate_name}</p>
        <p><strong>Status:</strong> Submitted</p>
        <br/>
        <p>Thank you for submitting a referral!</p>
      `
    );

    return res.status(201).json({
      message: "Referral submitted successfully.",
      referral_id: referralId,
      referred_by: {
        employee_id: employee.employee_id,
        employee_name: employee.name,
      },
      referral,
    });

  } catch (err) {
    console.error("Create Referral Error:", err.message);
    return res.status(500).json({ error: "Internal server error." });
  } finally {
    client.release();
  }
};

export const getMyReferrals = async (req, res) => {
  const client = await pool.connect();

  try {
    const user = getUserFromToken(req);
    const employeeId = user.id;

    const query = `
      SELECT 
        referral_id,
        candidate_name,
        candidate_email,
        phone_number,
        position,
        status,
        referred_at,
        work_exp,
        resume
      FROM ${REFERRALS_TABLE}
      WHERE referred_by = $1
      ORDER BY referred_at DESC
    `;

    const result = await client.query(query, [employeeId]);

    return res.status(200).json({
      total: result.rowCount,
      referrals: result.rows,
    });

  } catch (err) {
    console.error("Get My Referrals Error:", err.message);
    return res.status(500).json({ error: "Internal server error." });
  } finally {
    client.release();
  }
};


