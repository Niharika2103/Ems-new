import { useNavigate } from "react-router-dom";
import StatCard from "../../components/StatCard";
import { Link, useLocation } from "react-router-dom";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import HistoryIcon from "@mui/icons-material/History";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const AccountsDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  
  // Second-level title
  const secondLevel = "Accounts";
  
  // Get user from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user"));

  // Get role from redux or localStorage
  const role =
    storedUser?.employment_type ||
    localStorage.getItem("role") ||
    useSelector((state) => state.adminSlice) ||
    useSelector((state) => state.authSlice?.role) ||
    useSelector((state) => state.employeeSlice?.role);

  // Current page title
  const currentPage = pathnames[pathnames.length - 1] || "";

  // Accounts-related stats cards
  const stats = [
    {
      title: "Salary Structure",
      message: "View your salary breakdown and components",
      icon: AccountBalanceIcon,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      // onClick: () => navigate("/accounts/salary-structure"),
    },
    {
      title: "Payroll",
      message: "Process and view payroll information",
      icon: PaymentIcon,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      onClick: () => navigate("/accounts/payroll"),
    },
    {
      title: "Payslips",
      message: "Download and view your salary slips",
      icon: ReceiptIcon,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      onClick: () => navigate("/accounts/payslips"),
    },
    {
      title: "Payroll History",
      message: "View previous payroll records",
      icon: HistoryIcon,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      onClick: () => navigate("/accounts/payroll-history"),
    },
    {
      title: "Tax Information",
      message: "View tax deductions and declarations",
      icon: CreditCardIcon,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      onClick: () => navigate("/accounts/tax-info"),
    },
    {
      title: "Salary Analytics",
      message: "Analyze your salary trends and growth",
      icon: TrendingUpIcon,
      iconBg: "bg-teal-100",
      iconColor: "text-teal-600",
      onClick: () => navigate("/accounts/salary-analytics"),
    },
  ];

  // Role-based filtering for cards
  const getFilteredStats = () => {
    if (role === "admin" || role === "hr") {
      // Admin/HR sees all cards
      return stats;
    } else if (role === "freelancer") {
      // Freelancer sees limited cards
      return stats.filter(stat => 
        ["Payslips", "Salary Structure", "Tax Information"].includes(stat.title)
      );
    } else {
      // Regular employee
      return stats.filter(stat => 
        stat.title !== "Payroll" // Hide payroll processing for regular employees
      );
    }
  };

  const filteredStats = getFilteredStats();

  return (
    <>
      {/* Breadcrumb Navigation */}
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

     
    </>
  );
};

export default AccountsDashboard;