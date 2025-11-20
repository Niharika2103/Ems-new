// AdminLetterGenerator.js
import React, { useState } from 'react';

const AdminLetterGenerator = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('offer');
  const [formData, setFormData] = useState({});
  const [previewData, setPreviewData] = useState(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  // Template configurations
  const templates = [
    { id: 'offer', name: 'Offer Letter' },
    { id: 'joining', name: 'Joining Letter' },
    { id: 'appointment', name: 'Appointment Letter' },
    { id: 'experience', name: 'Experience Certificate' },
    { id: 'relieving', name: 'Relieving Letter' }
  ];

  // Common fields for all templates
  const commonFields = [
    { key: 'companyName', label: 'Company Name', type: 'text' },
    { key: 'companyAddress', label: 'Company Address', type: 'textarea' },
    { key: 'currentDate', label: 'Date', type: 'date' }
  ];

  // Template-specific fields
  const templateFields = {
    offer: [
      { key: 'candidateName', label: 'Candidate Name', type: 'text' },
      { key: 'position', label: 'Position', type: 'text' },
      { key: 'department', label: 'Department', type: 'text' },
      { key: 'joiningDate', label: 'Joining Date', type: 'date' },
      { key: 'salary', label: 'Salary', type: 'text' },
      { key: 'reportingManager', label: 'Reporting Manager', type: 'text' },
      { key: 'workLocation', label: 'Work Location', type: 'text' }
    ],
    joining: [
      { key: 'employeeName', label: 'Employee Name', type: 'text' },
      { key: 'position', label: 'Position', type: 'text' },
      { key: 'joiningDate', label: 'Joining Date', type: 'date' },
      { key: 'workTiming', label: 'Work Timing', type: 'text' },
      { key: 'workLocation', label: 'Work Location', type: 'text' },
      { key: 'hrManager', label: 'HR Manager', type: 'text' }
    ],
    appointment: [
      { key: 'employeeName', label: 'Employee Name', type: 'text' },
      { key: 'position', label: 'Position', type: 'text' },
      { key: 'department', label: 'Department', type: 'text' },
      { key: 'appointmentDate', label: 'Appointment Date', type: 'date' },
      { key: 'probationPeriod', label: 'Probation Period', type: 'text' },
      { key: 'termsConditions', label: 'Terms & Conditions', type: 'textarea' }
    ],
    experience: [
      { key: 'employeeName', label: 'Employee Name', type: 'text' },
      { key: 'position', label: 'Position', type: 'text' },
      { key: 'employmentFrom', label: 'Employment From', type: 'date' },
      { key: 'employmentTo', label: 'Employment To', type: 'date' },
      { key: 'workDescription', label: 'Work Description', type: 'textarea' },
      { key: 'managerName', label: 'Manager Name', type: 'text' }
    ],
    relieving: [
      { key: 'employeeName', label: 'Employee Name', type: 'text' },
      { key: 'position', label: 'Position', type: 'text' },
      { key: 'lastWorkingDay', label: 'Last Working Day', type: 'date' },
      { key: 'reason', label: 'Reason for Leaving', type: 'textarea' },
      { key: 'clearanceStatus', label: 'Clearance Status', type: 'text' }
    ]
  };

  // Handle input changes
  const handleInputChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Generate preview
  const handleGeneratePreview = (e) => {
    e.preventDefault();
    setPreviewData({ ...formData });
    setIsPreviewVisible(true);
  };

  // Reset form
  const handleReset = () => {
    setFormData({});
    setPreviewData(null);
    setIsPreviewVisible(false);
  };

  // Download as text file
  const handleDownload = () => {
    const content = generateLetterContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate}-letter.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate letter content based on template
  const generateLetterContent = () => {
    if (!previewData) return '';

    const data = previewData;
    const currentDate = data.currentDate || new Date().toLocaleDateString();

    switch (selectedTemplate) {
      case 'offer':
        return `OFFER LETTER

${data.companyName || '[Company Name]'}
${data.companyAddress || '[Company Address]'}

Date: ${currentDate}

Dear ${data.candidateName || '[Candidate Name]'},

We are pleased to offer you the position of ${data.position || '[Position]'} in our ${data.department || '[Department]'} department.

Your joining date will be: ${data.joiningDate || '[Joining Date]'}
Annual Salary: ${data.salary || '[Salary]'}
Work Location: ${data.workLocation || '[Work Location]'}
Reporting Manager: ${data.reportingManager || '[Reporting Manager]'}

We look forward to having you on our team.

Sincerely,
${data.companyName || '[Company Name]'}
HR Department`;

      case 'joining':
        return `JOINING LETTER

${data.companyName || '[Company Name]'}
${data.companyAddress || '[Company Address]'}

Date: ${currentDate}

Dear ${data.employeeName || '[Employee Name]'},

Welcome to ${data.companyName || '[Company Name]'}! We are pleased to confirm your joining as ${data.position || '[Position]'}.

Joining Date: ${data.joiningDate || '[Joining Date]'}
Work Timing: ${data.workTiming || '[Work Timing]'}
Work Location: ${data.workLocation || '[Work Location]'}

Please report to ${data.hrManager || '[HR Manager]'} on your joining date.

Best regards,
HR Department
${data.companyName || '[Company Name]'}`;

      case 'appointment':
        return `APPOINTMENT LETTER

${data.companyName || '[Company Name]'}
${data.companyAddress || '[Company Address]'}

Date: ${currentDate}

Dear ${data.employeeName || '[Employee Name]'},

We are pleased to appoint you as ${data.position || '[Position]'} in our ${data.department || '[Department]'} department.

Appointment Date: ${data.appointmentDate || '[Appointment Date]'}
Probation Period: ${data.probationPeriod || '[Probation Period]'}

Terms & Conditions:
${data.termsConditions || '[Terms and Conditions]'}

We welcome you to our organization.

Sincerely,
Management
${data.companyName || '[Company Name]'}`;

      case 'experience':
        return `EXPERIENCE CERTIFICATE

${data.companyName || '[Company Name]'}
${data.companyAddress || '[Company Address]'}

Date: ${currentDate}

TO WHOM IT MAY CONCERN

This is to certify that ${data.employeeName || '[Employee Name]'} worked with us as ${data.position || '[Position]'} from ${data.employmentFrom || '[From Date]'} to ${data.employmentTo || '[To Date]'}.

During this period, ${data.employeeName || '[Employee Name]'} demonstrated excellent skills and dedication. ${data.workDescription || '[Work Description]'}

We wish ${data.employeeName || '[Employee Name]'} all the best for future endeavors.

Sincerely,
${data.managerName || '[Manager Name]'}
${data.companyName || '[Company Name]'}`;

      case 'relieving':
        return `RELIEVING LETTER

${data.companyName || '[Company Name]'}
${data.companyAddress || '[Company Address]'}

Date: ${currentDate}

Dear ${data.employeeName || '[Employee Name]'},

This letter confirms that you are relieved from your duties as ${data.position || '[Position]'} effective ${data.lastWorkingDay || '[Last Working Day]'}.

Reason: ${data.reason || '[Reason for Leaving]'}
Clearance Status: ${data.clearanceStatus || '[Clearance Status]'}

We thank you for your service and wish you success in your future endeavors.

Sincerely,
HR Department
${data.companyName || '[Company Name]'}`;

      default:
        return 'Select a template to generate letter.';
    }
  };

  // Get all fields for current template
  const getAllFields = () => {
    return [...commonFields, ...(templateFields[selectedTemplate] || [])];
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Admin Letter Generator</h1>
      
      <div style={styles.content}>
        {/* Template Selection */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Select Template Type</h3>
          <div style={styles.templateButtons}>
            {templates.map(template => (
              <button
                key={template.id}
                style={{
                  ...styles.templateButton,
                  ...(selectedTemplate === template.id ? styles.activeButton : {})
                }}
                onClick={() => {
                  setSelectedTemplate(template.id);
                  handleReset();
                }}
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Enter Details</h3>
          <form onSubmit={handleGeneratePreview} style={styles.form}>
            <div style={styles.formGrid}>
              {getAllFields().map(field => (
                <div key={field.key} style={styles.formField}>
                  <label style={styles.label}>{field.label}:</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      style={styles.textarea}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      rows="3"
                    />
                  ) : (
                    <input
                      style={styles.input}
                      type={field.type}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div style={styles.buttonGroup}>
              <button type="submit" style={styles.primaryButton}>
                Generate Preview
              </button>
              <button type="button" onClick={handleReset} style={styles.secondaryButton}>
                Reset Form
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        {isPreviewVisible && (
          <div style={styles.section}>
            <div style={styles.previewHeader}>
              <h3 style={styles.sectionTitle}>Letter Preview</h3>
              <button onClick={handleDownload} style={styles.downloadButton}>
                Download Letter
              </button>
            </div>
            <div style={styles.preview}>
              <pre style={styles.letterContent}>
                {generateLetterContent()}
              </pre>
            </div>
          </div>
        )}
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
  templateButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  templateButton: {
    padding: '10px 20px',
    border: '2px solid #007bff',
    backgroundColor: 'white',
    color: '#007bff',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
  },
  activeButton: {
    backgroundColor: '#007bff',
    color: 'white'
  },
  form: {
    width: '100%'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '15px',
    marginBottom: '20px'
  },
  formField: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#495057'
  },
  input: {
    padding: '10px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '14px'
  },
  textarea: {
    padding: '10px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '14px',
    resize: 'vertical',
    minHeight: '80px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginTop: '20px'
  },
  primaryButton: {
    padding: '12px 30px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  secondaryButton: {
    padding: '12px 30px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  downloadButton: {
    padding: '10px 20px',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  preview: {
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
  }
};

export default AdminLetterGenerator;