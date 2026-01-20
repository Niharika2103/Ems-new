import { useNavigate } from "react-router-dom";
import StatCard from "../../components/StatCard";

// Material UI icons
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PaymentIcon from "@mui/icons-material/Payment";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DescriptionIcon from "@mui/icons-material/Description";

const VendorDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Vendor Info",
      message: "View and update your company details",
      icon: PersonIcon,
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
      onClick: () => navigate("/dashboard/vendor/info"),
    },
    {
      title: "Attendance",
      message: "Check your daily attendance",
      icon: AccessTimeIcon,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      onClick: () => navigate("/dashboard/vendor/attendance"),
    },
    {
      title: "Projects",
      message: "View assigned and active projects",
      icon: AssignmentIcon,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      onClick: () => navigate("/dashboard/vendor/projects"),
    },
    {
      title: "Payments",
      message: "View and download payment details",
      icon: PaymentIcon,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      onClick: () => navigate("/dashboard/vendor/payments"),
    },
    {
      title: "MoU",
      message: "View and accept your MoU document",
      icon: DescriptionIcon,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      onClick: () => navigate("/dashboard/vendor/mou"),
    },
  ];

  return (
    <>
      <h3 className="text-xl font-semibold mb-5">Vendor Dashboard</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>
    </>
  );
};

export default VendorDashboard;
