import React, { useState, useEffect } from 'react';

const PayoutManagement = () => {
  // State Management
  const [activeSection, setActiveSection] = useState('calculator');
  const [contractType, setContractType] = useState('fixed');
  const [thresholdAmount, setThresholdAmount] = useState(1000);
  const [userBalance, setUserBalance] = useState(0);
  
  // Form State
  const [formData, setFormData] = useState({
    amount: '',
    hours: '',
    hourlyRate: '',
    commissionRate: '',
    tdsRate: 10,
    platformCommission: 5,
    tdsApplicable: true,
    commissionApplicable: true,
    payoutDate: '',
    bankAccount: {
      accountNumber: '',
      ifscCode: '',
      accountHolder: '',
      bankName: ''
    }
  });
  
  // Payout History State
  const [payoutHistory, setPayoutHistory] = useState([
    {
      id: 1,
      date: '2024-01-15',
      amount: 15000,
      type: 'fixed',
      status: 'completed',
      tdsDeducted: 1500,
      commission: 750,
      netAmount: 12750
    },
    {
      id: 2,
      date: '2024-01-10',
      amount: 8000,
      type: 'hourly',
      status: 'processing',
      tdsDeducted: 800,
      commission: 400,
      netAmount: 6800
    },
    {
      id: 3,
      date: '2024-01-05',
      amount: 12000,
      type: 'commission',
      status: 'scheduled',
      tdsDeducted: 1200,
      commission: 600,
      netAmount: 10200
    }
  ]);
  
  // Scheduled Payouts State
  const [scheduledPayouts, setScheduledPayouts] = useState([
    {
      id: 3,
      date: '2024-01-25',
      amount: 10200,
      type: 'commission',
      status: 'scheduled'
    }
  ]);
  
  // Calculate Payout Function
  const calculatePayout = () => {
    let grossAmount = 0;
    
    switch(contractType) {
      case 'fixed':
        grossAmount = parseFloat(formData.amount) || 0;
        break;
      case 'hourly':
        const hours = parseFloat(formData.hours) || 0;
        const hourlyRate = parseFloat(formData.hourlyRate) || 0;
        grossAmount = hours * hourlyRate;
        break;
      case 'commission':
        const saleAmount = parseFloat(formData.amount) || 0;
        const commissionRate = parseFloat(formData.commissionRate) || 0;
        grossAmount = saleAmount * (commissionRate / 100);
        break;
      default:
        grossAmount = 0;
    }
    
    const tdsDeduction = formData.tdsApplicable 
      ? grossAmount * (parseFloat(formData.tdsRate) / 100)
      : 0;
    
    const commissionDeduction = formData.commissionApplicable
      ? grossAmount * (parseFloat(formData.platformCommission) / 100)
      : 0;
    
    const netAmount = grossAmount - tdsDeduction - commissionDeduction;
    
    return {
      grossAmount: grossAmount.toFixed(2),
      tdsDeduction: tdsDeduction.toFixed(2),
      commissionDeduction: commissionDeduction.toFixed(2),
      netAmount: netAmount.toFixed(2)
    };
  };
  
  // Format Currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Format Date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Handle Form Input Change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };
  
  // Schedule Payout
  const handleSchedulePayout = () => {
    const result = calculatePayout();
    const netAmount = parseFloat(result.netAmount);
    
    if (netAmount <= 0) {
      alert('Please calculate a valid payout amount first');
      return;
    }
    
    if (netAmount < thresholdAmount) {
      alert(`Amount is below minimum threshold of ${formatCurrency(thresholdAmount)}`);
      return;
    }
    
    const newPayout = {
      id: Date.now(),
      date: formData.payoutDate || new Date().toISOString().split('T')[0],
      amount: parseFloat(result.grossAmount),
      type: contractType,
      status: 'scheduled',
      tdsDeducted: parseFloat(result.tdsDeduction),
      commission: parseFloat(result.commissionDeduction),
      netAmount: netAmount
    };
    
    setScheduledPayouts(prev => [...prev, newPayout]);
    setUserBalance(prev => prev + netAmount);
    
    alert('Payout scheduled successfully!');
  };
  
  // Request Payout
  const handleRequestPayout = () => {
    if (userBalance < thresholdAmount) {
      alert(`You need ${formatCurrency(thresholdAmount - userBalance)} more to reach payout threshold`);
      return;
    }
    
    const newPayout = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      amount: userBalance,
      type: 'withdrawal',
      status: 'pending',
      tdsDeducted: 0,
      commission: 0,
      netAmount: userBalance
    };
    
    setPayoutHistory(prev => [newPayout, ...prev]);
    setUserBalance(0);
    
    alert('Payout requested successfully!');
  };
  
  // Cancel Scheduled Payout
  const handleCancelPayout = (id) => {
    setScheduledPayouts(prev => prev.filter(payout => payout.id !== id));
  };
  
  // Update Threshold
  const handleUpdateThreshold = () => {
    if (thresholdAmount < 100) {
      alert('Minimum threshold cannot be less than ₹100');
      return;
    }
    alert(`Threshold updated to ${formatCurrency(thresholdAmount)}`);
  };
  
  // Save Bank Details
  const handleSaveBankDetails = () => {
    const { accountNumber, ifscCode, accountHolder } = formData.bankAccount;
    if (!accountNumber || !ifscCode || !accountHolder) {
      alert('Please fill all required bank details');
      return;
    }
    alert('Bank details saved successfully!');
  };
  
  // Navigation Tabs
  const navigationTabs = [
    { id: 'calculator', label: '📊 Calculator', icon: '🧮' },
    { id: 'schedule', label: '📅 Schedule', icon: '⏰' },
    { id: 'history', label: '📋 History', icon: '📜' },
    { id: 'threshold', label: '🎯 Threshold', icon: '💰' },
    { id: 'bank', label: '🏦 Bank Transfer', icon: '💳' }
  ];
  
  // Contract Types
  const contractTypes = [
    { id: 'fixed', label: 'Fixed Contract', icon: '📄' },
    { id: 'hourly', label: 'Hourly Rate', icon: '⏱️' },
    { id: 'commission', label: 'Commission', icon: '📈' }
  ];
  
  // Status Badge Component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      processing: { color: 'bg-[#93C5FD] text-[#1D4ED8]', label: 'Processing' },
      scheduled: { color: 'bg-[#BFDBFE] text-[#1E40AF]', label: 'Scheduled' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };
  
  // Calculate total statistics
  const totalEarnings = payoutHistory.reduce((sum, payout) => sum + payout.amount, 0);
  const totalDeductions = payoutHistory.reduce((sum, payout) => sum + payout.tdsDeducted + payout.commission, 0);
  const totalNet = payoutHistory.reduce((sum, payout) => sum + payout.netAmount, 0);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">💰 Payout Management System</h1>
          <p className="text-gray-600 mb-4">Manage your earnings, deductions, and scheduled payments</p>
          
          {/* Balance Card */}
          <div className="bg-gradient-to-r from-[#60A5FA] to-[#3B82F6] rounded-lg p-6 text-white mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <p className="text-blue-100">Current Balance</p>
                <h2 className="text-4xl font-bold mt-2">{formatCurrency(userBalance)}</h2>
                <div className="mt-4">
                  <div className="flex items-center">
                    <div className="w-48 bg-blue-400 rounded-full h-2.5 mr-4">
                      <div 
                        className="bg-white h-2.5 rounded-full" 
                        style={{ width: `${Math.min((userBalance/thresholdAmount)*100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm">
                      {userBalance >= thresholdAmount ? '✅ Ready for payout' : 
                       `${formatCurrency(thresholdAmount - userBalance)} to reach threshold`}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleRequestPayout}
                disabled={userBalance < thresholdAmount}
                className={`mt-4 md:mt-0 px-6 py-3 rounded-lg font-semibold transition-all ${
                  userBalance >= thresholdAmount
                    ? 'bg-white text-[#3B82F6] hover:bg-blue-50'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Request Payout
              </button>
            </div>
          </div>
          
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <span className="text-green-600 text-xl">💰</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Earnings</p>
                  <p className="text-xl font-bold text-gray-800">{formatCurrency(totalEarnings)}</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg mr-3">
                  <span className="text-red-600 text-xl">📉</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Deductions</p>
                  <p className="text-xl font-bold text-gray-800">{formatCurrency(totalDeductions)}</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-[#BFDBFE] rounded-lg mr-3">
                  <span className="text-[#3B82F6] text-xl">💳</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Net Received</p>
                  <p className="text-xl font-bold text-gray-800">{formatCurrency(totalNet)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            {navigationTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                  activeSection === tab.id
                    ? 'bg-[#3B82F6] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Payout Calculator Section */}
          {activeSection === 'calculator' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">🧮 Payout Calculator</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Inputs */}
                <div>
                  {/* Contract Type Selection */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Contract Type</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {contractTypes.map(type => (
                        <button
                          key={type.id}
                          onClick={() => setContractType(type.id)}
                          className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center ${
                            contractType === type.id
                              ? 'border-[#3B82F6] bg-[#EFF6FF]'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-2xl mb-2">{type.icon}</span>
                          <span className="font-medium">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Dynamic Form Fields */}
                  <div className="space-y-6">
                    {contractType === 'fixed' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contract Amount (₹)
                        </label>
                        <input
                          type="number"
                          name="amount"
                          value={formData.amount}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6]"
                          placeholder="Enter contract amount"
                        />
                      </div>
                    )}
                    
                    {contractType === 'hourly' && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Hours Worked
                            </label>
                            <input
                              type="number"
                              name="hours"
                              value={formData.hours}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6]"
                              placeholder="Enter hours"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Hourly Rate (₹)
                            </label>
                            <input
                              type="number"
                              name="hourlyRate"
                              value={formData.hourlyRate}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6]"
                              placeholder="Enter hourly rate"
                            />
                          </div>
                        </div>
                      </>
                    )}
                    
                    {contractType === 'commission' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sale Amount (₹)
                          </label>
                          <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6]"
                            placeholder="Enter sale amount"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Commission Rate (%)
                          </label>
                          <input
                            type="number"
                            name="commissionRate"
                            value={formData.commissionRate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6]"
                            placeholder="Enter commission %"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Deduction Settings */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Deduction Settings</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="tdsApplicable"
                              name="tdsApplicable"
                              checked={formData.tdsApplicable}
                              onChange={handleInputChange}
                              className="h-5 w-5 text-[#3B82F6] rounded"
                            />
                            <label htmlFor="tdsApplicable" className="ml-3 font-medium">
                              Apply TDS (Tax Deducted at Source)
                            </label>
                          </div>
                          {formData.tdsApplicable && (
                            <div className="flex items-center">
                              <input
                                type="number"
                                name="tdsRate"
                                value={formData.tdsRate}
                                onChange={handleInputChange}
                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                                min="0"
                                max="30"
                              />
                              <span className="ml-2">%</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="commissionApplicable"
                              name="commissionApplicable"
                              checked={formData.commissionApplicable}
                              onChange={handleInputChange}
                              className="h-5 w-5 text-[#3B82F6] rounded"
                            />
                            <label htmlFor="commissionApplicable" className="ml-3 font-medium">
                              Apply Platform Commission
                            </label>
                          </div>
                          {formData.commissionApplicable && (
                            <div className="flex items-center">
                              <input
                                type="number"
                                name="platformCommission"
                                value={formData.platformCommission}
                                onChange={handleInputChange}
                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                                min="0"
                                max="30"
                              />
                              <span className="ml-2">%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Schedule Options */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Schedule Payout Date (Optional)
                      </label>
                      <input
                        type="date"
                        name="payoutDate"
                        value={formData.payoutDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6]"
                      />
                    </div>
                    
                    <button
                      onClick={handleSchedulePayout}
                      className="w-full bg-[#3B82F6] text-white py-3 px-6 rounded-lg hover:bg-[#2563EB] transition-colors font-semibold text-lg"
                    >
                      Schedule Payout
                    </button>
                  </div>
                </div>
                
                {/* Right Column - Results */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">📊 Payout Breakdown</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Gross Amount</span>
                        <span className="text-lg font-semibold">
                          ₹{calculatePayout().grossAmount || '0.00'}
                        </span>
                      </div>
                    </div>
                    
                    {formData.tdsApplicable && (
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center text-red-600">
                          <span>TDS Deduction ({formData.tdsRate}%)</span>
                          <span className="font-semibold">
                            -₹{calculatePayout().tdsDeduction || '0.00'}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {formData.commissionApplicable && (
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center text-red-600">
                          <span>Platform Commission ({formData.platformCommission}%)</span>
                          <span className="font-semibold">
                            -₹{calculatePayout().commissionDeduction || '0.00'}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-lg text-white">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Net Payout Amount</span>
                        <span className="text-2xl font-bold">
                          ₹{calculatePayout().netAmount || '0.00'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-[#EFF6FF] p-4 rounded-lg">
                      <h4 className="font-semibold text-[#1E40AF] mb-2">Summary</h4>
                      <ul className="text-sm text-[#3B82F6] space-y-1">
                        <li>• Contract Type: {contractTypes.find(t => t.id === contractType)?.label}</li>
                        <li>• TDS: {formData.tdsApplicable ? 'Yes' : 'No'}</li>
                        <li>• Platform Commission: {formData.commissionApplicable ? 'Yes' : 'No'}</li>
                        {formData.payoutDate && (
                          <li>• Scheduled for: {formatDate(formData.payoutDate)}</li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                      <div className="flex items-start">
                        <span className="text-amber-600 mr-2">💡</span>
                        <div>
                          <p className="text-sm text-amber-800 font-medium">Important Notes</p>
                          <ul className="text-xs text-amber-700 mt-1 space-y-1">
                            <li>• TDS is deducted as per Indian Income Tax rules</li>
                            <li>• Platform commission supports our services</li>
                            <li>• Minimum payout threshold: {formatCurrency(thresholdAmount)}</li>
                            <li>• Payouts are processed within 3-5 business days</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Scheduled Payouts Section */}
          {activeSection === 'schedule' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">📅 Scheduled Payouts</h2>
                <span className="bg-[#BFDBFE] text-[#1E40AF] px-3 py-1 rounded-full text-sm font-medium">
                  {scheduledPayouts.length} Payouts
                </span>
              </div>
              
              {scheduledPayouts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {scheduledPayouts.map(payout => (
                        <tr key={payout.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{payout.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(payout.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                              {payout.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {formatCurrency(payout.netAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={payout.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => handleCancelPayout(payout.id)}
                              className="text-red-600 hover:text-red-900 mr-4 font-medium"
                            >
                              Cancel
                            </button>
                            <button className="text-[#3B82F6] hover:text-[#1D4ED8] font-medium">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-medium text-gray-500 mb-2">No Scheduled Payouts</h3>
                  <p className="text-gray-400">Schedule a payout using the calculator</p>
                </div>
              )}
            </div>
          )}
          
          {/* Payout History Section */}
          {activeSection === 'history' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">📋 Payout History</h2>
                <button className="bg-[#3B82F6] text-white px-4 py-2 rounded-lg hover:bg-[#2563EB] transition-colors flex items-center">
                  <span className="mr-2">📥</span>
                  Export CSV
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gross Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deductions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payoutHistory.map(payout => (
                      <tr key={payout.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(payout.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            payout.type === 'fixed' ? 'bg-blue-100 text-blue-800' :
                            payout.type === 'hourly' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {payout.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatCurrency(payout.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="text-red-600">TDS: {formatCurrency(payout.tdsDeducted)}</div>
                            <div className="text-red-600">Commission: {formatCurrency(payout.commission)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          {formatCurrency(payout.netAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={payout.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Threshold Settings Section */}
          {activeSection === 'threshold' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">🎯 Payout Threshold Settings</h2>
              
              <div className="max-w-md mx-auto">
                <div className="bg-gray-50 p-8 rounded-xl">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-[#BFDBFE] rounded-full mb-4">
                      <span className="text-3xl">💰</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Minimum Payout Threshold</h3>
                    <p className="text-gray-600 mt-2">
                      Set the minimum balance required to request a payout
                    </p>
                  </div>
                  
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Current Threshold Amount
                    </label>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold mr-2">₹</span>
                      <input
                        type="number"
                        value={thresholdAmount}
                        onChange={(e) => setThresholdAmount(parseFloat(e.target.value) || 0)}
                        className="flex-1 text-3xl font-bold border-0 bg-transparent focus:outline-none focus:ring-0"
                        min="100"
                      />
                    </div>
                    <div className="mt-4">
                      <input
                        type="range"
                        min="100"
                        max="10000"
                        step="100"
                        value={thresholdAmount}
                        onChange={(e) => setThresholdAmount(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-2">
                        <span>₹100</span>
                        <span>₹10,000</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-[#EFF6FF] p-4 rounded-lg mb-6">
                    <div className="flex items-start">
                      <span className="text-[#3B82F6] mr-2">ℹ️</span>
                      <div>
                        <p className="text-sm text-[#1E40AF]">
                          <strong>Current Balance:</strong> {formatCurrency(userBalance)}
                        </p>
                        <p className="text-sm text-[#1E40AF] mt-1">
                          {userBalance >= thresholdAmount ? (
                            <span className="text-green-600">✓ You can request payout</span>
                          ) : (
                            <span>
                              Need {formatCurrency(thresholdAmount - userBalance)} more to reach threshold
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleUpdateThreshold}
                    className="w-full bg-[#3B82F6] text-white py-3 px-6 rounded-lg hover:bg-[#2563EB] transition-colors font-semibold"
                  >
                    Update Threshold
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Bank Transfer Section */}
          {activeSection === 'bank' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">🏦 Bank Transfer Integration</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bank Details Form */}
                <div>
                  <div className="bg-gray-50 p-6 rounded-xl mb-6">
                    <h3 className="text-lg font-semibold mb-4">Bank Account Details</h3>
                    <p className="text-gray-600 text-sm mb-6">
                      All payouts will be transferred to this bank account
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Holder Name *
                        </label>
                        <input
                          type="text"
                          name="bankAccount.accountHolder"
                          value={formData.bankAccount.accountHolder}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6]"
                          placeholder="Enter account holder name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bank Name *
                        </label>
                        <input
                          type="text"
                          name="bankAccount.bankName"
                          value={formData.bankAccount.bankName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6]"
                          placeholder="Enter bank name"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Number *
                          </label>
                          <input
                            type="text"
                            name="bankAccount.accountNumber"
                            value={formData.bankAccount.accountNumber}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6]"
                            placeholder="Enter account number"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            IFSC Code *
                          </label>
                          <input
                            type="text"
                            name="bankAccount.ifscCode"
                            value={formData.bankAccount.ifscCode}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6]"
                            placeholder="Enter IFSC code"
                          />
                        </div>
                      </div>
                      
                      <button
                        onClick={handleSaveBankDetails}
                        className="w-full bg-[#3B82F6] text-white py-3 px-6 rounded-lg hover:bg-[#2563EB] transition-colors font-semibold mt-6"
                      >
                        Save Bank Details
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Bank Info & Instructions */}
                <div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-green-800">💰 Payout Information</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <span className="text-green-600 mr-3">✅</span>
                        <div>
                          <p className="font-medium text-green-800">Secure Transfers</p>
                          <p className="text-sm text-green-700">All transactions are encrypted and secure</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <span className="text-green-600 mr-3">⚡</span>
                        <div>
                          <p className="font-medium text-green-800">Fast Processing</p>
                          <p className="text-sm text-green-700">Payouts processed within 24-48 hours</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <span className="text-green-600 mr-3">🏛️</span>
                        <div>
                          <p className="font-medium text-green-800">Bank Verified</p>
                          <p className="text-sm text-green-700">All banks in India are supported</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4 text-amber-800">📝 Important Instructions</h3>
                    
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="text-amber-600 mr-2">1.</span>
                        <span className="text-sm text-amber-800">
                          Ensure account number and IFSC code are correct
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-600 mr-2">2.</span>
                        <span className="text-sm text-amber-800">
                          Account holder name must match your PAN card
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-600 mr-2">3.</span>
                        <span className="text-sm text-amber-800">
                          TDS certificate will be provided for all deductions
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-600 mr-2">4.</span>
                        <span className="text-sm text-amber-800">
                          Contact support for any bank-related queries
                        </span>
                      </li>
                    </ul>
                    
                    <div className="mt-6 p-4 bg-white rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Note:</strong> For international transfers, additional charges may apply. 
                        Contact support for more information.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>💰 Payout Management System v1.0 | All calculations are indicative</p>
          <p className="mt-1">TDS deductions are as per Indian Income Tax Act, 1961</p>
        </div>
      </div>
    </div>
  );
};

export default PayoutManagement;