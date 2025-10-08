import { useNavigate } from "react-router-dom";
import StatCard from "../../components/StatCard";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

const EmployeeDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Employee Info ",
      // value: "18",
      message: "Check your daily attendance",
      icon: AccessTimeIcon,
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
      onClick: () => navigate("/dashboard/emp_info"),
    },

    {
      title:"Attendance",

      // value: "18",
      message: "Check your daily attendance",
      icon: AccessTimeIcon,
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
    },
    {
      title: "HR",
      // value: "5",
      message: "View HR announcements",
      icon: PeopleIcon,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      onClick: () => navigate("/hr"),
    },
    {
      title: "Payslip",
      // value: "10",
      message: "Download your salary slips",
      icon: ReceiptIcon,
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
      onClick: () => navigate("/payslip"),
    },
    {
      title: "Accounts",
      // value: "3",
      message: "Manage accounts and transactions",
      icon: AccountBalanceIcon,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      onClick: () => navigate("/accounts"),
    },
  ];

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

export default EmployeeDashboard;
