//Sidebar-Auditlogs

import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  Calendar,
  Settings,
  LogOut,
  CheckSquare,
  Briefcase,
  BarChart3,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

// ✅ BOTH LOGOUT APIs
import { adminLogoutApi, superAdminLogoutApi } from "../../api/authApi";
import { decodeToken } from "../../api/decodeToekn";

const Sidebar = ({ isOpen, handleClose }) => {
  const adminRole = useSelector((state) => state.adminSlice?.role);
  const authRole = useSelector((state) => state.authSlice?.role);
  const employeeRole = useSelector((state) => state.employeeSlice?.role);

  const role =
    adminRole ||
    authRole ||
    employeeRole ||
    localStorage.getItem("role");

  const employment_type =
    useSelector((state) => state.employeeSlice?.employment_type) ||
    localStorage.getItem("employment_type");

  // EMAIL for logout
  const [email, setEmail] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const decoded = await decodeToken();
        const stored = JSON.parse(localStorage.getItem("user") || "null");
        const finalEmail = decoded?.email || stored?.email || "";

        setEmail(finalEmail);
        console.log("Sidebar Logout Email:", finalEmail);
      } catch (err) {
        console.error("Decode Error:", err);
      }
    };
    loadUser();
  }, []);

  // ⭐ EMPLOYEE MENUS
  let employeeMenus = [];

  if (employment_type === "freelancer") {
    employeeMenus = [
      { name: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },
      { name: "Job Posting", icon: <Briefcase size={20} />, path: "/JobPostDashboard" },
      { name: "Attendance", icon: <Calendar size={20} />, path: "/dashboard/emp_attendance" },
      // { name: "Tasks", icon: <CheckSquare size={20} />, path: "/freelancer/tasks" },
      { name: "Payments", icon: <Users size={20} />, path: "/freelancer/payments" },
      // { name: "Reports", icon: <BarChart3 size={20} />, path: "/reports" },
    ];
  } else if (employment_type === "contract") {
    employeeMenus = [
      { name: "Dashboard", icon: <Home size={20} />, path: "/contract/dashboard" },
      { name: "Attendance", icon: <Calendar size={20} />, path: "/contract/attendance" },
      // { name: "HR", icon: <CheckSquare size={20} />, path: "/contract/hr" },
      { name: "Payslip", icon: <Users size={20} />, path: "/contract/payslip" },
      // { name: "Reports", icon: <BarChart3 size={20} />, path: "/reports" },
    ];
  } else {
    employeeMenus = [
      { name: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },
      { name: "Job Posting", icon: <Briefcase size={20} />, path: "/JobPostDashboard" },
      { name: "Attendance", icon: <Calendar size={20} />, path: "/emp_attendance" },
      // { name: "HR", icon: <CheckSquare size={20} />, path: "/hr" },
      { name: "Payslip", icon: <Users size={20} />, path: "/payslip" },
      // { name: "Reports", icon: <BarChart3 size={20} />, path: "/reports" },
    ];
  }

  // ⭐ ADMIN + SUPERADMIN MENUS
  const roleMenus = {
    admin: [
      { name: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },
      { name: "Job Posting", icon: <Briefcase size={20} />, path: "/JobPostDashboard" },
      { name: "Manage Employees", icon: <Users size={20} />, path: "/dashboard/emp_requestTable" },
      { name: "Attendance", icon: <Calendar size={20} />, path: "/attendance" },
      { name: "Freelancer", icon: <CheckSquare size={20} />, path: "/freelancer" },
      { name: "Accounts", icon: <Calendar size={20} />, path: "/accounts" },
      { name: "Reports", icon: <BarChart3 size={20} />, path: "/reports" },
      { name: "Settings", icon: <Settings size={20} />, path: "/settings" },
    ],

    superadmin: [
      { name: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },
      { name: "Job Posting", icon: <Briefcase size={20} />, path: "/jobs" },
      { name: "Manage Admins", icon: <Users size={20} />, path: "/manage-admins" },
      { name: "System Config", icon: <Settings size={20} />, path: "/system-config" },
      { name: "Audit Logs", icon: <CheckSquare size={20} />, path: "/audit-logs" },
      { name: "Accounts", icon: <Calendar size={20} />, path: "/accounts" },
      { name: "Reports", icon: <BarChart3 size={20} />, path: "/reports" },
      { name: "Settings", icon: <Settings size={20} />, path: "/settings" },
    ],
  };

  const finalMenus =
    role === "employee" ? employeeMenus : roleMenus[role] || [];

  // ⭐ FIXED LOGOUT — calls correct backend
  const handleLogout = async () => {
    try {
      if (email) {
        if (role === "superadmin") {
          await superAdminLogoutApi(email);
        } else if (role === "admin") {
          await adminLogoutApi(email);
        }
      }
    } catch (error) {
      console.error("Logout API Error:", error);
    }

    localStorage.clear();

    if (role === "admin") window.location.replace("/#/admin/login");
    else if (role === "superadmin") window.location.replace("/#/superadmin/login");
    else window.location.replace("/#/login");

    if (handleClose) handleClose();
  };

  // ROLE DISPLAY
  let displayRole = role?.toUpperCase();
  if (role === "employee") {
    displayRole =
      employment_type === "freelancer"
        ? "FREELANCER"
        : employment_type === "contract"
        ? "CONTRACT"
        : "EMPLOYEE";
  }

  return (
    <aside
      className={`font-robo font-medium bg-[#51b4f2] text-white transition-all duration-300 
        flex flex-col ${isOpen ? "w-56" : "w-16"}`}
    >
      <div className="flex items-center justify-center py-4">
        {isOpen && <span className="ml-3 text-lg font-bold">{displayRole}</span>}
      </div>

      {/* PROFILE IMAGE */}
      <div className="flex items-center justify-center py-2 ml-3">
        <img
          src="/default-user.jpg"
          alt="User"
          className="w-12 h-12 rounded-full border-2 border-white"
        />
      </div>

      {/* MENUS */}
      <div className="flex-1 mt-6 ml-6">
        <ul className="space-y-2">
          {finalMenus.map((item) => (
            <li key={item.name}>
              <NavLink
  to={item.path}
  className={({ isActive }) =>
    `group flex items-center p-2 rounded-l-full cursor-pointer transition-all duration-300
     ${
       isActive
         ? "bg-white text-[#51b4f2] font-semibold shadow-md"
         : "text-white hover:bg-white hover:text-[#51b4f2]"
     }`
  }
>
  {({ isActive }) => (
    <>
      <span
        className={`${isOpen ? "mr-3" : ""} transition-colors duration-300
        ${isActive ? "text-[#51b4f2]" : "group-hover:text-[#51b4f2]"}`}
      >
        {item.icon}
      </span>

      {isOpen && <span>{item.name}</span>}
    </>
  )}
</NavLink>

            </li>
          ))}

          {/* LOGOUT */}
          <li>
            <button
              onClick={handleLogout}
              className="w-full text-left group flex items-center p-2 
              rounded-l-full cursor-pointer hover:bg-white hover:scale-105 text-white"
            >
              <span className={`${isOpen ? "mr-3" : ""} group-hover:text-sky-600`}>
                <LogOut size={20} />
              </span>
              {isOpen && <span>Logout</span>}
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
