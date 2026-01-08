import React from "react";
import AdminDashboard from "./AdminDashboard";
import SuperAdminDashboard from "./SuperAdminDashboard";
import EmployeeDashboard from "./EmployeeDashboard";
import { useSelector } from "react-redux";

const Dashboard = () => {

  const reduxRole = useSelector((state) => state.authSlice?.role);

  const baseRole =
    reduxRole ||
    localStorage.getItem("role");

  const role1 = localStorage.getItem("role_1");
  const role2 = localStorage.getItem("role_2");

  const isTempAdmin =
    useSelector((state) => state.employeeSlice?.is_temp_admin) ??
    (localStorage.getItem("is_temp_admin") === "true");

  const activeRole =
    localStorage.getItem("active_role") ||
    baseRole ||
    role1 ||
    role2;

  if (!activeRole) return <div>Loading dashboard…</div>;

  // employee promoted temporarily
  if (activeRole === "employee" && isTempAdmin) {
    return <AdminDashboard />;
  }

  if (activeRole === "superadmin") return <SuperAdminDashboard />;

  if (activeRole === "admin") return <AdminDashboard />;

  return <EmployeeDashboard />;
};

export default Dashboard;
