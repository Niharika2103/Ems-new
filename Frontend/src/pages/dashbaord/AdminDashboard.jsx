import { useNavigate } from "react-router-dom";
import StatCard from "../../components/StatCard";

// Material UI icons
import GroupIcon from "@mui/icons-material/Group";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BusinessIcon from "@mui/icons-material/Business";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
    const role =
    storedUser?.employment_type ||
    localStorage.getItem("role") ||
    useSelector((state) => state.adminSlice) ||
    useSelector((state) => state.authSlice?.role) ||
    useSelector((state) => state.employeeSlice?.role);

    

  const stats = [
    {
      title: "Manage Employees",
      message: "Add, update, or remove employees",
      icon: GroupIcon,
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
      onClick: () => navigate("/dashboard/emp_requestTable"),
    },
    {
    title: "Employee Info",
    message: "View and manage employee details",
    icon: PersonIcon,
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    onClick: () => navigate("/dashboard/emp_info"),
  },
  {
    title: "Attendance",
    message: "Check your daily attendance records",
    icon: AccessTimeIcon,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    onClick: () => navigate("/dashboard/attendance"),
  },
  {
    title: "Projects",
    message: "View all assigned and active projects",
    icon: AssignmentIcon,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    onClick: () => navigate("/dashboard/fetch_project"),
  },
    {
      title: "Freelancer",
      message: "3rd party Employees reports",
      icon: BarChartIcon,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      onClick: () => navigate("/dashboard/freelancer"),
    },
    {
      title: "Settings",
      message: "Configure system settings",
      icon: SettingsIcon,
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
      onClick: () => navigate("/settings"),
    },
    {
      title: "Accounts",
      message: "Manage accounts and transactions",
      icon: AccountBalanceIcon,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      onClick: () => navigate("/dashboard/accounts"),
    },

     {
      title: "Audits & logs",
      message: "Manage accounts and transactions",
      icon: BarChartIcon,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      onClick: () => navigate("/audits-and-logs"),
    },
       {
      title: "Thirdparty Payroll Hub",
      message: "Manage Business and transactions",
      icon: BusinessIcon,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      onClick: () => navigate("/dashboard/admin-panel"),
    },
  ];

  return (
    <>
      <h3 className="text-xl font-semibold mb-5">Dashboard</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>
    </>
  );
};

export default AdminDashboard;
