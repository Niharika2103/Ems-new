import React, { useEffect, useState } from "react";
import {
  getFreelancerLettersApi,
  downloadFreelancerLetterApi,
} from "../../api/authApi";
import { decodeToken } from "../../api/decodeToekn";
import { toast } from "react-toastify";


const FreelancerLettersDownload = () => {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const decoded = decodeToken();
  const freelancerId = decoded?.id;

  const iconMap = {
    offer: "💼",
    appointment: "📄",
    experience: "⭐",
    relieving: "👋",
    confirmation: "📌",
    promotion: "📈",
    salary: "💰",
    increment: "💰",
    warning: "⚠️",
  };

  // ================= FETCH LETTERS =================
  useEffect(() => {
    const fetchLetters = async () => {
      try {
        if (!freelancerId) {
          setError("Session expired. Please login again.");
          return;
        }

        const res = await getFreelancerLettersApi(freelancerId);
        setLetters(res.data?.files || []);
      } catch (err) {
        console.error("❌ Fetch failed:", err);
        setError("Failed to fetch letters");
      } finally {
        setLoading(false);
      }
    };

    fetchLetters();
  }, [freelancerId]);

  // ================= DOWNLOAD LETTER =================
  const handleDownload = async (fileName) => {
  try {
    if (!freelancerId) {
      toast.error("Session expired. Please login again.");
      return;
    }

    const res = await downloadFreelancerLetterApi(
      freelancerId,
      fileName
    );

    const blob = new Blob([res.data], {
      type: "application/pdf",
    });

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

    // ✅ ERROR TOAST
    toast.error("Failed to download letter");
  }
};

  const getIcon = (name = "") => {
    const lower = name.toLowerCase();
    return (
      iconMap[
        Object.keys(iconMap).find((k) => lower.includes(k))
      ] || "📄"
    );
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📄 Freelancer Letters</h1>
      <p style={styles.subtitle}>
        Download your issued freelancer letters anytime
      </p>

      {loading && <p>⏳ Fetching letters...</p>}
      {!loading && error && (
        <p style={{ ...styles.empty, color: "red" }}>{error}</p>
      )}
      {!loading && !error && letters.length === 0 && (
        <p style={styles.empty}>No letters generated yet</p>
      )}

      <div style={styles.grid}>
        {letters.map((file, index) => (
          <div key={index} style={styles.card}>
            <div style={styles.icon}>
              {getIcon(file.name)}
            </div>

            <h3 style={styles.cardTitle}>
              {file.name.replace(".pdf", "")}
            </h3>

            <button
              style={styles.button}
              onClick={() => handleDownload(file.name)}
            >
              Download PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FreelancerLettersDownload;


/* ================= STYLES ================= */

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
  empty: {
    textAlign: "center",
    color: "#888",
    fontStyle: "italic",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: "15px",
    padding: "20px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  icon: {
    fontSize: "40px",
  },
  cardTitle: {
    fontSize: "14px",
    fontWeight: 600,
    wordBreak: "break-all",
  },
  button: {
    marginTop: 10,
    padding: "8px 14px",
    background: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};
