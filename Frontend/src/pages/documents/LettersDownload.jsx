import React, { useState } from 'react';

const LettersDownload = () => {
  const [loading, setLoading] = useState(null);

  const letters = [
    { id: 'offer', title: 'Offer Letter', color: '#1e40af' },
    { id: 'appointment', title: 'Appointment', color: '#2563eb' },
    { id: 'experience', title: 'Experience', color: '#3b82f6' },
    { id: 'relieving', title: 'Relieving', color: '#1e40af' },
    { id: 'confirmation', title: 'Confirmation', color: '#2563eb' },
    { id: 'promotion', title: 'Promotion', color: '#3b82f6' },
    { id: 'salary', title: 'Salary Increment', color: '#1e40af' },
    { id: 'warning', title: 'Warning', color: '#dc2626' }
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

  // Professional Admin Styles
  const styles = {
    container: {
      padding: '30px',
      maxWidth: '1000px',
      margin: '0 auto',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      minHeight: '100vh'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
      padding: '25px',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1e40af',
      margin: '0 0 8px 0'
    },
    subtitle: {
      color: '#64748b',
      fontSize: '14px',
      margin: '0',
      fontWeight: '500'
    },
    bulkButton: {
      width: '100%',
      padding: '15px',
      background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      marginBottom: '30px',
      boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px'
    },
    lettersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    letterCard: {
      background: 'white',
      padding: '25px 20px',
      borderRadius: '12px',
      textAlign: 'center',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    },
    letterTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1e293b',
      margin: '0 0 20px 0',
      padding: '0'
    },
    downloadBtn: {
      width: '100%',
      padding: '12px',
      background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    warningBtn: {
      background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
    },
    footer: {
      textAlign: 'center',
      fontSize: '14px',
      color: '#64748b',
      marginTop: '30px',
      padding: '20px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      fontWeight: '500'
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '12px'
    },
    loadingSpinner: {
      width: '20px',
      height: '20px',
      border: '2px solid #f3f4f6',
      borderTop: '2px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    badge: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      background: '#3b82f6',
      color: 'white',
      fontSize: '10px',
      padding: '3px 10px',
      borderRadius: '12px',
      fontWeight: '600'
    },
    cardHeader: {
      borderBottom: '2px solid #f1f5f9',
      paddingBottom: '15px',
      marginBottom: '15px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Employment Letters Portal</h1>
        <p style={styles.subtitle}>Admin Dashboard • Document Management System</p>
      </div>

      {/* <button 
        style={{
          ...styles.bulkButton,
          opacity: loading === 'bulk' ? 0.7 : 1,
          transform: loading === 'bulk' ? 'scale(0.98)' : 'scale(1)'
        }}
        onClick={handleBulkDownload}
        disabled={loading}
        onMouseOver={(e) => {
          if (!loading) e.target.style.transform = 'scale(1.02)';
        }}
        onMouseOut={(e) => {
          if (!loading) e.target.style.transform = 'scale(1)';
        }}
      >
        {loading === 'bulk' ? (
          <>
            <div style={styles.loadingSpinner}></div>
            Downloading All Documents...
          </>
        ) : (
          'Download All Letters'
        )}
      </button> */}

      <div style={styles.lettersGrid}>
        {letters.map(letter => (
          <div 
            key={letter.id} 
            style={{
              ...styles.letterCard,
              transform: loading === letter.id ? 'scale(0.98)' : 'scale(1)'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }
            }}
          >
            {loading === letter.id && (
              <div style={styles.loadingOverlay}>
                <div style={styles.loadingSpinner}></div>
              </div>
            )}
            
            <div style={styles.cardHeader}>
              <h3 style={styles.letterTitle}>{letter.title}</h3>
            </div>
            
            <div style={styles.badge}>
              PDF
            </div>
            
            <button
              style={{
                ...styles.downloadBtn,
                ...(letter.id === 'warning' && styles.warningBtn),
                opacity: loading === letter.id ? 0.6 : 1
              }}
              onClick={() => handleDownload(letter)}
              disabled={loading}
              onMouseOver={(e) => {
                if (!loading) e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                if (!loading) e.target.style.transform = 'translateY(0)';
              }}
            >
              {loading === letter.id ? (
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                  <div style={{...styles.loadingSpinner, width: '14px', height: '14px'}}></div>
                  Loading
                </div>
              ) : (
                'Download'
              )}
            </button>
          </div>
        ))}
      </div>

      <div style={styles.footer}>
        <strong>HR Administration System</strong> • Secure Document Access • {new Date().getFullYear()}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LettersDownload;