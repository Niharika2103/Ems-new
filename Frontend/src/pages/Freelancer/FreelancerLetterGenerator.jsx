// src/pages/Admin/FreelancerLetterGenerator.jsx
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  freelancerFetchApi,
  generateFreelancerLetterApi,
  getFreelancerLettersApi,
  deleteFreelancerLetterApi,
  sendFreelancerLetterEmailApi,
} from "../../api/authApi";

const FreelancerLetterGenerator = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [lettersMap, setLettersMap] = useState({});
  const [selectedLetterType, setSelectedLetterType] = useState("Offer Letter");
  const [loading, setLoading] = useState(false);
  const [generatingFor, setGeneratingFor] = useState(null);

  const letterTypes = [
    { id: "Offer Letter", icon: "📄" },
    { id: "Appointment Letter", icon: "💼" },
    { id: "Experience Letter", icon: "⭐" },
    { id: "Relieving Letter", icon: "👋" },
    { id: "Confirmation Letter", icon: "✅" },
    { id: "Promotion Letter", icon: "📈" },
    { id: "Salary Increment Letter", icon: "💰" },
    { id: "Warning Letter", icon: "⚠️" },
  ];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await freelancerFetchApi();
        const list = res.data || [];
        setFreelancers(list);

        const map = {};
        for (const f of list) {
          const lr = await getFreelancerLettersApi(f.id);
          map[f.id] = lr.data.files || [];
        }
        setLettersMap(map);
      } catch {
        alert("Failed to load freelancers");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // const generateLetter = async (id) => {
  //   setGeneratingFor(id);
  //   try {
  //     await generateFreelancerLetterApi({
  //       freelancerId: id,
  //       letterType: selectedLetterType,
  //     });
  //     const res = await getFreelancerLettersApi(id);
  //     setLettersMap((p) => ({ ...p, [id]: res.data.files || [] }));
  //   } finally {
  //     setGeneratingFor(null);
  //   }
  // };

  const generateLetter = async (id) => {
  const existingLetters = lettersMap[id] || [];

  const normalize = (str) =>
    str.toLowerCase().replace(/\s|_/g, "");

  const alreadyGenerated = existingLetters.some((file) =>
    normalize(file.name).includes(normalize(selectedLetterType))
  );

  // 🚫 Stop duplicate generation
  if (alreadyGenerated) {
    toast.warning(
      `⚠️ ${selectedLetterType} already generated for this freelancer`
    );
    return;
  }

  setGeneratingFor(id);

  try {
    await generateFreelancerLetterApi({
      freelancerId: id,
      letterType: selectedLetterType,
    });

    const res = await getFreelancerLettersApi(id);
    setLettersMap((p) => ({ ...p, [id]: res.data.files || [] }));

    toast.success(`✅ ${selectedLetterType} generated successfully`);
  } catch (err) {
    console.error(err);
    toast.error("❌ Failed to generate letter");
  } finally {
    setGeneratingFor(null);
  }
};

  const deleteLetter = async (id, file) => {
    if (!window.confirm("Delete this letter?")) return;
    await deleteFreelancerLetterApi(id, file);
    setLettersMap((p) => ({
      ...p,
      [id]: p[id].filter((f) => f.name !== file),
    }));
  };

  const sendLetter = async (id, file) => {
    await sendFreelancerLetterEmailApi({ freelancerId: id, fileName: file });
    alert("Email sent");
  };

  return (
    <div style={styles.page}>
      <ToastContainer position="top-right" autoClose={3000} />

      <h2 style={styles.title}>Freelancer Letter Management</h2>

      {/* LETTER TYPE */}
      <div style={styles.letterTypeBox}>
        <span style={styles.sectionLabel}>Select Letter Type</span>
        <div style={styles.letterButtons}>
          {letterTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedLetterType(t.id)}
              style={{
                ...styles.letterBtn,
                ...(selectedLetterType === t.id
                  ? styles.letterBtnActive
                  : {}),
              }}
            >
              {t.icon} {t.id}
            </button>
          ))}
        </div>
      </div>

      {/* FREELANCER LIST (SCROLLABLE) */}
      <div style={styles.freelancerList}>
        {loading ? (
          <p>Loading...</p>
        ) : (
          freelancers.map((f) => (
            <div key={f.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <strong>{f.name}</strong>
                  <div>Emp ID: {f.employee_id || "-"}</div>
                  <div>Dept: {f.department || "-"}</div>
                  <div>Designation: {f.designation || "-"}</div>
                </div>

                <button
                  style={styles.generateBtn}
                  disabled={generatingFor === f.id}
                  onClick={() => generateLetter(f.id)}
                >
                  {generatingFor === f.id ? "Generating..." : "Generate"}
                </button>
              </div>

              {(lettersMap[f.id] || []).length > 0 && (
                <div style={styles.generatedBox}>
                  <span style={styles.generatedLabel}>Generated:</span>

                  {(lettersMap[f.id] || []).map((file) => (
                    <div key={file.name} style={styles.generatedRow}>
                      <span>{file.name}</span>

                      <div style={styles.actions}>
                        <button
                          style={styles.viewBtn}
                          onClick={() => window.open(file.url)}
                        >
                          View
                        </button>
                        <button
                          style={styles.deleteBtn}
                          onClick={() => deleteLetter(f.id, file.name)}
                        >
                          Delete
                        </button>
                        <button
                          style={styles.sendBtn}
                          onClick={() => sendLetter(f.id, file.name)}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* ================= STYLES ================= */

const styles = {
  page: { padding: 20 },
  title: { textAlign: "center", marginBottom: 20 },

  letterTypeBox: {
    background: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionLabel: { fontWeight: 600, marginBottom: 10, display: "block" },
  letterButtons: { display: "flex", gap: 10, flexWrap: "wrap" },
  letterBtn: {
    padding: "8px 14px",
    border: "2px solid #007bff",
    background: "#fff",
    color: "#007bff",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  },
  letterBtnActive: { background: "#007bff", color: "#fff" },

  /* ✅ THIS IS THE IMPORTANT PART */
  freelancerList: {
    maxHeight: "65vh",
    overflowY: "auto",
    paddingRight: 6,
  },

  card: {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  generateBtn: {
    background: "#28a745",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: 5,
    cursor: "pointer",
  },

  generatedBox: { marginTop: 12 },
  generatedLabel: { fontSize: 13, color: "#6c757d" },
  generatedRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  actions: { display: "flex", gap: 8 },
  viewBtn: {
    background: "#17a2b8",
    color: "#fff",
    border: "none",
    padding: "4px 10px",
    borderRadius: 4,
  },
  deleteBtn: {
    background: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "4px 10px",
    borderRadius: 4,
  },
  sendBtn: {
    background: "#ffc107",
    color: "#000",
    border: "none",
    padding: "4px 10px",
    borderRadius: 4,
  },
};

export default FreelancerLetterGenerator;
