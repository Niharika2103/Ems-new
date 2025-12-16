import { SalaryStructureClient } from "../api/axiosClient";

// Different base URLs per r
export const API_BASES = {
  SUPERADMIN: import.meta.env.VITE_SUPERADMIN_URL || "http://localhost:5101",
  ADMIN: import.meta.env.VITE_ADMIN_URL || "http://localhost:5002",
  EMPLOYEE: import.meta.env.VITE_EMPLOYEE_URL || "http://localhost:5009",
  PROJECT:import.meta.env.VITE_Project_URL || "http://localhost:8081/api",
  ATTENDANCE:import.meta.env.VITE_Attendance_URL || "http://localhost:9191/api",
  SALARYSTRUCTURE:import.meta.env.VITE_SalaryStructure_URL || "http://localhost:9092",
  FREELANCER: import.meta.env.VITE_FREELANCER_URL || "http://localhost:5005",
  VENDOR: import.meta.env.VITE_VENDOR_URL || "http://localhost:5010",

};



// Auth endpoints
export const AUTH_API = {
  SUPERADMIN: `${API_BASES.SUPERADMIN}/auth/superadmin`,
  ADMIN: `${API_BASES.ADMIN}/admin`,
  EMPLOYEE: `${API_BASES.EMPLOYEE}/employee`,
  PROJECT:`${API_BASES.PROJECT}`,
  ATTENDANCE:`${API_BASES.ATTENDANCE}`,
  SALARYSTRUCTURE:`${API_BASES.SALARYSTRUCTURE}/salary`,
  FREELANCER: `${API_BASES.FREELANCER}/freelancer`,
  VENDOR: `${API_BASES.VENDOR}/vendor` 
};

export const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  EMPLOYEE: "employee",
  PROJECT:"project",
  ATTENDANCE:"attendance",
  SALARYSTRUCTURE:"salarystructure",
  FREELANCER: "freelancer",
  VENDOR: "vendor",
};

export const OTP_LENGTH = 6;
