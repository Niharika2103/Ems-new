// import React from "react";
// import { Navigate } from "react-router-dom";
// import { useSelector } from "react-redux";

// const ProtectedRoute = ({ children, allowedRoles }) => {
// const storedVendor = JSON.parse(localStorage.getItem("vendor"));
//   const role =
//     useSelector((state) => state.adminSlice?.role) ||
//     useSelector((state) => state.authSlice?.role) ||
//     useSelector((state) => state.employeeSlice?.role) ||
//     localStorage.getItem("role");
//     storedVendor?.role;

//   if (!role || (allowedRoles && !allowedRoles.includes(role))) {
//     return <Navigate to="/" replace />;
//   }

//   return children;
// };
  
// export default ProtectedRoute;

import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const storedVendor = JSON.parse(localStorage.getItem("vendor"));

  const role =
    useSelector((state) => state.adminSlice?.role) ||
    useSelector((state) => state.authSlice?.role) ||
    useSelector((state) => state.employeeSlice?.role) ||
    localStorage.getItem("role") ||
    storedVendor?.role;

  const normalizedRole = role?.toLowerCase();
  const normalizedAllowed = allowedRoles?.map(r => r.toLowerCase());

  if (!normalizedRole || (normalizedAllowed && !normalizedAllowed.includes(normalizedRole))) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

