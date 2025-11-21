import { superadminClient,employeeClient,adminClient,ProjectClient,AttendanceClient} from "./axiosClient";
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

export const promoteAdminToSuperadminApi = (adminId) =>
  superadminClient.put(`${AUTH_API.SUPERADMIN}/promote/${adminId}`);

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

export const DeleteAdminApi = (id,status) =>
  adminClient.put(`${AUTH_API.ADMIN}/status/${id}`, { status });

export const verifyEmailAdmin = (otp) =>
  adminClient.post(`${AUTH_API.ADMIN}/verify-email`, otp);

export const sendVerifyEmailAdmin = () =>
  adminClient.post(`${AUTH_API.ADMIN}/send-email-verification`);

export const promoteEmployeeApi = (employeeId) =>
  adminClient.post(`${AUTH_API.ADMIN}/promote/${employeeId}`)


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

export const FetchFreelancerApi = () =>
  employeeClient.get(`${AUTH_API.EMPLOYEE}/freelancers` );

//Delete All Employee
export const employeeDeleteApi = (id,status) =>
  employeeClient.put(`${AUTH_API.EMPLOYEE}/status/${id}`, { status } );


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


//PRoject insert
export const ProjectInsertApi = (data) =>
  ProjectClient.post(`${AUTH_API.PROJECT}/projects`,data);
//Project Getall
export const ProjectFetchAllApi = () =>
  ProjectClient.get(`${AUTH_API.PROJECT}/projects`);
//project assign to employee
export const ProjectAssignApi = (projectId, employeeId, role = "employee") => {
  return ProjectClient.post(
    `${AUTH_API.PROJECT}/projects/${projectId}/assign?employeeId=${employeeId}&role=${role}`
  );
}
//assigned project 
export const ProjectFetchAssignApi = (employeeId) => {
  return ProjectClient.get(
    `${AUTH_API.PROJECT}/projects/employee/${employeeId}`
  );
};
//fetch all project and user 
export const ProjectFetchAllDetailsApi = () => {
  return ProjectClient.get(
    `${AUTH_API.PROJECT}/projects/assignments`
  );
};
// Employee Attendance
//save all for attendance
export const AttendanceSaveallApi = (employeename,employeeId, projectId, formData) => {
  return AttendanceClient.post(
    `${AUTH_API.ATTENDANCE}/attendance/saveall?employeename=${employeename}&employeeId=${employeeId}&projectId=${projectId}`,
  formData);
};


// fetch Existing  week data 
export const AttendanceFetchExistingWeekApi =({ employeeId, projectId, startDate })=>{
  return AttendanceClient.get(
    `${AUTH_API.ATTENDANCE}/attendance/week`, {
    params: { employeeId, projectId, startDate },
  });
};
// fetch Existing  month data 
export const AttendanceFetchExistingMonthApi = ({ employeeId, startDate ,endDate }) => {
  return AttendanceClient.get(
    `${AUTH_API.ATTENDANCE}/attendance/month/range`, {
      params: { employeeId, startDate, endDate },
    }
  );
};


//fetch all data from attendance
export const AttendanceFetchAllApi =()=>{
  return AttendanceClient.get(
    `${AUTH_API.ATTENDANCE}/attendance`
  );
};


// Fetch attendance by employee and project
export const AttendanceFetchByEmployeeProjectApi = (employeeId, projectId) => {
  return AttendanceClient.get(`${AUTH_API.ATTENDANCE}/attendance/employee/${employeeId}/project/${projectId}`);
};



//fetch release-week
    export const AttendanceReleaseWeekApi = (employeeId,weekStart,weekEnd, employeeName ) => {
  return AttendanceClient.post(
    `${AUTH_API.ATTENDANCE}/attendance/release-weekly`,
    null,
    {
      params: { employeeId,weekStart,weekEnd, employeeName }
    }
  );
};

//fetch release-month
    export const AttendanceReleaseMonthApi = (employeeId, projectId,monthStart,monthEnd, employeeName) => {
  return AttendanceClient.post(
    `${AUTH_API.ATTENDANCE}/attendance/release-monthly`,
    null,
    {
      params: { employeeId,projectId, monthStart,monthEnd, employeeName }
    }
  );
};
//Admin Attendance
//In AttendanceAdmin fetch weekly data by using employeeId

export const AdminAttendancFetchWeeklyDataByIdApi = (employeeId, from,to) => {
  return AttendanceClient.get(
    `${AUTH_API.ADMIN}/attendance/pending-weekly?employeeId=${employeeId}&from=${from}&to=${to}`)
};

