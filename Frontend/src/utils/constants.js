// Different base URLs per role
export const API_BASES = {
  SUPERADMIN: import.meta.env.VITE_SUPERADMIN_URL || "http://localhost:5001",
  ADMIN: import.meta.env.VITE_ADMIN_URL || "http://localhost:5002",
  EMPLOYEE: import.meta.env.VITE_EMPLOYEE_URL || "http://localhost:5004",
};

// export const API_BASES = {
//   SUPERADMIN: import.meta.env.VITE_SUPERADMIN_URL || "https://emsproject-bl4w.onrender.com",
//   ADMIN: import.meta.env.VITE_ADMIN_URL || "https://emsproject-admin.onrender.com",
//   EMPLOYEE: import.meta.env.VITE_EMPLOYEE_URL || "https://emsproject-employee.onrender.com",
// };

// Auth endpoints
export const AUTH_API = {
  SUPERADMIN: `${API_BASES.SUPERADMIN}/auth/superadmin`,
  ADMIN: `${API_BASES.ADMIN}/admin`,
  EMPLOYEE: `${API_BASES.EMPLOYEE}/employee`,
};

export const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  EMPLOYEE: "employee",
};

export const OTP_LENGTH = 6;
