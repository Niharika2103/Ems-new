import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import StatCard from "../../components/StatCard";

// Material UI icons
import GroupIcon from "@mui/icons-material/Group";
import BarChartIcon from "@mui/icons-material/BarChart";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";


const JobPostDashboard = () => {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user"));

  const role =
    storedUser?.employment_type ||
    localStorage.getItem("role") ||
    useSelector((state) => state.adminSlice?.role) ||
    useSelector((state) => state.authSlice?.role) ||
    useSelector((state) => state.employeeSlice?.role);

  const isAdmin = role === "admin";

  /* ---------- PATH LOGIC ---------- */

  const getJobInfoPath = () => {
    if (storedUser?.employment_type === "fulltime" || storedUser?.employment_type === "freelancer") {
      return "/job-posts";
    }
    if (isAdmin) {
      return "/employee/application-tracking";
    }
    return "/";
  };

  /* ---------- BASE CARDS (EMPLOYEE + ADMIN) ---------- */

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

  /* ---------- ADMIN ONLY CARDS ---------- */

  if (isAdmin) {
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
    stats.push({
    title: "Interview List",
    message: "View all scheduled interviews",
    icon: CalendarTodayIcon,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    onClick: () => navigate("/interview-table"), // change path if needed
  });

    stats.push({
      title: "Manage Offers",
      message: "Offer jobs to employees",
      icon: GroupIcon,
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
      onClick: () => navigate("/offers/status"),
    });
  }

  /* ---------- UI ---------- */

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