//Admin Approved a Weekly Employee Attendance
export const Admin_Approve_Weekly_Attendance_Api = (employeeId, from, to) => {
  return AttendanceClient.put(
    `${AUTH_API.ADMIN}/attendance/weekly/approve`,
    { employeeId, from, to }  // correct
  );
};



//Admin monthly attendance Fetch
export const AdminAttendancFetchMonthlyDataByIdApi = (employeeId, from,to) => {
  return AttendanceClient.get(
    `${AUTH_API.ADMIN}/attendance/pending-monthly?employeeId=${employeeId}&from=${from}&to=${to}`)
};

//Admin Approved a Weekly Employee Attendance
export const Admin_Approve_monthly_Attendance_Api = (employeeId, from,to) => {
  return AttendanceClient.put(
    `${AUTH_API.ADMIN}/attendance/monthly/approve`,
    { employeeId, from ,to },
  );
};


export const AttendanceFetchAllbasedonMonthApi = (periodType, from, to) => {
  return AttendanceClient.get(
    `${AUTH_API.ATTENDANCE}/attendance/approval-summary?periodType=${periodType}&startDate=${from}&endDate=${to}`
  );
};

  // Apply parental leave (employee)
export const applyParentalLeaveApi = (data) =>
  AttendanceClient.post(`${AUTH_API.EMPLOYEE}/attendance/apply-parental`, data);



// Approve/reject parental leave (admin)
export const approveParentalLeaveApi = (data) =>
  AttendanceClient.put(`${AUTH_API.ADMIN}/attendance/approve-parental`, data);

// Fetch pending parental leaves (admin only)
export const fetchPendingParentalLeavesApi = () =>
  AttendanceClient.get(`${AUTH_API.ADMIN}/attendance/pending-parental`);

export const AttendanceCheckLeaveEligibilityApi = (employeeId, leaveType, requestedDays = 1) => {
  return AttendanceClient.get(`${AUTH_API.ATTENDANCE}/attendance/check-leave-eligibility`, {
    params: { employeeId, leaveType, requestedDays },
  });
};


export const Admin_Reject_Weekly_Attendance_Api = (employeeId, from, to) => {
  return AttendanceClient.post(
    `${AUTH_API.ADMIN}/attendance/weekly/reject`,
    { employeeId, from, to }
  );
};

// === Fetch Leaves of Employee ===
export const fetchEmployeeLeavesApi = (employeeId) => {
  return AttendanceClient.get(`${AUTH_API.ATTENDANCE}/employee/${employeeId}/leaves`);
};

//  Reject Monthly Attendance
export const Admin_Reject_Monthly_Attendance_Api = (employeeId, from, to) => {
  return AttendanceClient.post(
    `${AUTH_API.ADMIN}/attendance/monthly/reject`,
    { employeeId, from, to }
  );
};

export const fetchAuditLogsApi = () => {
  return AttendanceClient.get(`${AUTH_API.ADMIN}/audit-logs`);
};


// Public ADD Holidays 
export const saveHolidayApi = (formData) =>{
 return AttendanceClient.post(`${AUTH_API.ATTENDANCE}/holidays`, formData);

}
//update holidays 
export const updateHolidayApi = (id,formData) =>{
 return AttendanceClient.put(`${AUTH_API.ATTENDANCE}/holidays/${id}`,formData);
}
//delete
export const deleteHolidayApi =(id)=>{
  return AttendanceClient.delete(`${AUTH_API.ATTENDANCE}/holidays/${id}`);
}

// ================= Employee Document Upload (Admin) =================
export const uploadEmployeeDocumentsApi = (employeeId, data) => {
  const formData = new FormData();

  // Append single files
  if (data.passbook) formData.append("passbook", data.passbook);
  if (data.aadhaar) formData.append("aadhaar", data.aadhaar);
  if (data.pan) formData.append("pan", data.pan);

  // Append multiple files
  if (data.educational_docs && data.educational_docs.length > 0) {
    data.educational_docs.forEach((file) => {
      formData.append("educational_docs", file);
    });
  }

  if (data.experience_docs && data.experience_docs.length > 0) {
    data.experience_docs.forEach((file) => {
      formData.append("experience_docs", file);
    });
  }

  return adminClient.post(
    `${AUTH_API.ADMIN}/employees/${employeeId}/upload-documents`,
    formData
  );
};
