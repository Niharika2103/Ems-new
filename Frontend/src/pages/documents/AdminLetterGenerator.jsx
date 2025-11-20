// AdminLetterGenerator.js
import React, { useState, useEffect } from 'react';

const AdminLetterGenerator = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('offer');
  const [formData, setFormData] = useState({});
  const [previewData, setPreviewData] = useState(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Salary components structure
  const initialSalaryComponents = {
    basicPay: '',
    hra: '',
    medicalAllowance: '',
    conveyanceAllowance: '',
    specialAllowance: '',
    otherAllowance: '',
    driftAllowance: '',
    grossSalary: ''
  };

  // Get current date in YYYY-MM-DD format for date inputs
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initialize form data with current date and salary components
  useEffect(() => {
    const currentDate = getCurrentDate();
    const initialData = {
      currentDate: currentDate,
      joiningDate: currentDate,
      appointmentDate: currentDate,
      employmentFrom: currentDate,
      employmentTo: currentDate,
      lastWorkingDay: currentDate,
      salaryComponents: { ...initialSalaryComponents },
      offerTerms: '',
      joiningTerms: '',
      termsConditions: ''
    };
    
    setFormData(prev => ({ ...initialData, ...prev }));
  }, [selectedTemplate]);

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
      { key: 'reportingManager', label: 'Reporting Manager', type: 'text' },
      { key: 'workLocation', label: 'Work Location', type: 'text' },
      { key: 'hrManager', label: 'HR Manager', type: 'text' }
    ],
    joining: [
      { key: 'employeeName', label: 'Employee Name', type: 'text' },
      { key: 'position', label: 'Position', type: 'text' },
      { key: 'department', label: 'Department', type: 'text' },
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
      { key: 'probationPeriod', label: 'Probation Period', type: 'text' }
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

  // Terms and conditions fields
  const termsFields = {
    offer: {
      key: 'offerTerms',
      label: 'Offer Letter Terms & Conditions',
      placeholder: 'Enter terms and conditions for the offer letter...'
    },
    joining: {
      key: 'joiningTerms',
      label: 'Joining Letter Terms & Conditions',
      placeholder: 'Enter terms and conditions for the joining letter...'
    },
    appointment: {
      key: 'termsConditions',
      label: 'Appointment Letter Terms & Conditions',
      placeholder: 'Enter terms and conditions for the appointment letter...'
    }
  };

  // Salary components fields
  const salaryFields = [
    { key: 'basicPay', label: 'Basic Pay' },
    { key: 'hra', label: 'HRA' },
    { key: 'medicalAllowance', label: 'Medical Allowance' },
    { key: 'conveyanceAllowance', label: 'Conveyance Allowance' },
    { key: 'specialAllowance', label: 'Special Allowance' },
    { key: 'otherAllowance', label: 'Other Allowance' },
    { key: 'driftAllowance', label: 'Drift Allowance' },
    { key: 'grossSalary', label: 'Gross Salary' }
  ];

  // Format date for display (DD/MM/YYYY)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Handle input changes
  const handleInputChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle salary component changes
  const handleSalaryChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      salaryComponents: {
        ...prev.salaryComponents,
        [key]: value
      }
    }));
  };

  // Calculate gross salary automatically
  const calculateGrossSalary = () => {
    const components = formData.salaryComponents || {};
    const gross = Object.entries(components).reduce((total, [key, value]) => {
      if (key !== 'grossSalary' && value) {
        return total + (parseFloat(value) || 0);
      }
      return total;
    }, 0);
    
    handleSalaryChange('grossSalary', gross.toFixed(2));
  };

  // Auto-calculate gross salary when any component changes
  useEffect(() => {
    if (hasSalaryComponents()) {
      calculateGrossSalary();
    }
  }, [formData.salaryComponents]);

  // Generate preview
  const handleGeneratePreview = (e) => {
    e.preventDefault();
    setPreviewData({ ...formData });
    setIsPreviewVisible(true);
  };

  // Reset form
  const handleReset = () => {
    const currentDate = getCurrentDate();
    const resetData = {
      currentDate: currentDate,
      joiningDate: currentDate,
      appointmentDate: currentDate,
      employmentFrom: currentDate,
      employmentTo: currentDate,
      lastWorkingDay: currentDate,
      salaryComponents: { ...initialSalaryComponents },
      offerTerms: '',
      joiningTerms: '',
      termsConditions: ''
    };
    setFormData(resetData);
    setPreviewData(null);
    setIsPreviewVisible(false);
    setCurrentPage(1);
  };

  // Set current date for a specific field
  const handleSetCurrentDate = (fieldName) => {
    const currentDate = getCurrentDate();
    handleInputChange(fieldName, currentDate);
  };

  // Navigate between pages
  const handleNextPage = () => {
    setCurrentPage(2);
  };

  const handlePrevPage = () => {
    setCurrentPage(1);
  };

  // Download as text file
  const handleDownload = () => {
    const content = generateLetterContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate}-letter-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate salary table content
  const generateSalaryTable = () => {
    const salary = formData.salaryComponents || {};
    
    if (!salary.basicPay && !salary.hra) return '';

    return `
SALARY BREAKUP:
${'='.repeat(50)}
Basic Pay:                    ₹${salary.basicPay || '0'}
HRA:                         ₹${salary.hra || '0'}
Medical Allowance:           ₹${salary.medicalAllowance || '0'}
Conveyance Allowance:        ₹${salary.conveyanceAllowance || '0'}
Special Allowance:           ₹${salary.specialAllowance || '0'}
Other Allowance:             ₹${salary.otherAllowance || '0'}
Drift Allowance:             ₹${salary.driftAllowance || '0'}
${'-'.repeat(50)}
Gross Salary:                ₹${salary.grossSalary || '0'}
${'='.repeat(50)}`;
  };

  // Generate letter content based on template
  const generateLetterContent = () => {
    if (!previewData) return '';

    const data = previewData;
    const currentDate = data.currentDate ? formatDateForDisplay(data.currentDate) : formatDateForDisplay(getCurrentDate());
    const salaryTable = generateSalaryTable();

    switch (selectedTemplate) {
      case 'offer':
        return `OFFER LETTER
${'='.repeat(60)}

${data.companyName || '[Company Name]'}
${data.companyAddress || '[Company Address]'}

Date: ${currentDate}

Dear ${data.candidateName || '[Candidate Name]'},

We are pleased to offer you the position of ${data.position || '[Position]'} in our ${data.department || '[Department]'} department.

Your joining date will be: ${data.joiningDate ? formatDateForDisplay(data.joiningDate) : '[Joining Date]'}
Work Location: ${data.workLocation || '[Work Location]'}
Reporting Manager: ${data.reportingManager || '[Reporting Manager]'}

${salaryTable}

COMPENSATION & BENEFITS:
Your annual compensation will be as detailed above. Additional benefits include:
- Health insurance coverage
- Provident Fund as per company policy
- Paid leaves as per company policy

TERMS AND CONDITIONS:
${data.offerTerms || '[Please add terms and conditions for the offer letter]'}

We look forward to having you on our team. Please sign and return a copy of this letter to indicate your acceptance.

Sincerely,

${data.hrManager || '[HR Manager]'}
HR Department
${data.companyName || '[Company Name]'}

${'='.repeat(60)}
Page 1 of 2

OFFER LETTER - ACCEPTANCE
${'='.repeat(60)}

ACCEPTANCE OF OFFER

I, ${data.candidateName || '[Candidate Name]'}, accept the offer of employment as ${data.position || '[Position]'} with ${data.companyName || '[Company Name]'} on the terms and conditions outlined in this letter.

Signature: _________________________

Date: _________________________

Name: _________________________

Employee ID: _________________________

${'='.repeat(60)}
Page 2 of 2`;

      case 'joining':
        return `JOINING LETTER
${'='.repeat(60)}

${data.companyName || '[Company Name]'}
${data.companyAddress || '[Company Address]'}

Date: ${currentDate}

Dear ${data.employeeName || '[Employee Name]'},

Welcome to ${data.companyName || '[Company Name]'}! We are pleased to confirm your joining as ${data.position || '[Position]'} in our ${data.department || '[Department]'} department.

Joining Date: ${data.joiningDate ? formatDateForDisplay(data.joiningDate) : '[Joining Date]'}
Work Timing: ${data.workTiming || '[Work Timing]'}
Work Location: ${data.workLocation || '[Work Location]'}

${salaryTable}

EMPLOYMENT DETAILS:
Your employment details and compensation structure are as mentioned above. You will be entitled to all benefits as per company policy.

TERMS AND CONDITIONS:
${data.joiningTerms || '[Please add terms and conditions for the joining letter]'}

Please report to ${data.hrManager || '[HR Manager]'} on your joining date for completion of formalities.

Best regards,

${data.hrManager || '[HR Manager]'}
HR Department
${data.companyName || '[Company Name]'}

${'='.repeat(60)}
Page 1 of 2

JOINING LETTER - ACCEPTANCE
${'='.repeat(60)}

EMPLOYEE ACCEPTANCE

I, ${data.employeeName || '[Employee Name]'}, acknowledge receipt and understanding of this joining letter and agree to the terms and conditions outlined herein.

Signature: _________________________

Date: _________________________

Name: _________________________

Employee ID: _________________________

Witness: _________________________

Date: _________________________

${'='.repeat(60)}
Page 2 of 2`;

      case 'appointment':
        return `APPOINTMENT LETTER

${data.companyName || '[Company Name]'}
${data.companyAddress || '[Company Address]'}

Date: ${currentDate}

Dear ${data.employeeName || '[Employee Name]'},

We are pleased to appoint you as ${data.position || '[Position]'} in our ${data.department || '[Department]'} department.

Appointment Date: ${data.appointmentDate ? formatDateForDisplay(data.appointmentDate) : '[Appointment Date]'}
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

This is to certify that ${data.employeeName || '[Employee Name]'} worked with us as ${data.position || '[Position]'} from ${data.employmentFrom ? formatDateForDisplay(data.employmentFrom) : '[From Date]'} to ${data.employmentTo ? formatDateForDisplay(data.employmentTo) : '[To Date]'}.

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

This letter confirms that you are relieved from your duties as ${data.position || '[Position]'} effective ${data.lastWorkingDay ? formatDateForDisplay(data.lastWorkingDay) : '[Last Working Day]'}.

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

  // Check if template has salary components
  const hasSalaryComponents = () => {
    return ['offer', 'joining'].includes(selectedTemplate);
  };

  // Check if template has terms and conditions
  const hasTermsConditions = () => {
    return ['offer', 'joining', 'appointment'].includes(selectedTemplate);
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
                type="button"
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
          <h3 style={styles.sectionTitle}>
            Enter Details - Page {currentPage} of {hasSalaryComponents() ? 2 : 1}
          </h3>
          
          <form onSubmit={handleGeneratePreview} style={styles.form}>
            {/* Page 1: Basic Information */}
            {currentPage === 1 && (
              <div>
                <div style={styles.formGrid}>
                  {getAllFields().map(field => (
                    <div key={field.key} style={styles.formField}>
                      <label style={styles.label}>
                        {field.label}:
                        {field.type === 'date' && (
                          <button
                            type="button"
                            style={styles.todayButton}
                            onClick={() => handleSetCurrentDate(field.key)}
                            title="Set to today's date"
                          >
                        
                          </button>
                        )}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          style={styles.textarea}
                          value={formData[field.key] || ''}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          rows="3"
                        />
                      ) : field.type === 'date' ? (
                        <input
                          style={styles.input}
                          type="date"
                          value={formData[field.key] || ''}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          required
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

                {/* Terms and Conditions for relevant templates */}
                {hasTermsConditions() && (
                  <div style={styles.termsSection}>
                    <h4 style={styles.subSectionTitle}>
                      {termsFields[selectedTemplate]?.label}
                    </h4>
                    <textarea
                      style={styles.largeTextarea}
                      value={formData[termsFields[selectedTemplate]?.key] || ''}
                      onChange={(e) => handleInputChange(termsFields[selectedTemplate]?.key, e.target.value)}
                      placeholder={termsFields[selectedTemplate]?.placeholder}
                      rows="6"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Page 2: Salary Components */}
            {currentPage === 2 && hasSalaryComponents() && (
              <div style={styles.salarySection}>
                <h4 style={styles.subSectionTitle}>Salary Components</h4>
                <div style={styles.salaryTable}>
                  <div style={styles.salaryHeader}>
                    <div style={styles.salaryColumn}>Component</div>
                    <div style={styles.salaryColumn}>Amount (₹)</div>
                  </div>
                  {salaryFields.map((field, index) => (
                    <div 
                      key={field.key} 
                      style={{
                        ...styles.salaryRow,
                        ...(index === salaryFields.length - 1 ? styles.grossSalaryRow : {})
                      }}
                    >
                      <div style={styles.salaryColumn}>
                        {field.label}
                      </div>
                      <div style={styles.salaryColumn}>
                        <input
                          style={styles.salaryInput}
                          type="number"
                          value={formData.salaryComponents?.[field.key] || ''}
                          onChange={(e) => handleSalaryChange(field.key, e.target.value)}
                          placeholder="0"
                          readOnly={field.key === 'grossSalary'}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={styles.calculateNote}>
                  * Gross salary is automatically calculated
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={styles.buttonGroup}>
              {currentPage === 2 && hasSalaryComponents() && (
                <button 
                  type="button" 
                  onClick={handlePrevPage}
                  style={styles.secondaryButton}
                >
                  ← Previous
                </button>
              )}
              
              {currentPage === 1 && hasSalaryComponents() && (
                <button 
                  type="button" 
                  onClick={handleNextPage}
                  style={styles.primaryButton}
                >
                  Next → Salary Details
                </button>
              )}
              
              {(currentPage === 2 || !hasSalaryComponents()) && (
                <button type="submit" style={styles.primaryButton}>
                  Generate Preview
                </button>
              )}
              
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
              <div>
                <button onClick={handleDownload} style={styles.downloadButton}>
                  Download Letter
                </button>
                <button 
                  onClick={() => window.print()} 
                  style={styles.printButton}
                >
                  Print Letter
                </button>
              </div>
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
  subSectionTitle: {
    color: '#6c757d',
    marginBottom: '15px',
    fontSize: '1.1rem',
    borderBottom: '1px solid #dee2e6',
    paddingBottom: '8px'
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
    color: '#495057',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
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
  largeTextarea: {
    padding: '10px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '14px',
    resize: 'vertical',
    minHeight: '120px',
    width: '100%'
  },
  termsSection: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: 'white',
    borderRadius: '6px',
    border: '1px solid #e9ecef'
  },
  salarySection: {
    marginTop: '10px'
  },
  salaryTable: {
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    overflow: 'hidden',
    backgroundColor: 'white',
    marginBottom: '10px'
  },
  salaryHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    backgroundColor: '#007bff',
    color: 'white',
    fontWeight: 'bold'
  },
  salaryRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    borderBottom: '1px solid #dee2e6'
  },
  grossSalaryRow: {
    backgroundColor: '#e7f3ff',
    fontWeight: 'bold',
    borderTop: '2px solid #007bff'
  },
  salaryColumn: {
    padding: '10px',
    display: 'flex',
    alignItems: 'center'
  },
  salaryInput: {
    padding: '8px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '14px',
    width: '120px',
    textAlign: 'right'
  },
  calculateNote: {
    fontSize: '12px',
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginTop: '20px',
    flexWrap: 'wrap'
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
    fontSize: '14px',
    marginRight: '10px'
  },
  printButton: {
    padding: '10px 20px',
    backgroundColor: '#6f42c1',
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