import React, { useState } from "react";
import Sidebar from "../../components/Layout/sidebar";
import Header from "../../components/Layout/Header";
import Footer from "../../components/Layout/Footer";
import { Outlet } from "react-router-dom";

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} />
      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header isOpen={isOpen} setIsOpen={setIsOpen} />
        {/* Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-100 shadow-lg rounded-2xl">
          {/* Existing page content */}
          <Outlet />
          {/* {children} */}
        </main>
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
