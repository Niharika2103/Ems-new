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

import { adminLogoutApi, superAdminLogoutApi } from "../../api/authApi";
import { decodeToken } from "../../api/decodeToekn";

const Sidebar = ({ isOpen, handleClose }) => {

  const adminRole = useSelector((state) => state.adminSlice?.role);
  const authRole = useSelector((state) => state.authSlice?.role);
  const employeeRole = useSelector((state) => state.employeeSlice?.role);

  const profilePhoto =
    useSelector((state) => state.employeeDetails?.profile?.profile_photo) ||
    JSON.parse(localStorage.getItem("user"))?.profile_photo ||
    "/default-user.jpg";

  const role =
    adminRole ||
    authRole ||
    employeeRole ||
    localStorage.getItem("role");

  const baseRole = role || localStorage.getItem("role");

  const activeRole =
    localStorage.getItem("active_role") || baseRole;

  const employment_type = localStorage.getItem("employment_type");

  const [email, setEmail] = useState("");

  /* ------------------ LOAD USER EMAIL ------------------ */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const decoded = await decodeToken();
        const stored = JSON.parse(localStorage.getItem("user") || "null");
        const finalEmail = decoded?.email || stored?.email || "";
        setEmail(finalEmail);
      } catch (err) {
        console.error("Decode Error:", err);
      }
    };
    loadUser();
  }, []);

  /* ------------------ EMPLOYEE MENUS ------------------ */
  let employeeMenus = [];

  if (employment_type === "freelancer") {
    employeeMenus = [
      { name: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },
      { name: "Job Posting", icon: <Briefcase size={20} />, path: "/JobPostDashboard" },
      { name: "Attendance", icon: <Calendar size={20} />, path: "/dashboard/emp_attendance" },
      { name: "Payments", icon: <Users size={20} />, path: "/freelancer/payments" },
    ];
  } else if (employment_type === "contract") {
    employeeMenus = [
      { name: "Dashboard", icon: <Home size={20} />, path: "/contract/dashboard" },
      { name: "Attendance", icon: <Calendar size={20} />, path: "/contract/attendance" },
      { name: "Payslip", icon: <Users size={20} />, path: "/contract/payslip" },
    ];
  } else {
    employeeMenus = [
      { name: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },
      { name: "Job Posting", icon: <Briefcase size={20} />, path: "/JobPostDashboard" },
      { name: "Attendance", icon: <Calendar size={20} />, path: "/dashboard/emp_attendance" },
      { name: "Payslip", icon: <Users size={20} />, path: "/payslip" },
    ];
  }

  /* ------------------ ADMIN MENUS ------------------ */
  const roleMenus = {
    admin: [
      { name: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },
      { name: "Job Posting", icon: <Briefcase size={20} />, path: "/JobPostDashboard" },
      { name: "Manage Employees", icon: <Users size={20} />, path: "/dashboard/emp_requestTable" },
      { name: "Attendance", icon: <Calendar size={20} />, path: "/dashboard/attendance" },
      { name: "Freelancer", icon: <CheckSquare size={20} />, path: "/dashboard/freelancer" },
      { name: "Accounts", icon: <Calendar size={20} />, path: "/dashboard/accounts" },
      { name: "Reports", icon: <BarChart3 size={20} />, path: "/reports" },
      { name: "Settings", icon: <Settings size={20} />, path: "/settings" },
    ],
    superadmin: [
      { name: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },
      { name: "Manage Admins", icon: <Users size={20} />, path: "/dashboard/superadmin_requestTable" },
      { name: "Audit Logs", icon: <CheckSquare size={20} />, path: "/audit-logs" },
    ],
  };
   
    /* ------------------ VENDOR MENUS ------------------ */
  const vendorMenus = [
    { name: "Dashboard", icon: <Home size={20} />, path: "/dashboard/vendor" },
    { name: "Vendor Info", icon: <Users size={20} />, path: "/dashboard/vendor/info" },
    { name: "Attendance", icon: <Calendar size={20} />, path: "/dashboard/vendor/attendance" },
    { name: "Projects", icon: <Briefcase size={20} />, path: "/dashboard/vendor/projects" },
    { name: "Payments", icon: <BarChart3 size={20} />, path: "/dashboard/vendor/payments" },
    { name: "MoU", icon: <CheckSquare size={20} />, path: "/dashboard/vendor/mou" },
  ];

  // const finalMenus =
  //   role === "employee" ? employeeMenus : roleMenus[role] || [];

  //   const finalMenus =
  //   role === "employee"
  //     ? employeeMenus
  //     : role === "vendor"
  //     ? vendorMenus
  //     : roleMenus[role] || [];

      let finalMenus;

      if (activeRole === "employee") {
        finalMenus = employeeMenus;
      } else if (activeRole === "vendor") {
        finalMenus = vendorMenus;
      } else if (activeRole === "admin") {
        finalMenus = roleMenus.admin;
      } else if (activeRole === "superadmin") {
        finalMenus = roleMenus.superadmin;
      } else {
        finalMenus = employeeMenus;
      }



  /* ------------------ LOGOUT (FIXED) ------------------ */
  const handleLogout = async () => {
    try {
      if (email) {
        if (activeRole === "superadmin") {
          await superAdminLogoutApi(email);
        } else if (activeRole === "admin") {
          await adminLogoutApi(email);
        }
      }
    } catch (error) {
      console.error("Logout API Error:", error);
    }

    localStorage.clear();

    if (activeRole === "admin")
      window.location.replace("/#/admin/login");
    else if (activeRole === "superadmin")
      window.location.replace("/#/superadmin/login");
    else window.location.replace("/#/login");

    if (handleClose) handleClose();
  };

  let displayRole = activeRole?.toUpperCase();

  if (activeRole === "employee") {
    displayRole =
      employment_type === "freelancer"
        ? "FREELANCER"
        : employment_type === "contract"
        ? "CONTRACT"
        : "EMPLOYEE";
  }

  if (activeRole === "vendor") {
    displayRole = "VENDOR";
  }


  return (
    <aside
      className={`font-robo font-medium bg-[#51b4f2] text-white transition-all duration-300 
      flex flex-col ${isOpen ? "w-56" : "w-16"}`}
    >

      {/* ROLE */}
      <div className="flex items-center justify-center py-4">
        {isOpen && <span className="ml-3 text-lg font-bold">{displayRole}</span>}
      </div>

      {/* PROFILE */}
      <div className="flex items-center justify-center py-2">
        <img
          src={profilePhoto}
          alt="User"
          className="w-12 h-12 rounded-full border-2 border-white object-cover"
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
                  `group flex items-center p-2 rounded-l-full transition-all duration-300
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
                      className={`${isOpen ? "mr-3" : ""} 
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
              className="w-full text-left group flex items-center p-2 rounded-l-full
              hover:bg-white hover:text-[#51b4f2] transition-all"
            >
              <span className={`${isOpen ? "mr-3" : ""}`}>
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
