// src/pages/freelancer/FreelancerProjectTable.jsx

import React, { useState, useEffect } from "react";
import { Search, User, Briefcase, Calendar } from "lucide-react";
import { fetchFreelancerAssignmentsApi } from "../../api/authApi"; 

const FreelancerProjectTable = () => {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetchFreelancerAssignmentsApi();
        // Handle both Axios (response.data) and raw fetch (response)
        setProjects(response.data || response);
      } catch (error) {
        console.error("Failed to fetch freelancer assignments:", error);
      }
    };

    fetchAssignments();
  }, []);

  // Filter rows based on global search
  const filtered = projects.filter((p) =>
    Object.values(p).some((value) =>
      value?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  // Format ISO date string to "08 Dec 2025, 14:30"
  const formatDateTime = (isoString) => {
    if (!isoString) return "—";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24-hour format (e.g., 14:30)
    }).replace(",", ",");
  };

  return (
    <div style={{ padding: "30px", width: "100%", maxWidth: "1150px", margin: "0 auto" }}>
      {/* Page Header */}
      <h1 style={{ textAlign: "center", fontSize: "25px", marginBottom: "5px" }}>
        Freelancer Project Assignments
      </h1>
      <p style={{ textAlign: "center", color: "#666", marginBottom: "25px" }}>
        Overview of project allocations and freelancer roles
      </p>

      {/* Search Bar */}
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
          placeholder="Search by project, freelancer, role, description, or date..."
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

      {/* Assignments Table */}
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
              <th style={thStyle}><Briefcase size={16} /> Project Name</th>
              <th style={thStyle}>Description</th>
              <th style={thStyle}><User size={16} /> Freelancer</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}><Calendar size={16} /> Assigned At</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#888" }}>
                  No assignments found
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f1f1f1" }}>
                  <td style={tdStyle}>{p.project_name || "—"}</td>
                  <td style={tdStyle}>{p.description || "—"}</td>
                  <td style={tdStyle}>
                    <span style={badgeBlue}>{p.employee_name || "—"}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={badgePurple}>{p.role || "—"}</span>
                  </td>
                  <td style={tdStyle}>{formatDateTime(p.assigned_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Reusable styles
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

export default FreelancerProjectTable;