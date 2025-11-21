import axios from "axios";
import { API_BASES } from "../utils/constants";

// Helper to create axios instance with interceptors
const createAxiosClient = (baseURL) => {
  const client = axios.create({ baseURL });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 🔹 Add these lines to prevent caching
    config.headers["Cache-Control"] = "no-cache";
    config.headers["Pragma"] = "no-cache";
    config.headers["Expires"] = "0";

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// Export clients for each role
export const superadminClient = createAxiosClient(API_BASES.SUPERADMIN);
export const adminClient = createAxiosClient(API_BASES.ADMIN);
export const employeeClient = createAxiosClient(API_BASES.EMPLOYEE);
export const ProjectClient = createAxiosClient(API_BASES.PROJECT);
export const AttendanceClient = createAxiosClient(API_BASES.ATTENDANCE);
export const SalaryStructureClient = createAxiosClient(API_BASES.SALARYSTRUCTURE);

