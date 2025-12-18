import React, { useState, useEffect } from 'react';
import {
  validatePayrollApi,
  runPayrollApi,
  reversePayrollApi,
  rerunPayrollApi,
  getAllPayrollApi
} from "../../api/authApi";

const PayrollSystem = () => {
  const [activeTab, setActiveTab] = useState('new-run');
  const [step, setStep] = useState(1);
  const [payrollData, setPayrollData] = useState({
    selectedMonth: null,
    selectedYear: null,
    runName: ''
  });
  
  const [validationStatus, setValidationStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [error, setError] = useState('');
  const [payrollResults, setPayrollResults] = useState(null); // ✅ Store payroll run result

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
    warningButton: {
      padding: '10px 20px',
      background: '#FF9800',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      marginLeft: '10px'
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
    validationGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      margin: '20px 0'
    },
    validationCard: {
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      textAlign: 'center'
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
    },
    errorText: {
      color: '#f44336',
      marginTop: '10px'
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadPayrollHistory();
    }
  }, [activeTab]);

  const loadPayrollHistory = async () => {
    setIsProcessing(true);
    try {
      const response = await getAllPayrollApi();
      setPayrollHistory(response.data.payroll || []);
    } catch (err) {
      setError('Failed to load payroll history');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ STEP 1: YEAR + MONTH DROPDOWNS (with full year range)
  const PeriodSelection = () => {
    const currentYear = new Date().getFullYear();
    const startYear = 2000; // Earliest supported year
    const endYear = currentYear + 10; // Allow future planning
    const years = Array.from(
      { length: endYear - startYear + 1 },
      (_, i) => startYear + i
    ).reverse(); // Most recent years first

    const months = [
      { value: 1, name: 'January' },
      { value: 2, name: 'February' },
      { value: 3, name: 'March' },
      { value: 4, name: 'April' },
      { value: 5, name: 'May' },
      { value: 6, name: 'June' },
      { value: 7, name: 'July' },
      { value: 8, name: 'August' },
      { value: 9, name: 'September' },
      { value: 10, name: 'October' },
      { value: 11, name: 'November' },
      { value: 12, name: 'December' },
    ];

    return (
      <div>
        <h3>Step 1: Select Pay Period</h3>
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Year
            </label>
            <select
              value={payrollData.selectedYear || ''}
              onChange={(e) => setPayrollData({ ...payrollData, selectedYear: Number(e.target.value) })}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                minWidth: '120px',
                fontSize: '14px'
              }}
            >
              <option value="">-- Select Year --</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Month
            </label>
            <select
              value={payrollData.selectedMonth || ''}
              onChange={(e) => setPayrollData({ ...payrollData, selectedMonth: Number(e.target.value) })}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                minWidth: '150px',
                fontSize: '14px'
              }}
              disabled={!payrollData.selectedYear}
            >
              <option value="">-- Select Month --</option>
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <input
            type="text"
            placeholder="Payroll Run Name (Optional)"
            value={payrollData.runName}
            onChange={(e) => setPayrollData({ ...payrollData, runName: e.target.value })}
            style={{ padding: '10px', width: '300px', marginRight: '10px' }}
          />
        </div>

        {error && <p style={styles.errorText}>{error}</p>}
        
        <div style={{ marginTop: '30px' }}>
          <button 
            style={styles.primaryButton}
            disabled={!payrollData.selectedMonth || !payrollData.selectedYear}
            onClick={() => setStep(2)}
          >
            Next: Validate Data
          </button>
        </div>
      </div>
    );
  };

  // ✅ STEP 2: VALIDATION + "Continue Anyway"
  const DataValidation = () => (
    <div>
      <h3>Step 2: Pre-Payroll Validation</h3>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Validate attendance and salary structure before processing payroll.
      </p>

      {validationStatus && (
        <div style={styles.validationGrid}>
          <div style={styles.validationCard}>
            <h4>Attendance Summary</h4>
            <p>Approved: {validationStatus.attendance_summary?.approved || 0}</p>
            <p style={{ 
              color: validationStatus.attendance_summary?.pending_approval > 0 ? '#FF9800' : 'inherit',
              fontWeight: validationStatus.attendance_summary?.pending_approval > 0 ? 'bold' : 'normal'
            }}>
              Pending: {validationStatus.attendance_summary?.pending_approval || 0}
            </p>
          </div>
          
          <div style={styles.validationCard}>
            <h4>Employees</h4>
            <p>Total: {validationStatus.total_employees || 0}</p>
            <p style={{ 
              color: validationStatus.issues?.length > 0 ? '#FF9800' : 'inherit',
              fontWeight: validationStatus.issues?.length > 0 ? 'bold' : 'normal'
            }}>
              With Issues: {validationStatus.issues?.length || 0}
            </p>
          </div>
        </div>
      )}

      {error && <p style={styles.errorText}>{error}</p>}
      
      <div style={{ marginTop: '30px' }}>
        <button style={styles.secondaryButton} onClick={() => setStep(1)}>
          Back
        </button>
        
        <button 
          style={styles.primaryButton}
          onClick={async () => {
            if (!payrollData.selectedMonth || !payrollData.selectedYear) {
              setError('Please select a valid period');
              return;
            }
            setIsProcessing(true);
            setError('');
            try {
              const response = await validatePayrollApi({
                month: payrollData.selectedMonth,
                year: payrollData.selectedYear
              });
              setValidationStatus(response.data);
            } catch (err) {
              setError(err.response?.data?.error || 'Validation failed');
              console.error(err);
            } finally {
              setIsProcessing(false);
            }
          }}
          disabled={isProcessing}
        >
          {isProcessing ? 'Validating...' : 'Run Validation'}
        </button>

        <button 
          style={styles.warningButton}
          onClick={() => setStep(3)}
        >
          Continue Anyway
        </button>
      </div>
    </div>
  );

  // ✅ STEP 3: REVIEW (no restrictions)
  const PayrollReview = () => (
    <div>
      <h3>Step 3: Review & Run Payroll</h3>
      
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '6px', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Payroll Summary</h4>
        <p><strong>Period:</strong> {payrollData.selectedMonth}/{payrollData.selectedYear}</p>
        {validationStatus && (
          <>
            <p><strong>Employees:</strong> {validationStatus.total_employees}</p>
            <p><strong>Approved Attendance:</strong> {validationStatus.attendance_summary?.approved || 0}</p>
            <p><strong>Pending Approval:</strong> {validationStatus.attendance_summary?.pending_approval || 0}</p>
          </>
        )}
      </div>

      {error && <p style={styles.errorText}>{error}</p>}
      
      <div style={{ marginTop: '30px' }}>
        <button style={styles.secondaryButton} onClick={() => setStep(2)}>
          Back
        </button>
        <button 
          style={styles.primaryButton}
          onClick={async () => {
            setIsProcessing(true);
            setError('');
            try {
              const response = await runPayrollApi({
                month: payrollData.selectedMonth,
                year: payrollData.selectedYear
              });
              setPayrollResults(response.data); // ✅ Save full result
              await loadPayrollHistory();
              setStep(4);
            } catch (err) {
              setError(err.response?.data?.error || 'Payroll run failed');
              console.error(err);
            } finally {
              setIsProcessing(false);
            }
          }}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing Payroll...' : 'Run Payroll'}
        </button>
      </div>
    </div>
  );

  // ✅ STEP 4: RESULTS — NOW SHOWING ALL TOTALS
  const PayrollResults = () => (
    <div>
      <h3>Step 4: Payroll Results</h3>
      
      <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '6px', marginBottom: '20px' }}>
        <h4 style={{ color: '#4CAF50', margin: '0 0 10px 0' }}>✓ Payroll Completed Successfully</h4>
        <p><strong>Period:</strong> {payrollData.selectedMonth}/{payrollData.selectedYear}</p>
        <p><strong>Processed On:</strong> {payrollResults?.runDate ? new Date(payrollResults.runDate).toLocaleString() : 'N/A'}</p>
        <p><strong>Total Gross:</strong> ${parseFloat(payrollResults?.totalGross || 0).toFixed(2)}</p>
        <p><strong>Total Deductions:</strong> ${parseFloat(payrollResults?.totalDeductions || 0).toFixed(2)}</p>
        <p><strong>Total Net:</strong> ${parseFloat(payrollResults?.totalNet || 0).toFixed(2)}</p>
      </div>

      <div style={{ marginTop: '30px' }}>
        <button 
          style={styles.primaryButton}
          onClick={() => {
            setStep(1);
            setPayrollData({ selectedMonth: null, selectedYear: null, runName: '' });
            setValidationStatus(null);
            setPayrollResults(null);
            setError('');
          }}
        >
          Run Another Payroll
        </button>
        <button 
          style={{ ...styles.secondaryButton, marginLeft: '10px' }}
          onClick={() => {
            setActiveTab('history');
            loadPayrollHistory();
          }}
        >
          View Payroll History
        </button>
      </div>
    </div>
  );

  // ✅ HISTORY TAB
  const PayrollHistoryView = () => (
    <div>
      <h3>Payroll History</h3>
      
      {isProcessing && <p>Loading payroll history...</p>}
      {error && <p style={styles.errorText}>{error}</p>}
      
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Payroll ID</th>
            <th style={styles.th}>Period</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Run Date</th>
            <th style={styles.th}>Employees</th>
            <th style={styles.th}>Total Gross</th>
            <th style={styles.th}>Total Net</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payrollHistory.map(run => (
            <tr key={run.id}>
              <td style={styles.td}>{run.payroll_id}</td>
              <td style={styles.td}>{run.month}/{run.year}</td>
              <td style={styles.td}>
                <span style={{
                  ...styles.badge,
                  ...(run.status === 'Completed' ? styles.completedBadge : 
                       run.status === 'Reversed' ? styles.reversedBadge : 
                       { background: '#FF9800', color: 'white' })
                }}>
                  {run.status}
                </span>
              </td>
              <td style={styles.td}>{new Date(run.run_date).toLocaleDateString()}</td>
              <td style={styles.td}>{run.total_employees}</td>
              <td style={styles.td}>${parseFloat(run.total_gross).toFixed(2)}</td>
              <td style={styles.td}>${parseFloat(run.total_net).toFixed(2)}</td>
              <td style={styles.td}>
                {(run.status === 'Completed' || run.status === 'Reversed') && (
                  <button 
                    style={{ ...styles.secondaryButton, padding: '5px 10px', fontSize: '12px' }}
                    onClick={() => {
                      if (window.confirm(`Re-run payroll for ${run.month}/${run.year}?`)) {
                        (async () => {
                          setIsProcessing(true);
                          try {
                            await rerunPayrollApi({ month: run.month, year: run.year });
                            await loadPayrollHistory();
                          } catch (err) {
                            setError(err.response?.data?.error || 'Failed to re-run');
                          } finally {
                            setIsProcessing(false);
                          }
                        })();
                      }
                    }}
                    disabled={isProcessing}
                  >
                    Re-run
                  </button>
                )}

                {run.status === 'Completed' && (
                  <button 
                    style={styles.dangerButton}
                    onClick={() => {
                      if (window.confirm('Reverse this payroll? This cannot be undone.')) {
                        (async () => {
                          setIsProcessing(true);
                          try {
                            await reversePayrollApi({ id: run.id });
                            await loadPayrollHistory();
                          } catch (err) {
                            setError(err.response?.data?.error || 'Failed to reverse');
                          } finally {
                            setIsProcessing(false);
                          }
                        })();
                      }
                    }}
                    disabled={isProcessing}
                  >
                    Reverse
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={{ margin: 0 }}>Payroll Management System</h1>
      </div>

      <div style={styles.tabs}>
        <button 
          style={{ ...styles.tabButton, ...(activeTab === 'new-run' ? styles.activeTab : {}) }}
          onClick={() => setActiveTab('new-run')}
        >
          New Payroll Run
        </button>
        <button 
          style={{ ...styles.tabButton, ...(activeTab === 'history' ? styles.activeTab : {}) }}
          onClick={() => {
            setActiveTab('history');
            loadPayrollHistory();
          }}
        >
          Payroll History
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
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
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
    </div>
  );
};

export default PayrollSystem;