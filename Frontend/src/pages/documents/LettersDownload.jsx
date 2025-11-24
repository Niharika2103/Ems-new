import React, { useState, useEffect } from "react";
import { getEmployeeLettersEmployeeApi } from "../../api/authApi";

const LettersDownload = () => {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(false);

  const iconMap = {
    Offer: "💼",
    Appointment: "📄",
    Experience: "⭐",
    Relieving: "👋",
    Confirmation: "📌",
    Promotion: "📈",
    Salary: "💰",
    Increment: "💰",
    Warning: "⚠️"
  };

  const fetchLetters = async () => {
    setLoading(true);

    const storedDetails = JSON.parse(localStorage.getItem("ProjectDetails"));
    const employeeId = storedDetails?.employeeId;

    console.log("Logged-In Employee Details =>", storedDetails);
    console.log("Detected employeeId =>", employeeId);

    if (!employeeId) {
      console.error("❌ Employee ID not found");
      setLoading(false);
      return;
    }

    try {
      const res = await getEmployeeLettersEmployeeApi(employeeId);
      setLetters(res.data.files || []);
    } catch (error) {
      console.error("Error fetching letters:", error);
    }
    setLoading(false);
  };

  const handleDownload = (url) => {
    window.open(url, "_blank");
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📄 Employment Letters</h1>
      <p style={styles.subtitle}>Download your issued HR letters anytime</p>

      {loading && <div style={styles.loader}>⏳ Fetching letters...</div>}

      {!loading && letters.length === 0 && (
        <p style={styles.empty}>No letters generated yet</p>
      )}

      <div style={styles.grid}>
        {letters.map((file, index) => {
          const namePart = file.name.replace(".pdf", "");
          const displayIcon =
            iconMap[
              Object.keys(iconMap).find((key) =>
                namePart.toLowerCase().includes(key.toLowerCase())
              )
            ] || "📄";

          return (
            <div key={index} style={styles.card}>
              <div style={styles.icon}>{displayIcon}</div>
              <h3 style={styles.cardTitle}>{namePart}</h3>
              <button
                style={styles.button}
                onClick={() => handleDownload(file.url)}
              >
                Download PDF
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    padding: "30px",
    maxWidth: "1100px",
    margin: "0 auto",
    fontFamily: "Poppins, sans-serif",
  },
  title: {
    textAlign: "center",
    fontSize: "28px",
    fontWeight: "700",
    color: "#2c3e50",
  },
  subtitle: {
    textAlign: "center",
    color: "#7f8c8d",
    marginBottom: "25px",
    fontSize: "14px",
  },
  loader: {
    textAlign: "center",
    fontSize: "16px",
    color: "#2980b9",
  },
  empty: {
    textAlign: "center",
    color: "#888",
    fontStyle: "italic",
    marginTop: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  card: {
    background: "rgba(255,255,255,0.8)",
    borderRadius: "15px",
    padding: "20px",
    textAlign: "center",
    backdropFilter: "blur(8px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    transition: "transform 0.2s ease-in-out",
  },
  icon: {
    fontSize: "40px",
    marginBottom: "10px",
  },
  cardTitle: {
    fontSize: "15px",
    color: "#2c3e50",
    fontWeight: "600",
    marginBottom: "12px",
  },
  button: {
    padding: "8px 14px",
    background: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
};
// d
export default LettersDownload;
