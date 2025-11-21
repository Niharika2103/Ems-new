
import React, { useState, useEffect } from 'react';

const AdminLetterGenerator = () => {
  const [selectedLetterType, setSelectedLetterType] = useState('offer');
  const [letters, setLetters] = useState({
    offer: [],
    joining: [],
    appointment: [],
    experience: [],
    relieving: []
  });
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isViewingLetter, setIsViewingLetter] = useState(false);

  // Letter types
  const letterTypes = [
    { id: 'offer', name: 'Offer Letters', icon: '📄' },
    { id: 'joining', name: 'Joining Letters', icon: '👥' },
    { id: 'appointment', name: 'Appointment Letters', icon: '💼' },
    { id: 'experience', name: 'Experience Certificates', icon: '⭐' },
    { id: 'relieving', name: 'Relieving Letters', icon: '👋' }
  ];

  // Sample data for demonstration
  useEffect(() => {
    const sampleLetters = {
      offer: [
        { 
          id: 1, 
          employeeName: 'John Doe', 
          position: 'Software Engineer', 
          date: '2024-01-15', 
          status: 'Draft',
          department: 'Engineering',
          joiningDate: '2024-02-01',
          email: 'john.doe@email.com'
        },
        { 
          id: 2, 
          employeeName: 'Jane Smith', 
          position: 'Product Manager', 
          date: '2024-01-20', 
          status: 'Sent',
          department: 'Product',
          joiningDate: '2024-02-15',
          email: 'jane.smith@email.com'
        }
      ],
      joining: [
        { 
          id: 1, 
          employeeName: 'John Doe', 
          position: 'Software Engineer', 
          date: '2024-02-01', 
          status: 'Completed',
          department: 'Engineering',
          email: 'john.doe@email.com'
        }
      ],
      appointment: [
        { 
          id: 1, 
          employeeName: 'John Doe', 
          position: 'Software Engineer', 
          date: '2024-02-01', 
          status: 'Active',
          department: 'Engineering',
          email: 'john.doe@email.com'
        }
      ],
      experience: [
        { 
          id: 1, 
          employeeName: 'Robert Brown', 
          position: 'Senior Developer', 
          date: '2024-01-30', 
          status: 'Issued',
          department: 'Engineering',
          email: 'robert.brown@email.com'
        }
      ],
      relieving: [
        { 
          id: 1, 
          employeeName: 'Emily Davis', 
          position: 'Marketing Manager', 
          date: '2024-01-28', 
          status: 'Processed',
          department: 'Marketing',
          email: 'emily.davis@email.com'
        }
      ]
    };
    
    setLetters(sampleLetters);
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'sent':
      case 'completed':
      case 'active':
      case 'issued':
      case 'processed':
        return '#28a745';
      case 'accepted':
        return '#17a2b8';
      case 'pending':
        return '#ffc107';
      case 'draft':
        return '#6c757d';
      case 'rejected':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  // Handle create new letter
  // const handleCreateNew = () => {
  //   setIsCreatingNew(true);
  //   setSelectedLetter(null);
  //   setIsViewingLetter(false);
  // };

  // Handle view letter
  const handleViewLetter = (letter) => {
    setSelectedLetter(letter);
    setIsViewingLetter(true);
    setIsCreatingNew(false);
  };

  // Handle back to list
  const handleBackToList = () => {
    setSelectedLetter(null);
    setIsCreatingNew(false);
    setIsViewingLetter(false);
  };

  // Handle delete letter
  const handleDeleteLetter = (letterId, e) => {
    if (e) e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this letter?')) {
      setLetters(prev => ({
        ...prev,
        [selectedLetterType]: prev[selectedLetterType].filter(letter => letter.id !== letterId)
      }));
      handleBackToList();
    }
  };

  // Handle download letter
  const handleDownloadLetter = (letter, e) => {
    if (e) e.stopPropagation();
    alert(`Downloading ${selectedLetterType} letter for ${letter.employeeName}`);
  };

  // Handle send letter
  const handleSendLetter = (letter, e) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Send ${selectedLetterType} letter to ${letter.employeeName} (${letter.email})?`)) {
      // Update letter status to "Sent"
      setLetters(prev => ({
        ...prev,
        [selectedLetterType]: prev[selectedLetterType].map(l => 
          l.id === letter.id ? { ...l, status: 'Sent' } : l
        )
      }));
      
      if (selectedLetter && selectedLetter.id === letter.id) {
        setSelectedLetter(prev => ({ ...prev, status: 'Sent' }));
      }
      
      alert(`Letter sent successfully to ${letter.email}`);
    }
  };

  // Handle edit letter
  const handleEditLetter = (letter, e) => {
    if (e) e.stopPropagation();
    alert(`Edit functionality for ${letter.employeeName}'s letter`);
    // Here you would typically open an edit form
  };

  // Generate letter content for preview
  const generateLetterContent = (letter) => {
    const letterType = letterTypes.find(type => type.id === selectedLetterType)?.name;
    
    return `
${letterType.toUpperCase()}
${'='.repeat(50)}

Company Name: ABC Technologies
Company Address: 123 Business Park, City, State

Date: ${formatDate(letter.date)}

Dear ${letter.employeeName},

This is a sample ${selectedLetterType} letter for the position of ${letter.position} in the ${letter.department} department.

${letter.joiningDate ? `Joining Date: ${formatDate(letter.joiningDate)}` : ''}

We are pleased to offer you this position and look forward to having you on our team.

Best regards,
HR Department
ABC Technologies

Status: ${letter.status}
${'='.repeat(50)}
    `;
  };

  // Render letter list
  const renderLetterList = () => {
    const currentLetters = letters[selectedLetterType] || [];

    return (
      <div style={styles.listContainer}>
        <div style={styles.listHeader}>
          <h3 style={styles.listTitle}>
            {letterTypes.find(type => type.id === selectedLetterType)?.name}
            <span style={styles.countBadge}>{currentLetters.length}</span>
          </h3>
          
        </div>

        {currentLetters.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📄</div>
            <h4 style={styles.emptyTitle}>No {selectedLetterType} letters found</h4>
            <p style={styles.emptyText}>
              Get started by creating your first {selectedLetterType} letter.
            </p>
            <button 
              onClick={handleCreateNew}
              style={styles.createButton}
            >
              Create New Letter
            </button>
          </div>
        ) : (
          <div style={styles.lettersGrid}>
            {currentLetters.map(letter => (
              <div 
                key={letter.id} 
                style={styles.letterCard}
              >
                <div style={styles.cardHeader}>
                  <h4 style={styles.employeeName}>{letter.employeeName}</h4>
                  <span 
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(letter.status)
                    }}
                  >
                    {letter.status}
                  </span>
                </div>
                
                <div style={styles.cardContent}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Position:</span>
                    <span style={styles.detailValue}>{letter.position}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Department:</span>
                    <span style={styles.detailValue}>{letter.department}</span>
                  </div>
                  {letter.joiningDate && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Joining Date:</span>
                      <span style={styles.detailValue}>{formatDate(letter.joiningDate)}</span>
                    </div>
                  )}
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Email:</span>
                    <span style={styles.detailValue}>{letter.email}</span>
                  </div>
                </div>

                <div style={styles.cardActions}>
                  <button 
                    onClick={() => handleViewLetter(letter)}
                    style={styles.viewBtn}
                  >
                    View
                  </button>
                  <button 
                    onClick={(e) => handleEditLetter(letter, e)}
                    style={styles.editBtn}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={(e) => handleSendLetter(letter, e)}
                    style={styles.sendBtn}
                    disabled={letter.status === 'Sent'}
                  >
                    Send
                  </button>
                  <button 
                    onClick={(e) => handleDeleteLetter(letter.id, e)}
                    style={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render letter preview
  const renderLetterPreview = () => {
    if (!selectedLetter) return null;

    return (
      <div style={styles.previewContainer}>
        <div style={styles.previewHeader}>
          <button onClick={handleBackToList} style={styles.backButton}>
            ← Back to List
          </button>
          <h3 style={styles.previewTitle}>
            {selectedLetter.employeeName} - {selectedLetterType} Letter
          </h3>
          <div style={styles.previewActions}>
            <button 
              onClick={(e) => handleEditLetter(selectedLetter, e)}
              style={styles.editButton}
            >
              Edit
            </button>
            <button 
              onClick={(e) => handleSendLetter(selectedLetter, e)}
              style={styles.sendButton}
              disabled={selectedLetter.status === 'Sent'}
            >
              Send
            </button>
            <button 
              onClick={(e) => handleDownloadLetter(selectedLetter, e)}
              style={styles.downloadButton}
            >
              Download
            </button>
            <button 
              onClick={(e) => handleDeleteLetter(selectedLetter.id, e)}
              style={styles.deleteButton}
            >
              Delete
            </button>
          </div>
        </div>

        <div style={styles.previewContent}>
          <div style={styles.letterPreview}>
            <pre style={styles.letterContent}>
              {generateLetterContent(selectedLetter)}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  // Render create new letter form (simplified)
  const renderCreateNew = () => {
    return (
      <div style={styles.createContainer}>
        <div style={styles.createHeader}>
          <button onClick={handleBackToList} style={styles.backButton}>
            ← Back to List
          </button>
          <h3 style={styles.createTitle}>
            Create New {letterTypes.find(type => type.id === selectedLetterType)?.name}
          </h3>
        </div>
        
        <div style={styles.createForm}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Employee Name</label>
            <input type="text" style={styles.formInput} placeholder="Enter employee name" />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Position</label>
            <input type="text" style={styles.formInput} placeholder="Enter position" />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Department</label>
            <input type="text" style={styles.formInput} placeholder="Enter department" />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Email</label>
            <input type="email" style={styles.formInput} placeholder="Enter email" />
          </div>
          
          <div style={styles.formActions}>
            <button onClick={handleBackToList} style={styles.cancelButton}>
              Cancel
            </button>
            <button onClick={handleBackToList} style={styles.saveButton}>
              Create Letter
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Letter Management</h1>
      
      <div style={styles.content}>
        {/* Letter Type Selection */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Select Letter Type</h3>
          <div style={styles.letterTypeButtons}>
            {letterTypes.map(type => (
              <button
                key={type.id}
                style={{
                  ...styles.letterTypeButton,
                  ...(selectedLetterType === type.id ? styles.activeLetterType : {})
                }}
                onClick={() => {
                  setSelectedLetterType(type.id);
                  handleBackToList();
                }}
              >
                <span style={styles.typeIcon}>{type.icon}</span>
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.section}>
          {isCreatingNew ? renderCreateNew() : 
           isViewingLetter ? renderLetterPreview() : renderLetterList()}
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '30px'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  section: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e9ecef'
  },
  sectionTitle: {
    marginTop: '0',
    color: '#495057',
    borderBottom: '2px solid #dee2e6',
    paddingBottom: '10px'
  },
  letterTypeButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  letterTypeButton: {
    padding: '12px 20px',
    border: '2px solid #007bff',
    backgroundColor: 'white',
    color: '#007bff',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  activeLetterType: {
    backgroundColor: '#007bff',
    color: 'white'
  },
  typeIcon: {
    fontSize: '16px'
  },
  listContainer: {
    width: '100%'
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  listTitle: {
    margin: '0',
    color: '#495057',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  countBadge: {
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '12px',
    padding: '2px 8px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  createButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#6c757d'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '15px'
  },
  emptyTitle: {
    margin: '0 0 10px 0',
    color: '#495057'
  },
  emptyText: {
    margin: '0 0 20px 0'
  },
  lettersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  letterCard: {
    backgroundColor: 'white',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '20px',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px'
  },
  employeeName: {
    margin: '0',
    color: '#2c3e50',
    fontSize: '18px'
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'uppercase'
  },
  cardContent: {
    marginBottom: '15px'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    paddingBottom: '8px',
    borderBottom: '1px solid #f8f9fa'
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#6c757d',
    fontSize: '12px'
  },
  detailValue: {
    color: '#495057',
    fontSize: '14px'
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'space-between'
  },
  viewBtn: {
    padding: '8px 12px',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    flex: 1
  },
  editBtn: {
    padding: '8px 12px',
    backgroundColor: '#ffc107',
    color: 'black',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    flex: 1
  },
  sendBtn: {
    padding: '8px 12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    flex: 1
  },
  deleteBtn: {
    padding: '8px 12px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    flex: 1
  },
  previewContainer: {
    width: '100%'
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  previewTitle: {
    margin: '0',
    color: '#495057',
    textAlign: 'center',
    flex: 1
  },
  previewActions: {
    display: 'flex',
    gap: '10px'
  },
  editButton: {
    padding: '8px 16px',
    backgroundColor: '#ffc107',
    color: 'black',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  sendButton: {
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  downloadButton: {
    padding: '8px 16px',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  deleteButton: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  previewContent: {
    width: '100%'
  },
  letterPreview: {
    backgroundColor: 'white',
    border: '1px solid #dee2e6',
    borderRadius: '5px',
    padding: '20px',
    maxHeight: '500px',
    overflow: 'auto'
  },
  letterContent: {
    whiteSpace: 'pre-wrap',
    fontFamily: 'monospace',
    fontSize: '14px',
    lineHeight: '1.5',
    margin: '0'
  },
  createContainer: {
    width: '100%'
  },
  createHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '20px'
  },
  createTitle: {
    margin: '0',
    color: '#495057'
  },
  createForm: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #dee2e6'
  },
  formGroup: {
    marginBottom: '15px'
  },
  formLabel: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#495057'
  },
  formInput: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '14px'
  },
  formActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '20px'
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  saveButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  }
};

export default AdminLetterGenerator;