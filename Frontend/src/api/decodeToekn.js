import jwtDecode from "jwt-decode"; //  default import in v3

export const decodeToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return {
      email: decoded?.email || null,
      role: decoded?.role || null,
      employeeId:decoded?.employee_id || null,
       id: decoded?.id || null,
       name : decoded?.name || null,
    };
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
};
