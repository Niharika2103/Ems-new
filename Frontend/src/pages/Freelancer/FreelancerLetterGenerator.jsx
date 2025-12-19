// FreelancerLetterGenerator.jsx
import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';

const FreelancerLetterGenerator = () => {
  // Sample freelancer data
  const [freelancers] = useState([
    {
      id: 1,
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      freelancer_id: 'FRE001',
      services: 'Full Stack Development',
      rate: '$65/hr',
      joinDate: '2024-01-10',
      address: '123 Tech Street, Silicon Valley, CA',
      phone: '+1 (555) 123-4567',
    },
    {
      id: 2,
      name: 'Maria Garcia',
      email: 'maria.garcia@example.com',
      freelancer_id: 'FRE002',
      services: 'UI/UX Design',
      rate: '$55/hr',
      joinDate: '2024-02-15',
      address: '456 Design Ave, Brooklyn, NY',
      phone: '+1 (555) 987-6543',
    },
    {
      id: 3,
      name: 'David Kim',
      email: 'david.kim@example.com',
      freelancer_id: 'FRE003',
      services: 'Digital Marketing',
      rate: '$45/hr',
      joinDate: '2024-03-05',
      address: '789 Marketing Blvd, Austin, TX',
      phone: '+1 (555) 456-7890',
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      freelancer_id: 'FRE004',
      services: 'Content Writing',
      rate: '$35/hr',
      joinDate: '2024-01-25',
      address: '321 Content Lane, Portland, OR',
      phone: '+1 (555) 234-5678',
    }
  ]);

  const [selectedLetterType, setSelectedLetterType] = useState('Offer Letter');
  const [freelancerLettersMap, setFreelancerLettersMap] = useState({});
  const [generatingFor, setGeneratingFor] = useState(null);

  // Letter templates
  const letterTemplates = {
    'Offer Letter': (freelancer) => {
      const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      return `OFFER LETTER

To,
${freelancer.name}
${freelancer.address}
Email: ${freelancer.email}
Phone: ${freelancer.phone}

Date: ${today}

Subject: Offer for Freelance ${freelancer.services} Position

Dear ${freelancer.name.split(' ')[0]},

We are delighted to offer you a freelance position as a ${freelancer.services} with our organization. We were thoroughly impressed with your portfolio and believe your skills will greatly contribute to our projects.

Your expertise in this field aligns perfectly with our requirements, and we are confident in your ability to deliver exceptional results.

POSITION DETAILS:
────────────────
• Position: Freelance ${freelancer.services}
• Rate: ${freelancer.rate}
• Start Date: ${new Date(freelancer.joinDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}
• Engagement: Project-based
• Communication: Weekly sync meetings
• Reporting: Project Manager

TERMS OF ENGAGEMENT:
───────────────────
1. This is a contract-based freelance position
2. Payment will be processed upon completion of agreed milestones
3. All intellectual property rights for work created will belong to the client
4. Confidentiality of project information must be maintained
5. Timely delivery as per project timelines is expected

We are excited about the possibility of working with you and are confident that this collaboration will be mutually beneficial.

Please confirm your acceptance by replying to this email within 7 days.

Warm regards,

Jessica Parker
Head of Talent Acquisition
Innovate Solutions Inc.
Email: jessica@innovatesolutions.com
Phone: +1 (555) 000-1111

---
This letter is electronically generated and does not require a signature.`;
    },

    'Appointment Letter': (freelancer) => {
      const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      return `APPOINTMENT LETTER

APPOINTMENT CONFIRMATION
────────────────────────

To,
${freelancer.name}
${freelancer.address}

Date: ${today}

Ref: APPT/${freelancer.freelancer_id}

Dear ${freelancer.name},

This letter serves to confirm your official appointment as a Freelance ${freelancer.services} with our organization, effective from ${new Date(freelancer.joinDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}.

Your appointment is based on your qualifications and experience, and we are confident in your ability to contribute to our projects.

APPOINTMENT DETAILS:
──────────────────
• Appointment ID: ${freelancer.freelancer_id}
• Designation: Freelance ${freelancer.services}
• Compensation: ${freelancer.rate}
• Duration: Project-based
• Notice Period: 15 days
• Performance Review: Quarterly

KEY RESPONSIBILITIES:
────────────────────
1. Deliver high-quality ${freelancer.services.toLowerCase()} services
2. Adhere to project deadlines and quality standards
3. Participate in project meetings and discussions
4. Provide regular progress updates
5. Maintain professional communication with team members

This appointment is subject to satisfactory performance and adherence to organizational policies. We reserve the right to terminate this appointment with appropriate notice.

We welcome you to our team and look forward to a successful collaboration.

Best regards,

Michael Roberts
Project Director
Digital Solutions Group`;
    },

    'Experience Letter': (freelancer) => {
      const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      return `EXPERIENCE CERTIFICATE
─────────────────────

CERTIFICATE OF EMPLOYMENT

To Whom It May Concern,

This is to certify that ${freelancer.name} has been associated with our organization as a Freelance ${freelancer.services} from ${new Date(freelancer.joinDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })} to present.

${freelancer.name.split(' ')[0]} has been responsible for providing ${freelancer.services.toLowerCase()} services and has worked on multiple projects during this period.

Their performance has been consistently excellent, demonstrating strong technical skills, professionalism, and dedication to quality work.

KEY ACHIEVEMENTS:
────────────────
• Successfully delivered multiple projects on time
• Maintained high client satisfaction ratings
• Demonstrated excellent problem-solving abilities
• Contributed innovative ideas to improve processes

SKILLS DEMONSTRATED:
───────────────────
• ${freelancer.services}
• Project Management
• Communication Skills
• Technical Proficiency
• Quality Assurance

${freelancer.name} has been a valuable member of our freelance team, and we have no hesitation in recommending ${freelancer.name.split(' ')[0]} for future engagements.

We wish ${freelancer.name.split(' ')[0]} all the best in their future endeavors.

Sincerely,

Robert Chen
Chief Operations Officer
Tech Innovations Ltd.

Date: ${today}

---
This is an electronically generated experience certificate.`;
    },

    'Relieving Letter': (freelancer) => {
      const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      return `RELIEVING LETTER
────────────────

To,
${freelancer.name}
${freelancer.address}

Date: ${today}

Ref: REL/${freelancer.freelancer_id}

Dear ${freelancer.name},

This letter confirms that you have been relieved from your freelance duties as a ${freelancer.services} with effect from ${today}.

All project deliverables assigned to you have been completed satisfactorily, and we acknowledge the successful conclusion of our working relationship.

We confirm the following:
• All project-related dues have been cleared
• No company assets are with you
• All confidential information has been returned/secured
• Project handover has been completed

We appreciate the contributions you made during your tenure with us. ${freelancer.name.split(' ')[0]}'s work on various projects has been valuable to our organization.

We wish you the very best for your future projects and professional growth.

Please accept our sincere thanks for your services.

Best regards,

Lisa Thompson
HR Manager
Creative Solutions Inc.`;
    },

    'Confirmation Letter': (freelancer) => {
      const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      return `CONFIRMATION LETTER
───────────────────

To,
${freelancer.name}
${freelancer.address}

Date: ${today}

Ref: CONF/${freelancer.freelancer_id}

Dear ${freelancer.name},

We are pleased to confirm your continued engagement as a Freelance ${freelancer.services} with our organization, effective immediately.

Your performance over the past period has been satisfactory, and we appreciate your dedication and quality of work.

CONFIRMED TERMS:
───────────────
• Position: Confirmed Freelance ${freelancer.services}
• Rate: ${freelancer.rate}
• Status: Active
• Review Period: 6 months
• Effective Date: ${today}

PERFORMANCE HIGHLIGHTS:
──────────────────────
• Consistent delivery quality
• Adherence to timelines
• Professional communication
• Problem-solving approach

We expect you to continue maintaining the high standards of work and look forward to your continued contributions.

Congratulations on your confirmation! We value your association with our organization and look forward to many more successful collaborations.

Best regards,

Kevin Miller
Engagement Manager
Pro Solutions Group`;
    },

//     'Promotion Letter': (freelancer) => {
//       const today = new Date().toLocaleDateString('en-US', { 
//         year: 'numeric', 
//         month: 'long', 
//         day: 'numeric' 
//       });
//       const newRate = parseInt(freelancer.rate.replace(/[^0-9]/g, '')) * 1.2;
      
//       return `PROMOTION LETTER
// ────────────────

// To,
// ${freelancer.name}
// ${freelancer.address}

// Date: ${today}

// Ref: PROM/${freelancer.freelancer_id}

// Dear ${freelancer.name},

// We are delighted to inform you of your promotion to Senior Freelance ${freelancer.services}, effective immediately.

// This promotion recognizes your exceptional performance, leadership qualities, and significant contributions to our projects over the past period.

// Your dedication, expertise, and commitment to excellence have not gone unnoticed. You have consistently exceeded expectations and demonstrated the qualities we value in our senior freelancers.

// NEW POSITION DETAILS:
// ───────────────────
// • New Designation: Senior Freelance ${freelancer.services}
// • Previous Rate: ${freelancer.rate}
// • New Rate: $${newRate}/hr (20% increase)
// • Effective Date: ${today}
// • Additional Responsibilities: Mentoring, quality review

// ADDITIONAL RESPONSIBILITIES:
// ──────────────────────────
// 1. Guide junior freelancers on projects
// 2. Conduct quality assurance reviews
// 3. Participate in project planning sessions
// 4. Provide technical guidance and best practices

// This promotion comes with increased responsibility, and we are confident that you will continue to excel in your new role.

// Please join us in celebrating this achievement. Your hard work and dedication have truly paid off.

// Congratulations!

// Warm regards,

// Amanda Scott
// Director of Operations
// Innovation Hub Inc.`;
//     },

//     'Salary Increment Letter': (freelancer) => {
//       const today = new Date().toLocaleDateString('en-US', { 
//         year: 'numeric', 
//         month: 'long', 
//         day: 'numeric' 
//       });
//       const newRate = parseInt(freelancer.rate.replace(/[^0-9]/g, '')) * 1.15;
      
//       return `SALARY INCREMENT LETTER
// ───────────────────────

// To,
// ${freelancer.name}
// ${freelancer.address}

// Date: ${today}

// Ref: INC/${freelancer.freelancer_id}

// Dear ${freelancer.name},

// We are pleased to inform you about the increment in your freelance rate, in recognition of your valuable contributions and performance.

// Your consistent delivery of high-quality work, professionalism, and dedication to our projects have been exemplary.

// INCREMENT DETAILS:
// ────────────────
// • Current Rate: ${freelancer.rate}
// • New Rate: $${newRate}/hr (15% increase)
// • Effective Date: ${today}
// • Applicable From: Next billing cycle

// PERFORMANCE METRICS:
// ───────────────────
// • Project completion rate: 100%
// • Client satisfaction: Excellent
// • Quality score: 95%
// • Timeliness: Always on schedule

// This increment reflects our appreciation for your hard work and commitment. We value our association with you and look forward to your continued contributions.

// Please continue to maintain the high standards that have earned you this recognition.

// Best regards,

// Brian Wilson
// Finance Director
// Global Solutions Corp.`;
//     },

//     'Warning Letter': (freelancer) => {
//       const today = new Date().toLocaleDateString('en-US', { 
//         year: 'numeric', 
//         month: 'long', 
//         day: 'numeric' 
//       });
      
//       return `WARNING LETTER
// ───────────────

// To,
// ${freelancer.name}
// ${freelancer.address}

// Date: ${today}

// Ref: WARN/${freelancer.freelancer_id}

// Dear ${freelancer.name},

// This letter serves as a formal warning regarding recent performance concerns that require immediate attention.

// ISSUE DETAILS:
// ─────────────
// We have observed deviations from expected standards in recent project deliverables, including missed deadlines and quality issues.

// SPECIFIC CONCERNS:
// ────────────────
// 1. Timeliness of deliverables
// 2. Quality standards not being met
// 3. Communication gaps

// EXPECTED IMPROVEMENTS:
// ────────────────────
// 1. Immediate improvement in project delivery timelines
// 2. Adherence to quality guidelines
// 3. Regular progress updates
// 4. Proactive communication of challenges

// We value your association with us and want to help you succeed. However, failure to address these concerns within the next 30 days may result in termination of our agreement.

// Please schedule a meeting with your project manager to discuss an improvement plan.

// Sincerely,

// Rachel Adams
// Quality Assurance Manager
// Prime Solutions Ltd.`;
//     },

//     'Form16': (freelancer) => {
//       const financialYear = `${new Date().getFullYear() - 1}-${new Date().getFullYear().toString().slice(-2)}`;
      
//       return `FORM 16
// ────────
// Certificate under Section 203 of the Income-tax Act, 1961
// For Tax Deducted at Source

// FINANCIAL YEAR: ${financialYear}

// PART A
// ─────
// Deductor's Details:
// • Name: Tech Solutions Inc.
// • TAN: TECH12345F
// • Address: 789 Corporate Blvd, Business City

// Deductee's Details:
// • Name: ${freelancer.name}
// • PAN: [To be provided by freelancer]
// • Address: ${freelancer.address}
// • Status: Freelance Professional

// PART B
// ─────
// Annexure - Details of Tax Deducted at Source

// SUMMARY OF TAX DEDUCTED:
// ────────────────────────
// Quarter  Amount Paid  TDS Rate  TDS Deducted  Date of Deduction
// ──────────────────────────────────────────────────────────────
// Q1       $15,000      10%       $1,500        ${new Date(new Date().getFullYear(), 0, 31).toLocaleDateString()}
// Q2       $18,000      10%       $1,800        ${new Date(new Date().getFullYear(), 3, 30).toLocaleDateString()}
// Q3       $20,000      10%       $2,000        ${new Date(new Date().getFullYear(), 6, 31).toLocaleDateString()}
// Q4       $22,000      10%       $2,200        ${new Date(new Date().getFullYear(), 9, 31).toLocaleDateString()}
// ──────────────────────────────────────────────────────────────
// Total    $75,000                $7,500

// CERTIFICATE:
// ───────────
// This is to certify that tax has been deducted at source as per the provisions of Chapter XVII-B of the Income-tax Act, 1961.

// Date: ${new Date().toLocaleDateString()}

// Authorized Signatory
// Accounts Department
// Tech Solutions Inc.`;
//     },

//     'Form16A': (freelancer) => {
//       const quarter = Math.floor((new Date().getMonth() / 3)) + 1;
//       const quarterDates = {
//         1: 'Apr 1 - Jun 30',
//         2: 'Jul 1 - Sep 30',
//         3: 'Oct 1 - Dec 31',
//         4: 'Jan 1 - Mar 31'
//       };
      
//       return `FORM 16A
// ─────────
// Certificate of Tax Deducted at Source
// [Under Section 203(3) of the Income-tax Act, 1961]

// FINANCIAL YEAR: ${new Date().getFullYear() - 1}-${new Date().getFullYear().toString().slice(-2)}
// QUARTER: ${quarter} (${quarterDates[quarter]})

// DEDUCTOR DETAILS:
// ────────────────
// • Name: Global Freelance Network
// • TAN: GFN67890D
// • Address: 456 Finance Street, Tax City

// DEDUCTEE DETAILS:
// ────────────────
// • Name: ${freelancer.name}
// • PAN: [To be provided]
// • Address: ${freelancer.address}
// • Nature of Payment: Professional Fees

// DETAILS OF TAX DEDUCTED:
// ───────────────────────
// Payment Details for Quarter ${quarter}:
// • Total Amount Credited: $${(parseInt(freelancer.rate.replace(/[^0-9]/g, '')) * 160).toLocaleString()}
// • Date of Credit: ${new Date().toLocaleDateString()}
// • TDS Section: 194J
// • TDS Rate: 10%
// • TDS Amount: $${(parseInt(freelancer.rate.replace(/[^0-9]/g, '')) * 160 * 0.1).toLocaleString()}
// • Date of Deposit: ${new Date(new Date().setDate(new Date().getDate() + 7)).toLocaleDateString()}

// CERTIFICATE:
// ───────────
// Certified that tax of $${(parseInt(freelancer.rate.replace(/[^0-9]/g, '')) * 160 * 0.1).toLocaleString()} has been deducted at source from the payment made to ${freelancer.name} and deposited to the credit of the Central Government.

// This certificate is issued for the purpose of filing Income Tax Returns.

// Date: ${new Date().toLocaleDateString()}

// Authorized Signatory
// Finance Department
// Global Freelance Network`;
//     }
  };

  // Supported letter types
  const letterTypes = [
    { id: 'Offer Letter', name: 'Offer Letter', icon: '📄', color: '#007bff' },
    { id: 'Appointment Letter', name: 'Appointment Letter', icon: '💼', color: '#28a745' },
    { id: 'Experience Letter', name: 'Experience Letter', icon: '⭐', color: '#ffc107' },
    { id: 'Relieving Letter', name: 'Relieving Letter', icon: '👋', color: '#6f42c1' },
    { id: 'Confirmation Letter', name: 'Confirmation Letter', icon: '✅', color: '#17a2b8' },
    // { id: 'Promotion Letter', name: 'Promotion Letter', icon: '📈', color: '#fd7e14' },
    // { id: 'Salary Increment Letter', name: 'Salary Increment Letter', icon: '💰', color: '#20c997' },
    // { id: 'Warning Letter', name: 'Warning Letter', icon: '⚠️', color: '#dc3545' },
    // { id: 'Form16', name: 'Form 16', icon: '📑', color: '#343a40' },
    // { id: 'Form16A', name: 'Form 16A', icon: '📊', color: '#6c757d' },
  ];

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedLetters = localStorage.getItem('freelancerLetters');
    if (savedLetters) {
      setFreelancerLettersMap(JSON.parse(savedLetters));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('freelancerLetters', JSON.stringify(freelancerLettersMap));
  }, [freelancerLettersMap]);

  // Generate PDF from text
  const generatePDF = (content, filename) => {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(content, 180);
    const pageHeight = doc.internal.pageSize.height;
    
    // Add header
    doc.setFillColor(40, 40, 150);
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('FreelanceHub', 105, 20, null, null, 'center');
    
    // Add content
    let yPosition = 40;
    const lineHeight = 7;
    
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 150);
    const titleLines = doc.splitTextToSize(filename.replace('.pdf', ''), 180);
    doc.text(titleLines, 15, yPosition);
    yPosition += titleLines.length * lineHeight + 10;
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    const allLines = doc.splitTextToSize(content, 180);
    
    for (let i = 0; i < allLines.length; i++) {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(allLines[i], 15, yPosition);
      yPosition += lineHeight;
    }
    
    // Add footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, pageHeight - 5, null, null, 'center');
    
    // Save PDF
    doc.save(filename);
    
    // Return object URL for preview
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    
    return {
      name: filename,
      url: url,
      blob: pdfBlob,
      generatedAt: new Date().toISOString(),
    };
  };

  const handleGenerateLetter = async (freelancerId) => {
    if (!freelancerId || !selectedLetterType) return;

    setGeneratingFor(freelancerId);
    
    setTimeout(() => {
      try {
        const freelancer = freelancers.find(f => f.id === freelancerId);
        if (!freelancer) return;

        const template = letterTemplates[selectedLetterType];
        
        if (!template) {
          alert('Template not found for this letter type');
          return;
        }

        const content = template(freelancer);
        const filename = `${selectedLetterType.replace(/\s+/g, '_')}_${freelancer.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        
        const generatedFile = generatePDF(content, filename);
        
        // Add to letters map
        setFreelancerLettersMap(prev => ({
          ...prev,
          [freelancerId]: [
            ...(prev[freelancerId] || []),
            generatedFile
          ]
        }));
        
        alert(`✅ ${selectedLetterType} generated for ${freelancer.name}!`);
      } catch (err) {
        console.error('Generation failed:', err);
        alert(`❌ Failed to generate letter: ${err.message}`);
      } finally {
        setGeneratingFor(null);
      }
    }, 500);
  };

  const handleDeleteLetter = (freelancerId, filename) => {
    if (!window.confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }

    setFreelancerLettersMap(prev => {
      const updated = { ...prev };
      updated[freelancerId] = (updated[freelancerId] || []).filter(file => file.name !== filename);
      
      // Clean up URL object
      const fileToDelete = prev[freelancerId]?.find(f => f.name === filename);
      if (fileToDelete?.url) {
        URL.revokeObjectURL(fileToDelete.url);
      }
      
      return updated;
    });

    alert('✅ Letter deleted successfully!');
  };

  const handleSend = async (freelancerId, fileName) => {
    const freelancer = freelancers.find(f => f.id === freelancerId);
    if (!freelancer) return;

    const letters = freelancerLettersMap[freelancerId] || [];
    const file = letters.find(f => f.name === fileName);
    
    if (!file) {
      alert('File not found');
      return;
    }

    // Create email link
    const subject = encodeURIComponent(`${fileName.replace('.pdf', '')}`);
    const body = encodeURIComponent(`Dear ${freelancer.name},\n\nPlease find attached ${fileName}.\n\nBest regards,\nFreelanceHub Team`);
    const mailtoLink = `mailto:${freelancer.email}?subject=${subject}&body=${body}`;
    
    window.open(mailtoLink, '_blank');
  };

  const handleDownload = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerSection}>
        <h1 style={styles.header}>📝 Freelancer Letter Generator</h1>
        <p style={styles.subHeader}>Generate professional letters for freelancers instantly</p>
      </div>

      {/* Letter Type Selector */}
      <div style={styles.letterTypeSection}>
        <h3 style={styles.sectionTitle}>Select Letter Type</h3>
        <div style={styles.letterTypeButtons}>
          {letterTypes.map((type) => (
            <button
              key={type.id}
              style={{
                ...styles.letterTypeButton,
                borderColor: type.color,
                color: selectedLetterType === type.id ? 'white' : type.color,
                backgroundColor: selectedLetterType === type.id ? type.color : 'white',
              }}
              onClick={() => setSelectedLetterType(type.id)}
            >
              <span style={styles.typeIcon}>{type.icon}</span>
              {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* Freelancer List */}
      <div style={styles.mainContent}>
        <div style={styles.freelancerListContainer}>
          <div style={styles.listHeaderContainer}>
            <h3 style={styles.listHeader}>
              Freelancers ({freelancers.length})
            </h3>
          </div>
          
          <div style={styles.freelancerList}>
            {freelancers.map((freelancer) => {
              const letters = freelancerLettersMap[freelancer.id] || [];
              
              return (
                <div key={freelancer.id} style={styles.freelancerCard}>
                  <div style={styles.freelancerHeader}>
                    <div style={styles.freelancerInfo}>
                      <div style={styles.nameRow}>
                        <strong style={styles.freelancerName}>{freelancer.name}</strong>
                        <span style={styles.freelancerId}>ID: {freelancer.freelancer_id}</span>
                      </div>
                      <div style={styles.detailsRow}>
                        <span style={styles.detailItem}>📧 {freelancer.email}</span>
                        <span style={styles.detailItem}>📱 {freelancer.phone}</span>
                        <span style={styles.detailItem}>💰 {freelancer.rate}</span>
                      </div>
                    </div>

                    <div style={styles.actionRow}>
                      <button
                        onClick={() => handleGenerateLetter(freelancer.id)}
                        disabled={generatingFor === freelancer.id}
                        style={styles.generateBtn}
                      >
                        {generatingFor === freelancer.id ? (
                          <>
                            <span style={styles.spinner}></span> Generating...
                          </>
                        ) : (
                          `Generate ${selectedLetterType}`
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Show existing letters */}
                  {letters.length > 0 && (
                    <div style={styles.letterPreviewList}>
                      <small style={styles.letterLabel}>
                        Generated Letters ({letters.length})
                      </small>
                      {letters.map((file, idx) => (
                        <div key={idx} style={styles.fileRow}>
                          <div style={styles.fileInfo}>
                            <span style={styles.fileIcon}>📄</span>
                            <span style={styles.fileName}>
                              {file.name.replace('.pdf', '')}
                            </span>
                          </div>
                          <div style={styles.fileActions}>
                            <button
                              onClick={() => handleDownload(file.url)}
                              style={styles.viewBtn}
                              title="View PDF"
                            >
                              View
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSend(freelancer.id, file.name);
                              }}
                              style={styles.sendBtn}
                              title="Send via email"
                            >
                              Send
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLetter(freelancer.id, file.name);
                              }}
                              style={styles.deleteBtn}
                              title="Delete letter"
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
            })}
          </div>
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
    padding: '15px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  headerSection: {
    textAlign: 'center',
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  header: {
    color: '#2c3e50',
    marginBottom: '5px',
    fontSize: '1.8rem',
  },
  subHeader: {
    color: '#6c757d',
    fontSize: '1rem',
    maxWidth: '600px',
    margin: '0 auto',
  },
  letterTypeSection: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    margin: '0 0 15px 0',
    color: '#495057',
    fontSize: '1.1rem',
    fontWeight: '600',
  },
  letterTypeButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  letterTypeButton: {
    padding: '8px 12px',
    border: '2px solid',
    backgroundColor: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    transition: 'all 0.2s ease',
    minWidth: '140px',
  },
  typeIcon: {
    fontSize: '14px',
  },
  mainContent: {
    display: 'flex',
    gap: '15px',
  },
  freelancerListContainer: {
    flex: 1,
    backgroundColor: '#fff',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    maxHeight: '70vh',
    overflowY: 'auto',
  },
  listHeaderContainer: {
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '1px solid #f0f0f0',
  },
  listHeader: {
    margin: '0',
    color: '#495057',
    fontSize: '1.2rem',
  },
  freelancerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  freelancerCard: {
    display: 'flex',
    flexDirection: 'column',
    padding: '15px',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
  },
  freelancerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  freelancerInfo: {
    flex: 1,
    minWidth: '200px',
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '5px',
  },
  freelancerName: {
    fontSize: '1.1rem',
    color: '#2c3e50',
  },
  freelancerId: {
    backgroundColor: '#e9ecef',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    color: '#6c757d',
  },
  detailsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  detailItem: {
    fontSize: '0.8rem',
    color: '#495057',
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
  },
  actionRow: {
    display: 'flex',
  },
  generateBtn: {
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  spinner: {
    width: '12px',
    height: '12px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '50%',
    borderTopColor: 'white',
    animation: 'spin 1s linear infinite',
  },
  letterPreviewList: {
    borderTop: '1px dashed #ddd',
    paddingTop: '10px',
    marginTop: '10px',
  },
  letterLabel: {
    display: 'block',
    marginBottom: '8px',
    color: '#495057',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  fileRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px',
    backgroundColor: 'white',
    border: '1px solid #e9ecef',
    borderRadius: '6px',
    marginBottom: '8px',
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
  },
  fileIcon: {
    fontSize: '1rem',
  },
  fileName: {
    fontSize: '0.85rem',
    color: '#2c3e50',
    fontWeight: '500',
  },
  fileActions: {
    display: 'flex',
    gap: '6px',
  },
  viewBtn: {
    padding: '4px 8px',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },
  sendBtn: {
    padding: '4px 8px',
    backgroundColor: '#dda31b',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },
  deleteBtn: {
    padding: '4px 8px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },
};

// Add CSS animation for spinner
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

export default FreelancerLetterGenerator;