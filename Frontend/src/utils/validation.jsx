// Strong Password Regex: min 8, max 16, includes uppercase, lowercase, number, special char
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!-/:-@[-`{-~]).{8,16}$/; // ✅ all ASCII special chars

// Org Email Validation (common)
export const validateOrgEmail = (email) => {
  const orgDomain = "@zigmaneural.com"; // your company domain
  return email.endsWith(orgDomain);
};

// Admin and SuperAdmin Register Validation
export const validateRegistration = (formData) => {
  let errors = {};

  if (!formData.fullName) {
    errors.fullName = "Full name is required";
  } else if (!/^[a-zA-Z\s]{1,15}$/.test(formData.fullName.trim())) {
    errors.fullName = "Only letters and spaces allowed, max 15 characters";
  }

  if (!formData.email) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = "Email is not valid";
  } else if (!validateOrgEmail(formData.email)) {
    errors.email = "Please use your organization email (e.g. @zigmaneural.com)";
  }

  if (!formData.password) {
    errors.password = "Password is required";
  } else if (!strongPasswordRegex.test(formData.password)) {
    errors.password =
      "Password must be 8-16 characters and include uppercase, lowercase, number, and special character";
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = "Confirm Password is required";
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (!formData.role) {
    errors.role = "Role is required";
  }

  return errors;
};

// Employee Register Validation
export const validateEmployeeRegistration = (formData) => {
  let errors = {};

  if (!formData.fullName) {
    errors.fullName = "Full name is required";
  } else if (!/^[a-zA-Z\s]{1,15}$/.test(formData.fullName.trim())) {
    errors.fullName = "Only letters and spaces allowed, max 15 characters";
  }

  if (!formData.email) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = "Email is not valid";
  }

  if (!formData.role) {
    errors.role = "Role is required";
  }

  if (!formData.phone) {
    errors.phone = "Phone number is required";
  } else if (!/^[0-9]{10}$/.test(formData.phone)) {
    errors.phone = "Phone number must be 10 digits";
  }

  if (!formData.address) {
    errors.address = "Address is required";
  }

  if (!formData.dateOfJoining) {
    errors.dateOfJoining = "Date of joining is required";
  } else {
    const today = new Date().toISOString().split("T")[0];
    if (formData.dateOfJoining > today) {
      errors.dateOfJoining = "Date of joining cannot be in the future";
    }
  }

  if (!formData.department) {
    errors.department = "Department is required";
  }

  return errors;
};

// Login Validation
export const validateLogin = (formData) => {
  let errors = {};

  if (!formData.email) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = "Email is not valid";
  } else if (!validateOrgEmail(formData.email)) {
    errors.email = "Please use your organization email (e.g. @zigmaneural.com)";
  }

  if (!formData.password) {
    errors.password = "Password is required";
  } else if (!strongPasswordRegex.test(formData.password)) {
    errors.password =
      "Password must be 8-16 characters and include uppercase, lowercase, number, and special character";
  }

  return errors;
};

// Profile Validation
export const validateProfileForm = (formData, roles) => {
  const errors = {};

  // Full Name
  if (!formData.name?.trim()) {
    errors.name = "Full name is required";
  } else if (!/^[a-zA-Z\s]{1,15}$/.test(formData.name.trim())) {
    errors.name = "Only letters and spaces allowed, max 15 characters";
  }

  // DOB
  if (!formData.dob) {
    errors.dob = "Date of birth is required";
  }

  // Gender
  if (!formData.gender) {
    errors.gender = "Please select gender";
  }

  // Department
  if (!formData.department?.trim()) {
    errors.department = "Department is required";
  }

  // Phone
  if (!formData.phone?.trim()) {
    errors.phone = "Phone number is required";
  } else if (!/^[0-9]{10}$/.test(formData.phone)) {
    errors.phone = "Enter valid 10-digit number";
  }

  // Email
  if (!formData.email?.trim()) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = "Invalid email format";
  } else if (!validateOrgEmail(formData.email)) {
    errors.email = "Please use your organization email (e.g. @zigmaneural.com)";
  }

  // Current Address
  if (!formData.currentAddress?.trim()) {
    errors.currentAddress = "Current address required";
  }

  // Permanent Address
  if (!formData.permanent_address?.trim()) {
    errors.permanent_address = "Permanent address required";
  }

  // Emergency Contact
  if (!formData.emergencyContact?.trim()) {
    errors.emergencyContact = "Emergency contact required";
  } else if (!/^[0-9]{10}$/.test(formData.emergencyContact)) {
    errors.emergencyContact = "Enter valid 10-digit number";
  }

  // Resume (Only for employee role)
  if (roles === "employee") {
    if (!formData.resume) {
      errors.resume = "Resume is required";
    } else {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(formData.resume.type)) {
        errors.resume = "Only PDF, DOC, DOCX allowed";
      }
      if (formData.resume.size > 5 * 1024 * 1024) {
        errors.resume = "Resume must be ≤ 5MB";
      }
    }
  }

  // Profile Photo
  if (formData.profilePhoto) {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(formData.profilePhoto.type)) {
      errors.profilePhoto = "Only JPG, JPEG, PNG allowed";
    }
    if (formData.profilePhoto.size > 2 * 1024 * 1024) {
      errors.profilePhoto = "Profile Photo must be ≤ 2MB";
    }
  }

  return errors;
};

// ✅ MFA / OTP Validation (Frontend now checks expiration)
export const validateOTP = (otp, otpExpirationTime) => {
  const errors = {};
  const now = new Date().getTime(); // current timestamp

  if (!otp) {
    errors.otp = "OTP is required";
  } else if (!/^\d{6}$/.test(otp)) {
    errors.otp = "OTP must be 6 digits only";
  } else if (now >= new Date(otpExpirationTime).getTime()) {
    errors.otp = "OTP has expired"; // ✅ frontend immediately blocks expired OTP
  }

  return errors;
};

// Reset Password Validation (used for first login or forgot password)
export const validateResetPassword = (formData) => {
  const errors = {};

  if (!formData.password) {
    errors.password = "Password is required";
  } else if (!strongPasswordRegex.test(formData.password)) {
    errors.password =
      "Password must be 8-16 characters and include uppercase, lowercase, number, and special character";
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = "Confirm Password is required";
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

