import React from "react";
import AdminDashboard from "./AdminDashboard"
import SuperAdminDashboard from "./SuperAdminDashboard";
import EmployeeDashboard from "./EmployeeDashboard";
import { useSelector } from "react-redux";


const Dashboard = () => {
  const role =
    localStorage.getItem("role")  ||
    useSelector((state) => state.adminSlice) ||
    useSelector((state) => state.authSlice?.role) ||
    useSelector((state) => state.employeeSlice?.role);
    

     //  ADD THIS LINE — check if user is temp admin
  const is_temp_admin =
    useSelector((state) => state.employeeSlice?.is_temp_admin) ??
    (localStorage.getItem("is_temp_admin") === "true");

    if (!role) {
    return <div>Loading dashboard...</div>;
  }

  if (role === "admin") {
    return <AdminDashboard />;
    <AssignProjectPage/> 
  } else if (role === "superadmin") {
    return <SuperAdminDashboard />;
  } else if (role === "employee" && is_temp_admin) { 
    return <AdminDashboard />;
  } else {
    return <EmployeeDashboard />;
  }
};

export default Dashboard;
