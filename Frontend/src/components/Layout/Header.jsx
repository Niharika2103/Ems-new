import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Menu as MenuIcon, Bell, Search } from "lucide-react";
import { Menu, MenuItem, Stack } from "@mui/material";
import { employeeForgotPassword } from "../../features/auth/employeeSlice";
import { decodeToken } from "../../api/decodeToekn";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Audit logs logout
import { adminLogoutApi, superAdminLogoutApi } from "../../api/authApi";

const Header = ({ isOpen, setIsOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [email, setEmail] = useState("");
  const [data, setData] = useState({});

  const activeRole =
    localStorage.getItem("active_role") || localStorage.getItem("role");

  // ✅ PROFILE PHOTO
  const profilePhoto =
    useSelector((state) => state.employeeDetails?.profile?.profile_photo) ||
    JSON.parse(localStorage.getItem("user"))?.profile_photo ||
    "/default-user.jpg";

    // ✅ PROFILE NAME (FIXED)
  const profileName =
    useSelector((state) => state.employeeDetails?.profile?.name) ||
    JSON.parse(localStorage.getItem("user"))?.name ||
    data?.name ||
    "User";
  const open = Boolean(anchorEl);

  /* -------------------- INIT -------------------- */
  useEffect(() => {
    const init = async () => {
      try {
        const decoded = await decodeToken();
        setData(decoded);

        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        const finalEmail = decoded?.email || storedUser?.email || "";
        setEmail(finalEmail);
      } catch (error) {
        console.error("Decode error:", error);
      }
    };

    init();
  }, []);

  /* -------------------- MENU HANDLERS -------------------- */
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleProfile = () => {
    if (activeRole === "employee") {
      navigate("/dashboard/employeeinfo/employeeprofile");
    } else {
      navigate("/profile");
    }
    handleClose();
  };

  const handlePassword = () => {
    dispatch(employeeForgotPassword(email))
      .unwrap()
      .then((res) => {
        toast.success(res.message);
        navigate("/login/reset-password");
        localStorage.clear();
      })
      .catch((err) => toast.error(err?.error || "Failed"));
    handleClose();
  };

  /* -------------------- LOGOUT (FIXED) -------------------- */
  const Logout = async () => {
    const realRole = localStorage.getItem("role"); // ✅ FIXED

    try {
      if (email) {
        if (realRole === "superadmin") {
          await superAdminLogoutApi(email);
        } else if (realRole === "admin") {
          await adminLogoutApi(email);
        }
      }
    } catch (err) {
      console.error("Logout API Error:", err);
      toast.error("Logout failed. Please try again.");
    }

    localStorage.clear();

    if (realRole === "admin") window.location.replace("/#/admin/login");
    else if (realRole === "superadmin")
      window.location.replace("/#/superadmin/login");
    else window.location.replace("/#/login");

    handleClose();
  };

  return (
    <>
      <header className="flex font-robo font-semibold justify-between items-center px-4 sm:px-6 py-2 bg-white shadow-md">

        {/* LEFT */}
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-md text-[#51b4f2]"
            onClick={() => setIsOpen(!isOpen)}
          >
            <MenuIcon size={20} />
          </button>
        </div>

        {/* SEARCH */}
        <div className="hidden sm:block flex-1 max-w-md mx-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#51b4f2] w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-3 py-2 rounded-3xl bg-white text-black
                focus:outline-none border border-[#51b4f2]
                focus:border-sky-700 transition-all"
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {activeRole === "admin" && (
            <button
              className="px-3 py-1 text-sm bg-sky-400 text-white rounded-md"
              onClick={() => navigate("/employee_register")}
            >
              + Add Employee
            </button>
          )}

          {/* Notifications */}
          <button className="relative">
            <Bell className="w-6 h-6 text-gray-700" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full px-1">
              3
            </span>
          </button>

          {/* PROFILE */}
          <div
            className="flex items-center gap-2 bg-white shadow-sm rounded-2xl px-2 py-1 cursor-pointer"
            onClick={handleClick}
          >
           <span className="text-[#51b4f2] text-sm">
  {profileName || "User"}
</span>

            <img
              src={profilePhoto}
              alt="User"
              className="rounded-full w-8 h-8 border border-white object-cover"
            />
          </div>

          {/* DROPDOWN */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              elevation: 3,
              sx: { borderRadius: "12px", padding: 1 },
            }}
          >
            <Stack spacing={2} sx={{ p: 2, minWidth: 200 }}>
              <div>
                {/* <strong>{data?.name}</strong> */}
                <strong>{profileName || "User"}</strong>

                <p style={{ fontSize: "0.85rem", color: "#555" }}>
                  {data?.email}
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
