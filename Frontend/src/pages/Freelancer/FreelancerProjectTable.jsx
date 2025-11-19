// src/pages/freelancer/FreelancerProjectTable.jsx

import React, { useState, useEffect } from "react";
import { Search, User, Briefcase, Calendar } from "lucide-react";

const FreelancerProjectTable = () => {
  const [projects, setProjects] = useState([]); // API data will come here
  const [search, setSearch] = useState("");

  // EXAMPLE how you will fetch data:
  /*
  useEffect(() => {
    fetch("/api/freelancer/projects")
      .then(res => res.json())
      .then(data => setProjects(data));
  }, []);
  */

  // 🔍 GLOBAL SEARCH (any field)
  const filtered = projects.filter((p) =>
    Object.values(p).some((v) =>
      v?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div style={{ padding: "30px", width: "100%", maxWidth: "1150px", margin: "0 auto" }}>

      {/* PAGE TITLE */}
      <h1 style={{ textAlign: "center", fontSize: "25px", marginBottom: "5px" }}>
        Freelancer Project Assignments
      </h1>
      <p style={{ textAlign: "center", color: "#666", marginBottom: "25px" }}>
        Overview of project allocations and freelancer roles
      </p>

      {/* SEARCH BAR */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#fff",
          padding: "14px 18px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          marginBottom: "25px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
        }}
      >
        <Search size={20} color="#666" />
        <input
          type="text"
          placeholder="Search by project, employee, role, description, shift, OT, date..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            marginLeft: "10px",
            border: "none",
            outline: "none",
            fontSize: "16px",
            background: "transparent",
          }}
        />
      </div>

      {/* TABLE */}
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #e5e7eb",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8f9fa" }}>
              <th style={thStyle}><Briefcase size={16} /> Project</th>
              <th style={thStyle}>Description</th>
              <th style={thStyle}><User size={16} /> Freelancer</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}><Calendar size={16} /> Assigned At</th>
              <th style={thStyle}>Shift</th>
              <th style={thStyle}>OT</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#888" }}>
                  No assignments found
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f1f1f1" }}>
                  <td style={tdStyle}>{p.project}</td>
                  <td style={tdStyle}>{p.description}</td>

                  {/* Employee badge */}
                  <td style={tdStyle}>
                    <span style={badgeBlue}>{p.employee}</span>
                  </td>

                  {/* Role badge */}
                  <td style={tdStyle}>
                    <span style={badgePurple}>{p.role}</span>
                  </td>

                  <td style={tdStyle}>{p.assignmentDate}</td>

                  {/* SHIFT */}
                  <td style={tdStyle}>
                    <span style={badgeShift(p.shift)}>{p.shift}</span>
                  </td>

                  {/* OVERTIME */}
                  <td style={tdStyle}>
                    <span style={badgeOT(p.overtime)}>{p.overtime}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ======================
// STYLES
// ======================
const thStyle = {
  padding: "14px",
  textAlign: "left",
  fontWeight: "600",
  fontSize: "14px",
  color: "#444",
};

const tdStyle = {
  padding: "14px",
  fontSize: "15px",
  color: "#333",
};

const badgeBlue = {
  background: "#e3f2fd",
  color: "#1e88e5",
  padding: "4px 10px",
  fontSize: "13px",
  borderRadius: "10px",
};

const badgePurple = {
  background: "#f3e5f5",
  color: "#8e24aa",
  padding: "4px 10px",
  fontSize: "13px",
  borderRadius: "10px",
};

const badgeShift = (shift) => ({
  background:
    shift === "Day"
      ? "#e3f2fd"
      : shift === "Night"
      ? "#fce4ec"
      : "#e8f5e9",
  color:
    shift === "Day"
      ? "#1976d2"
      : shift === "Night"
      ? "#c2185b"
      : "#2e7d32",
  padding: "4px 10px",
  borderRadius: "10px",
  fontSize: "13px",
});

const badgeOT = (ot) => ({
  background: ot !== "0 hours" ? "#fff3cd" : "#d4edda",
  color: ot !== "0 hours" ? "#856404" : "#155724",
  padding: "4px 10px",
  borderRadius: "10px",
  fontSize: "13px",
});

export default FreelancerProjectTable;
