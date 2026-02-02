import React, { useEffect, useState } from "react";
import {
  getEmployeeLettersEmployeeApi,
  downloadEmployeeLetterApi
} from "../../api/authApi";
import { decodeToken } from "../../api/decodeToekn";
import { toast } from "react-toastify";


const LettersDownload = () => {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const iconMap = {
    Offer: "💼",
    Appointment: "📄",
    Experience: "⭐",
    Relieving: "👋",
    Confirmation: "📌",
    Promotion: "📈",
    Salary: "💰",
    Increment: "💰",
    Warning: "⚠️",
  };

  // ================= FETCH LETTERS =================
  const fetchLetters = async () => {
    try {
      setLoading(true);
      setError("");

      const decoded = decodeToken();
      if (!decoded?.id) {
        setError("Session expired. Please login again.");
        return;
      }

      const res = await getEmployeeLettersEmployeeApi(decoded.id);
      setLetters(res.data?.files || []);
    } catch (err) {
      console.error("❌ Fetch letters failed:", err);
      setError("Failed to fetch letters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  // ================= DOWNLOAD LETTER =================
  const handleDownload = async (fileName) => {
  try {
    const decoded = decodeToken();
    const employeeId = decoded?.id;

    if (!employeeId) {
      toast.error("Session expired. Please login again.");
      return;
    }

    const res = await downloadEmployeeLetterApi(employeeId, fileName);

    // 🛑 Safety check (in case backend sends empty response)
    if (!res || !res.data) {
      toast.error("No file received from server");
      return;
    }

    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // ✅ SUCCESS TOAST
    toast.success("Letter downloaded successfully");

  } catch (err) {
    console.error("❌ Download failed:", err);

    // ✅ SHOW BACKEND ERROR IF AVAILABLE
    const msg =
      err.response?.data?.error ||
      err.message ||
      "Failed to download letter";

    toast.error(msg);
  }
};

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📄 Employment Letters</h1>
      <p style={styles.subtitle}>Download your issued HR letters anytime</p>

      {loading && <p style={styles.loader}>⏳ Fetching letters...</p>}

      {!loading && error && (
        <p style={{ ...styles.empty, color: "red" }}>{error}</p>
      )}

      {!loading && !error && letters.length === 0 && (
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
                onClick={() => handleDownload(file.name)}
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

// ================= STYLES =================
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
    background: "rgba(255,255,255,0.9)",
    borderRadius: "15px",
    padding: "20px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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

export default LettersDownload;
