import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Menu as MenuIcon, Bell } from "lucide-react";
import { Search } from "lucide-react";
import { Menu, MenuItem, Stack } from "@mui/material";
import { employeeForgotPassword } from "../../features/auth/employeeSlice";
import { decodeToken } from "../../api/decodeToekn";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Header = ({ isOpen, setIsOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [email, setEmail] = useState(null);
  const [emp, setEmp] = useState([])
 const [data, setData] = useState([]);
  const roleCheck =
    useSelector((state) => state.adminSlice?.role) ||
    useSelector((state) => state.authSlice?.role) ||
    useSelector((state) => state.employeeSlice?.role) ||
    localStorage.getItem("role");

  const open = Boolean(anchorEl);

  useEffect(() => {
    const getDecoded = async () => {
    try {
      const decoded = await decodeToken();
      setData(decoded);
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  };

  getDecoded();
        
    const employee = JSON.parse(localStorage.getItem("user"));
    setEmp(employee)
    if (employee) {
      setEmail((prev) => ({
        ...prev,
        email: employee.email,
      }));
    }
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleProfile = () => {
    navigate("/profile");
    handleClose();
  };
  const handlePassword = () => {
    handleLoginSubmit(); // just call
    navigate("/login/reset-password");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    handleClose();
     
  };

  const handleLoginSubmit = () => {
    dispatch(employeeForgotPassword(email))
      .unwrap()
      .then((response) => {
        toast.success(response.message);
        navigate("/login/reset-password");
      })
      .catch((err) => toast.error(err.error || "Login failed"));
  };
  const Logout = () => {
    localStorage.clear();

     if (roleCheck === "admin") {
    window.location.replace("/#/admin/login");
  } else if (roleCheck === "superadmin") {
    window.location.replace("/#/superadmin/login");
  } else if (role === "employee") {
    window.location.replace("/#/login");
  } else {
    // ✅ If no role exists → go to main landing page
    window.location.href("/#/");
  }
   
    setTimeout(() => {
      window.history.pushState(null, "", window.location.href);
      window.onpopstate = () => {
        window.history.go(1); // Force forward navigation
      };
    }, 0);
     handleClose();
  };

  return (
    <>
      <header className="flex font-robo font-semibold justify-between items-center px-4 sm:px-6 py-2 bg-gradient-to-r  bg-white text-white shadow-md">
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-md text-[#51b4f2]"
            onClick={() => setIsOpen(!isOpen)}
          >
            <MenuIcon size={20} />
          </button>
        </div>
        <div className="hidden sm:block flex-1 max-w-md mx-4">
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 
               text-[#51b4f2] w-5 h-5 transition-transform duration-300
               group-focus-within:scale-110 group-focus-within:rotate-12"
            />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-3 py-2 rounded-3xl bg-white text-black
               focus:outline-none shadow-sm border border-[#51b4f2]
               focus:border-sky-700 focus:shadow-lg
               focus:shadow-sky-500/40 transition-all duration-300 ease-in-out"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          {roleCheck === "admin" && (
            <button
              type="button"
              className="px-2 py-1 text-sm bg-sky-400 text-white rounded-md shadow hover:bg-sky-400" onClick={() => navigate("/employee_register")}
            >
              + Add Employee
            </button>
          )}

          <button className="relative">
            <Bell className="w-6 h-6 text-gray-700" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full px-1">
              3
            </span>
          </button>
          <div className="flex items-center gap-2 bg-white shadow-sm rounded-2xl px-2 py-1  " onClick={handleClick}>
            <span className="font-small text-[#51b4f2]">
              {data.name}

            </span>
            <img
              src="data:image/jpeg;base64,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"
              alt="User"
              className="rounded-full w-8 h-8 border border-white"
            />
          </div>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              elevation: 3,
              sx: { borderRadius: "12px", padding: 1 },
            }}
          >
            <Stack spacing={2} sx={{ p: 2, minWidth: 200, borderRadius: "12px" }}>
              <div>
                <strong>
                  {data.name}

                </strong>
                <p style={{ fontSize: "0.85rem", color: "#555" }}>
                  {data.email}
                </p>
              </div>
              <MenuItem onClick={handleProfile}>My Profile</MenuItem>
              <MenuItem onClick={handlePassword}>Change Password</MenuItem>
              <MenuItem onClick={Logout}>Logout</MenuItem>
            </Stack>
          </Menu>
        </div>
      </header>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default Header;
