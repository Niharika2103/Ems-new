import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ProjectGetAll, ProjectAssign } from "../../features/Project/projectsSlice";
import { fetchAllEmployees } from "../../features/employeesDetails/employeesSlice";

export default function FreelancerAssignProjectpage() {
  const [project, setProject] = useState("");
  const [user, setUser] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [shift, setShift] = useState("");
  const [ot, setOt] = useState("");
  const [employmentType, setEmploymentType] = useState("");

  // Get project list from Redux
  const { list: projects } = useSelector((state) => state.project);
  const { list: employees } = useSelector((state) => state.employeeDetails);

  useEffect(() => {
    const emp = employees.find((e) => e.email === selectedEmail);
    if (emp) {
      setEmployeeName(emp.name);
      setUser(emp.id);
      setShift(emp.shift || "");
      setOt(emp.ot || "");
      setEmploymentType(emp.employmentType || "");
    } else {
      setEmployeeName("");
      setUser("");
      setShift("");
      setOt("");
      setEmploymentType("");
    }
  }, [selectedEmail, employees]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

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

    dispatch(ProjectAssign({ 
      projectId: project, 
      employeeId: user, 
      role: "employee",
      shift: shift,
      ot: ot,
      employmentType: employmentType
    }))
      .unwrap()
      .then(() => {
        alert("Project assigned successfully!");
        setProject("");
        setUser("");
        setSelectedEmail("");
        setEmployeeName("");
        setShift("");
        setOt("");
        setEmploymentType("");
        navigate("/dashboard/fetch_project");
      })
      .catch((err) => {
        alert("Failed to assign project: " + err);
      });
  };

  const handleClick = () => {
    navigate("/dashboard/add_project");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Freelancer Assign Project</h1>
        <button
          onClick={handleClick}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Project
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border">
        <div className="flex gap-4 items-end">
          {/* Project Select */}
          <div className="flex-1">
            <label className="block mb-2 font-semibold">Project</label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Employee Email */}
          <div className="flex-1">
            <label className="block mb-2 font-semibold">Employee Email</label>
            <select
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">Select Email</option>
              
            </select>
          </div>

          {/* Employee Name */}
          <div className="flex-1">
            <label className="block mb-2 font-semibold">Employee Name</label>
            <input
              type="text"
              value={employeeName}
              readOnly
              className="w-full border rounded p-2 bg-gray-100"
            />
          </div>

          {/* Shift */}
          <div className="flex-1">
            <label className="block mb-2 font-semibold">Shift</label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">Select Shift</option>
              <option value="morning">Shift1</option>
              <option value="afternoon">shift2</option>
              <option value="night">shift3</option>
            </select>
          </div>

          {/* OT */}
          <div className="flex-1">
            <label className="block mb-2 font-semibold">OT</label>
            <select
              value={ot}
              onChange={(e) => setOt(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">Select OT</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {/* Employment Type */}
          <div className="flex-1">
            <label className="block mb-2 font-semibold">Employment Type</label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">Select Type</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Freelancer</option>
              
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex-1">
            <button
              type="submit"
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}