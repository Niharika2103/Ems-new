import React, { useState, useEffect, useMemo, useCallback } from 'react';

const PayrollVendorManagementSystem = () => {
  // ==================== STATE MANAGEMENT ====================
  const [activeModule, setActiveModule] = useState('dataSync');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  
  // Module states
  const [mappings, setMappings] = useState([]);
  const [syncProgress, setSyncProgress] = useState({ active: false, progress: 0, step: '', total: 0, processed: 0 });
  const [apiLogs, setApiLogs] = useState([]);
  const [apiStats, setApiStats] = useState({ success: 0, errors: 0, avgResponse: 0 });
  const [vendors, setVendors] = useState([]);
  const [discrepancies, setDiscrepancies] = useState([]);
  const [validationRules, setValidationRules] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ category: '', status: '', minRating: 0 });
  const [apiCredentials, setApiCredentials] = useState([]);
  const [reconciliationJobs, setReconciliationJobs] = useState([]);
  const [vendorRatings, setVendorRatings] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [dataPreview, setDataPreview] = useState({ source: [], target: [] });
  const [errorQueue, setErrorQueue] = useState([]);
  const [monitoringSettings, setMonitoringSettings] = useState({ enabled: true, autoRetry: true });

  // ==================== STYLES ====================
  const styles = {
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f5f7fa',
      minHeight: '100vh'
    },
    header: {
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '25px',
      borderRadius: '12px',
      marginBottom: '30px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    title: {
      margin: 0,
      fontSize: '32px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    subtitle: {
      margin: '10px 0 0 0',
      fontSize: '16px',
      opacity: 0.9,
      fontWeight: '400'
    },
    tabs: {
      display: 'flex',
      backgroundColor: 'white',
      borderRadius: '12px',
      marginBottom: '30px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    },
    tab: {
      padding: '18px 30px',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      borderRight: '1px solid #eee',
      transition: 'all 0.2s ease',
      backgroundColor: 'white'
    },
    activeTab: {
      backgroundColor: '#3498db',
      color: 'white'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '25px',
      marginBottom: '25px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    cardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
    },
    cardTitle: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '20px',
      color: '#2c3e50',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '25px'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease'
    },
    primaryButton: {
      backgroundColor: '#3498db',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: '#95a5a6',
      color: 'white'
    },
    successButton: {
      backgroundColor: '#27ae60',
      color: 'white'
    },
    warningButton: {
      backgroundColor: '#f39c12',
      color: 'white'
    },
    dangerButton: {
      backgroundColor: '#e74c3c',
      color: 'white'
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '14px'
    },
    tableHeader: {
      backgroundColor: '#f8f9fa',
      borderBottom: '2px solid #dee2e6'
    },
    tableHeaderCell: {
      padding: '15px',
      textAlign: 'left',
      fontWeight: '600',
      color: '#495057'
    },
    tableRow: {
      borderBottom: '1px solid #dee2e6',
      transition: 'background-color 0.2s ease'
    },
    tableRowHover: {
      backgroundColor: '#f8f9fa'
    },
    tableCell: {
      padding: '15px',
      color: '#212529'
    },
    input: {
      padding: '12px 15px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      fontSize: '14px',
      width: '100%',
      boxSizing: 'border-box'
    },
    select: {
      padding: '12px 15px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      fontSize: '14px',
      width: '100%',
      backgroundColor: 'white',
      cursor: 'pointer'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
      color: '#495057'
    },
    formGroup: {
      marginBottom: '20px'
    },
    progressBar: {
      width: '100%',
      height: '12px',
      backgroundColor: '#e9ecef',
      borderRadius: '6px',
      overflow: 'hidden',
      margin: '15px 0'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#3498db',
      borderRadius: '6px',
      transition: 'width 0.3s ease'
    },
    chip: {
      display: 'inline-flex',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
      alignItems: 'center',
      gap: '5px'
    },
    chipSuccess: {
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb'
    },
    chipWarning: {
      backgroundColor: '#fff3cd',
      color: '#856404',
      border: '1px solid #ffeaa7'
    },
    chipDanger: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb'
    },
    chipInfo: {
      backgroundColor: '#d1ecf1',
      color: '#0c5460',
      border: '1px solid #bee5eb'
    },
    metricCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '25px',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    },
    metricValue: {
      fontSize: '32px',
      fontWeight: '700',
      margin: '10px 0'
    },
    metricLabel: {
      fontSize: '14px',
      color: '#6c757d',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    notification: {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      padding: '20px 25px',
      borderRadius: '12px',
      backgroundColor: 'white',
      boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      zIndex: 1000,
      minWidth: '350px',
      animation: 'slideIn 0.3s ease'
    },
    notificationSuccess: {
      borderLeft: '5px solid #27ae60'
    },
    notificationError: {
      borderLeft: '5px solid #e74c3c'
    },
    notificationWarning: {
      borderLeft: '5px solid #f39c12'
    },
    notificationInfo: {
      borderLeft: '5px solid #3498db'
    },
    icon: {
      fontSize: '20px'
    },
    loadingOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255,255,255,0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    },
    statusBar: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '12px 25px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '14px'
    },
    statusItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }
  };

  // Animation keyframes
  const animationStyles = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    initializeData();
    startMockMonitoring();
  }, []);

  const initializeData = () => {
    // Initialize mappings
    setMappings([
      { id: 1, internalField: 'employee_id', vendorField: 'emp_no', type: 'string', required: true },
      { id: 2, internalField: 'gross_salary', vendorField: 'basic_pay', type: 'number', required: true },
      { id: 3, internalField: 'bonus_amount', vendorField: 'incentive', type: 'number', required: false },
      { id: 4, internalField: 'hire_date', vendorField: 'start_date', type: 'date', required: true }
    ]);

    // Initialize vendors
    setVendors([
      { id: 1, name: 'Payroll Solutions Inc', category: 'Payroll', status: 'Active', location: 'NY', 
        serviceType: 'Full Service', rating: 4.5, contractValue: 50000, employees: 150 },
      { id: 2, name: 'HR Tech Partners', category: 'HR', status: 'Pending', location: 'CA',
        serviceType: 'Consulting', rating: 4.2, contractValue: 35000, employees: 85 },
      { id: 3, name: 'Benefit Administrators', category: 'Benefits', status: 'Active', location: 'TX',
        serviceType: 'Benefits', rating: 4.7, contractValue: 42000, employees: 120 },
      { id: 4, name: 'Tax Compliance Corp', category: 'Tax', status: 'Active', location: 'IL',
        serviceType: 'Compliance', rating: 4.3, contractValue: 28000, employees: 65 }
    ]);

    // Initialize API logs
    setApiLogs([
      { id: 1, timestamp: '2024-01-15 10:30:22', endpoint: '/api/payroll/sync', method: 'POST', 
        status: 'error', responseTime: 4500, error: 'Connection timeout' },
      { id: 2, timestamp: '2024-01-15 11:15:45', endpoint: '/api/vendor/update', method: 'PUT',
        status: 'success', responseTime: 1200, error: null },
      { id: 3, timestamp: '2024-01-15 12:30:10', endpoint: '/api/payroll/validate', method: 'POST',
        status: 'error', responseTime: 3200, error: 'Invalid credentials' }
    ]);

    // Initialize validation rules
    setValidationRules([
      { id: 1, name: 'Salary Range Check', field: 'gross_salary', operator: 'between', 
        value: '1000-50000', severity: 'high', enabled: true },
      { id: 2, name: 'Tax ID Validation', field: 'tax_id', operator: 'regex', 
        value: '^[0-9]{9}$', severity: 'medium', enabled: true },
      { id: 3, name: 'Department Budget', field: 'department_total', operator: '<=', 
        value: '100000', severity: 'low', enabled: true }
    ]);

    // Initialize discrepancies
    setDiscrepancies([
      { id: 1, employeeId: 'EMP001', name: 'John Doe', internalAmount: 5000, vendorAmount: 4990, 
        difference: 10, status: 'pending', department: 'Engineering', date: '2024-01-15' },
      { id: 2, employeeId: 'EMP002', name: 'Jane Smith', internalAmount: 6500, vendorAmount: 6500, 
        difference: 0, status: 'resolved', department: 'Marketing', date: '2024-01-15' },
      { id: 3, employeeId: 'EMP003', name: 'Bob Johnson', internalAmount: 7200, vendorAmount: 7000, 
        difference: 200, status: 'in-progress', department: 'Sales', date: '2024-01-15' }
    ]);

    // Initialize API credentials
    setApiCredentials([
      { id: 1, name: 'Payroll API', type: 'jwt', token: '*******', expires: '2024-02-15', status: 'active' },
      { id: 2, name: 'Vendor API', type: 'api_key', token: '*******', expires: '2024-03-01', status: 'active' }
    ]);

    // Initialize reconciliation jobs
    setReconciliationJobs([
      { id: 1, period: 'Jan 2024', startDate: '2024-01-01', endDate: '2024-01-31', 
        status: 'completed', discrepancies: 5, autoResolved: 3, manualResolved: 2 },
      { id: 2, period: 'Dec 2023', startDate: '2023-12-01', endDate: '2023-12-31',
        status: 'completed', discrepancies: 8, autoResolved: 6, manualResolved: 2 }
    ]);

    // Initialize vendor ratings
    setVendorRatings([
      { id: 1, vendorId: 1, date: '2024-01-15', quality: 4, timeliness: 5, communication: 4, cost: 4, 
        overall: 4.3, feedback: 'Excellent service, responsive team' },
      { id: 2, vendorId: 2, date: '2024-01-10', quality: 4, timeliness: 4, communication: 5, cost: 3, 
        overall: 4.0, feedback: 'Good communication, slightly expensive' }
    ]);

    // Calculate initial stats
    calculateApiStats();
    calculatePerformanceMetrics();
  };

  const startMockMonitoring = () => {
    // Simulate real-time monitoring
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && monitoringSettings.enabled) {
        const newLog = {
          id: Date.now(),
          timestamp: new Date().toLocaleString(),
          endpoint: '/api/payroll/check',
          method: 'GET',
          status: Math.random() > 0.2 ? 'success' : 'error',
          responseTime: Math.floor(Math.random() * 3000) + 200,
          error: Math.random() > 0.2 ? null : 'Temporary failure'
        };
        setApiLogs(prev => [newLog, ...prev.slice(0, 19)]);
        calculateApiStats();
      }
    }, 5000);

    return () => clearInterval(interval);
  };

  // ==================== MODULE 1: API DATA MAPPING SYNC ====================
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    
    // Simulate file processing
    setTimeout(() => {
      const sampleData = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        employee_id: `EMP${String(i + 1).padStart(3, '0')}`,
        gross_salary: Math.floor(Math.random() * 50000) + 30000,
        bonus_amount: Math.floor(Math.random() * 10000),
        department: ['Engineering', 'Marketing', 'Sales', 'HR'][Math.floor(Math.random() * 4)]
      }));

      setDataPreview({
        source: sampleData.slice(0, 5),
        target: sampleData.slice(0, 5).map(item => ({
          emp_no: item.employee_id,
          basic_pay: item.gross_salary,
          incentive: item.bonus_amount,
          dept: item.department
        }))
      });

      showNotification(`Loaded ${sampleData.length} records from ${file.name}`, 'success');
      setLoading(false);
    }, 1500);
  };

  const executeDataSync = async () => {
    setSyncProgress({
      active: true,
      progress: 0,
      step: 'Initializing synchronization...',
      total: 100,
      processed: 0
    });

    const steps = [
      { step: 'Validating data mappings...', progress: 10 },
      { step: 'Transforming data format...', progress: 20 },
      { step: 'Connecting to vendor API...', progress: 30 },
      { step: 'Uploading batch 1/3...', progress: 45 },
      { step: 'Uploading batch 2/3...', progress: 60 },
      { step: 'Uploading batch 3/3...', progress: 75 },
      { step: 'Verifying responses...', progress: 90 },
      { step: 'Finalizing synchronization...', progress: 100 }
    ];

    for (let i = 0; i < steps.length; i++) {
      setSyncProgress(prev => ({
        ...prev,
        step: steps[i].step,
        progress: steps[i].progress,
        processed: Math.round(steps[i].progress / 100 * prev.total)
      }));

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setSyncProgress(prev => ({ ...prev, active: false }));
    showNotification('Data synchronization completed successfully!', 'success');
  };

  // ==================== MODULE 2: API MONITORING ====================
  const calculateApiStats = useCallback(() => {
    const logs = apiLogs;
    const successCount = logs.filter(log => log.status === 'success').length;
    const errorCount = logs.filter(log => log.status === 'error').length;
    const avgResponse = logs.reduce((sum, log) => sum + log.responseTime, 0) / logs.length || 0;

    setApiStats({
      success: successCount,
      errors: errorCount,
      avgResponse: Math.round(avgResponse)
    });

    // Update error queue
    const newErrors = logs.filter(log => 
      log.status === 'error' && 
      !errorQueue.some(eq => eq.id === log.id)
    );
    if (newErrors.length > 0) {
      setErrorQueue(prev => [...newErrors.map(err => ({ ...err, retryCount: 0 })), ...prev]);
    }
  }, [apiLogs, errorQueue]);

  const handleRetryError = (errorId) => {
    setErrorQueue(prev => 
      prev.map(error => 
        error.id === errorId 
          ? { ...error, retryCount: (error.retryCount || 0) + 1, status: 'retrying' }
          : error
      )
    );

    setTimeout(() => {
      setErrorQueue(prev => 
        prev.map(error => 
          error.id === errorId 
            ? Math.random() > 0.3 
              ? { ...error, status: 'resolved' }
              : { ...error, status: 'failed' }
            : error
        )
      );
      showNotification('Retry attempt completed', 'info');
    }, 2000);
  };

  // ==================== MODULE 3: PAYROLL COMPARISON ====================
  const runPayrollComparison = () => {
    setLoading(true);
    
    setTimeout(() => {
      const comparisonData = Array.from({ length: 25 }, (_, i) => {
        const internal = Math.floor(Math.random() * 50000) + 30000;
        const vendor = internal + (Math.random() > 0.7 ? Math.floor(Math.random() * 2000) - 1000 : 0);
        
        return {
          id: i + 1,
          employeeId: `EMP${String(i + 1).padStart(3, '0')}`,
          name: `Employee ${i + 1}`,
          department: ['Engineering', 'Marketing', 'Sales', 'HR'][Math.floor(Math.random() * 4)],
          internalAmount: internal,
          vendorAmount: vendor,
          difference: vendor - internal,
          status: vendor === internal ? 'matched' : Math.random() > 0.5 ? 'pending' : 'resolved'
        };
      });

      setDiscrepancies(comparisonData);
      setLoading(false);
      
      const discrepancyCount = comparisonData.filter(d => d.difference !== 0).length;
      showNotification(`Comparison completed. Found ${discrepancyCount} discrepancies.`, 'info');
    }, 2000);
  };

  // ==================== MODULE 4: VALIDATION RULES ====================
  const runValidation = () => {
    setLoading(true);
    
    setTimeout(() => {
      const newExceptions = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        ruleId: Math.floor(Math.random() * validationRules.length) + 1,
        employeeId: `EMP${String(Math.floor(Math.random() * 100) + 1).padStart(3, '0')}`,
        field: ['gross_salary', 'tax_id', 'department', 'bonus'][Math.floor(Math.random() * 4)],
        value: Math.random() > 0.5 ? 'Invalid format' : 'Out of range',
        severity: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
        status: 'open',
        createdAt: new Date().toISOString().split('T')[0]
      }));

      setExceptions(newExceptions);
      setLoading(false);
      showNotification(`Validation completed. Found ${newExceptions.length} exceptions.`, 'info');
    }, 1500);
  };

  // ==================== MODULE 5: VENDOR SEARCH ====================
  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      if (searchQuery && !vendor.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      if (filters.category && vendor.category !== filters.category) {
        return false;
      }
      
      if (filters.status && vendor.status !== filters.status) {
        return false;
      }
      
      if (filters.minRating > 0 && vendor.rating < filters.minRating) {
        return false;
      }
      
      return true;
    });
  }, [vendors, searchQuery, filters]);

  // ==================== MODULE 6: VENDOR PERFORMANCE ====================
  const calculatePerformanceMetrics = () => {
    const activeVendors = vendors.filter(v => v.status === 'Active');
    const averageRating = activeVendors.reduce((sum, v) => sum + v.rating, 0) / activeVendors.length || 0;
    const totalContractValue = vendors.reduce((sum, v) => sum + (v.contractValue || 0), 0);

    setPerformanceMetrics({
      averageRating: averageRating.toFixed(1),
      totalVendors: vendors.length,
      activeVendors: activeVendors.length,
      totalContractValue: totalContractValue.toLocaleString()
    });
  };

  const submitVendorRating = (vendorId, ratingData) => {
    const newRating = {
      id: vendorRatings.length + 1,
      vendorId,
      date: new Date().toISOString().split('T')[0],
      ...ratingData,
      overall: (ratingData.quality + ratingData.timeliness + ratingData.communication + ratingData.cost) / 4
    };

    setVendorRatings(prev => [newRating, ...prev]);
    
    // Update vendor's overall rating
    setVendors(prev => prev.map(vendor => {
      if (vendor.id === vendorId) {
        const vendorRatingsList = [...vendorRatings, newRating].filter(r => r.vendorId === vendorId);
        const newAverage = vendorRatingsList.reduce((sum, r) => sum + r.overall, 0) / vendorRatingsList.length;
        return { ...vendor, rating: parseFloat(newAverage.toFixed(1)) };
      }
      return vendor;
    }));

    showNotification('Rating submitted successfully!', 'success');
  };

  // ==================== MODULE 7: MOU APPROVAL WORKFLOW ====================
  const submitForApproval = (template) => {
    showNotification(`Template "${template.name}" submitted for legal approval`, 'success');
  };

  // ==================== MODULE 8: API SECURITY ====================
  const rotateApiCredentials = (credentialId) => {
    setApiCredentials(prev => prev.map(cred => 
      cred.id === credentialId 
        ? { 
            ...cred, 
            token: '••••••••',
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            lastRotated: new Date().toISOString().split('T')[0]
          }
        : cred
    ));
    showNotification('API credentials rotated successfully', 'success');
  };

  // ==================== MODULE 9: PAYROLL RECONCILIATION ====================
  const runReconciliation = () => {
    setLoading(true);
    
    setTimeout(() => {
      const results = {
        totalRecords: 5000,
        matched: 4850,
        discrepancies: 150,
        autoResolved: 120,
        manualReview: 30,
        varianceAmount: 24500.50,
        status: 'completed'
      };

      const newJob = {
        id: reconciliationJobs.length + 1,
        period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        status: 'completed',
        discrepancies: results.discrepancies,
        autoResolved: results.autoResolved,
        manualResolved: results.manualReview,
        varianceAmount: results.varianceAmount
      };

      setReconciliationJobs(prev => [newJob, ...prev]);
      setLoading(false);
      showNotification(`Reconciliation completed. ${results.discrepancies} discrepancies found.`, 'info');
    }, 2500);
  };

  // ==================== UTILITY FUNCTIONS ====================
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
  };

  const getChipStyle = (status) => {
    switch(status) {
      case 'success':
      case 'completed':
      case 'resolved':
      case 'active':
        return { ...styles.chip, ...styles.chipSuccess };
      case 'warning':
      case 'pending':
      case 'in-progress':
        return { ...styles.chip, ...styles.chipWarning };
      case 'error':
      case 'failed':
        return { ...styles.chip, ...styles.chipDanger };
      default:
        return { ...styles.chip, ...styles.chipInfo };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getIconForModule = (module) => {
    const icons = {
      dataSync: '🔄',
      apiMonitor: '📊',
      payrollCompare: '⚖️',
      validationRules: '✅',
      vendorSearch: '🔍',
      performance: '⭐',
      mouApproval: '📝',
      apiSecurity: '🔒',
      reconciliation: '💼'
    };
    return icons[module] || '📋';
  };

  // ==================== RENDER FUNCTIONS ====================
  const renderDataSyncModule = () => (
    <div>
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🔄 API Data Mapping & Synchronization</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Map internal data fields to vendor API formats and perform bulk data synchronization
        </p>
        
        <div style={styles.grid}>
          <div>
            <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#2c3e50' }}>Field Mappings</h3>
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.tableHeaderCell}>Internal Field</th>
                  <th style={styles.tableHeaderCell}>Vendor Field</th>
                  <th style={styles.tableHeaderCell}>Type</th>
                  <th style={styles.tableHeaderCell}>Required</th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((map) => (
                  <tr key={map.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{map.internalField}</td>
                    <td style={styles.tableCell}>{map.vendorField}</td>
                    <td style={styles.tableCell}>
                      <span style={getChipStyle('info')}>{map.type}</span>
                    </td>
                    <td style={styles.tableCell}>
                      {map.required ? '✅' : '➖'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div>
            <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#2c3e50' }}>Data Synchronization</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Upload Source Data</label>
              <input
                type="file"
                accept=".csv,.json,.xlsx"
                onChange={handleFileUpload}
                style={{ ...styles.input, padding: '8px' }}
              />
            </div>
            
            {syncProgress.active && (
              <div style={{ margin: '20px 0' }}>
                <p style={{ marginBottom: '10px', fontSize: '14px' }}>{syncProgress.step}</p>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${syncProgress.progress}%` }}></div>
                </div>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Processed {syncProgress.processed} of {syncProgress.total} records
                </p>
              </div>
            )}
            
            <button
              onClick={executeDataSync}
              disabled={syncProgress.active}
              style={{
                ...styles.button,
                ...styles.primaryButton,
                ...(syncProgress.active ? styles.buttonDisabled : {})
              }}
            >
              {syncProgress.active ? 'Syncing...' : 'Start Synchronization'}
            </button>
            
            {dataPreview.source.length > 0 && (
              <div style={{ marginTop: '25px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#2c3e50' }}>Data Preview</h4>
                <div style={{ display: 'flex', gap: '20px', overflowX: 'auto' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '12px', fontWeight: '500', marginBottom: '5px' }}>Source (Internal)</p>
                    <table style={{ ...styles.table, fontSize: '12px' }}>
                      <thead>
                        <tr>
                          <th>Employee ID</th>
                          <th>Salary</th>
                          <th>Bonus</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataPreview.source.map((row, idx) => (
                          <tr key={idx}>
                            <td>{row.employee_id}</td>
                            <td>{formatCurrency(row.gross_salary)}</td>
                            <td>{formatCurrency(row.bonus_amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '12px', fontWeight: '500', marginBottom: '5px' }}>Target (Vendor)</p>
                    <table style={{ ...styles.table, fontSize: '12px' }}>
                      <thead>
                        <tr>
                          <th>Emp No</th>
                          <th>Basic Pay</th>
                          <th>Incentive</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataPreview.target.map((row, idx) => (
                          <tr key={idx}>
                            <td>{row.emp_no}</td>
                            <td>{formatCurrency(row.basic_pay)}</td>
                            <td>{formatCurrency(row.incentive)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderApiMonitoringModule = () => (
    <div>
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>📊 API Monitoring & Error Handling</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Monitor API calls, log errors, and implement retry mechanisms for failed transactions
        </p>
        
        <div style={{ ...styles.grid, gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '25px' }}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Success Rate</div>
            <div style={{ ...styles.metricValue, color: '#27ae60' }}>
              {apiStats.success + apiStats.errors > 0 
                ? `${((apiStats.success / (apiStats.success + apiStats.errors)) * 100).toFixed(1)}%`
                : '0%'}
            </div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Total Errors</div>
            <div style={{ ...styles.metricValue, color: '#e74c3c' }}>
              {apiStats.errors}
            </div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Avg Response</div>
            <div style={styles.metricValue}>
              {apiStats.avgResponse}ms
            </div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Error Queue</div>
            <div style={{ ...styles.metricValue, color: '#f39c12' }}>
              {errorQueue.filter(e => e.status !== 'resolved').length}
            </div>
          </div>
        </div>
        
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', margin: 0, color: '#2c3e50' }}>Recent API Calls</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={monitoringSettings.enabled}
              onChange={(e) => setMonitoringSettings(prev => ({ ...prev, enabled: e.target.checked }))}
              style={{ cursor: 'pointer' }}
            />
            Live Monitoring
          </label>
        </div>
        
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.tableHeaderCell}>Timestamp</th>
              <th style={styles.tableHeaderCell}>Endpoint</th>
              <th style={styles.tableHeaderCell}>Method</th>
              <th style={styles.tableHeaderCell}>Status</th>
              <th style={styles.tableHeaderCell}>Response</th>
              <th style={styles.tableHeaderCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {apiLogs.slice(0, 10).map((log) => (
              <tr key={log.id} style={styles.tableRow}>
                <td style={{ ...styles.tableCell, fontSize: '12px' }}>{log.timestamp}</td>
                <td style={styles.tableCell}>
                  <span style={getChipStyle('info')}>{log.endpoint}</span>
                </td>
                <td style={styles.tableCell}>
                  <span style={{
                    ...getChipStyle(log.method === 'GET' ? 'success' : 
                                   log.method === 'POST' ? 'warning' : 'info'),
                    padding: '2px 8px'
                  }}>
                    {log.method}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <span style={getChipStyle(log.status)}>
                    {log.status === 'success' ? '✓' : '✗'} {log.status}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      flex: 1,
                      height: '6px',
                      backgroundColor: log.responseTime > 3000 ? '#e74c3c' : '#2ecc71',
                      borderRadius: '3px',
                      width: `${Math.min((log.responseTime / 5000) * 100, 100)}%`
                    }}></div>
                    <span style={{ fontSize: '12px', minWidth: '50px' }}>{log.responseTime}ms</span>
                  </div>
                </td>
                <td style={styles.tableCell}>
                  {log.status === 'error' && (
                    <button
                      onClick={() => handleRetryError(log.id)}
                      style={{ ...styles.button, padding: '6px 12px', fontSize: '12px' }}
                    >
                      🔄 Retry
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPayrollComparisonModule = () => (
    <div>
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>⚖️ Payroll Data Comparison</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Compare payroll data between internal and vendor systems, highlighting discrepancies
        </p>
        
        <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div>
              <label style={styles.label}>Period</label>
              <select style={{ ...styles.select, width: '150px' }}>
                <option>Current Month</option>
                <option>Previous Month</option>
                <option>Quarter</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Department</label>
              <select style={{ ...styles.select, width: '150px' }}>
                <option>All Departments</option>
                <option>Engineering</option>
                <option>Marketing</option>
                <option>Sales</option>
                <option>HR</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={runPayrollComparison}
            disabled={loading}
            style={{ ...styles.button, ...styles.primaryButton }}
          >
            🔄 Run Comparison
          </button>
        </div>
        
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.tableHeaderCell}>Employee</th>
              <th style={styles.tableHeaderCell}>Internal</th>
              <th style={styles.tableHeaderCell}>Vendor</th>
              <th style={styles.tableHeaderCell}>Difference</th>
              <th style={styles.tableHeaderCell}>Status</th>
              <th style={styles.tableHeaderCell}>Department</th>
            </tr>
          </thead>
          <tbody>
            {discrepancies.map((row) => (
              <tr key={row.id} style={{
                ...styles.tableRow,
                backgroundColor: row.difference === 0 ? '#f8fff9' : 
                               row.status === 'resolved' ? '#f8f9ff' : '#fff8f8'
              }}>
                <td style={styles.tableCell}>
                  <div>
                    <div style={{ fontWeight: '500' }}>{row.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{row.employeeId}</div>
                  </div>
                </td>
                <td style={{ ...styles.tableCell, fontWeight: '600' }}>
                  {formatCurrency(row.internalAmount)}
                </td>
                <td style={{ ...styles.tableCell, fontWeight: '600' }}>
                  {formatCurrency(row.vendorAmount)}
                </td>
                <td style={styles.tableCell}>
                  <span style={getChipStyle(
                    row.difference === 0 ? 'success' :
                    row.difference > 0 ? 'warning' : 'error'
                  )}>
                    {row.difference === 0 ? '✓' : 
                     row.difference > 0 ? '↑' : '↓'} 
                    {formatCurrency(Math.abs(row.difference))}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <span style={getChipStyle(row.status)}>
                    {row.status === 'resolved' ? '✓' :
                     row.status === 'in-progress' ? '⟳' : '…'} {row.status}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <span style={getChipStyle('info')}>{row.department}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '14px' }}>
          <div>
            <span style={{ color: '#666' }}>Total Discrepancies: </span>
            <strong>{discrepancies.filter(d => d.difference !== 0).length}</strong>
          </div>
          <div>
            <span style={{ color: '#666' }}>Total Variance: </span>
            <strong>{formatCurrency(discrepancies.reduce((sum, d) => sum + Math.abs(d.difference), 0))}</strong>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVendorSearchModule = () => (
    <div>
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🔍 Vendor Search & Filter System</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Search vendors by name, category, status with filter options for location and service type
        </p>
        
        <div style={{ ...styles.grid, marginBottom: '25px' }}>
          <div>
            <label style={styles.label}>Search Vendors</label>
            <input
              type="text"
              placeholder="Search by vendor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.input}
            />
          </div>
          
          <div>
            <label style={styles.label}>Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              style={styles.select}
            >
              <option value="">All Categories</option>
              <option value="Payroll">Payroll</option>
              <option value="HR">HR</option>
              <option value="Benefits">Benefits</option>
              <option value="Tax">Tax</option>
            </select>
          </div>
          
          <div>
            <label style={styles.label}>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              style={styles.select}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          
          <div>
            <label style={styles.label}>Minimum Rating</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.minRating}
                onChange={(e) => setFilters(prev => ({ ...prev, minRating: parseFloat(e.target.value) }))}
                style={{ flex: 1 }}
              />
              <span style={{ minWidth: '40px' }}>{filters.minRating.toFixed(1)}</span>
            </div>
          </div>
        </div>
        
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.tableHeaderCell}>Vendor Name</th>
              <th style={styles.tableHeaderCell}>Category</th>
              <th style={styles.tableHeaderCell}>Status</th>
              <th style={styles.tableHeaderCell}>Location</th>
              <th style={styles.tableHeaderCell}>Service Type</th>
              <th style={styles.tableHeaderCell}>Rating</th>
              <th style={styles.tableHeaderCell}>Contract Value</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map((vendor) => (
              <tr key={vendor.id} style={styles.tableRow}>
                <td style={{ ...styles.tableCell, fontWeight: '500' }}>
                  {vendor.name}
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    {vendor.employees} employees
                  </div>
                </td>
                <td style={styles.tableCell}>
                  <span style={getChipStyle('info')}>{vendor.category}</span>
                </td>
                <td style={styles.tableCell}>
                  <span style={getChipStyle(vendor.status.toLowerCase())}>
                    {vendor.status === 'Active' ? '✓' : '…'} {vendor.status}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <span style={getChipStyle('info')}>{vendor.location}</span>
                </td>
                <td style={styles.tableCell}>{vendor.serviceType}</td>
                <td style={styles.tableCell}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ color: '#f39c12' }}>★</span>
                    <span>{vendor.rating.toFixed(1)}</span>
                    <button
                      onClick={() => {
                        // Open rating modal
                        const rating = prompt(`Rate ${vendor.name} (1-5):`, vendor.rating.toString());
                        if (rating && !isNaN(rating) && rating >= 1 && rating <= 5) {
                          submitVendorRating(vendor.id, {
                            quality: parseFloat(rating),
                            timeliness: parseFloat(rating),
                            communication: parseFloat(rating),
                            cost: parseFloat(rating)
                          });
                        }
                      }}
                      style={{ 
                        ...styles.button, 
                        padding: '4px 8px', 
                        fontSize: '12px',
                        backgroundColor: 'transparent',
                        color: '#3498db',
                        border: '1px solid #3498db'
                      }}
                    >
                      Rate
                    </button>
                  </div>
                </td>
                <td style={styles.tableCell}>{formatCurrency(vendor.contractValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredVendors.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No vendors found matching your criteria
          </div>
        )}
      </div>
    </div>
  );

  const renderReconciliationModule = () => (
    <div>
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>💼 Payroll Reconciliation Engine</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Automated reconciliation of data differences with summary report generation
        </p>
        
        <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', margin: 0, color: '#2c3e50' }}>Reconciliation Jobs</h3>
          <button
            onClick={runReconciliation}
            disabled={loading}
            style={{ ...styles.button, ...styles.successButton }}
          >
            🔄 Run Reconciliation
          </button>
        </div>
        
        <div style={styles.grid}>
          {reconciliationJobs.map((job) => (
            <div key={job.id} style={{
              ...styles.metricCard,
              textAlign: 'left',
              borderLeft: `5px solid ${
                job.status === 'completed' ? '#27ae60' : 
                job.status === 'in-progress' ? '#f39c12' : '#e74c3c'
              }`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h4 style={{ margin: 0, fontSize: '16px', color: '#2c3e50' }}>{job.period}</h4>
                <span style={getChipStyle(job.status)}>
                  {job.status === 'completed' ? '✓' : '⟳'} {job.status}
                </span>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>Discrepancies:</span>
                  <span style={{ fontWeight: '600' }}>{job.discrepancies}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>Auto-Resolved:</span>
                  <span style={{ fontWeight: '600', color: '#27ae60' }}>{job.autoResolved}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>Manual Resolved:</span>
                  <span style={{ fontWeight: '600', color: '#3498db' }}>{job.manualResolved}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>Variance:</span>
                  <span style={{ fontWeight: '600' }}>{formatCurrency(job.varianceAmount || 0)}</span>
                </div>
              </div>
              
              <div style={{ fontSize: '12px', color: '#999', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                {job.startDate} - {job.endDate}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ==================== MAIN RENDER ====================
  const modules = {
    dataSync: renderDataSyncModule,
    apiMonitor: renderApiMonitoringModule,
    payrollCompare: renderPayrollComparisonModule,
    vendorSearch: renderVendorSearchModule,
    reconciliation: renderReconciliationModule
  };

  const moduleTitles = {
    dataSync: 'Data Sync',
    apiMonitor: 'API Monitor',
    payrollCompare: 'Payroll Compare',
    validationRules: 'Validation Rules',
    vendorSearch: 'Vendor Search',
    performance: 'Performance',
    mouApproval: 'MOU Approval',
    apiSecurity: 'API Security',
    reconciliation: 'Reconciliation'
  };

  return (
    <div style={styles.container}>
      <style>{animationStyles}</style>
      
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <span style={{ fontSize: '32px' }}>💼</span>
          Payroll & Vendor Management System
        </h1>
        <p style={styles.subtitle}>
          Integrated platform for payroll processing, vendor management, and API integration
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabs}>
        {Object.entries(moduleTitles).map(([key, title]) => (
          <div
            key={key}
            onClick={() => setActiveModule(key)}
            style={{
              ...styles.tab,
              ...(activeModule === key ? styles.activeTab : {}),
              backgroundColor: activeModule === key ? '#3498db' : 'white',
              color: activeModule === key ? 'white' : '#333'
            }}
          >
            <span>{getIconForModule(key)}</span>
            {title}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div>
        {modules[activeModule] ? modules[activeModule]() : (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>{getIconForModule(activeModule)} {moduleTitles[activeModule]}</h2>
            <p style={{ color: '#666' }}>
              Module under development. Coming soon with full functionality.
            </p>
          </div>
        )}
      </div>

      {/* Notification */}
      {notification.show && (
        <div style={{
          ...styles.notification,
          ...(notification.type === 'success' ? styles.notificationSuccess :
               notification.type === 'error' ? styles.notificationError :
               notification.type === 'warning' ? styles.notificationWarning :
               styles.notificationInfo)
        }}>
          <span style={{ fontSize: '20px' }}>
            {notification.type === 'success' ? '✅' :
             notification.type === 'error' ? '❌' :
             notification.type === 'warning' ? '⚠️' : 'ℹ️'}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '500', marginBottom: '4px' }}>
              {notification.type === 'success' ? 'Success' :
               notification.type === 'error' ? 'Error' :
               notification.type === 'warning' ? 'Warning' : 'Info'}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>{notification.message}</div>
          </div>
          <button
            onClick={() => setNotification(prev => ({ ...prev, show: false }))}
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <div style={{ color: '#2c3e50', fontSize: '16px', fontWeight: '500' }}>Processing...</div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div style={styles.statusBar}>
        <div style={styles.statusItem}>
          <span style={{ color: '#27ae60' }}>●</span>
          <span>System Online</span>
        </div>
        
        <div style={{ display: 'flex', gap: '30px' }}>
          <div style={styles.statusItem}>
            <span>API Status:</span>
            <span style={{ color: apiStats.errors > 0 ? '#e74c3c' : '#27ae60' }}>
              {apiStats.errors} errors
            </span>
          </div>
          
          <div style={styles.statusItem}>
            <span>Active Vendors:</span>
            <span style={{ color: '#3498db' }}>
              {vendors.filter(v => v.status === 'Active').length}
            </span>
          </div>
          
          <div style={styles.statusItem}>
            <span>Pending Tasks:</span>
            <span style={{ color: '#f39c12' }}>
              {exceptions.filter(e => e.status === 'open').length}
            </span>
          </div>
        </div>
        
        <div style={styles.statusItem}>
          <button
            onClick={calculateApiStats}
            style={{ 
              ...styles.button, 
              padding: '4px 12px', 
              fontSize: '12px',
              backgroundColor: 'transparent',
              color: 'white',
              border: '1px solid white'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollVendorManagementSystem;