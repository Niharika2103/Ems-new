import { useNavigate, useLocation, Link } from "react-router-dom";
import StatCard from "../../../components/StatCard";

// MUI Icons
import AssignmentIcon from "@mui/icons-material/Assignment";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import PaidIcon from "@mui/icons-material/Paid";
import BarChartIcon from "@mui/icons-material/BarChart";

const FreelancerJobPostDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const secondLevel = "Freelancer Job Posting";

  const stats = [
   
    {
      title: "Job Applications",
      message: "Track freelancer applications & status",
      icon: PersonIcon,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      onClick: () => navigate("/freelancer/application"),
    },
    // {
    //   title: "Offers",
    //   message: "Send and manage freelancer offers",
    //   icon: PaidIcon,
    //   iconBg: "bg-orange-100",
    //   iconColor: "text-orange-600",
    // //   onClick: () => navigate("/freelancer/jobs/offers"),
    // },
    {
      title: "Panel Feedback",
      message: "Interview feedback and evaluations",
      icon: BarChartIcon,
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
    //   onClick: () => navigate("/freelancer/jobs/feedback"),
    },
  ];

  return (
    <>
      {/* Breadcrumb */}
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

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
    </>
  );
};

export default FreelancerJobPostDashboard;
