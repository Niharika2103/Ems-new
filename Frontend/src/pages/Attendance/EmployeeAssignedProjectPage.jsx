import React, { useEffect, useState, useMemo } from "react";
import { decodeToken } from "../../api/decodeToekn";
import { useDispatch, useSelector } from "react-redux";
import { ProjectFetchAssign } from "../../features/Project/projectsSlice";
import { useNavigate } from "react-router-dom";

export default function EmployeeAssignedProjectPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { projects = [], loading, error } = useSelector(
    (state) => state.project
  );

  const [data, setData] = useState(null);
  const [email, setEmail] = useState("");

  /* ================= EMAIL ================= */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setEmail(parsed?.email || "");
    }
  }, []);

  /* ================= TOKEN ================= */
  useEffect(() => {
    const getDecoded = async () => {
      const decoded = await decodeToken();
      setData(decoded);
    };
    getDecoded();
  }, []);

  /* ================= FETCH PROJECTS ================= */
  useEffect(() => {
    if (data?.id) {
      dispatch(ProjectFetchAssign(data.id));
    }
  }, [data, dispatch]);

  /* ================= ✅ ONLY IN-PROGRESS ================= */
  const inProgressProjects = useMemo(() => {
  return Array.isArray(projects)
    ? projects.filter(p => p.status === "IN_PROGRESS")
    : [];
}, [projects]);
console.log(inProgressProjects,"Assigned projects")
  /* ================= NAME ================= */
  const employeeName =
    inProgressProjects.length > 0
      ? inProgressProjects[0].employeeName
      : "";

  /* ================= NAVIGATE (DO NOT TOUCH) ================= */
  const handleNavigate = () => {
    if (inProgressProjects.length === 0) return;

    const first = inProgressProjects[0];

    const ProjectDetails = {
      projectID: first.projectId,
      employeeId: first.employeeId,
      employeeName: first.employeeName,
      projectName:first.projectName,
      email
    };

    localStorage.setItem("ProjectDetails", JSON.stringify(ProjectDetails));
    navigate("/attendance/emptimesheet");
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Assigned Projects</h2>

      <form className="flex items-end gap-4">
        {/* Email */}
        <div className="flex-1">
          <label className="block mb-2 font-semibold">Employee Email</label>
          <input value={email} readOnly className="w-full border rounded-lg p-2 bg-gray-100" />
        </div>

        {/* Name */}
        <div className="flex-1">
          <label className="block mb-2 font-semibold">Employee Name</label>
          <input value={employeeName} readOnly className="w-full border rounded-lg p-2 bg-gray-100" />
        </div>

        {/* Assigned Projects */}
        <div className="flex-1">
          <label className="block mb-2 font-semibold">Assigned Projects</label>

          {inProgressProjects.length > 0 ? (
            <ul className="w-full border rounded-lg p-2 bg-gray-100 max-h-40 overflow-y-auto">
              {inProgressProjects.map((p) => (
                <li key={p.projectId} className="border-b last:border-b-0">
                  {p.projectName}
                </li>
              ))}
            </ul>
          ) : (
            <input value="No In-Progress Project Assigned" readOnly className="w-full border rounded-lg p-2 bg-gray-100" />
          )}
        </div>

        {/* Attendance */}
        <div className="flex items-center">
          <button
            onClick={handleNavigate}
            type="button"
            className="bg-blue-400 text-white px-5 py-3 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={inProgressProjects.length === 0}
          >
            Go to Attendance
          </button>
        </div>
      </form>
    </div>
  );
}
