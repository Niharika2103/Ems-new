import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";

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
import AdminTable from "../pages/MyProfile/adminTable";
import SuperAadminTable from "../pages/MyProfile/superadminTable";
import LeaveCalendar from "../pages/Calender";
import LeaveType from "../pages/Attendance/LeaveType";
import AssignProjectPage from "../pages/Attendance/index";
import ResetPassword from "../pages/Auth/ResetPassword";
import EmpInfoDashboard from "../pages/dashbaord/EmpInfoDashboard";

function AppRoutes() {
  return (
    <Routes>
      {/* Without layout */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/register" element={<AdminRegisterPage />} />
      <Route path="/superadmin/login" element={<SuperAdminLogin />} />
      <Route path="/superadmin/register" element={<SuperAdminRegister />} />
      <Route path="/attendance/leavetype" element={<LeaveType />} />
          <Route path="/login/reset-password" element={<ResetPassword/>}/>
      {/* With layout */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
         <Route path="/attendance" element={<AssignProjectPage />} />
         {/*Employee List*/}
        <Route path="/dashboard/emp_requestTable" element={<AdminTable />} />
        <Route path="/dashboard/superadmin_requestTable" element={<SuperAadminTable />} />
         <Route path="/dashboard/emp_info" element={<EmpInfoDashboard />} />

        <Route path="/cal" element={<LeaveCalendar />} />
           {/* employee Registeration */}
        <Route path="/employee_register" element={<EmployeeRegisterForm />} />
    
      </Route>
    </Routes>
  );
}

export default AppRoutes;
