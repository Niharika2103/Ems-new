import React, { useEffect, useState } from "react";
import { decodeToken } from "../../api/decodeToekn";
import { useDispatch, useSelector } from "react-redux";
import { ProjectFetchAssign } from "../../features/Project/projectsSlice"
import { useNavigate } from "react-router-dom";

export default function EmployeeAssignedProjectPage() {
  const dispatch = useDispatch();
  const [data, setData] = useState(null);
  const { projects, loading, error } = useSelector((state) => state.project);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUsername(parsed?.fullName || "");
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
    navigate("/attendance/leavetype");
  };
  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Assigned Projects</h2>

      <form className="flex items-end gap-6">
        {/* Employee Dropdown (disabled) */}
        <div className="flex-1">
          <label className="block mb-2 font-semibold">Employee Name</label>
          <select
            value={data?.id || ""}
            disabled
            className="w-full border rounded-lg p-2 bg-gray-100 text-gray-600"
          >
            <option value={data?.id}>{username}</option>
          </select>
        </div>

        {/* Project Dropdown (disabled) */}
        <div className="flex-1">
          <label className="block mb-2 font-semibold">Assigned Project</label>
          <select
            value={projects.length > 0 ? projects[0].project?.id : ""}
            disabled
            className="w-full border rounded-lg p-2 bg-gray-100 text-gray-600"
          >
            {projects.length > 0 ? (
              projects.map((p) => (
                <option key={p.id} value={p.project?.id}>
                  {p.project?.name}
                </option>
              ))
            ) : (
              <option value="">No Project Assigned</option>
            )}
          </select>
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
