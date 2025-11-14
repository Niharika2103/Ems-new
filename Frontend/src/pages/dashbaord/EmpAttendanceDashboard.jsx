import { useNavigate } from "react-router-dom";
import StatCard from "../../components/StatCard";
import { Link, useLocation } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";


const EmpAttendanceDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  // Second-level title
  const secondLevel = "Attendance";

  // Current page title
  const currentPage = pathnames[pathnames.length - 1] || "";
  const stats = [
    {
      title: "Projects",
      message: "Check your daily attendance",
      icon: AccountCircleIcon,
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
      onClick: () => navigate("/dashboard/assign_project"),
    },
    {
      title: "Leaves",
      message: "View Your leaves table",
      icon: DescriptionIcon,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      onClick: () => navigate("/dashboard/employee/leave"),
    },
    {
      title: "List Holidays",
      message: "View Your holidays List",
      icon: CalendarMonthIcon,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      onClick: () => navigate("/dashboard/employee/holiday"),
    },

  ];

  return (
    <>
      <nav className="text-gray-600 text-sm mb-4" aria-label="breadcrumb">
        <ol className="list-reset flex">
          {/* First breadcrumb */}
          <li>
            <Link to="/dashboard" className="text-sky-600 hover:underline">
              Dashboard
            </Link>
          </li>

          {/* Second breadcrumb */}
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

export default EmpAttendanceDashboard;
