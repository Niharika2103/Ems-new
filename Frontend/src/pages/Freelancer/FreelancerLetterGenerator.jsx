// src/pages/Admin/FreelancerLetterGenerator.jsx
import React, { useEffect, useState } from "react";
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

<<<<<<< HEAD
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

    'Promotion Letter': (freelancer) => {
      const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const newRate = parseInt(freelancer.rate.replace(/[^0-9]/g, '')) * 1.2;
      
      return `PROMOTION LETTER
────────────────

To,
${freelancer.name}
${freelancer.address}

Date: ${today}

Ref: PROM/${freelancer.freelancer_id}

Dear ${freelancer.name},

We are delighted to inform you of your promotion to Senior Freelance ${freelancer.services}, effective immediately.

This promotion recognizes your exceptional performance, leadership qualities, and significant contributions to our projects over the past period.

Your dedication, expertise, and commitment to excellence have not gone unnoticed. You have consistently exceeded expectations and demonstrated the qualities we value in our senior freelancers.

NEW POSITION DETAILS:
───────────────────
• New Designation: Senior Freelance ${freelancer.services}
• Previous Rate: ${freelancer.rate}
• New Rate: $${newRate}/hr (20% increase)
• Effective Date: ${today}
• Additional Responsibilities: Mentoring, quality review

ADDITIONAL RESPONSIBILITIES:
──────────────────────────
1. Guide junior freelancers on projects
2. Conduct quality assurance reviews
3. Participate in project planning sessions
4. Provide technical guidance and best practices

This promotion comes with increased responsibility, and we are confident that you will continue to excel in your new role.

Please join us in celebrating this achievement. Your hard work and dedication have truly paid off.

Congratulations!

Warm regards,

Amanda Scott
Director of Operations
Innovation Hub Inc.`;
    },

    'Salary Increment Letter': (freelancer) => {
      const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const newRate = parseInt(freelancer.rate.replace(/[^0-9]/g, '')) * 1.15;
      
      return `SALARY INCREMENT LETTER
───────────────────────

To,
${freelancer.name}
${freelancer.address}

Date: ${today}

Ref: INC/${freelancer.freelancer_id}

Dear ${freelancer.name},

We are pleased to inform you about the increment in your freelance rate, in recognition of your valuable contributions and performance.

Your consistent delivery of high-quality work, professionalism, and dedication to our projects have been exemplary.

INCREMENT DETAILS:
────────────────
• Current Rate: ${freelancer.rate}
• New Rate: $${newRate}/hr (15% increase)
• Effective Date: ${today}
• Applicable From: Next billing cycle

PERFORMANCE METRICS:
───────────────────
• Project completion rate: 100%
• Client satisfaction: Excellent
• Quality score: 95%
• Timeliness: Always on schedule

This increment reflects our appreciation for your hard work and commitment. We value our association with you and look forward to your continued contributions.

Please continue to maintain the high standards that have earned you this recognition.

Best regards,

Brian Wilson
Finance Director
Global Solutions Corp.`;
    },

    'Warning Letter': (freelancer) => {
      const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      return `WARNING LETTER
───────────────

To,
${freelancer.name}
${freelancer.address}

Date: ${today}

Ref: WARN/${freelancer.freelancer_id}

Dear ${freelancer.name},

This letter serves as a formal warning regarding recent performance concerns that require immediate attention.

ISSUE DETAILS:
─────────────
We have observed deviations from expected standards in recent project deliverables, including missed deadlines and quality issues.

SPECIFIC CONCERNS:
────────────────
1. Timeliness of deliverables
2. Quality standards not being met
3. Communication gaps

EXPECTED IMPROVEMENTS:
────────────────────
1. Immediate improvement in project delivery timelines
2. Adherence to quality guidelines
3. Regular progress updates
4. Proactive communication of challenges

We value your association with us and want to help you succeed. However, failure to address these concerns within the next 30 days may result in termination of our agreement.

Please schedule a meeting with your project manager to discuss an improvement plan.

Sincerely,

Rachel Adams
Quality Assurance Manager
Prime Solutions Ltd.`;
    },

    'Form16': (freelancer) => {
      const financialYear = `${new Date().getFullYear() - 1}-${new Date().getFullYear().toString().slice(-2)}`;
      
      return `FORM 16
────────
Certificate under Section 203 of the Income-tax Act, 1961
For Tax Deducted at Source

FINANCIAL YEAR: ${financialYear}

PART A
─────
Deductor's Details:
• Name: Tech Solutions Inc.
• TAN: TECH12345F
• Address: 789 Corporate Blvd, Business City

Deductee's Details:
• Name: ${freelancer.name}
• PAN: [To be provided by freelancer]
• Address: ${freelancer.address}
• Status: Freelance Professional

PART B
─────
Annexure - Details of Tax Deducted at Source

SUMMARY OF TAX DEDUCTED:
────────────────────────
Quarter  Amount Paid  TDS Rate  TDS Deducted  Date of Deduction
──────────────────────────────────────────────────────────────
Q1       $15,000      10%       $1,500        ${new Date(new Date().getFullYear(), 0, 31).toLocaleDateString()}
Q2       $18,000      10%       $1,800        ${new Date(new Date().getFullYear(), 3, 30).toLocaleDateString()}
Q3       $20,000      10%       $2,000        ${new Date(new Date().getFullYear(), 6, 31).toLocaleDateString()}
Q4       $22,000      10%       $2,200        ${new Date(new Date().getFullYear(), 9, 31).toLocaleDateString()}
──────────────────────────────────────────────────────────────
Total    $75,000                $7,500

CERTIFICATE:
───────────
This is to certify that tax has been deducted at source as per the provisions of Chapter XVII-B of the Income-tax Act, 1961.

Date: ${new Date().toLocaleDateString()}

Authorized Signatory
Accounts Department
Tech Solutions Inc.`;
    },

    'Form16A': (freelancer) => {
      const quarter = Math.floor((new Date().getMonth() / 3)) + 1;
      const quarterDates = {
        1: 'Apr 1 - Jun 30',
        2: 'Jul 1 - Sep 30',
        3: 'Oct 1 - Dec 31',
        4: 'Jan 1 - Mar 31'
      };
      
      return `FORM 16A
─────────
Certificate of Tax Deducted at Source
[Under Section 203(3) of the Income-tax Act, 1961]

FINANCIAL YEAR: ${new Date().getFullYear() - 1}-${new Date().getFullYear().toString().slice(-2)}
QUARTER: ${quarter} (${quarterDates[quarter]})

DEDUCTOR DETAILS:
────────────────
• Name: Global Freelance Network
• TAN: GFN67890D
• Address: 456 Finance Street, Tax City

DEDUCTEE DETAILS:
────────────────
• Name: ${freelancer.name}
• PAN: [To be provided]
• Address: ${freelancer.address}
• Nature of Payment: Professional Fees

DETAILS OF TAX DEDUCTED:
───────────────────────
Payment Details for Quarter ${quarter}:
• Total Amount Credited: $${(parseInt(freelancer.rate.replace(/[^0-9]/g, '')) * 160).toLocaleString()}
• Date of Credit: ${new Date().toLocaleDateString()}
• TDS Section: 194J
• TDS Rate: 10%
• TDS Amount: $${(parseInt(freelancer.rate.replace(/[^0-9]/g, '')) * 160 * 0.1).toLocaleString()}
• Date of Deposit: ${new Date(new Date().setDate(new Date().getDate() + 7)).toLocaleDateString()}

CERTIFICATE:
───────────
Certified that tax of $${(parseInt(freelancer.rate.replace(/[^0-9]/g, '')) * 160 * 0.1).toLocaleString()} has been deducted at source from the payment made to ${freelancer.name} and deposited to the credit of the Central Government.

This certificate is issued for the purpose of filing Income Tax Returns.

Date: ${new Date().toLocaleDateString()}

Authorized Signatory
Finance Department
Global Freelance Network`;
    }
  };

  // Supported letter types
=======
>>>>>>> 274fc6c251b844a328303d77ba85ebff977ee108
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

  const generateLetter = async (id) => {
    setGeneratingFor(id);
    try {
      await generateFreelancerLetterApi({
        freelancerId: id,
        letterType: selectedLetterType,
      });
      const res = await getFreelancerLettersApi(id);
      setLettersMap((p) => ({ ...p, [id]: res.data.files || [] }));
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
