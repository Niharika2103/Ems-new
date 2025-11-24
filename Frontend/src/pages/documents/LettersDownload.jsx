import React, { useState } from 'react';

const LettersDownload = () => {
  const [loading, setLoading] = useState(null);

  const letters = [
    { id: 'offer', title: 'Offer', icon: '💼', color: '#3498db' },
    { id: 'appointment', title: 'Appointment', icon: '⭐', color: '#f39c12' },
    { id: 'experience', title: 'Experience', icon: '👋', color: '#2ecc71' },
    { id: 'relieving', title: 'Relieving', icon: '✅', color: '#e74c3c' },
    { id: 'confirmation', title: 'Confirmation', icon: '📈', color: '#9b59b6' },
    { id: 'promotion', title: 'Promotion', icon: '💰', color: '#1abc9c' },
    { id: 'salary', title: 'Salary Inc', icon: '📊', color: '#d35400' },
    { id: 'warning', title: 'Warning', icon: '⚠️', color: '#c0392b' }
  ];

  const handleDownload = async (letter) => {
    setLoading(letter.id);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      alert(`Downloaded ${letter.title} Letter`);
    } catch (error) {
      alert('Download failed');
    } finally {
      setLoading(null);
    }
  };

  const handleBulkDownload = async () => {
    setLoading('bulk');
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('All letters downloaded!');
    } catch (error) {
      alert('Download failed');
    } finally {
      setLoading(null);
    }
  };

  // Compact Styles
  const styles = {
    container: {
      padding: '15px',
      maxWidth: '900px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    },
    header: {
      textAlign: 'center',
      marginBottom: '20px'
    },
    title: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#2c3e50',
      margin: '0 0 5px 0'
    },
    subtitle: {
      color: '#7f8c8d',
      fontSize: '12px',
      margin: '0'
    },
    bulkButton: {
      width: '100%',
      padding: '10px',
      background: '#27ae60',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      marginBottom: '15px'
    },
    lettersRow: {
      display: 'flex',
      gap: '10px',
      marginBottom: '15px',
      flexWrap: 'wrap',
      justifyContent: 'center'
    },
    letterCard: {
      background: 'white',
      padding: '15px',
      borderRadius: '8px',
      textAlign: 'center',
      boxShadow: '0 1px 5px rgba(0,0,0,0.1)',
      border: '1px solid #e1e8ed',
      minWidth: '100px',
      flex: '1'
    },
    letterIcon: {
      fontSize: '1.5em',
      marginBottom: '8px'
    },
    letterTitle: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#2c3e50',
      margin: '0 0 10px 0'
    },
    downloadBtn: {
      width: '100%',
      padding: '6px',
      background: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    footer: {
      textAlign: 'center',
      fontSize: '11px',
      color: '#95a5a6',
      marginTop: '15px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📄 Employment Letters</h1>
        <p style={styles.subtitle}>Quick download access</p>
      </div>

      <button 
        style={styles.bulkButton}
        onClick={handleBulkDownload}
        disabled={loading}
      >
        {loading === 'bulk' ? 'Downloading...' : '📦 Download All'}
      </button>

      <div style={styles.lettersRow}>
        {letters.map(letter => (
          <div key={letter.id} style={styles.letterCard}>
            <div style={{...styles.letterIcon, color: letter.color}}>
              {letter.icon}
            </div>
            <h3 style={styles.letterTitle}>{letter.title}</h3>
            <button
              style={{
                ...styles.downloadBtn,
                background: letter.color,
                opacity: loading === letter.id ? 0.6 : 1
              }}
              onClick={() => handleDownload(letter)}
              disabled={loading}
            >
              {loading === letter.id ? '...' : 'Get'}
            </button>
          </div>
        ))}
      </div>

      <div style={styles.footer}>
        HR Portal • Instant Access
      </div>
    </div>
  );
};

export default LettersDownload;