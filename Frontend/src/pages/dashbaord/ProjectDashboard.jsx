import { useNavigate } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import AssignmentIcon from "@mui/icons-material/Assignment";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";

const ProjectDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const secondLevel = "Employee Info";

  const stats = [
    {
      title: "Timesheet",
      message: "View and manage your daily attendance",
      icon: AccountCircleIcon,
      iconBg: "bg-gradient-to-r from-sky-100 to-sky-200",
      iconColor: "text-sky-700",
      onClick: () => navigate("/attendance/timesheettable"),
    },
    {
      title: "Assigned Projects",
      message: "See the list of your current and past projects",
      icon: AssignmentIcon,
      iconBg: "bg-gradient-to-r from-indigo-100 to-indigo-200",
      iconColor: "text-indigo-700",
      onClick: () => navigate("/attendance/projects"),
    },
    {
      title: "Maternity & Paternity",
      message: "Apply or check your leave eligibility",
      icon: FamilyRestroomIcon,
      iconBg: "bg-gradient-to-r from-pink-100 to-rose-200",
      iconColor: "text-pink-700",
      onClick: () => navigate("/attendance/maternity-paternity-leaves"),
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="text-gray-600 text-sm mb-6" aria-label="breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link
              to="/dashboard"
              className="text-sky-600 font-medium hover:underline"
            >
              Dashboard
            </Link>
          </li>
          {pathnames.length > 0 && (
            <>
              <li>/</li>
              <li className="text-gray-500">{secondLevel}</li>
            </>
          )}
        </ol>
      </nav>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Employee Info Overview
      </h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            onClick={stat.onClick}
            className="cursor-pointer rounded-2xl bg-white shadow-md hover:shadow-xl transition-shadow duration-300 p-5 flex flex-col items-start border border-gray-100 hover:border-sky-200">
            <div
              className={`w-14 h-14 flex items-center justify-center rounded-xl ${stat.iconBg} mb-4`}
            >
              <stat.icon className={`${stat.iconColor} text-3xl`} />
            </div>

            <h3 className="text-lg font-semibold text-gray-800">
              {stat.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1 mb-3">{stat.message}</p>

            <button
              className="mt-auto text-sky-600 font-medium hover:text-sky-800 transition-colors"
              onClick={stat.onClick}
            >
              View Details →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDashboard;
