import { superadminClient } from "./axiosClient";
import { adminClient } from "./axiosClient";
import { employeeClient } from "./axiosClient";
import { AUTH_API } from "../utils/constants";

// ================= SuperAdmin =================
export const checkEmailApi = (email) =>
  superadminClient.post(`${AUTH_API.SUPERADMIN}/check-email`, { email });

export const superadminRegisterApi = (data) =>
  superadminClient.post(`${AUTH_API.SUPERADMIN}/register`, data);

export const superadminLoginApi = (data) =>
  superadminClient.post(`${AUTH_API.SUPERADMIN}/login`, data);

export const superadminVerifyOtpApi = (data) =>
  superadminClient.post(`${AUTH_API.SUPERADMIN}/mfa/verify`, data);

export const getSuperadminProfileApi = (id) =>
  superadminClient.get(`${AUTH_API.SUPERADMIN}/get/${id}`);

export const superadminApproveAdminApi = (id, is_approved) =>
  adminClient.patch(`${AUTH_API.ADMIN}/approve/${id}`, { is_approved });

export const updateSuperAdminProfileApi = (data, id) => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      if (key === "profilePhoto" && data[key] instanceof File) {
        formData.append("profilePhoto", data[key]);
      } else if (key === "resume" && data[key] instanceof File) {
        formData.append("resume", data[key]);
      } else {
        formData.append(key, data[key]);
      }
    }
  }
);

  return superadminClient.put(`${AUTH_API.SUPERADMIN}/profile/${id}`, formData);
};

// ================= Admin =================
export const adminRegisterApi = (data) =>
  adminClient.post(`${AUTH_API.ADMIN}/register`, data);

export const adminLoginApi = (data) =>
  adminClient.post(`${AUTH_API.ADMIN}/login`, data);

export const adminVerifyOtpApi = (data) =>
  adminClient.post(`${AUTH_API.ADMIN}/verify-mfa`, data);

export const grantTempAdminApi = (email, durationHours) =>
  adminClient.post(`${AUTH_API.ADMIN}/grant-temp`, { email, durationHours });

// Revoke temporary admin role
export const revokeTempAdminApi = (email) =>
  adminClient.delete(`${AUTH_API.ADMIN}/revoke-temp/${email}`);

//adminProfile get by using email
export const getAdminProfileApi = (id) =>
  adminClient.get(`${AUTH_API.ADMIN}/get/${id}`);

export const updateAdminProfileApi = (data, id) => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      if (key === "profilePhoto" && data[key] instanceof File) {
        formData.append("profilePhoto", data[key]);
      } else if (key === "resume" && data[key] instanceof File) {
        formData.append("resume", data[key]);
      } else {
        formData.append(key, data[key]);
      }
    }
  }
);

  return adminClient.put(`${AUTH_API.ADMIN}/adminprofile-update/${id}`, formData);
};


export const FetchallAdminApi = () =>
  adminClient.get(`${AUTH_API.ADMIN}/fetchall`)

export const DeleteAdminApi = (id) =>
  adminClient.delete(`${AUTH_API.ADMIN}/delete/${id}`);

export const verifyEmailAdmin = (otp) =>
  adminClient.post(`${AUTH_API.ADMIN}/verify-email`, otp);

export const sendVerifyEmailAdmin = () =>
  adminClient.post(`${AUTH_API.ADMIN}/send-email-verification`);


// ================= Employee Auth =================
export const employeeRegisterApi = (data) =>
  employeeClient.post(`${AUTH_API.EMPLOYEE}/register`, data);


// Login
export const employeeLoginApi = (data) =>
  employeeClient.post(`${AUTH_API.EMPLOYEE}/login`, data);

// Forgot password
export const employeeForgotPasswordApi = (data) =>
  employeeClient.post(`${AUTH_API.EMPLOYEE}/request-password-reset`, data);

// Reset password
export const employeeResetPasswordApi = (data) =>
  employeeClient.post(`${AUTH_API.EMPLOYEE}/reset-password`, data);

// Fetch all employees
export const employeeFetchApi = () =>
  employeeClient.get(`${AUTH_API.EMPLOYEE}/get` );

//Delete All Employee
export const employeeDeleteApi = (id) =>
  employeeClient.delete(`${AUTH_API.EMPLOYEE}/delete/${id}` );


//Profile get by using email
export const getProfileApi = (email) =>
  employeeClient.get(`${AUTH_API.EMPLOYEE}/get/${email}`);

//Profile employee edit & update
export const editProfileApi = (data, id) => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      if (key === "profilePhoto" && data[key] instanceof File) {
        formData.append("profilePhoto", data[key]);
      } else if (key === "resume" && data[key] instanceof File) {
        formData.append("resume", data[key]);
      } else {
        formData.append(key, data[key]);
      }
    }
  }
);

  return employeeClient.put(`${AUTH_API.EMPLOYEE}/profile-update/${id}`, formData);
};


//send verfication to email
export const veryEmail = (otp) =>
  employeeClient.post(`${AUTH_API.EMPLOYEE}/verify-email`, otp);

// verfiy Emial
export const sendVerfiyEmail = () =>
  employeeClient.post(`${AUTH_API.EMPLOYEE}/send-email-verification`);
//Employee Edit by Admin
export const adminUpdateEmployeeApi = (data, id) => {
 adminClient.put(`${AUTH_API.EMPLOYEE}/edit/${id}`, data);
};

export const employeeUploadExcelApi = (formData) =>
  employeeClient.post(`${AUTH_API.EMPLOYEE}/upload`, formData);


// Bulk Insert Employees
export const employeeBulkInsertApi = (payload) =>
  employeeClient.post(`${AUTH_API.EMPLOYEE}/bulk-insert`, payload);
