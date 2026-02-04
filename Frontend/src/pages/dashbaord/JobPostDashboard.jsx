import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import StatCard from "../../components/StatCard";

// MUI Icons
import GroupIcon from "@mui/icons-material/Group";
import BarChartIcon from "@mui/icons-material/BarChart";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const JobPostDashboard = () => {
  const navigate = useNavigate();

  /* ---------------- REDUX ROLES ---------------- */
  const adminRole = useSelector((state) => state.adminSlice?.role);
  const authRole = useSelector((state) => state.authSlice?.role);
  const employeeRole = useSelector((state) => state.employeeSlice?.role);

  /* ---------------- LOCAL STORAGE ---------------- */
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const activeRole =
    localStorage.getItem("active_role") ||
    adminRole ||
    authRole ||
    employeeRole;

  const employmentType = storedUser?.employment_type; // fulltime | freelancer

  /* ---------------- PATH HELPERS ---------------- */

  const getJobInfoPath = () => {
    // EMPLOYEE (Fulltime / Freelancer)
    if (
      activeRole === "employee" &&
      (employmentType === "fulltime" || employmentType === "freelancer")
    ) {
      return "/job-posts";
    }

    // ADMIN / HR → Application tracking
    if (activeRole === "admin" || activeRole === "hr") {
      return "/employee/application-tracking";
    }

    return "/";
  };

  /* ---------------- BASE CARDS ---------------- */

  const stats = [
    {
      title: "Job Applications",
      message: "View and track job applications",
      icon: PersonIcon,
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
      onClick: () => navigate(getJobInfoPath()),
    },
    {
      title: "Panel Feedback",
      message: "View interview feedback",
      icon: BarChartIcon,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      onClick: () => navigate("/employee/feedback"),
    },
  ];

  /* ---------------- ADMIN / HR CARDS ---------------- */

  if (activeRole === "admin" || activeRole === "hr") {
    stats.unshift(
      {
        title: "Manage Jobs",
        message: "Add, update, or remove jobs",
        icon: GroupIcon,
        iconBg: "bg-sky-100",
        iconColor: "text-sky-600",
        onClick: () => navigate("/published-jobs"),
      },
      {
        title: "Create Jobs",
        message: "Create new job postings",
        icon: AssignmentIcon,
        iconBg: "bg-sky-100",
        iconColor: "text-sky-600",
        onClick: () => navigate("/job-create"),
      }
    );

    stats.push(
      {
        title: "Interview List",
        message: "View all scheduled interviews",
        icon: CalendarTodayIcon,
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
        onClick: () => navigate("/interview-table"),
      },
      {
        title: "Manage Offers",
        message: "Offer jobs to candidates",
        icon: GroupIcon,
        iconBg: "bg-sky-100",
        iconColor: "text-sky-600",
        // onClick: () => navigate("/offers/status"),
      }
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <>
      <h3 className="text-xl font-semibold mb-5">Dashboard</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
    </>
  );
};

export default JobPostDashboard;
