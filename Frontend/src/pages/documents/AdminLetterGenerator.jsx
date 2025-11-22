// AdminLetterGenerator.js
import React, { useState, useEffect } from 'react';
import {
  employeeFetchApi,
  generateLetterApi,
  getEmployeeLettersApi,deleteLetterApi
} from "../../api/authApi";

const AdminLetterGenerator = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedLetterType, setSelectedLetterType] = useState('Offer Letter');
  const [employeeLettersMap, setEmployeeLettersMap] = useState({}); // { empId: [ {name, url}, ... ] }
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [generatingFor, setGeneratingFor] = useState(null); // employeeId being processed

  // Supported letter types (must match backend exactly)
  const letterTypes = [
    { id: 'Offer Letter', name: 'Offer Letter', icon: '📄' },
    { id: 'Appointment Letter', name: 'Appointment Letter', icon: '💼' },
    { id: 'Experience Letter', name: 'Experience Letter', icon: '⭐' },
    { id: 'Relieving Letter', name: 'Relieving Letter', icon: '👋' },
    { id: 'Confirmation Letter', name: 'Confirmation Letter', icon: '✅' },
    { id: 'Promotion Letter', name: 'Promotion Letter', icon: '📈' },
    { id: 'Salary Increment Letter', name: 'Salary Increment Letter', icon: '💰' },
    { id: 'Warning Letter', name: 'Warning Letter', icon: '⚠️' },
  ];

  // Fetch all employees on mount
  useEffect(() => {
    const fetchAll = async () => {
      setLoadingEmployees(true);
      try {
        const res = await employeeFetchApi();
        const empList = Array.isArray(res.data) ? res.data : res.data?.employees || [];
        setEmployees(empList);

        // Pre-fetch letters for all employees (optional: can lazy-load on expand)
        const lettersMap = {};
        for (const emp of empList) {
          try {
            const letterRes = await getEmployeeLettersApi(emp.id);
            lettersMap[emp.id] = letterRes.data.files || [];
          } catch {
            lettersMap[emp.id] = [];
          }
        }
        setEmployeeLettersMap(lettersMap);
      } catch (err) {
        console.error('Failed to load employees or letters:', err);
        alert('Failed to load employee data');
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchAll();
  }, []);

  const handleGenerateLetter = async (employeeId) => {
    if (!employeeId || !selectedLetterType) return;

    setGeneratingFor(employeeId);
    try {
      await generateLetterApi({
        employeeId,
        letterType: selectedLetterType,
      });

      // Refresh letters for this employee
      const res = await getEmployeeLettersApi(employeeId);
      setEmployeeLettersMap((prev) => ({
        ...prev,
        [employeeId]: res.data.files || [],
      }));
      alert(`✅ ${selectedLetterType} generated for employee!`);
    } catch (err) {
      console.error('Generation failed:', err);
      const msg = err.response?.data?.error || 'Failed to generate letter';
      alert(`❌ ${msg}`);
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleDeleteLetter = async (employeeId, filename) => {
  if (!window.confirm(`Are you sure you want to delete "${filename}"?\nThis action cannot be undone.`)) {
    return;
  }

  try {
    // Call backend delete API
    await deleteLetterApi(employeeId, filename);

    // Update UI: remove the file from local state
    setEmployeeLettersMap(prev => {
      const updated = { ...prev };
      updated[employeeId] = (updated[employeeId] || []).filter(file => file.name !== filename);
      return updated;
    });

    alert('✅ Letter deleted successfully!');
  } catch (err) {
    console.error('Delete error:', err);
    const errorMsg = err.response?.data?.error || 'Failed to delete letter. Please try again.';
    alert(`❌ ${errorMsg}`);
  }
};

  const handleDownload = (url) => {
    window.open(url, '_blank');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Letter Management</h1>

      {/* Letter Type Selector */}
      <div style={styles.letterTypeSection}>
        <h3 style={styles.sectionTitle}>Select Letter Type</h3>
        <div style={styles.letterTypeButtons}>
          {letterTypes.map((type) => (
            <button
              key={type.id}
              style={{
                ...styles.letterTypeButton,
                ...(selectedLetterType === type.id ? styles.activeLetterType : {}),
              }}
              onClick={() => setSelectedLetterType(type.id)}
            >
              <span style={styles.typeIcon}>{type.icon}</span>
              {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* Employee List with Actions */}
      <div style={styles.mainContent}>
        {/* Employee List */}
        <div style={styles.employeeListContainer}>
          <h3 style={styles.listHeader}>Employees ({employees.length})</h3>
          {loadingEmployees ? (
            <p style={styles.loadingText}>Loading employees...</p>
          ) : employees.length === 0 ? (
            <p style={styles.emptyText}>No employees found.</p>
          ) : (
            <div style={styles.employeeList}>
              {employees.map((emp) => {
                const letters = employeeLettersMap[emp.id] || [];
                return (
                  <div key={emp.id} style={styles.employeeCard}>
                    <div style={styles.employeeInfo}>
                      <strong>{emp.name}</strong>
                      <div>Emp ID: {emp.employee_id || '—'}</div>
                      <div>Dept: {emp.department || '—'}</div>
                      <div>Designation: {emp.designation || '—'}</div>
                    </div>

                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => handleGenerateLetter(emp.id)}
                        disabled={generatingFor === emp.id}
                        style={styles.generateBtn}
                      >
                        {generatingFor === emp.id ? 'Generating...' : 'Generate'}
                      </button>
                    </div>

                    {/* Show existing letters */}
                    {letters.length > 0 && (
                      <div style={styles.letterPreviewList}>
                        <small style={styles.letterLabel}>Generated:</small>
                        {letters.map((file, idx) => (
                          <div key={idx} style={styles.fileRow}>
                            <span style={styles.fileName}>{file.name.replace('.pdf', '')}</span>
                           <button
  onClick={() => handleDownload(file.url)}
  style={styles.viewBtn}
>
  View
</button>
<span style={{ margin: '0 8px' }}></span> {/* Space between buttons */}
<button
  onClick={(e) => {
    e.stopPropagation();
    handleDeleteLetter(emp.id, file.name);
  }}
  style={styles.deleteBtn}
>
  Delete
</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '20px',
  },
  letterTypeSection: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #e9ecef',
  },
  sectionTitle: {
    margin: '0 0 15px 0',
    color: '#495057',
  },
  letterTypeButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  letterTypeButton: {
    padding: '10px 16px',
    border: '2px solid #007bff',
    backgroundColor: 'white',
    color: '#007bff',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  activeLetterType: {
    backgroundColor: '#007bff',
    color: 'white',
  },
  typeIcon: {
    fontSize: '16px',
  },
  mainContent: {
    display: 'flex',
    gap: '20px',
  },
  employeeListContainer: {
    flex: 1,
    backgroundColor: '#fff',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    padding: '16px',
    maxHeight: '70vh',
    overflowY: 'auto',
  },
  listHeader: {
    margin: '0 0 16px 0',
    padding: '0 0 10px',
    borderBottom: '1px solid #eee',
    color: '#495057',
  },
  loadingText: {
    textAlign: 'center',
    color: '#6c757d',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6c757d',
    fontStyle: 'italic',
  },
  employeeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  employeeCard: {
    display: 'flex',
    flexDirection: 'column',
    padding: '14px',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
  },
  employeeInfo: {
    fontSize: '14px',
    marginBottom: '12px',
    lineHeight: 1.4,
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '10px',
  },
  generateBtn: {
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  letterPreviewList: {
    borderTop: '1px dashed #ccc',
    paddingTop: '10px',
    marginTop: '10px',
  },
  letterLabel: {
    display: 'block',
    marginBottom: '6px',
    color: '#6c757d',
    fontSize: '12px',
  },
  fileRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 0',
    fontSize: '13px',
  },
  fileName: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: '#2c3e50',
  },
  viewBtn: {
    padding: '4px 10px',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    marginLeft: '8px',
  },
  fileActions: {
  display: 'flex',
  gap: '8px',
},
deleteBtn: {
  padding: '4px 10px',
  backgroundColor: '#dc3545', // Bootstrap danger red
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 'bold',
},
};

export default AdminLetterGenerator;