import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/Layout/ProtectedRoute";

// Pages
import LandingPage from "../pages/Auth/LandingPage";
import Login from "../pages/Auth/Login";
import AdminLogin from "../pages/Auth/AdminLogin";
import AdminRegisterPage from "../pages/Auth/AdminRegisterPage";
import SuperAdminLogin from "../pages/Auth/SuperAdminLogin";
import SuperAdminRegister from "../pages/Auth/SuperAdminRegister";
import EmployeeRegisterForm from "../pages/Auth/EmpRegister";
import EmpPayslip from "../pages/Auth/EmpPayslip";
import Dashboard from "../pages/dashbaord/Dashboard";
import Profile from "../pages/MyProfile/Profile";
import EmployeeProfile from "../pages/MyProfile/EmployeeProfile";
import AdminTable from "../pages/MyProfile/adminTable";
import SuperAadminTable from "../pages/MyProfile/superadminTable";
import LeaveCalendar from "../pages/Calender";
import EmpTimesheet from "../pages/Attendance/EmployeeTimesheet";
import Timesheet from "../pages/Attendance/Timesheet";
import AssignProjectPage from "../pages/Attendance/index";
import ResetPassword from "../pages/Auth/ResetPassword";
import EmpInfoDashboard from "../pages/dashbaord/EmpInfoDashboard";
import ProjectForm from "../pages/Attendance/ProjectFrom";
import EmployeeAssignedProjectPage from "../pages/Attendance/EmployeeAssignedProjectPage";
import ProjectTable from "../pages/Attendance/ProjectTable";
import TimesheetTable from "../pages/Attendance/Timesheettable";
import AuditLogs from "../pages/Attendance/AuditLogs";
import FinancialYearSetup from '../pages/Attendance/FinancialYearSetup';
import ProjectDashboard from "../pages/dashbaord/ProjectDashboard";
import Letters from "../pages/documents/Letters";
import AdminLetterGenerator from "../pages/documents/AdminLetterGenerator";
import EmployeeDocumentUpload from '../pages/documents/EmployeeDocumentUpload';
import MonthlyTimesheet from "../pages/Attendance/MonthlyTimesheet";
import EmployeeLeave from "../pages/Attendance/EmployeeLeave";
import LettersDownload from '../pages/documents/LettersDownload';
import EmployeeDocumentList from '../pages/documents/EmployeeDocumentList';
import MaternityPaternityLeaveTable from "../pages/Attendance/MaternityPaternityLeaveTable";
import EmpAttendanceDashboard from "../pages/dashbaord/EmpAttendanceDashboard";
import AuditLogsTable from "../pages/Attendance/AuditLogs";
import EmployeeHolidayList from "../pages/Attendance/EmployeeHolidayList";
import FreelancerDashboard from  "../pages/dashbaord/FreelancerDashboard";
import FreelancerInfo from  "../pages/Freelancer/FreelancerInfo";
import FreelancerTable from  "../pages/Freelancer/freelancerTable";
import FreelancerAttendance from  "../pages/Freelancer/FreelancerAttendance";
import FreelancerHolidayList from  "../pages/Freelancer/FreelancerHolidayList";
import FreelancerProjectTable from  "../pages/Freelancer/FreelancerProjectTable";
import FreelancerDocuments from  "../pages/Freelancer/FreelancerDocuments";
import EmployeeList from '../pages/Freelancer/Documents/EmployeeList';
import FreelancerAssignProjectpage from  "../pages/Freelancer/FreelancerAssignProjectpage";
import TimesheetApprovalList from '../pages/Freelancer/Attendance/TimesheetApprovalList';
import ContractManager from "../pages/Freelancer/ContractManager";
import ReferCandidatePage from "../pages/Referral/ReferCandidatePage";
import AdminReferralDashboard from '../pages/Referral/AdminReferralDashboard';
import SalaryStructure from '../pages/Accounts/SalaryStructure';
import EmpTypeFreelancerDashboard from '../pages/dashbaord/EmpTypeFreelancerDashboard';
import CreateJobList from "../pages/JobPosting/CreateJobList";
import JobPostDashboard from "../pages/dashbaord/JobPostDashboard";
import JobPosts from "../pages/JobPosting/JobPosts"; 
import ApplyJob from "../components/ApplyJob";
import PublishedJobs from "../pages/JobPosting/PublishedJobs";
import JobApplicationTracking from "../pages/JobPosting/JobApplicationTracking";


