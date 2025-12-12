import { useNavigate, useLocation, Link } from "react-router-dom";
import StatCard from "../../../components/StatCard";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import PaidIcon from "@mui/icons-material/Paid";
import GavelIcon from "@mui/icons-material/Gavel";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BarChartIcon from "@mui/icons-material/BarChart";

const FreelancerReports = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const secondLevel = "Freelancer Reports";

  const stats = [
    {
      title: "HR Analytics",
      message: "Employee trends, hiring stats & HR insights",
      icon: AnalyticsIcon,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      onClick: () => navigate("/freelancer/hr"),
    },
    {
      title: "Payroll Analytics",
      message: "Salary, PF, ESI breakdown & payroll trends",
      icon: PaidIcon,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      onClick: () => navigate("/freelancer/payroll"),
    },
    {
      title: "Compliance Reports",
      message: "Statutory compliance & audit-related reports",
      icon: GavelIcon,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      onClick: () => navigate("/freelancer/compliance"),
    },
    {
      title: "Freelancer ROI",
      message: "Freelancer cost vs productivity insights",
      icon: TrendingUpIcon,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      onClick: () => navigate("/freelancer/roi"),
    },
    {
      title: "Custom Reports",
      message: "Build your own report templates",
      icon: BarChartIcon,
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
      onClick: () => navigate("/freelancer/custom"),
    },
  ];

  return (
    <>
      <nav className="text-gray-600 text-sm mb-4" aria-label="breadcrumb">
        <ol className="list-reset flex">
          <li>
            <Link to="/dashboard" className="text-sky-600 hover:underline">
              Dashboard
            </Link>
          </li>

          {pathnames.length > 0 && (
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-400">{secondLevel}</span>
            </li>
          )}
        </ol>
      </nav>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
    </>
  );
};

export default FreelancerReports;
