import { useNavigate } from "react-router-dom";
import StatCard from "../../components/StatCard";

// Material UI icons
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import HistoryIcon from "@mui/icons-material/History";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const AccountsDashboard = () => {
  const navigate = useNavigate();


  const stats = [
  {
      title: "Salary Structure",
      message: "View your salary breakdown and components",
      icon: AccountBalanceIcon,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      onClick: () => navigate("/accounts/salary-structure"),
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
      title: "Compliance",
      message: "Download and view your salary slips",
      icon: ReceiptIcon,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      // onClick: () => navigate("/compliance"),
    },
    // {
    //   title: "Payroll History",
    //   message: "View previous payroll records",
    //   icon: HistoryIcon,
    //   iconBg: "bg-orange-100",
    //   iconColor: "text-orange-600",
    //   onClick: () => navigate("/accounts/payroll-history"),
    // },
    // {
    //   title: "Tax Information",
    //   message: "View tax deductions and declarations",
    //   icon: CreditCardIcon,
    //   iconBg: "bg-red-100",
    //   iconColor: "text-red-600",
    //   onClick: () => navigate("/accounts/tax-info"),
    // },
    // {
    //   title: "Salary Analytics",
    //   message: "Analyze your salary trends and growth",
    //   icon: TrendingUpIcon,
    //   iconBg: "bg-teal-100",
    //   iconColor: "text-teal-600",
    //   onClick: () => navigate("/accounts/salary-analytics"),
    // },
  ];;

  return (
    <>
      <h3 className="text-xl font-semibold mb-5">Accounts Dashboard</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>
    </>
  );
};

export default AccountsDashboard;
