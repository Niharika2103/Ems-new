import { superadminClient,employeeClient,adminClient,ProjectClient,AttendanceClient,
  SalaryStructureClient, freelancerClient ,vendorClient,settingsClient } from "./axiosClient";
import { AUTH_API } from "../utils/constants";


// ================= SuperAdmin =================
export const checkEmailApi = (email) =>
  superadminClient.post(`${AUTH_API.SUPERADMIN}/check-email`, { email });

export const superadminRegisterApi = (data) =>
  superadminClient.post(`${AUTH_API.SUPERADMIN}/register`, data);

export const superadminLoginApi = (data) =>
  superadminClient.post(`${AUTH_API.SUPERADMIN}/login`, data);

//Superadmin auditlogs

//  Get All SuperAdmin Audit Logs
export const getAllSuperAdminAuditLogsApi = () =>
  adminClient.get(`${AUTH_API.SUPERADMIN}/audit-logs`);


//  SuperAdmin Logout API (same style as admin)
export const superAdminLogoutApi = (email) => {
  console.log("Calling backend SuperAdmin logout with email:", email);
  return adminClient.post(`${AUTH_API.SUPERADMIN}/logout`, { email });
};

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

// export const updateAdminProfileApi = (data, id) => {
//   const formData = new FormData();

//   Object.keys(data).forEach((key) => {
//     if (data[key] !== null && data[key] !== undefined) {
//       if (key === "profilePhoto" && data[key] instanceof File) {
//         formData.append("profilePhoto", data[key]);
//       } else if (key === "resume" && data[key] instanceof File) {
//         formData.append("resume", data[key]);
//       } else {
//         formData.append(key, data[key]);
//       }
//     }
//   }
// );

