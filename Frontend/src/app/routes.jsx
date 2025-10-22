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
import ProjectDashboard from "../pages/dashbaord/ProjectDashboard";
import Letters from "../pages/documents/Letters";
import MonthlyTimesheet from "../pages/Attendance/MonthlyTimesheet";
import MaternityPaternityLeaveTable from "../pages/Attendance/MaternityPaternityLeaveTable";

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
            <ProtectedRoute allowedRoles={["employee" ,"admin"]}>
              <EmployeeAssignedProjectPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cal"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <LeaveCalendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/projects"
          element={
            <ProtectedRoute allowedRoles={["employee","admin"]}>
              <AssignProjectPage />
            </ProtectedRoute>
          }
        />

        {/* Dashboard & profile (accessible to all logged-in users) */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />

         <Route
          path="/dashboard/employeeinfo/employeeprofile"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeProfile/>
            </ProtectedRoute>
          }
        />
       


        {/* Superadmin routes */}
        <Route
          path="/dashboard/superadmin_requestTable"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
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
          path="/dashboard/emp_info"
          element={
            <ProtectedRoute allowedRoles={["admin","employee"]}>
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
            <ProtectedRoute allowedRoles={["admin","employee"]}>
              <Letters />
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
              < MaternityPaternityLeaveTable/>
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>

    
  );
}

export default AppRoutes;
