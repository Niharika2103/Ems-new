import { HashRouter as Router } from "react-router-dom";
import AppRoutes from "./app/routes";
import { useEffect } from "react";

function App() {
  useEffect(() => {
  const handlePopState = () => {
    const role = localStorage.getItem("role");
    const hash = window.location.hash || "#/";

    const loginPaths = [
      "#/",
      "#/login",
      "#/admin/login",
      "#/admin/register",
      "#/superadmin/login",
      "#/superadmin/register",
    ];

    // Prevent logged-in users from going back to login/landing pages
    if (role && loginPaths.some((p) => hash.startsWith(p))) {
      window.history.replaceState(null, "", "#/dashboard");
    }

    // Prevent logged-out users from going forward to dashboard
    if (!role && hash.startsWith("#/dashboard")) {
      window.history.replaceState(null, "", "#/login");
    }
  };

  window.history.replaceState(null, "", window.location.hash || "#/");

  window.addEventListener("popstate", handlePopState);
  return () => window.removeEventListener("popstate", handlePopState);
}, []);


  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
