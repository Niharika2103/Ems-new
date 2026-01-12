import { useNavigate, useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import StatCard from "../../components/StatCard";

// MUI Icons
import DescriptionIcon from "@mui/icons-material/Description";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const EmpInfoDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

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

  /* ---------------- BREADCRUMB ---------------- */
  const pathnames = location.pathname.split("/").filter(Boolean);
  const secondLevel = "Employee Info";

  /* ---------------- PATH HELPERS ---------------- */

  const getDocumentPath = () => {
    if (employmentType === "freelancer")
      return "/dashboard/freelancer/documents";

    if (activeRole === "admin" || activeRole === "hr")
      return "/documents/employees";

    return "/";
  };

  const getLetterPath = () => {
    if (employmentType === "fulltime" && activeRole === "employee")
      return "/employee/letters";

    if (employmentType === "freelancer")
      return "/freelancer/letters-download";

    if (activeRole === "admin" || activeRole === "hr")
      return "/documents/admin/letters";

    return "/";
  };

  const getReferralPath = () => {
    if (employmentType === "fulltime"  && activeRole === "employee")
      return "/dashboard/emp_info/referral";

    if (activeRole === "admin" || activeRole === "hr")
      return "/admin/referrals";

    return "/";
  };

  const getPerformancePath = () => {
    if (employmentType === "fulltime" && activeRole === "employee")
      return "/performanceform";

    if (activeRole === "admin" || activeRole === "tl")
      return "/performancetable";

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
      onClick: () => navigate(getReferralPath()),
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
      onClick: () => navigate(getPerformancePath()),
    },
  ];

  /* ---------------- CONDITIONAL CARDS ---------------- */

  // Document → Admin / HR / Freelancer
  if (
    activeRole === "admin" ||
    activeRole === "hr" ||
    employmentType === "freelancer"
  ) {
    stats.unshift({
      title: "Document",
      message: "View HR announcements",
      icon: DescriptionIcon,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      onClick: () => navigate(getDocumentPath()),
    });
  }

  // Probation → Admin / HR only
  if (activeRole === "admin" || activeRole === "hr") {
    stats.push({
      title: "Probation",
      message: "Track employee probation periods",
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
      <nav className="text-gray-600 text-sm mb-4">
        <ol className="flex">
          <li>
            <Link to="/dashboard" className="text-sky-600 hover:underline">
              Dashboard
            </Link>
          </li>

          {pathnames.length > 1 && (
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