import { useNavigate } from "react-router-dom";
import StatCard from "../../components/StatCard";

// Material UI icons
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SettingsIcon from "@mui/icons-material/Settings";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu"; 
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  
  const stats = [
    {
      title: "Manage Admins",
      message: "Create or remove admin accounts",
      icon: AdminPanelSettingsIcon,
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
      onClick: () => navigate("/dashboard/superadmin_requestTable"),
    },
    {
      title: "System Config",
      message: "Global system configuration",
      icon: SettingsIcon,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      // onClick: () => navigate("/system-config"),
    },
    {
      title: "Audit Logs",
      message: "View system activity logs",
      icon: HistoryEduIcon,
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
      onClick: () => navigate("/audit-logs"),
    },
    {
      title: "Accounts",
      message: "Manage accounts and transactions",
      icon: AccountBalanceIcon,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      // onClick: () => navigate("/accounts"),
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

export default SuperAdminDashboard;
