import { useNavigate } from "react-router-dom";
import StatCard from "../../components/StatCard";

// Material UI icons
import GroupIcon from "@mui/icons-material/Group";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const AdminDashboard = () => {
  const navigate = useNavigate();


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
          title: "Attendance",
          // value: "18",
          message: "Check your daily attendance",
          icon: AccessTimeIcon,
          iconBg: "bg-sky-100",
          iconColor: "text-sky-600",
          onClick: () => navigate("/attendance"),
        },
    {
      title: "Reports",
      message: "View performance reports",
      icon: BarChartIcon,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      onClick: () => navigate("/reports"),
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
      onClick: () => navigate("/accounts"),
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
