import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ProjectGetAll, ProjectAssign } from "../../features/Project/projectsSlice";
import { fetchAllEmployees } from "../../features/employeesDetails/employeesSlice";
export default function AssignProjectPage() {
  const [project, setProject] = useState("");
  const [user, setUser] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  // Get project list from Redux
  const { list: projects } = useSelector((state) => state.project);

  const { list: employees, loading, error } = useSelector(
    (state) => state.employeeDetails
  );
  console.log(employees, "projects")
  useEffect(() => {
    // Find employee by email when selection changes
    const emp = employees.find((e) => e.email === selectedEmail);
    if (emp) {
      setEmployeeName(emp.name);
      setUser(emp.id);
    } else {
      setEmployeeName("");
      setUser("");
    }
  }, [selectedEmail, employees]);


  const navigate = useNavigate();

  const dispatch = useDispatch();


  // Fetch all projects on mount
  useEffect(() => {
    dispatch(ProjectGetAll());
    dispatch(fetchAllEmployees());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!project || !user) {
      alert("Please select both project and employee!");
      return;
    }

    dispatch(ProjectAssign({ projectId: project, employeeId: user, role: "employee" }))
      .unwrap()
      .then(() => {
        alert("Project assigned successfully!");
        setProject("");
        setUser("");
        navigate("/dashboard/fetch_project");
      })
      .catch((err) => {
        alert("Failed to assign project: " + err);
      });
  };


  const handleClick = () => {
    navigate("/dashboard/add_project"); // the route you want to go
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Add Project
      </button>
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
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-semibold">Select Employee Email</label>
          <select
            value={selectedEmail}
            onChange={(e) => setSelectedEmail(e.target.value)}
            className="w-full border rounded-lg p-2"
          >
            <option value="">-- Select Email --</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.email}>
                {emp.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-semibold">Employee Name</label>
          <input
            type="text"
            value={employeeName}
            readOnly
            className="w-full border rounded-lg p-2 bg-gray-100"
          />
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
    </>
  );
}


