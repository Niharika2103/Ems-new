import { useNavigate } from "react-router-dom";
import StatCard from "../../components/StatCard";

// Material UI icons
import GroupIcon from "@mui/icons-material/Group";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIcon from "@mui/icons-material/Assignment";

const FreelancerDashboard = () => {
  const navigate = useNavigate();


  const stats = [
    {
      title: "Manage Freelancer",
      message: "Add, update, or remove employees",
      icon: GroupIcon,
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
    //   onClick: () => navigate("/dashboard/freelancer/emp_requestTable"),
    },
    {
    title: "Employee Info",
    message: "View and manage employee details",
    icon: PersonIcon,
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    // onClick: () => navigate("/dashboard/freelancer/emp_info"),
  },
  {
    title: "Attendance",
    message: "Check your daily attendance records",
    icon: AccessTimeIcon,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    // onClick: () => navigate("/dashboard/freelancer/attendance"),
  },
  {
    title: "Projects",
    message: "View all assigned and active projects",
    icon: AssignmentIcon,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    // onClick: () => navigate("/dashboard/freelancer/fetch_project"),
  },];

  return (
    <>
      <h3 className="text-xl font-semibold mb-5">Freelancer Dashboard</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>
    </>
  );
};

export default FreelancerDashboard;
