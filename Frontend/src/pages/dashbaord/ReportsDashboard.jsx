import { useNavigate } from "react-router-dom";
import StatCard from "../../components/StatCard";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import PaidIcon from "@mui/icons-material/Paid";
import GavelIcon from "@mui/icons-material/Gavel";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BarChartIcon from "@mui/icons-material/BarChart";

const ReportsDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "HR Analytics",
      message: "Employee trends, hiring stats & HR insights",
      icon: AnalyticsIcon,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      onClick: () => navigate("/reports/hr"),
    },
    {
      title: "Payroll Analytics",
      message: "Salary, PF, ESI breakdown & payroll trends",
      icon: PaidIcon,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      onClick: () => navigate("/reports/payroll"),
    },
    {
      title: "Compliance Reports",
      message: "Statutory compliance & audit-related reports",
      icon: GavelIcon,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      onClick: () => navigate("/reports/compliance"),
    },
    {
      title: "Employee ROI",
      message: "Employee cost vs productivity insights",
      icon: TrendingUpIcon,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      onClick: () => navigate("/dashboard/employee/employeeroi"),
    },
    {
      title: "Custom Reports",
      message: "Build your own report templates",
      icon: BarChartIcon,
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
      onClick: () => navigate("/reports/custom"),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
};

export default ReportsDashboard;