//   return adminClient.put(`${AUTH_API.ADMIN}/adminprofile-update/${id}`, formData);
// };
export const updateAdminProfileApi = (formData, id) => {
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

// ================= Admin Job Posts =================

export const createAdminJobPostApi = (data) =>
  adminClient.post(`${AUTH_API.ADMIN}/admin/job-posts`, data);

export const getAdminJobPostsApi = () =>
  adminClient.get(`${AUTH_API.ADMIN}/admin/job-posts`);

export const updateJobStatusApi = (id, status) =>
  adminClient.patch(`${AUTH_API.ADMIN}/admin/job-posts/${id}/status`, {
    status,
    updated_by: "ADMIN_ID_HERE"
  });

// Fetch only published jobs (for employee dashboard)
export const getPublishedJobPostsApi = () =>
  adminClient.get(`${AUTH_API.ADMIN}/jobs`);


export const applyForJobApi = (formData) =>
  adminClient.post(`${AUTH_API.ADMIN}/applications/apply`, formData);

export const getAllApplicationsApi = () =>
  adminClient.get(`${AUTH_API.ADMIN}/applications/all`);

export const filterApplicationsApi = (filters) =>
  adminClient.get(`/admin/applications/filter`, {
    params: filters,
  });


// Update application status
export const updateApplicationStatusApi = (application_id, status, extraData = {}) =>
  adminClient.put(
    `${AUTH_API.ADMIN}/applications/status/${application_id}`,
    {
      status,
      ...extraData   // 👈 REQUIRED for interview data
    }
  );

  export const scheduleInterviewApi = (data) =>
  adminClient.post(`${AUTH_API.ADMIN}/interviews/schedule`, data);
//interview cancel and reschdule 
  export const rescheduleInterviewApi = (id, data) =>
  adminClient.put(`/admin/interviews/reschedule/${id}`, data);

export const cancelInterviewApi = (id) =>
  adminClient.put(`/admin/interviews/cancel/${id}`);



  // ✅ ADDED — Parse Resume API (Do NOT DELETE anything)
export const parseResumeApi = (formData) =>
  adminClient.post(`${AUTH_API.ADMIN}/applications/parse-resume`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

// ======================= GET INTERVIEWS BY APPLICATION ID =======================
export const getInterviewsByApplicationApi = (application_id) => {
  return adminClient.get(`/admin/interviews/${application_id}`);
};

// ================== Interview Panels ==================


// ======== Letter Generation API ========
export const generateLetterApi = (payload) =>
  adminClient.post(`${AUTH_API.ADMIN}/letters/generate`, payload);

export const getEmployeeLettersApi = (employeeId) =>
  adminClient.get(`${AUTH_API.ADMIN}/letters/${employeeId}`);

// ⬇️ Download employee letter PDF
export const downloadEmployeeLetterApi = (employeeId, fileName) =>
  employeeClient.get(`${AUTH_API.ADMIN}/letters/download/${employeeId}/${fileName}`,
    { responseType: "blob" }
  );


// Delete letter API
export const deleteLetterApi = (employeeId, filename) =>
  adminClient.delete(`${AUTH_API.ADMIN}/letters/${employeeId}/${filename}`);

export const sendLetterEmailApi = (employeeId, fileName) =>
  adminClient.post(`${AUTH_API.ADMIN}/letters/send-email`, { employeeId, fileName });


// ================= Employee Auth =================

// export const getEmployeeLettersEmployeeApi = (employeeId) =>
//   employeeClient.get(`/letters/${employeeId}`);
export const getEmployeeLettersEmployeeApi = (employeeId) => {
  return employeeClient.get(`/employee/letters/${employeeId}`);
};

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

// Fetch only FULL-TIME employees (for HR Analytics)
export const fetchFullTimeEmployeesApi = () =>
  employeeClient.get(`${AUTH_API.EMPLOYEE}/employees/fulltime`);


export const FetchFreelancerApi = () =>
  employeeClient.get(`${AUTH_API.EMPLOYEE}/freelancers` );

//Delete All Employee
export const employeeDeleteApi = (id,status) =>
  employeeClient.put(`${AUTH_API.EMPLOYEE}/status/${id}`, { status } );


//Profile get by using email
export const getProfileApi = (email) =>
  employeeClient.get(`${AUTH_API.EMPLOYEE}/get/${email}`);
//fetch all employee role role1 role2
export const fetchallemployeeApi = (email) =>
  employeeClient.get(`${AUTH_API.EMPLOYEE}/fetch/${email}`);

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
export const ProjectAssignApi = (projectId, employeeId, role = "employee",employee_type) => {
  return ProjectClient.post(
    `${AUTH_API.PROJECT}/projects/${projectId}/assign?employeeId=${employeeId}&role=${role}&employee_type=${employee_type}`
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

//PayslipDownload

export const downloadPayslipApi = (employeeId, month, year) => {
  return SalaryStructureClient.get(`${AUTH_API.SALARYSTRUCTURE}/download/${employeeId}/${month}/${year}`, {
    responseType: "blob",
  });
};
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
//salary structure 
export const createSalaryStructureApi=(formData)=>{
  return SalaryStructureClient.post(`${AUTH_API.SALARYSTRUCTURE}/create`,formData)
}
//get salary 
export const fetchsalarybgidApi=(id)=>{
  return SalaryStructureClient.get(`${AUTH_API.SALARYSTRUCTURE}/last/${id}`)
}
//================Admin upload Employee Doc ===================

export const employeeUploadDocFecthApi=()=>{
  return adminClient.get(`${AUTH_API.ADMIN}/employees-with-docs`)
}
 
export const employeeDocDownloadbyAdminApi = (employeeId, docKey, index, onDownloadProgress) => {
  const url = index !== undefined && index !== null
    ? `${AUTH_API.ADMIN}/download/${employeeId}/${docKey}/${index}`
    : `${AUTH_API.ADMIN}/download/${employeeId}/${docKey}`;

  return adminClient.get(url, {
    responseType: "blob",
    onDownloadProgress,
  });
};




// Upload freelancer documents
export const uploadFreelancerDocsApi = (formData) => {
  return freelancerClient.post(
    `${AUTH_API.FREELANCER}/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// Get API
export const getFreelancerDocsApi = (id) => {
  return freelancerClient.get(`${AUTH_API.FREELANCER}/${id}`);
};

// ============== Referral (Employee) ======================
export const createReferralApi = (formData) => {
  return employeeClient.post(`${AUTH_API.EMPLOYEE}/refer-candidate`, formData);
  
};

export const getMyReferralsApi = (employeeId) => {
  return employeeClient.get(`${AUTH_API.EMPLOYEE}/my-referrals/${employeeId}`);
};

// =============== Referral Management (Admin) ===============
export const getAllReferralsAdminApi = () =>
  adminClient.get(`${AUTH_API.ADMIN}/referrals`);

export const getReferralByIdAdminApi = (referral_id) =>
  adminClient.get(`${AUTH_API.ADMIN}/referrals/${referral_id}`);

export const updateReferralStatusAdminApi = (id, status) =>
  adminClient.put(`${AUTH_API.ADMIN}/referrals/status/${id}`, { status });

// ================= Panel Management APIs =================
export const assignPanelMembersApi = (panelData) =>
  adminClient.post(`${AUTH_API.ADMIN}/panels/assign`, panelData);

export const getAllPanelsApi = () =>
  adminClient.get(`${AUTH_API.ADMIN}/panels`);

// ================= Interview Scheduling APIs =================
export const scheduleInterviewReferralApi = (referral_id, interviewData) =>
  adminClient.post(`${AUTH_API.ADMIN}/interviews/schedule/${referral_id}`, interviewData);

export const rescheduleInterviewReferralApi = (referral_id, interviewData) =>
  adminClient.post(`${AUTH_API.ADMIN}/interviews/reschedule/${referral_id}`, interviewData);

export const getAllInterviewsWithDetailsApi = () =>
  adminClient.get(`${AUTH_API.ADMIN}/interviews/all`);

// ================= Feedback APIs =================
export const addPanelFeedbackApi = (interview_id, feedbackData) =>
  adminClient.post(`${AUTH_API.ADMIN}/interviews/${interview_id}/feedback`, feedbackData);

export const getPanelFeedbackApi = (interview_id) =>
  adminClient.get(`${AUTH_API.ADMIN}/panel-feedback/${interview_id}`);


export const createFreelancerContractApi = (data) => {
  return adminClient.post(`/admin/freelancer-contract/create`, data);
};


export const updateFreelancerContractApi = (contractId, data) => {
  return adminClient.put(`/admin/freelancer-contract/update/${contractId}`, data);
};

export const cancelFreelancerContractApi = (contractId) => {
  return adminClient.patch(`/admin/freelancer-contract/cancel/${contractId}`);
};


export const updateFreelancerContractStatusApi = (contractId, status) => {
  return adminClient.patch(`/admin/freelancer-contract/status/${contractId}`, { status });
};


export const renewFreelancerContractApi = (contractId, newEndDate) => {
  return adminClient.patch(`/admin/freelancer-contract/renew/${contractId}`, {
    new_end_date: newEndDate
  });
};


export const fetchFreelancerContractsApi = (freelancerId) => {
  return adminClient.get(`/admin/freelancer-contract/freelancer/${freelancerId}`);
};


export const fetchAllFreelancerContractsApi = () => {
  return adminClient.get(`/admin/freelancer-contract/all`);
};


export const fetchFreelancerContractByIdApi = (contractId) => {
  return adminClient.get(`/admin/freelancer-contract/${contractId}`);
};

// ================= Freelancer HR Analytics =================
export const getFreelancerHRAnalyticsApi = () =>
  adminClient.get(`/admin/freelancers/analytics`);

//Auditlogs

export const getAllAdminAuditLogsApi = () =>
  adminClient.get(`${AUTH_API.ADMIN}/audit-logs`);

export const adminLogoutApi = (email) => {
  console.log("Calling backend logout with email:", email);

  return adminClient
    .post(`${AUTH_API.ADMIN}/admin/logout`, { email })
    .then((res) => {
      console.log("Logout API CALLED SUCCESSFULLY", res.data);
      return res;
    })
    .catch((err) => {
      console.error("Logout API ERROR:", err);
      throw err;
    });
};

//Probation 
export const fetchNewEmployeeApi =()=>{
  return adminClient.get(`${AUTH_API.ADMIN}/new-employees`);
}
//creating probation 
export const createProbationPeriodApi =(payload)=>{
  return adminClient.post(`${AUTH_API.ADMIN}/store-probation`,payload);
}
//fetch assign Probation 
export const fetchassignProbationApi =()=>{
  return adminClient.get(`${AUTH_API.ADMIN}/probation/user`)
}

// / ================== INVOICE APIs ======================
export const createInvoiceApi = (data) =>
  adminClient.post(`${AUTH_API.ADMIN}/invoices/create`, data);

export const getAllInvoicesApi = () =>
  adminClient.get(`${AUTH_API.ADMIN}/invoices/all`);

export const getInvoiceByIdApi = (invoiceId) =>
  adminClient.get(`${AUTH_API.ADMIN}/invoices/${invoiceId}`);

export const updateInvoiceStatusApi = (invoiceId, status, updatedBy) =>
  adminClient.put(`${AUTH_API.ADMIN}/invoices/status/${invoiceId}`, {
    status,
    updated_by: updatedBy,
  });

export const generateInvoicePdfApi = (invoiceId) =>
  adminClient.get(`${AUTH_API.ADMIN}/invoices/pdf/${invoiceId}`);

export const sendInvoiceReminderApi = (invoiceId) =>
  adminClient.post(`${AUTH_API.ADMIN}/invoices/reminder/${invoiceId}`);

export const deleteInvoiceApi = (invoiceId) =>
  adminClient.delete(`${AUTH_API.ADMIN}/invoices/${invoiceId}`);


// ================= Vendor Auth =================
export const vendorRegisterApi = (data) =>
  vendorClient.post(`${AUTH_API.VENDOR}/vendor/register`, data); // backend route

export const vendorLoginApi = (data) =>
  vendorClient.post(`${AUTH_API.VENDOR}/vendor/login`, data);

export const vendorForgotPasswordApi = (data) =>
  vendorClient.post(`${AUTH_API.VENDOR}/vendor/forgot-password`, data);

export const vendorResetPasswordApi = (data) =>
  vendorClient.post(`${AUTH_API.VENDOR}/vendor/reset-password`, data);

// Fetch freelancer project assignments
export const fetchFreelancerAssignmentsApi = () =>
  employeeClient.get(`${AUTH_API.EMPLOYEE}/assignments/freelancers`);

export const getMonthlyFinalSummaryApi = (employeeId, year, month) =>
  adminClient.get(
    `${AUTH_API.ADMIN}/monthly-final-summary/${employeeId}/${year}/${month}`
  );

export const validatePayrollApi = (data) =>
  adminClient.post(`${AUTH_API.ADMIN}/validate`, data);

// 2️⃣ Run Payroll
export const runPayrollApi = (data) =>
  adminClient.post(`${AUTH_API.ADMIN}/run`, data);

// 3️⃣ Reverse Payroll
export const reversePayrollApi = (data) =>
  adminClient.post(`${AUTH_API.ADMIN}/reverse`, data);

// 4️⃣ Rerun Payroll
export const rerunPayrollApi = (data) =>
  adminClient.post(`${AUTH_API.ADMIN}/rerun`, data);

// 5️⃣ Get all Payroll Records
export const getAllPayrollApi = () =>
  adminClient.get(`${AUTH_API.ADMIN}/payroll`);

// Performance Review APIs
// export const submitSelfReviewApi = (data) =>
//   employeeClient.post(`/employee/performance/submit`, data);
// authApi.js or employeeApi.js
export const submitSelfReviewApi = (data) => {
  return employeeClient.post(`/employee/performance/submit`, data);
};

export const updateTLReviewApi = (id, data) =>
  adminClient.put(`/admin/performance/update/${id}`, data);

export const fetchAllPerformanceReviewsApi = () =>
  adminClient.get(`/admin/performance/all`);

export const fetchFinalRatingsApi = () =>
  adminClient.get(`/admin/performance/final-ratings`);


//payroll analytics
// export const getMonthlyPayrollSummaryApi = (month, year) =>
//   adminClient.get(`${AUTH_API.ADMIN}/payroll/summary?month=${month}&year=${year}`);

// PAYROLL SUMMARY
// PAYROLL SUMMARY
export const getMonthlyPayrollSummaryApi = (month, year) =>
  adminClient.get(`/admin/payroll/summary?month=${month}&year=${year}`);

// DEPT PAYROLL
export const getDepartmentWisePayrollApi = (month, year) =>
  adminClient.get(`/admin/payroll/department-wise?month=${month}&year=${year}`);

// TREND
export const getPayrollTrendApi = (limit = 6) =>
  adminClient.get(`/admin/payroll/trend?limit=${limit}`);

// TREND 3 MONTHS
export const getPayrollTrend3Api = () =>
  adminClient.get(`/admin/payroll/trend/3-months`);

// TREND 12 MONTHS
export const getPayrollTrend12Api = () =>
  adminClient.get(`/admin/payroll/trend/12-months`);
//branding settings APIs

export const fetchSettings = () => {
  return settingsClient.get(`${AUTH_API.SETTINGS}/system-settings`);
};

export const updateBranding = (formData) => {
  return settingsClient.put(
    `${AUTH_API.SETTINGS}/system-settings/branding`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const updateWhiteLabel = (data) =>{
 return settingsClient.put(`${AUTH_API.SETTINGS}/system-settings/white-label`, data);
}
export const getTenantBrandingApi = (tenantKey) => {
  return settingsClient.get(`${AUTH_API.SETTINGS}/system-settings/tenants/${tenantKey}/branding`);
};

export const updateTenantBrandingApi = (tenantKey, formData) => {
  return settingsClient.put(`${AUTH_API.SETTINGS}/system-settings/tenants/${tenantKey}/branding`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

//whatsapp template 
export const getTemplatesApi = () =>{
  return settingsClient.get(`${AUTH_API.SETTINGS}/whatsapp/template/fetch`);
}

export const createTemplateApi = (data) =>
  {
  return settingsClient.post(`${AUTH_API.SETTINGS}/whatsapp/template`, data);
}


export const updateTemplateApi = (id, data) =>
   {
  return settingsClient.put(`${AUTH_API.SETTINGS}/whatsapp/template/${id}`, data);
}

export const updateTemplateStatusApi = (id, status) =>
   {
  return settingsClient.patch(`${AUTH_API.SETTINGS}/whatsapp/template/${id}/status`, { status });

}

export const deleteTemplateApi = (id) =>{
   return settingsClient.delete(`${AUTH_API.SETTINGS}/whatsapp/template/${id}`);
}
// ================= Leave Policy (Admin Settings) =================

// Get all leave types
export const getLeaveTypesApi = () =>
  adminClient.get(`/admin/settings/getleave-types`);

// Create leave type
export const createLeaveTypeApi = (data) =>
  adminClient.post(`/admin/settings/leave-types`, data);

// Update leave type
export const updateLeaveTypeApi = (id, data) =>
  adminClient.put(`/admin/settings/leave-types/${id}`, data);

// Enable / Disable leave type
export const toggleLeaveTypeStatusApi = (id, isActive) =>
  adminClient.patch(`/admin/settings/leave-types/${id}/status`, { isActive });

