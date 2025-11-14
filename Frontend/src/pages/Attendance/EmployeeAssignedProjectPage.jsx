import React, { useEffect, useState } from "react";
import { decodeToken } from "../../api/decodeToekn";
import { useDispatch, useSelector } from "react-redux";
import { ProjectFetchAssign } from "../../features/Project/projectsSlice"
import { useNavigate } from "react-router-dom";

export default function EmployeeAssignedProjectPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projects, loading, error } = useSelector((state) => state.project);

  const [data, setData] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUsername(parsed?.fullName || "");
      setEmail(parsed?.email || "");

    }
  }, []);


  useEffect(() => {
    const getDecoded = async () => {
      try {
        const decoded = await decodeToken();
        setData(decoded);
      } catch (error) {
        console.error("Error decoding token:", error);
        setError("Failed to decode token");
      }
    };

    getDecoded();
  }, []);

  useEffect(() => {
    if (data?.id) {
      dispatch(ProjectFetchAssign(data.id));
    }
  }, [data, dispatch]);
  const handleNavigate = () => {
    if (projects.length > 0) {
      const projectName = projects[0]?.project?.name;
      const projectID = projects[0]?.project?.id;
      const employeeId = projects[0]?.employeeId;

      const ProjectDetails = { projectName, projectID, employeeId, username, email };
      localStorage.setItem("ProjectDetails", JSON.stringify(ProjectDetails));


      navigate("/attendance/emptimesheet");
    } else {
      console.log("No projects found to save");
    }
  };
  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Assigned Projects</h2>

      <form className="flex items-end gap-4">
        {/* Employee Dropdown (disabled) */}
        {/* Employee Email (read-only) */}
        <div className="flex-1">
          <label className="block mb-2 font-semibold">Employee Email</label>
          <input
            type="text"
            value={email}
            readOnly
            className="w-full border rounded-lg p-2 bg-gray-100 text-gray-600"
          />
        </div>

        {/* Employee Name (read-only) */}
        <div className="flex-1">
          <label className="block mb-2 font-semibold">Employee Name</label>
          <input
            type="text"
            value={username}
            readOnly
            className="w-full border rounded-lg p-2 bg-gray-100 text-gray-600"
          />
        </div>


        {/* Project Dropdown (disabled) */}
        <div className="flex-1">
          <label className="block mb-2 font-semibold">Assigned Projects</label>
          {projects.length > 0 ? (
            <ul className="w-full border rounded-lg p-2 bg-gray-100 text-gray-600 max-h-40 overflow-y-auto">
              {projects.map((p) => (
                <li key={p.id} className=" border-b last:border-b-0">
                  {p.project?.name || "Unnamed Project"}
                </li>
              ))}
            </ul>
          ) : (
            <input
              type="text"
              value="No Project Assigned"
              readOnly
              className="w-full border rounded-lg p-2 bg-gray-100 text-gray-600"
            />
          )}
        </div>

        <div className="flex items-center">
          <button
            onClick={handleNavigate}
            type="button"
            className="bg-blue-400 text-white text-sm px-5 py-3 rounded hover:bg-blue-700 transition whitespace-nowrap"
          >
            Go to Attendance
          </button>
        </div>
      </form>
    </div>

  );
}
