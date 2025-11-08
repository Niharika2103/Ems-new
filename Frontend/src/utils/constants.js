// Different base URLs per r
// export const API_BASES = {
//   SUPERADMIN: import.meta.env.VITE_SUPERADMIN_URL || "http://localhost:5001",
//   ADMIN: import.meta.env.VITE_ADMIN_URL || "http://localhost:5002",
//   EMPLOYEE: import.meta.env.VITE_EMPLOYEE_URL || "http://localhost:5004",
//   PROJECT:import.meta.env.VITE_Project_URL || "http://localhost:8080/api",
//   ATTENDANCE:import.meta.env.VITE_Attendance_URL || "http://localhost:9091/api",
// };


export const API_BASES = {
  SUPERADMIN: import.meta.env.VITE_SUPERADMIN_URL || "https://auth-service-nuob.onrender.com",
  ADMIN: import.meta.env.VITE_ADMIN_URL || "https://admin-service-vb0h.onrender.com",
  EMPLOYEE: import.meta.env.VITE_EMPLOYEE_URL || "https://employee-service-5od6.onrender.com",
  PROJECT:import.meta.env.VITE_Project_URL || "http://20.40.57.43:8081/api",
  ATTENDANCE:import.meta.env.VITE_Attendance_URL || "http://20.40.57.43:9090/api",
};

// Auth endpoints
export const AUTH_API = {
  SUPERADMIN: `${API_BASES.SUPERADMIN}/auth/superadmin`,
  ADMIN: `${API_BASES.ADMIN}/admin`,
  EMPLOYEE: `${API_BASES.EMPLOYEE}/employee`,
  PROJECT:`${API_BASES.PROJECT}`,
  ATTENDANCE:`${API_BASES.ATTENDANCE}`,
};

export const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  EMPLOYEE: "employee",
  PROJECT:"project",
  ATTENDANCE:"attendance",
};

export const OTP_LENGTH = 6;
