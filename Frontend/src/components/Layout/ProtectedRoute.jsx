// import React from "react";
// import { Navigate } from "react-router-dom";
// import { useSelector } from "react-redux";

// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const role =
//     useSelector((state) => state.adminSlice?.role) ||
//     useSelector((state) => state.authSlice?.role) ||
//     useSelector((state) => state.employeeSlice?.role) ||
//     localStorage.getItem("role");

//   if (!role || (allowedRoles && !allowedRoles.includes(role))) {
//     return <Navigate to="/" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;


import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const activeRole = localStorage.getItem("active_role"); // 👈 MAIN
  const actualRole = localStorage.getItem("role");        // superadmin

  if (!activeRole || !actualRole) {
    return <Navigate to="/" replace />;
  }

  // 🚫 Safety: employee mode la irundhu admin mode ku jump panna koodathu
  const ROLE_LEVEL = {
    superadmin: 3,
    admin: 2,
    employee: 1,
  };

  if (ROLE_LEVEL[activeRole] > ROLE_LEVEL[actualRole]) {
    return <Navigate to="/" replace />;
  }

  // ✅ Page access check (ONLY active_role)
  if (allowedRoles && !allowedRoles.includes(activeRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

