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

const JobPostDashboard = () => {
  const navigate = useNavigate();


  const stats = [
    {
      title: "Manage Jobs",
      message: "Add, update, or remove employees",
      icon: GroupIcon,
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
      onClick: () => navigate("/published-jobs"),
    },
    {
      title: "Create Jobs",
      message: "Add, update, or remove employees",
      icon: AssignmentIcon,
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
      onClick: () => navigate("/job-postings"),
    },
    {
    title: "Job Info",
    message: "View and manage employee details",
    icon: PersonIcon,
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    onClick: () => navigate("/job-posts"),
   // onClick: () => navigate("/employee/application-tracking"),

  },

  {
      title: "Manage Offers",
      message: "Offer jobs to employees",
      icon: GroupIcon,
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
      onClick: () => navigate("/offers/status"),
    },

  {
      title: "Panel Feedback",
      message: "Manage Candidate FeedBack",
      icon: BarChartIcon,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      onClick: () => navigate("/candidate/feedback"),
    },

    {
      title: "Settings",
      message: "Configure system settings",
      icon: SettingsIcon,
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
    //   onClick: () => navigate("/settings"),
    },
    {
      title: "Accounts",
      message: "Manage accounts and transactions",
      icon: AccountBalanceIcon,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    //   onClick: () => navigate("/accounts/salary-structure"),
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

export default JobPostDashboard;
