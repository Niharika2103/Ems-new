import React, { useState } from "react";

const ContractManager = () => {
  // --------------- CONTRACT TEMPLATES -----------------
  const contractTemplates = {
    employment: [
      { name: "employeeName", label: "Employee Name", type: "text" },
      { name: "designation", label: "Designation", type: "text" },
      { name: "joiningDate", label: "Joining Date", type: "date" },
      { name: "salary", label: "Salary", type: "number" },
    ],
    internship: [
      { name: "internName", label: "Intern Name", type: "text" },
      { name: "duration", label: "Duration (Months)", type: "number" },
      { name: "startDate", label: "Start Date", type: "date" },
    ],
    vendor: [
      { name: "vendorName", label: "Vendor Name", type: "text" },
      { name: "serviceType", label: "Service Type", type: "text" },
      { name: "contractStart", label: "Contract Start Date", type: "date" },
      { name: "contractEnd", label: "Contract End Date", type: "date" },
    ],
  };

  // ------------------ STATES --------------------------
  const [selectedType, setSelectedType] = useState("");
  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState("Draft"); // Draft | Pending | Approved | Rejected

  // ------------------ HANDLE FIELD CHANGE -------------
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ------------------ SUBMIT FOR APPROVAL -------------
  const submitForApproval = () => {
    setStatus("Pending");
  };

  // ------------------ APPROVE / REJECT ----------------
  const handleApproval = (state) => {
    setStatus(state);
  };

  // ------------------ PDF GENERATION -------------------
  const generatePDF = () => {
    alert("PDF generation API will be called here.");
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Contract Management</h2>

      {/* ---------------- SELECT CONTRACT TYPE ---------------- */}
      <div style={styles.section}>
        <label style={styles.label}>Select Contract Type</label>
        <select
          style={styles.input}
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            setFormData({});
          }}
        >
          <option value="">-- Select --</option>
          <option value="employment">Employment Contract</option>
          <option value="internship">Internship Contract</option>
          <option value="vendor">Vendor Agreement</option>
        </select>
      </div>

      {/* ---------------- DYNAMIC FORM FIELDS ---------------- */}
      {selectedType && (
        <div style={styles.section}>
          <h3 style={styles.subHeading}>Fill Contract Data</h3>

          {contractTemplates[selectedType].map((field) => (
            <div key={field.name} style={styles.fieldRow}>
              <label style={styles.label}>{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          ))}

          {/* Submit Button */}
          {status === "Draft" && (
            <button style={styles.buttonPrimary} onClick={submitForApproval}>
              Submit for Approval
            </button>
          )}
        </div>
      )}

      {/* ---------------- APPROVAL WORKFLOW ---------------- */}
      {selectedType && (
        <div style={styles.section}>
          <h3 style={styles.subHeading}>Approval Status</h3>

          <p style={styles.status(status)}>{status}</p>

          {status === "Pending" && (
            <div style={styles.buttonRow}>
              <button
                style={styles.buttonApprove}
                onClick={() => handleApproval("Approved")}
              >
                Approve
              </button>
              <button
                style={styles.buttonReject}
                onClick={() => handleApproval("Rejected")}
              >
                Reject
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------- PDF GENERATION ---------------- */}
      {status === "Approved" && (
        <div style={styles.section}>
          <h3 style={styles.subHeading}>Final PDF</h3>

          <button style={styles.buttonPrimary} onClick={generatePDF}>
            Generate PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default ContractManager;

// ------------------ INLINE STYLES --------------------
const styles = {
  container: {
    width: "60%",
    margin: "auto",
    padding: 20,
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 0 10px #ccc",
    fontFamily: "Arial",
  },
  heading: { textAlign: "center", marginBottom: 20 },
  subHeading: { marginBottom: 10, color: "#444" },
  section: {
    marginBottom: 25,
    paddingBottom: 10,
    borderBottom: "1px solid #ddd",
  },
  fieldRow: { marginBottom: 12 },
  label: { display: "block", marginBottom: 4 },
  input: {
    width: "100%",
    padding: 8,
    borderRadius: 4,
    border: "1px solid #aaa",
  },
  buttonPrimary: {
    padding: "10px 20px",
    background: "#0066ff",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  buttonRow: {
    display: "flex",
    gap: 12,
    marginTop: 10,
  },
  buttonApprove: {
    padding: "10px 20px",
    background: "green",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  buttonReject: {
    padding: "10px 20px",
    background: "red",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  status: (state) => ({
    fontWeight: "bold",
    color:
      state === "Approved"
        ? "green"
        : state === "Rejected"
        ? "red"
        : state === "Pending"
        ? "orange"
        : "black",
  }),
};
