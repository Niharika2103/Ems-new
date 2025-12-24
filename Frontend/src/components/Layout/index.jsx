import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import Sidebar from "../../components/Layout/sidebar";
import Header from "../../components/Layout/Header";
import Footer from "../../components/Layout/Footer";
import { Outlet } from "react-router-dom";
import { fetchEmployeeProfile ,fetchAdminProfile,
  fetchSuperAdminProfile,} from "../../features/employeesDetails/employeesSlice";

const Layout = () => {
  const [isOpen, setIsOpen] = useState(true);
  const dispatch = useDispatch();

 useEffect(() => {
  const loadProfile = () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser || !storedUser.role) return;

    // ✅ EMPLOYEE → EMAIL
    if (storedUser.role === "employee" && storedUser.email) {
      dispatch(fetchEmployeeProfile(storedUser.email));
    }

    // ✅ ADMIN → ID
    else if (storedUser.role === "admin" && storedUser.id) {
      dispatch(fetchAdminProfile(storedUser.id));
    }

    // ✅ SUPERADMIN → ID
    else if (storedUser.role === "superadmin" && storedUser.id) {
      dispatch(fetchSuperAdminProfile(storedUser.id));
    }
  };

  // 1️⃣ Immediate attempt
  loadProfile();

  // 2️⃣ Storage listener (login event)
  const onStorageChange = () => loadProfile();
  window.addEventListener("storage", onStorageChange);

  // 3️⃣ Fallback retry (HashRouter)
  const timeout = setTimeout(loadProfile, 500);

  return () => {
    window.removeEventListener("storage", onStorageChange);
    clearTimeout(timeout);
  };
}, [dispatch]);


  return (
    <div className="flex min-h-screen overflow-hidden">
      <Sidebar isOpen={isOpen} />
      <div className="flex-1 flex flex-col">
        <Header isOpen={isOpen} setIsOpen={setIsOpen} />
        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-100 shadow-lg rounded-2xl">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
