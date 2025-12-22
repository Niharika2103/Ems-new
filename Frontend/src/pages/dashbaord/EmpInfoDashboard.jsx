import { useNavigate, useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import StatCard from "../../components/StatCard";

// MUI Icons
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const EmpInfoDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => []);

  // Second-level title
  const secondLevel = "Employee Info";

  // Get user from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user"));

  // Get role from redux or localStorage
  const role =
    storedUser?.employment_type ||
    localStorage.getItem("role") ||
    useSelector((state) => state.adminSlice?.role) ||
    useSelector((state) => state.authSlice?.role) ||
    useSelector((state) => state.employeeSlice?.role);
    console.log("role",role)
  /* ---------------- PATH HELPERS ---------------- */

  const getDocumentPath = () => {
    if (storedUser?.employment_type === "freelancer") {
      return "/dashboard/freelancer/documents";
    }
    if (role === "admin") {
      return "/documents/employees";
    }
    return "/";
  };

  // const getLetterPath = () => {
  //   if (storedUser?.employment_type === "fulltime" || storedUser?.employment_type === "freelancer" ) {
  //     return "/employee/letters";
  //   }
  //   if (role === "admin") {
  //     return "/documents/admin/letters";
  //   }
  //   return "/";
  // };

  const getLetterPath = () => {
    if (storedUser?.employment_type === "fulltime") {
      return "/employee/letters";
    }
    if (storedUser?.employment_type === "freelancer") {
      return "/freelancer/letters-download";
    }
    if (role === "admin") {
      return "/documents/admin/letters";
    }
    return "/";
  };
  const getReferralspath = () => {
    if (storedUser?.employment_type === "fulltime") {
      return "/dashboard/emp_info/referral";
    }
    if (role === "admin") {
      return "/admin/referrals";
    }
    return "/";
  };

  const getPerformancepath = () => {
    if (storedUser?.employment_type === "fulltime") {
      return "/performanceform";
    }
    if (role === "admin") {
      return "/performancetable";
    }
    return "/";
  };

  /* ---------------- BASE CARDS ---------------- */

  const stats = [
    {
      title: "Letters",
      message: "Download your salary slips",
      icon: MailOutlineIcon,
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
      onClick: () => navigate(getLetterPath()),
    },
    {
      title: "Referrals",
      message: "Refer candidates and earn rewards",
      icon: GroupAddIcon,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      onClick: () => navigate(getReferralspath()),
    },
    {
      title: "Invoice",
      message: "View Contracts & Agreements",
      icon: CreditCardIcon,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      onClick: () => navigate("/invoices"),
    },
    {
      title: "Performance",
      message: "View your performance reviews",
      icon: TrendingUpIcon,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      onClick: () => navigate(getPerformancepath()),
    },
  ];

  /* ---------------- CONDITIONAL CARDS ---------------- */

  // Document → Admin & Freelancer ONLY
  if (role === "admin" || storedUser?.employment_type === "freelancer") {
    stats.unshift({
      title: "Document",
      message: "View HR announcements",
      icon: DescriptionIcon,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      onClick: () => navigate(getDocumentPath()),
    });
  }

  // Probation → Admin ONLY
  if (role === "admin") {
    stats.push({
      title: "Probation",
      message: "Track and manage employee probation periods",
      icon: VerifiedUserIcon,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      onClick: () => navigate("/dashboard/empinfo/probation"),
    });
  }

  /* ---------------- UI ---------------- */

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

export default EmpInfoDashboard;
