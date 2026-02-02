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
  const activeRole = localStorage.getItem("active_role");
  const actualRole = localStorage.getItem("role");

  // ⛔ Not logged in
  if (!actualRole) {
    return <Navigate to="/" replace />;
  }

  // 🛟 Fallback: if active_role missing, default to actual role
  const safeActiveRole = activeRole || actualRole;

  const ROLE_LEVEL = {
    superadmin: 4,
    admin: 3,
    vendor: 2,
    employee: 1,
  };

  // 🚫 Prevent role escalation
  if (
    ROLE_LEVEL[safeActiveRole] &&
    ROLE_LEVEL[actualRole] &&
    ROLE_LEVEL[safeActiveRole] > ROLE_LEVEL[actualRole]
  ) {
    return <Navigate to="/" replace />;
  }

  // 🚫 Route access check
  if (allowedRoles && !allowedRoles.includes(safeActiveRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;



