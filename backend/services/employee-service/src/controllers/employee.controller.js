import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import supabase from "../supabaseClient.js";
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

// ================== JWT Helper ==================
function issueJwt({ email, role, employee_id,id, is_temp_admin = false,name }) {
  return jwt.sign(
    { email, role, employee_id, is_temp_admin ,id,name},
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

async function generateEmployeeId() {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select("employee_id");

  if (error) throw error;

  // Only consider non-null employee_ids
  const existingIds = data
    .map(e => e.employee_id)
    .filter(id => id !== null)
    .map(id => parseInt(id.replace("EMP", ""), 10))
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b);

  let nextNum = 1;
  for (const num of existingIds) {
    if (num === nextNum) {
      nextNum++;
    } else if (num > nextNum) {
      break; // found a gap
    }
  }

  return `EMP${nextNum.toString().padStart(3, "0")}`;
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
  try {
    const { fullName, email, phone, address, department, dateOfJoining } = req.body;

    // ✅ Validation
    const validationError = validateEmployeeData({ fullName, email, phone, address });
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const employeeId = await generateEmployeeId();
    console.log("Generated Employee ID:", employeeId);

    // ✅ Check if employee already exists
    const { data: existing, error: fetchError } = await supabase
      .from(USERS_TABLE)
      .select("*")
      .eq("email", email)
      .eq("role", "employee")
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (existing) return res.status(400).json({ error: "Employee already registered" });

    // ✅ Generate password & hash
    const randomPassword = crypto.randomBytes(6).toString("base64").slice(0, 10);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // ✅ Reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // ✅ Insert into users table
    const { data: newEmployee, error: insertError } = await supabase
      .from(USERS_TABLE)
      .insert([
        {
          employee_id: employeeId,
          name: fullName,
          email,
          password: hashedPassword,
          phone,
          address,
          department,
          date_of_joining: dateOfJoining,
          role: "employee",
          access_flag: "y",
        },
      ])
      .select("*")
      .single();

    if (insertError) throw insertError;

    // ✅ Insert into registrations
    const { error: regInsertError } = await supabase
      .from(REGISTRATIONS_TABLE)
      .insert([
        {
          user_id: newEmployee.id,
          otp_code: null,
          otp_expiry: null,
          reset_token: resetToken,
          reset_token_expiry: resetExpiry,
          is_approved: false,
          is_temp_admin: false,
          temp_admin_expiry: null,
        },
      ]);

    if (regInsertError) throw regInsertError;

    // ✅ Insert default attendance record
    const currentYear = new Date().getFullYear();

    const { error: attendanceInsertError } = await supabase
      .from("attendance")
      .insert([
        {
          employee_id: newEmployee.id,
          year: currentYear,
          working_days: 0,
          work_from_home: 315, // default
          holidays: 10,
          optional_holidays: 2,
          el: 25,
          sl: 10,
          extra_milar: 2,
          maternity_leave: 0,
          paternity_leave: 0,
          project_id: null,
          date: new Date().toISOString().split("T")[0], // current date
          status: "draft",
          total_hours: 0,
          worked_hours: 0,
        },
      ]);

    if (attendanceInsertError) throw attendanceInsertError;

    // ✅ Send Email with login credentials
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

    // ✅ Response
    res.status(201).json({
      message: "Employee registered successfully. Credentials sent via email, and attendance record created.",
    });

  } catch (err) {
    console.error("Register Employee Error:", err.message);
    res.status(500).json({ error: err.message });
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
  try {
    const { email, password, otp } = req.body;

    const { data: user, error } = await supabase
      .from(USERS_TABLE)
      .select("*")
      .eq("email", email)
      .in("role", ["employee", "admin", "superadmin"])
      .maybeSingle();

    if (error || !user) return res.status(401).json({ error: "Invalid Email" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Invalid Password" });

    if (["admin", "superadmin"].includes(user.role)) {
  // Step 1: Password verification
   if (!otp) {
    return res.json({
      message: "Enter OTP from your authenticator app",
      otpRequired: true,   // frontend will use this to show OTP input
    });
  }

  // Step 2: Verify OTP using speakeasy
  const verified = speakeasy.totp.verify({
    secret: user.mfa_secret,
    encoding: "base32",
    token: otp,
    window: 1, // optional: allows for ±1 step
  });

  if (!verified) return res.status(401).json({ error: "Invalid OTP" });

  // OTP verified → issue JWT
  const token = issueJwt({
    email: user.email,
    role: user.role,
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
    },
  });
}
    // employee flow
    const { data: reg, error: regError } = await supabase
      .from(REGISTRATIONS_TABLE)
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (regError || !reg) {
      return res.status(400).json({ error: "Registration record not found. Please contact admin." });
    }

    // Check reset token (first login)
    const now = new Date();
    if (reg?.reset_token && now <= new Date(reg.reset_token_expiry)) {
      return res.status(202).json({
        message: "First login detected. Please reset your password to proceed.",
        firstLogin: true,
        resetToken: reg.reset_token,
      });
    }

    // Generate/send OTP if missing
    if (!otp) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      const { error: updateError } = await supabase
        .from(REGISTRATIONS_TABLE)
        .update({ otp_code: otpCode, otp_expiry: otpExpiry })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      await sendEmail(
        user.email,
        "Your EMS Login OTP",
        `
          <p>Hello ${user.name},</p>
          <p>Your OTP is: <b>${otpCode}</b></p>
          <p>Valid for 5 minutes.</p>
        `
      );
      return res.json({ message: "OTP sent to your email", otpRequired: true  });
    }

    if (reg?.otp_code !== otp || new Date() > new Date(reg?.otp_expiry)) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    await supabase.from(REGISTRATIONS_TABLE).update({ otp_code: null, otp_expiry: null }).eq("user_id", user.id);

    // Check temp admin
    let is_temp_admin = false;
    if (reg?.is_temp_admin && new Date() <= new Date(reg.temp_admin_expiry)) {
      is_temp_admin = true;
    } else if (reg?.is_temp_admin) {
      await supabase.from(REGISTRATIONS_TABLE).update({ is_temp_admin: false, temp_admin_expiry: null }).eq("user_id", user.id);
    }

    const token = issueJwt({
      email: user.email,
      role: user.role,
      employee_id: user.employee_id,
      is_temp_admin,
      id: user.id,
    });

    return res.json({
      message: "Employee login successful",
      token,
      employee: {
        employeeId: user.employee_id,
        fullName: user.name,
        email: user.email,
        is_temp_admin,
        temp_admin_expiry: reg?.temp_admin_expiry,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ================== Request Password Reset ==================
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const { data: user, error } = await supabase
      .from(USERS_TABLE)
      .select("*")
      .eq("email", email)
      .eq("role", "employee")
      .maybeSingle();

    if (error || !user) return res.status(404).json({ error: "Employee not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000);

    const { error: regError } = await supabase
      .from(REGISTRATIONS_TABLE)
      .update({
        reset_token: resetToken,
        reset_token_expiry: resetExpiry,
      })
      .eq("user_id", user.id);

    if (regError) throw regError;

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail(
      user.email,
      "Reset your EMS Password",
      `
        <p>Hello ${user.name},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
      `
    );

    res.json({ message: "Password reset link sent to your email." });
  } catch (err) {
    console.error("Request Password Reset Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ================== Reset Password ==================
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const { data: registration, error: regError } = await supabase
      .from(REGISTRATIONS_TABLE)
      .select("*")
      .eq("reset_token", token)
      .maybeSingle();

    if (regError || !registration || new Date() > new Date(registration.reset_token_expiry)) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error: updateError } = await supabase
      .from(USERS_TABLE)
      .update({ password: hashedPassword })
      .eq("id", registration.user_id);

    if (updateError) throw updateError;

    // Clear reset token
    await supabase
      .from(REGISTRATIONS_TABLE)
      .update({ reset_token: null, reset_token_expiry: null })
      .eq("id", registration.id);
      
    res.json({
      message: "Password reset successful. Please login with your new password.",
      firstLoginCompleted: !!token,
    });
  } catch (err) {
    console.error("Reset Password Error:", err.message);
    res.status(500).json({ error: err.message });
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
          department: row.getCell(5).value, // Column E → Department
          date_of_joining: row.getCell(6).value?.toISOString?.() || row.getCell(6).value,
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
  try {
    const employees = req.body.employees;

    // 1️⃣ Fetch existing employee IDs
    const { data: existingEmployees, error: fetchError } = await supabase
      .from(USERS_TABLE)
      .select("employee_id")
      .eq("role", "employee");

    if (fetchError) throw fetchError;

    // Extract numbers from EMPxxx IDs
    const existingNumbers = existingEmployees
      .map(e => e.employee_id)
      .filter(Boolean)
      .map(id => parseInt(id.replace("EMP", ""), 10))
      .filter(n => !isNaN(n));

    let nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

    // 2️⃣ Prepare employees
    const employeesPrepared = await Promise.all(
      employees.map(async (emp) => {
        const employeeId = `EMP${nextNumber.toString().padStart(3, "0")}`;
        nextNumber++; // increment for next employee
        
        const randomPassword =
          emp.password || crypto.randomBytes(6).toString("base64").slice(0, 10);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        return {
          user: {
            name: emp.fullName,
            email: emp.email,
            password: hashedPassword,
            role: "employee",
            phone: emp.phone,
            address: emp.address,
            department: emp.department,
            date_of_joining: emp.dateOfJoining,
            employee_id: employeeId,
            access_flag: "y",
          },
          registration: {
            email_otp: null,
            otp_code: null,
            otp_expiry: null,
            reset_token: resetToken,
            reset_token_expiry: resetExpiry,
            is_approved: false,
            is_temp_admin: false,
            temp_admin_expiry: null,
            plainPassword: randomPassword, //in memory
          },
        };
      })
    );

    // 3️⃣ Insert into user_employees_master
    const { data: insertedUsers, error: insertError } = await supabase
      .from(USERS_TABLE)
      .insert(employeesPrepared.map((e) => e.user))
      .select();

    if (insertError) throw insertError;

    // 4️⃣ Insert into registrations (exclude plainPassword)
    const registrationsToInsert = employeesPrepared.map((e, idx) => {
      const { plainPassword, ...rest } = e.registration; // remove plainPassword
      return {
        ...rest,
        user_id: insertedUsers[idx].id,
      };
    });

    const { error: regError } = await supabase
      .from(REGISTRATIONS_TABLE)
      .insert(registrationsToInsert);

    if (regError) throw regError;


    const loginUrl = `${process.env.FRONTEND_URL}/login`;

    // 4️⃣ Send emails in background
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

    return res.json({
      message: "Employees added successfully and credentials sent via email.",
      employees: insertedUsers,
    });
  } catch (err) {
    console.error("Bulk Insert Employees Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};


// ================== Get All Employees ==================
export const getEmployees = async (req, res) => {
  try {
    const { data, error } = await supabase.from(USERS_TABLE).select("*").in("role",  ["admin", "superadmin","employee"]);
    if (error) throw error;

    return res.json(data);
  } catch (err) {
    console.error("Get Employees Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ================== Get Employee by ID ==================
export const getEmployeeById = async (req, res) => {
  try {
    const { email } = req.params;

    const { data, error } = await supabase
      .from(USERS_TABLE)
      .select("*")
      .eq("email", email) // match database primary key
      .eq("role", "employee")
      .maybeSingle();

    if (error) throw error;

    return res.json(data);
  } catch (err) {
    console.error("Get Employee By ID Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};


// ================== Update Employee ==================
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    let updates = req.body;
   
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const { data, error } = await supabase.from(USERS_TABLE).update(updates).eq("id", id).select();
    if (error) throw error;

    return res.json({ message: "Employee updated successfully", employee: data[0] });
  } catch (err) {
    console.error("Update Employee Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ================== Delete Employee ==================
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
  const { status } = req.body; 
    const { error } = await supabase.from(USERS_TABLE).update({ is_active: status }).eq("id", id);
    if (error) throw error;

    
 
    return res.json({ message: `Employee ${status ? "activated" : "deactivated"} successfully` });
  } catch (err) {
    console.error("Delete Employee Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ================== Export Employees ==================
export const exportEmployees = async (req, res) => {
  try {
    const { data: employees, error } = await supabase.from(USERS_TABLE).select("*").eq("role", "employee");
    if (error) throw error;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Employees");

    worksheet.columns = [
      { header: "Employee ID", key: "employee_id", width: 15 },
      { header: "Full Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 20 },
      { header: "Address", key: "address", width: 30 },
      { header: "Department", key: "department", width: 20 },
      { header: "Date of Joining", key: "date_of_joining", width: 20 }, // ✅ included in export
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
  }
};


// ================== Email Verification ==================

export const sendEmailVerification = async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    const email = decoded.email;

    // 1️⃣ Get user id
    const { data: user, error: userError } = await supabase
      .from(USERS_TABLE)
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
      .from(USERS_TABLE)
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
      .from(USERS_TABLE)
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


export const updateEmployeeProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Fetch existing employee row
    const { data: existingData, error: fetchError } = await supabase
      .from(USERS_TABLE)
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;
    if (!existingData) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // ✅ Merge old data with new updates
    let updates = { ...existingData, ...req.body };

    // 🚫 Prevent restricted fields from being changed
    delete updates.employee_id;
    delete updates.role;
    delete updates.date_of_joining;

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

    // ✅ Save merged data back into DB
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .update(updates)
      .eq("id", id)
      .select("*");

    if (error) throw error;

    return res.json({
      message: "Employee updated successfully",
      employee: data[0],
    });

  } catch (err) {
    console.error("Update Employee Error:", err);
    res.status(500).json({ message: err.message });
  }
};

