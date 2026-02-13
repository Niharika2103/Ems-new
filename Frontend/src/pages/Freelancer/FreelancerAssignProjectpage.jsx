// import React, { useEffect, useState, useMemo } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { decodeToken } from "../../api/decodeToekn";
// import { ProjectFetchAssign } from "../../features/Project/projectsSlice";

// export default function FreelancerAssignedProjectPage() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { projects = [], loading, error } = useSelector(
//     (state) => state.project
//   );

//   const [data, setData] = useState(null);
//   const [email, setEmail] = useState("");

//   /* ================= EMAIL ================= */
//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     if (storedUser) {
//       const parsed = JSON.parse(storedUser);
//       setEmail(parsed?.email || "");
//     }
//   }, []);

//   /* ================= TOKEN ================= */
//   useEffect(() => {
//     const getDecoded = async () => {
//       const decoded = await decodeToken();
//       setData(decoded);
//     };
//     getDecoded();
//   }, []);

//   /* ================= FETCH ASSIGNED PROJECTS ================= */
//   useEffect(() => {
//     if (data?.id) {
//       dispatch(ProjectFetchAssign(data.id));
//     }
//   }, [data, dispatch]);

//   /* ================= ✅ ONLY FREELANCER + IN_PROGRESS ================= */
//   const inProgressProjects = useMemo(() => {
//     return Array.isArray(projects)
//       ? projects.filter(
//           (p) =>
//             p.status === "IN_PROGRESS" &&
//             p.employee_type === "freelancer"
//         )
//       : [];
//   }, [projects]);

//   /* ================= FREELANCER NAME ================= */
//   const freelancerName =
//     inProgressProjects.length > 0
//       ? inProgressProjects[0].employeeName
//       : "";

//   /* ================= NAVIGATE ================= */
//   const handleNavigate = () => {
//     if (inProgressProjects.length === 0) return;

//     const first = inProgressProjects[0];

//     const ProjectDetails = {
//       projectID: first.projectId,
//       employeeId: first.employeeId,
//       employeeName: first.employeeName,
//       email,
//       employee_type: "freelancer",
//     };

//     localStorage.setItem(
//       "ProjectDetails",
//       JSON.stringify(ProjectDetails)
//     );

//     navigate("/attendance/freelancertimesheet");
//   };

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p className="text-red-500">Error: {error}</p>;

//   return (
//     <div className="p-6 bg-gray-50 rounded-lg shadow">
//       <h2 className="text-xl font-bold mb-4">
//         Assigned Projects (Freelancer)
//       </h2>

//       <form className="flex items-end gap-4">
//         {/* Email */}
//         <div className="flex-1">
//           <label className="block mb-2 font-semibold">
//             Freelancer Email
//           </label>
//           <input
//             value={email}
//             readOnly
//             className="w-full border rounded-lg p-2 bg-gray-100"
//           />
//         </div>

//         {/* Name */}
//         <div className="flex-1">
//           <label className="block mb-2 font-semibold">
//             Freelancer Name
//           </label>
//           <input
//             value={freelancerName}
//             readOnly
//             className="w-full border rounded-lg p-2 bg-gray-100"
//           />
//         </div>

//         {/* Assigned Projects */}
//         <div className="flex-1">
//           <label className="block mb-2 font-semibold">
//             Assigned Projects
//           </label>

//           {inProgressProjects.length > 0 ? (
//             <ul className="w-full border rounded-lg p-2 bg-gray-100 max-h-40 overflow-y-auto">
//               {inProgressProjects.map((p) => (
//                 <li
//                   key={p.projectId}
//                   className="border-b last:border-b-0"
//                 >
//                   {p.projectName}
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <input
//               value="No In-Progress Project Assigned"
//               readOnly
//               className="w-full border rounded-lg p-2 bg-gray-100"
//             />
//           )}
//         </div>

//         {/* Attendance */}
//         <div className="flex items-center">
//           <button
//             type="button"
//             onClick={handleNavigate}
//             disabled={inProgressProjects.length === 0}
//             className="bg-blue-500 text-white px-5 py-3 rounded hover:bg-blue-700 disabled:opacity-50"
//           >
//             Go to Attendance
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ProjectGetAll, ProjectAssign } from "../../features/Project/projectsSlice";
import { fetchAllFreelancer } from "../../features/freelancer/freelancerSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function FreelancerAssignProjectpage() {
  const [project, setProject] = useState("");
  const [user, setUser] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [employee_type, setEmploymentType] = useState("");

  // Get project list from Redux
  const { list: projects } = useSelector((state) => state.project);

  const { list
    : employees, loading, error } = useSelector(
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
    dispatch(fetchAllFreelancer());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!project || !user) {
      alert("Please select both project and employee!");
      return;
    }

    dispatch(ProjectAssign({ projectId: project, employeeId: user, role: "employee",employee_type:employee_type }))
      .unwrap()
      .then(() => {
   toast.success("Project assigned successfully!");
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
     <ToastContainer position="top-right" autoClose={3000} />
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
          <div className="flex-1">
            <label className="block mb-2 font-semibold">Employment Type</label>
             <select
              value={employee_type}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">Select Type</option>
              <option value="freelancer">Freelancer</option>
              
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
    </>
  );
}


