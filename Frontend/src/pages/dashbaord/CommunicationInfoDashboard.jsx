import { useNavigate } from "react-router-dom";
import StatCard from "../../components/StatCard";
import { Link, useLocation } from "react-router-dom";

// Icons
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import HubIcon from "@mui/icons-material/Hub"; // for Webhook settings

const CommunicationInfoDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Second level title
  const secondLevel = "Communication";

  const stats = [
    {
      title: "WhatsApp Template",
      message: "Configure WhatsApp templates & automation",
      icon: WhatsAppIcon,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      onClick: () => navigate("/watsup-template"),
    },
    {
      title: "Email Template",
      message: "Manage email templates and communication logs",
      icon: EmailIcon,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      onClick: () => navigate("/email-template"),
    },
    {
      title: "Webhook Settings",
      message: "Configure API callbacks and event notifications",
      icon: HubIcon,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      onClick: () => navigate("/communication/webhooks"),
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

export default CommunicationInfoDashboard;