function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/register" element={<AdminRegisterPage />} />
      <Route path="/superadmin/login" element={<SuperAdminLogin />} />
      <Route path="/superadmin/register" element={<SuperAdminRegister />} />
      <Route path="/login/reset-password" element={<ResetPassword />} />


      <Route path="/attendance/emptimesheet" element={<EmpTimesheet />} />
      <Route path="/attendance/timesheet" element={<Timesheet />} />
      <Route path='/dashboard/timesheet/monthly'
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <MonthlyTimesheet />
          </ProtectedRoute>
        }
      />
      {/* Routes with Layout */}
      <Route element={<Layout />}>
        {/* Employee routes */}
        <Route
          path="/dashboard/assign_project"
          element={
            <ProtectedRoute allowedRoles={["employee", "admin"]}>
              <EmployeeAssignedProjectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/freelancer_dashboard"
          element={
            <ProtectedRoute>
              <EmpTypeFreelancerDashboard />
            </ProtectedRoute>
          }

        />
        <Route path="/payslip" element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <EmpPayslip />
          </ProtectedRoute>
        } />



        <Route path="dashboard/employee/leave" element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <EmployeeLeave />
          </ProtectedRoute>
        } />
        <Route
          path="/cal"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <LeaveCalendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/freelancer"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <FreelancerDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/admin/freelancer-documents" 
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
              <EmployeeList />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/accounts/salary-structure"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SalaryStructure />
            </ProtectedRoute>
          }
        />

        
        <Route path="/job-postings"
         element={
           <ProtectedRoute allowedRoles={[ "admin"]}>
              <CreateJobList />
            </ProtectedRoute>
          }
        />

       <Route path="/dashboard/JobPostDashboard"
         element={
           <ProtectedRoute allowedRoles={["employee", "admin"]}>
              <JobPostDashboard />
            </ProtectedRoute>
          }
        />
          <Route path="/job-posts" 
          element={
           <ProtectedRoute allowedRoles={["employee"]}>
              <JobPosts />
            </ProtectedRoute>
          }
        />

        <Route path="/apply-job" 
        element={
           <ProtectedRoute allowedRoles={["employee"]}>
              <ApplyJob />
            </ProtectedRoute>
          }
        />
       <Route path="/published-jobs"
        element={
           <ProtectedRoute allowedRoles={["admin"]}>
              <PublishedJobs />
            </ProtectedRoute>
          }
        />
        
       <Route
          path="/employee/application-tracking"
          element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <JobApplicationTracking />
             </ProtectedRoute>}
        />


        <Route
          path="/attendance/projects"
          element={
            <ProtectedRoute allowedRoles={["employee", "admin"]}>
              <AssignProjectPage />
            </ProtectedRoute>
          }
        />

        <Route path="/financial-year-setup" element={<FinancialYearSetup />} />

        {/* Dashboard & profile (accessible to all logged-in users) */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Profile />
            </ProtectedRoute>
          } />

        <Route
          path="/dashboard/employeeinfo/employeeprofile"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeProfile />
            </ProtectedRoute>
          } />

        <Route
          path="/dashboard/emp_attendance"
          element={
            <ProtectedRoute allowedRoles={["employee", "admin"]}>
              <EmpAttendanceDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/employee/holiday"
          element={
            <ProtectedRoute allowedRoles={["employee", "admin"]}>
              <EmployeeHolidayList />
            </ProtectedRoute>
          }
        />
         <Route
          path="/dashboard/freelancer/holiday"
          element={
            <ProtectedRoute allowedRoles={["employee", "admin"]}>
              <FreelancerHolidayList />
            </ProtectedRoute>
          }
        />
        <Route path="/freelancer/contract-manager"
         element={
           <ProtectedRoute allowedRoles={["employee", "admin"]}>
              <ContractManager />
            </ProtectedRoute>
         } />

        {/* Superadmin routes */}
        <Route
          path="/dashboard/superadmin_requestTable"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <SuperAadminTable />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/dashboard/emp_requestTable"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminTable />
            </ProtectedRoute>
          }
        />

        

        <Route
          path="/dashboard/freelancer/info"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <FreelancerTable />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/freelancer/freelancerinfo"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <FreelancerInfo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/freelancer/freelancerattendance"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <FreelancerAttendance />
            </ProtectedRoute>
          }
        />
        <Route path="/freelancer/attendance/timesheet-approval"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TimesheetApprovalList />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/freelancer/projects"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <FreelancerProjectTable />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/freelancer/assign_projects"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <FreelancerAssignProjectpage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/freelancer/documents"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <FreelancerDocuments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/emp_info/referral"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <ReferCandidatePage />
            </ProtectedRoute>
          }
        />

        <Route path="/admin/referrals"
         element={
              <ProtectedRoute allowedRoles={["admin"]}>
          <AdminReferralDashboard/>
          </ProtectedRoute>
        }
        />
         



        {/* <Route path="/freelancer/projects" element={<FreelancerProjectTable />} /> */}

        <Route
          path="/dashboard/emp_info"
          element={
            <ProtectedRoute allowedRoles={["admin", "employee"]}>
              <EmpInfoDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/add_project"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ProjectForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/fetch_project"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ProjectTable />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee_register"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EmployeeRegisterForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/attendance"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ProjectDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/audit-logs"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              < AuditLogsTable />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/timesheettable"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TimesheetTable />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/letters"
          element={
            <ProtectedRoute allowedRoles={["admin", "employee"]}>
              <Letters />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/employees"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EmployeeDocumentUpload />
            </ProtectedRoute>
          }
        />

        
          <Route path="/employee/documents/list" 
          element={
          <ProtectedRoute allowedRoles={["admin"]}>
              <EmployeeDocumentList  />
            </ProtectedRoute>
          }
        />
        
        <Route path="/employee/letters" 
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
              <LettersDownload />
            </ProtectedRoute>
          }
        />

        <Route path="/documents/admin/letters"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              < AdminLetterGenerator />
            </ProtectedRoute>
          }
        />

        {/* 👇 Admin Dashboard page for Maternity & Paternity Leaves
        <Route
          path="/maternity-paternity-leaves"
          element={<MaternityPaternityLeaveTable />}
        /> */}

        <Route
          path="/attendance/maternity-paternity-leaves"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              < MaternityPaternityLeaveTable />
            </ProtectedRoute>
          }
        />
         
      </Route>

    </Routes>


  );
}

export default AppRoutes;
