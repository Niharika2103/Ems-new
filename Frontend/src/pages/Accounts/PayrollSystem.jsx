import React, { useState, useEffect } from 'react';

const PayrollSystem = () => {
  // State management
  const [activeTab, setActiveTab] = useState('new-run');
  const [step, setStep] = useState(1);
  const [payrollData, setPayrollData] = useState({
    payPeriod: '',
    periodType: 'monthly',
    selectedEmployees: [],
    validationResults: null,
    payrollResults: null,
    runName: ''
  });
  
  const [validationStatus, setValidationStatus] = useState({
    attendance: 'pending',
    leaves: 'pending',
    overtime: 'pending',
    overall: 'pending'
  });
  
  const [validationIssues, setValidationIssues] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);

  // Mock data
  const [payrollPeriods] = useState([
    { id: 'jan-2024', name: 'January 2024', type: 'monthly', start: '2024-01-01', end: '2024-01-31' },
    { id: 'feb-2024', name: 'February 2024', type: 'monthly', start: '2024-02-01', end: '2024-02-29' },
    { id: 'week1-feb', name: 'Week 1, Feb 2024', type: 'weekly', start: '2024-02-05', end: '2024-02-11' },
    { id: 'week2-feb', name: 'Week 2, Feb 2024', type: 'weekly', start: '2024-02-12', end: '2024-02-18' },
  ]);

  const [payrollHistory, setPayrollHistory] = useState([
    {
      id: 'PR-001',
      period: 'January 2024',
      type: 'monthly',
      status: 'completed',
      runDate: '2024-02-05',
      totalEmployees: 150,
      totalAmount: '$450,000',
      canReverse: true
    },
    {
      id: 'PR-002',
      period: 'Week 1, Feb 2024',
      type: 'weekly',
      status: 'completed',
      runDate: '2024-02-12',
      totalEmployees: 150,
      totalAmount: '$112,500',
      canReverse: true
    },
    {
      id: 'PR-003',
      period: 'December 2023',
      type: 'monthly',
      status: 'reversed',
      runDate: '2024-01-05',
      totalEmployees: 145,
      totalAmount: '$435,000',
      canReverse: false
    }
  ]);

  const [employees] = useState([
    { id: 1, name: 'John Doe', department: 'Engineering', basicSalary: 5000, attendance: 22, leaves: 2, overtime: 8 },
    { id: 2, name: 'Jane Smith', department: 'Marketing', basicSalary: 4500, attendance: 20, leaves: 4, overtime: 4 },
    { id: 3, name: 'Bob Johnson', department: 'Sales', basicSalary: 4000, attendance: 23, leaves: 1, overtime: 12 },
  ]);

  // CSS Styles
  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      paddingBottom: '20px',
      borderBottom: '1px solid #e0e0e0'
    },
    tabs: {
      display: 'flex',
      gap: '10px',
      marginBottom: '30px'
    },
    tabButton: {
      padding: '10px 20px',
      border: 'none',
      background: '#f0f0f0',
      cursor: 'pointer',
      borderRadius: '4px'
    },
    activeTab: {
      background: '#2196F3',
      color: 'white'
    },
    primaryButton: {
      padding: '10px 20px',
      background: '#2196F3',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    secondaryButton: {
      padding: '10px 20px',
      background: '#f0f0f0',
      color: '#333',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      marginRight: '10px'
    },
    dangerButton: {
      padding: '8px 16px',
      background: '#f44336',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      marginLeft: '5px'
    },
    wizard: {
      background: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    stepper: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '30px',
      position: 'relative'
    },
    step: {
      textAlign: 'center',
      flex: 1,
      padding: '10px',
      position: 'relative',
      color: '#999'
    },
    activeStep: {
      color: '#2196F3',
      fontWeight: 'bold'
    },
    stepIndicator: {
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      background: '#f0f0f0',
      margin: '0 auto 10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    activeIndicator: {
      background: '#2196F3',
      color: 'white'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '15px',
      margin: '20px 0'
    },
    card: {
      padding: '15px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.3s'
    },
    selectedCard: {
      borderColor: '#2196F3',
      background: '#e3f2fd'
    },
    validationGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '20px',
      margin: '20px 0'
    },
    validationCard: {
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      textAlign: 'center'
    },
    successCard: {
      borderColor: '#4CAF50',
      background: '#f1f8e9'
    },
    warningCard: {
      borderColor: '#FF9800',
      background: '#fff3e0'
    },
    errorCard: {
      borderColor: '#f44336',
      background: '#ffebee'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '20px'
    },
    th: {
      background: '#f5f5f5',
      padding: '12px',
      textAlign: 'left',
      borderBottom: '1px solid #ddd'
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #ddd'
    },
    badge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    completedBadge: {
      background: '#4CAF50',
      color: 'white'
    },
    reversedBadge: {
      background: '#f44336',
      color: 'white'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: 'white',
      borderRadius: '8px',
      padding: '20px',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '80vh',
      overflow: 'auto'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    salarySections: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px'
    },
    salarySection: {
      padding: '15px',
      border: '1px solid #e0e0e0',
      borderRadius: '6px'
    },
    salaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '10px',
      paddingBottom: '10px',
      borderBottom: '1px solid #f0f0f0'
    },
    netSalary: {
      gridColumn: 'span 2',
      textAlign: 'center',
      padding: '20px',
      background: '#e3f2fd',
      borderRadius: '6px'
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255,255,255,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px'
    }
  };

  // Component functions
  const handleRunValidation = async () => {
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      const results = {
        attendance: 'success',
        leaves: 'warning',
        overtime: 'success',
        overall: 'ready'
      };
      
      setValidationStatus(results);
      setValidationIssues(['3 employees have pending leave approval', '1 employee has attendance discrepancy']);
      setIsProcessing(false);
      setPayrollData(prev => ({...prev, validationResults: results}));
    }, 1500);
  };

  const handleRunPayroll = async () => {
    setIsProcessing(true);
    
    // Simulate payroll processing
    setTimeout(() => {
      const results = {
        success: true,
        totalEmployees: employees.length,
        totalGross: '$27,000',
        totalNet: '$22,500',
        details: employees.map(emp => ({
          ...emp,
          gross: emp.basicSalary + (emp.overtime * 25),
          deductions: emp.basicSalary * 0.15,
          net: (emp.basicSalary + (emp.overtime * 25)) * 0.85
        }))
      };
      
      setPayrollData(prev => ({...prev, payrollResults: results}));
      setIsProcessing(false);
      setStep(4);
      
      // Add to history
      const newRun = {
        id: `PR-00${payrollHistory.length + 1}`,
        period: payrollPeriods.find(p => p.id === payrollData.payPeriod)?.name || 'Custom Period',
        type: payrollData.periodType,
        status: 'completed',
        runDate: new Date().toISOString().split('T')[0],
        totalEmployees: employees.length,
        totalAmount: results.totalNet,
        canReverse: true
      };
      
      setPayrollHistory(prev => [newRun, ...prev]);
    }, 2000);
  };

  const handleReversePayroll = async (payrollId) => {
    if (window.confirm('Are you sure you want to reverse this payroll? This action cannot be undone.')) {
      setIsProcessing(true);
      
      setTimeout(() => {
        setPayrollHistory(prev => 
          prev.map(run => 
            run.id === payrollId 
              ? {...run, status: 'reversed', canReverse: false}
              : run
          )
        );
        setIsProcessing(false);
        alert(`Payroll ${payrollId} has been reversed successfully.`);
      }, 1000);
    }
  };

  const handleRerunPayroll = async (payrollId) => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const originalRun = payrollHistory.find(run => run.id === payrollId);
      const newRun = {
        ...originalRun,
        id: `PR-00${payrollHistory.length + 1}`,
        runDate: new Date().toISOString().split('T')[0],
        status: 'completed'
      };
      
      setPayrollHistory(prev => [newRun, ...prev]);
      setIsProcessing(false);
      alert(`Payroll ${payrollId} has been re-run successfully.`);
    }, 1500);
  };

  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployeeDetails(employees.find(emp => emp.id === employeeId));
  };

  const calculateSalary = (employee) => {
    const overtimeRate = 25; // $ per hour
    const deductionRate = 0.15; // 15%
    
    const overtimePay = employee.overtime * overtimeRate;
    const gross = employee.basicSalary + overtimePay;
    const deductions = gross * deductionRate;
    const net = gross - deductions;
    
    return { gross, deductions, net };
  };

  // Sub-components
  const PeriodSelection = () => (
    <div>
      <h3>Step 1: Select Pay Period</h3>
      
      <div style={{margin: '20px 0'}}>
        <label style={{marginRight: '20px'}}>
          <input 
            type="radio" 
            name="periodType" 
            value="monthly"
            checked={payrollData.periodType === 'monthly'}
            onChange={(e) => setPayrollData({...payrollData, periodType: e.target.value, payPeriod: ''})}
            style={{marginRight: '5px'}}
          />
          Monthly
        </label>
        <label>
          <input 
            type="radio" 
            name="periodType" 
            value="weekly"
            checked={payrollData.periodType === 'weekly'}
            onChange={(e) => setPayrollData({...payrollData, periodType: e.target.value, payPeriod: ''})}
            style={{marginRight: '5px'}}
          />
          Weekly
        </label>
      </div>

      <div style={styles.grid}>
        {payrollPeriods
          .filter(p => p.type === payrollData.periodType)
          .map(period => (
            <div 
              key={period.id}
              style={{
                ...styles.card,
                ...(payrollData.payPeriod === period.id ? styles.selectedCard : {})
              }}
              onClick={() => setPayrollData({...payrollData, payPeriod: period.id})}
            >
              <h4 style={{margin: '0 0 10px 0'}}>{period.name}</h4>
              <p style={{margin: '0', color: '#666', fontSize: '14px'}}>
                {period.start} to {period.end}
              </p>
            </div>
          ))}
      </div>

      <div style={{marginTop: '20px'}}>
        <input
          type="text"
          placeholder="Payroll Run Name (Optional)"
          value={payrollData.runName}
          onChange={(e) => setPayrollData({...payrollData, runName: e.target.value})}
          style={{padding: '10px', width: '300px', marginRight: '10px'}}
        />
      </div>

      <div style={{marginTop: '30px'}}>
        <button 
          style={styles.primaryButton}
          disabled={!payrollData.payPeriod}
          onClick={() => setStep(2)}
        >
          Next: Validate Data
        </button>
      </div>
    </div>
  );

  const DataValidation = () => (
    <div>
      <h3>Step 2: Pre-Payroll Validation</h3>
      <p style={{color: '#666', marginBottom: '20px'}}>
        Validate attendance, leave, and overtime data before processing payroll.
      </p>

      <div style={styles.validationGrid}>
        <div style={{
          ...styles.validationCard,
          ...(validationStatus.attendance === 'success' ? styles.successCard : 
               validationStatus.attendance === 'warning' ? styles.warningCard : 
               validationStatus.attendance === 'error' ? styles.errorCard : {})
        }}>
          <h4>Attendance</h4>
          <p>{validationStatus.attendance === 'pending' ? 'Not validated' : 
              validationStatus.attendance === 'success' ? '✓ All records valid' :
              validationStatus.attendance === 'warning' ? '⚠ Needs review' : '✗ Issues found'}</p>
        </div>
        
        <div style={{
          ...styles.validationCard,
          ...(validationStatus.leaves === 'success' ? styles.successCard : 
               validationStatus.leaves === 'warning' ? styles.warningCard : 
               validationStatus.leaves === 'error' ? styles.errorCard : {})
        }}>
          <h4>Leave Applications</h4>
          <p>{validationStatus.leaves === 'pending' ? 'Not validated' : 
              validationStatus.leaves === 'success' ? '✓ All approved' :
              validationStatus.leaves === 'warning' ? '⚠ Pending approvals' : '✗ Issues found'}</p>
        </div>
        
        <div style={{
          ...styles.validationCard,
          ...(validationStatus.overtime === 'success' ? styles.successCard : 
               validationStatus.overtime === 'warning' ? styles.warningCard : 
               validationStatus.overtime === 'error' ? styles.errorCard : {})
        }}>
          <h4>Overtime</h4>
          <p>{validationStatus.overtime === 'pending' ? 'Not validated' : 
              validationStatus.overtime === 'success' ? '✓ Calculations valid' :
              validationStatus.overtime === 'warning' ? '⚠ Needs review' : '✗ Issues found'}</p>
        </div>
      </div>

      {validationIssues.length > 0 && (
        <div style={{background: '#fff3e0', padding: '15px', borderRadius: '6px', margin: '20px 0'}}>
          <h4 style={{margin: '0 0 10px 0', color: '#FF9800'}}>⚠️ Validation Issues:</h4>
          <ul style={{margin: '0', paddingLeft: '20px'}}>
            {validationIssues.map((issue, index) => (
              <li key={index} style={{marginBottom: '5px'}}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{marginTop: '30px'}}>
        <button style={styles.secondaryButton} onClick={() => setStep(1)}>
          Back
        </button>
        <button 
          style={styles.primaryButton}
          onClick={handleRunValidation}
          disabled={isProcessing}
        >
          {isProcessing ? 'Validating...' : 'Run All Validations'}
        </button>
        {validationStatus.overall === 'ready' && (
          <button 
            style={{...styles.primaryButton, marginLeft: '10px'}}
            onClick={() => setStep(3)}
          >
            Next: Review & Run
          </button>
        )}
      </div>
    </div>
  );

  const PayrollReview = () => {
    const period = payrollPeriods.find(p => p.id === payrollData.payPeriod);
    
    return (
      <div>
        <h3>Step 3: Review & Run Payroll</h3>
        
        <div style={{background: '#f5f5f5', padding: '20px', borderRadius: '6px', marginBottom: '20px'}}>
          <h4 style={{margin: '0 0 10px 0'}}>Payroll Summary</h4>
          <p><strong>Period:</strong> {period?.name || 'N/A'}</p>
          <p><strong>Type:</strong> {payrollData.periodType}</p>
          <p><strong>Date Range:</strong> {period?.start} to {period?.end}</p>
          <p><strong>Employees:</strong> {employees.length} employees</p>
        </div>

        <h4>Employee List</h4>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Department</th>
              <th style={styles.th}>Attendance</th>
              <th style={styles.th}>Leaves</th>
              <th style={styles.th}>Overtime (hrs)</th>
              <th style={styles.th}>Estimated Net</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(employee => {
              const salary = calculateSalary(employee);
              return (
                <tr key={employee.id}>
                  <td style={styles.td}>{employee.name}</td>
                  <td style={styles.td}>{employee.department}</td>
                  <td style={styles.td}>{employee.attendance} days</td>
                  <td style={styles.td}>{employee.leaves} days</td>
                  <td style={styles.td}>{employee.overtime}</td>
                  <td style={styles.td}>${salary.net.toFixed(2)}</td>
                  <td style={styles.td}>
                    <button 
                      style={{...styles.secondaryButton, padding: '5px 10px', fontSize: '12px'}}
                      onClick={() => handleEmployeeSelect(employee.id)}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{marginTop: '30px'}}>
          <button style={styles.secondaryButton} onClick={() => setStep(2)}>
            Back
          </button>
          <button 
            style={styles.primaryButton}
            onClick={handleRunPayroll}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing Payroll...' : 'Run Payroll'}
          </button>
        </div>
      </div>
    );
  };

  const PayrollResults = () => (
    <div>
      <h3>Step 4: Payroll Results</h3>
      
      {payrollData.payrollResults && (
        <div style={{background: '#e8f5e9', padding: '20px', borderRadius: '6px', marginBottom: '20px'}}>
          <h4 style={{color: '#4CAF50', margin: '0 0 10px 0'}}>✓ Payroll Completed Successfully</h4>
          <p><strong>Payroll ID:</strong> {payrollHistory[0]?.id}</p>
          <p><strong>Total Employees:</strong> {payrollData.payrollResults.totalEmployees}</p>
          <p><strong>Total Gross Amount:</strong> {payrollData.payrollResults.totalGross}</p>
          <p><strong>Total Net Amount:</strong> {payrollData.payrollResults.totalNet}</p>
          <p><strong>Processed On:</strong> {new Date().toLocaleString()}</p>
        </div>
      )}

      <div style={{marginTop: '30px'}}>
        <button 
          style={styles.primaryButton}
          onClick={() => {
            setStep(1);
            setPayrollData({
              payPeriod: '',
              periodType: 'monthly',
              selectedEmployees: [],
              validationResults: null,
              payrollResults: null,
              runName: ''
            });
            setValidationStatus({
              attendance: 'pending',
              leaves: 'pending',
              overtime: 'pending',
              overall: 'pending'
            });
            setValidationIssues([]);
          }}
        >
          Run Another Payroll
        </button>
        <button 
          style={{...styles.secondaryButton, marginLeft: '10px'}}
          onClick={() => setActiveTab('history')}
        >
          View Payroll History
        </button>
      </div>
    </div>
  );

  const PayrollHistoryView = () => (
    <div>
      <h3>Payroll History</h3>
      
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Payroll ID</th>
            <th style={styles.th}>Period</th>
            <th style={styles.th}>Type</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Run Date</th>
            <th style={styles.th}>Employees</th>
            <th style={styles.th}>Total Amount</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payrollHistory.map(run => (
            <tr key={run.id}>
              <td style={styles.td}>{run.id}</td>
              <td style={styles.td}>{run.period}</td>
              <td style={styles.td}>{run.type}</td>
              <td style={styles.td}>
                <span style={{
                  ...styles.badge,
                  ...(run.status === 'completed' ? styles.completedBadge : 
                       run.status === 'reversed' ? styles.reversedBadge : 
                       {background: '#FF9800', color: 'white'})
                }}>
                  {run.status}
                </span>
              </td>
              <td style={styles.td}>{run.runDate}</td>
              <td style={styles.td}>{run.totalEmployees}</td>
              <td style={styles.td}>{run.totalAmount}</td>
              <td style={styles.td}>
                <button 
                  style={{...styles.secondaryButton, padding: '5px 10px', fontSize: '12px'}}
                  onClick={() => {/* View details */}}
                >
                  View
                </button>
                {run.canReverse && (
                  <>
                    <button 
                      style={styles.dangerButton}
                      onClick={() => handleReversePayroll(run.id)}
                      disabled={isProcessing}
                    >
                      Reverse
                    </button>
                    <button 
                      style={{...styles.secondaryButton, padding: '5px 10px', fontSize: '12px', marginLeft: '5px'}}
                      onClick={() => handleRerunPayroll(run.id)}
                      disabled={isProcessing}
                    >
                      Re-run
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const EmployeeSalaryModal = () => {
    if (!selectedEmployeeDetails) return null;
    
    const salary = calculateSalary(selectedEmployeeDetails);
    const deductions = [
      { name: 'Tax', amount: salary.gross * 0.10 },
      { name: 'Insurance', amount: salary.gross * 0.03 },
      { name: 'Retirement', amount: salary.gross * 0.02 }
    ];
    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);

    return (
      <div style={styles.modalOverlay} onClick={() => setSelectedEmployeeDetails(null)}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <h3 style={{margin: 0}}>{selectedEmployeeDetails.name} - Salary Breakdown</h3>
            <button 
              onClick={() => setSelectedEmployeeDetails(null)}
              style={{background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer'}}
            >
              ×
            </button>
          </div>
          
          <div style={styles.salarySections}>
            <div style={styles.salarySection}>
              <h4>Earnings</h4>
              <div style={styles.salaryRow}>
                <span>Basic Salary</span>
                <span>${selectedEmployeeDetails.basicSalary.toFixed(2)}</span>
              </div>
              <div style={styles.salaryRow}>
                <span>Overtime ({selectedEmployeeDetails.overtime} hrs × $25)</span>
                <span>${(selectedEmployeeDetails.overtime * 25).toFixed(2)}</span>
              </div>
              <div style={{...styles.salaryRow, borderBottom: '2px solid #333', fontWeight: 'bold'}}>
                <span>Gross Salary</span>
                <span>${salary.gross.toFixed(2)}</span>
              </div>
            </div>
            
            <div style={styles.salarySection}>
              <h4>Deductions</h4>
              {deductions.map(d => (
                <div key={d.name} style={styles.salaryRow}>
                  <span>{d.name}</span>
                  <span>${d.amount.toFixed(2)}</span>
                </div>
              ))}
              <div style={{...styles.salaryRow, borderBottom: '2px solid #333', fontWeight: 'bold'}}>
                <span>Total Deductions</span>
                <span>${totalDeductions.toFixed(2)}</span>
              </div>
            </div>
            
            <div style={styles.netSalary}>
              <h4>Net Salary</h4>
              <div style={{fontSize: '32px', fontWeight: 'bold', color: '#2196F3'}}>
                ${salary.net.toFixed(2)}
              </div>
              <p style={{color: '#666', fontSize: '14px'}}>
                After {selectedEmployeeDetails.attendance} days attendance, {selectedEmployeeDetails.leaves} days leave
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={{margin: 0}}>Payroll Management System</h1>
        <div>
          <button 
            style={{...styles.primaryButton, marginRight: '10px'}}
            onClick={() => {
              setActiveTab('new-run');
              setStep(1);
            }}
          >
            New Payroll Run
          </button>
          <button 
            style={styles.secondaryButton}
            onClick={() => setActiveTab('history')}
          >
            View History
          </button>
        </div>
      </div>

      <div style={styles.tabs}>
        <button 
          style={{...styles.tabButton, ...(activeTab === 'new-run' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('new-run')}
        >
          New Payroll Run
        </button>
        <button 
          style={{...styles.tabButton, ...(activeTab === 'history' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('history')}
        >
          Payroll History
        </button>
        <button 
          style={{...styles.tabButton, ...(activeTab === 'reports' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
      </div>

      {activeTab === 'new-run' && (
        <div style={styles.wizard}>
          <div style={styles.stepper}>
            {[1, 2, 3, 4].map((stepNum) => (
              <div 
                key={stepNum} 
                style={{
                  ...styles.step,
                  ...(step === stepNum ? styles.activeStep : {})
                }}
              >
                <div style={{
                  ...styles.stepIndicator,
                  ...(step === stepNum ? styles.activeIndicator : {})
                }}>
                  {stepNum}
                </div>
                <div>
                  {stepNum === 1 && 'Select Period'}
                  {stepNum === 2 && 'Validate'}
                  {stepNum === 3 && 'Review'}
                  {stepNum === 4 && 'Results'}
                </div>
              </div>
            ))}
          </div>

          {isProcessing && (
            <div style={styles.loadingOverlay}>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '24px', marginBottom: '10px'}}>⏳</div>
                <p>Processing...</p>
              </div>
            </div>
          )}

          {step === 1 && <PeriodSelection />}
          {step === 2 && <DataValidation />}
          {step === 3 && <PayrollReview />}
          {step === 4 && <PayrollResults />}
        </div>
      )}

      {activeTab === 'history' && <PayrollHistoryView />}
      
      {activeTab === 'reports' && (
        <div style={styles.wizard}>
          <h3>Payroll Reports</h3>
          <p>Reports feature coming soon...</p>
        </div>
      )}

      {selectedEmployeeDetails && <EmployeeSalaryModal />}
    </div>
  );
};

export default PayrollSystem;