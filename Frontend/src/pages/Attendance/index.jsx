import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AssignProjectPage() {
  const [project, setProject] = useState("");
  const [user, setUser] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (project && user) {
      // Redirect with params
      navigate('/attendance/leavetype');
    } else {
      alert("Please select both project and user!");
    }
  };

  return (
    // <div className="flex h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="flex gap-6 p-6 "
      >
        {/* Left Side - Project Select */}
        <div className="flex-1">
          <label className="block mb-2 font-semibold">Select Project</label>
          <select
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="w-full border rounded-lg p-2"
          >
            <option value="">-- Select Project --</option>
            <option value="ProjectA">Project A</option>
            <option value="ProjectB">Project B</option>
            <option value="ProjectC">Project C</option>
          </select>
        </div>

        {/* Right Side - User Select */}
        <div className="flex-1">
          <label className="block mb-2 font-semibold">Assign User</label>
          <select
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="w-full border rounded-lg p-2"
          >
            <option value="">-- Select User --</option>
            <option value="User1">User 1</option>
            <option value="User2">User 2</option>
            <option value="User3">User 3</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className="flex items-end">
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Submit
          </button>
        </div>
      </form>
    // </div>
  );
}


