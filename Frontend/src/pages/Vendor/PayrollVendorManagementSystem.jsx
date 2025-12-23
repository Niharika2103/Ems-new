import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, BarChart, TrendingUp, AlertTriangle, 
  RefreshCw, Shield, Key, Database, GitCompare,
  CheckCircle, XCircle, Clock, Download, Eye,
  BarChart2, Settings, Zap, Wifi, WifiOff,
  UploadCloud, Server, Cpu, Activity, FileText,
  Users, GitBranch, FileText as FileTextIcon, Home,
  Settings as SettingsIcon, Eye as EyeIcon,
  Upload, Plus, Trash2, Lock, Unlock,
  Award, Star, ThumbsUp, ThumbsDown, TrendingDown,
  Scale, Calculator, FileCheck, AlertCircle,
  Network, Link, ShieldCheck, RotateCcw,
  ClipboardCheck, BookOpen, Scale as ScaleIcon,
  UserCheck, FileBarChart, Repeat, GitMerge,
  Edit, DownloadCloud, ExternalLink, ChevronRight
} from 'lucide-react';

const PayrollVendorManagementSystem = () => {
  const [activeModule, setActiveModule] = useState('comparison');
  const [modules] = useState([
    { id: 'comparison', name: 'Payroll Comparison', icon: <GitCompare /> },
    { id: 'validation', name: 'Validation Rules', icon: <Calculator /> },
    { id: 'search', name: 'Vendor Search', icon: <Search /> },
    { id: 'rating', name: 'Vendor Rating', icon: <Star /> },
    { id: 'legal', name: 'Legal Approval', icon: <Scale /> },
    { id: 'security', name: 'API Security', icon: <Shield /> },
    { id: 'reconciliation', name: 'Reconciliation', icon: <GitMerge /> }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Payroll Vendor Management System</h1>
              <p className="text-gray-600">Comprehensive platform for managing payroll vendors and integrations</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">System Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-green-600">All Systems Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  activeModule === module.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {module.icon}
                {module.name}
              </button>
            ))}
          </div>
        </div>

        {/* Module Content */}
        <div className="space-y-6">
          {activeModule === 'comparison' && <PayrollComparisonEngine />}
          {activeModule === 'validation' && <ValidationRulesEngine />}
          {activeModule === 'search' && <VendorSearchSystem />}
          {activeModule === 'rating' && <VendorRatingSystem />}
          {activeModule === 'legal' && <LegalApprovalWorkflow />}
          {activeModule === 'security' && <APISecuritySystem />}
          {activeModule === 'reconciliation' && <PayrollReconciliationEngine />}
        </div>
      </div>
    </div>
  );
};

// ============================================
// 11. PAYROLL DATA COMPARISON ENGINE
// ============================================
const PayrollComparisonEngine = () => {
  const [comparisonData, setComparisonData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState('all');

  const vendors = [
    { id: 'all', name: 'All Vendors' },
    { id: 'vendor1', name: 'TechPay Solutions' },
    { id: 'vendor2', name: 'PayMaster Inc' },
    { id: 'vendor3', name: 'SalarySoft Ltd' }
  ];

  const sampleData = [
    {
      id: 1,
      employeeId: 'EMP001',
      employeeName: 'John Smith',
      department: 'Engineering',
      vendor: 'TechPay Solutions',
      internalBasic: 50000,
      vendorBasic: 50000,
      internalHra: 20000,
      vendorHra: 20000,
      internalSpecialAllowance: 10000,
      vendorSpecialAllowance: 10000,
      internalPf: 6000,
      vendorPf: 6000,
      internalNetPay: 74000,
      vendorNetPay: 74000,
      status: 'matched',
      discrepancies: [],
      variance: 0
    },
    {
      id: 2,
      employeeId: 'EMP002',
      employeeName: 'Jane Doe',
      department: 'Marketing',
      vendor: 'PayMaster Inc',
      internalBasic: 45000,
      vendorBasic: 45000,
      internalHra: 18000,
      vendorHra: 17000,
      internalSpecialAllowance: 8000,
      vendorSpecialAllowance: 8000,
      internalPf: 5400,
      vendorPf: 5400,
      internalNetPay: 65600,
      vendorNetPay: 64600,
      status: 'mismatch',
      discrepancies: ['HRA difference: ₹1,000'],
      variance: -1000
    },
    {
      id: 3,
      employeeId: 'EMP003',
      employeeName: 'Robert Johnson',
      department: 'Sales',
      vendor: 'SalarySoft Ltd',
      internalBasic: 60000,
      vendorBasic: 60000,
      internalHra: 24000,
      vendorHra: 24000,
      internalSpecialAllowance: 12000,
      vendorSpecialAllowance: 11000,
      internalPf: 7200,
      vendorPf: 7200,
      internalNetPay: 88800,
      vendorNetPay: 87800,
      status: 'mismatch',
      discrepancies: ['Special Allowance difference: ₹1,000'],
      variance: -1000
    }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const filteredData = selectedVendor === 'all' 
        ? sampleData 
        : sampleData.filter(d => d.vendor === vendors.find(v => v.id === selectedVendor)?.name);
      setComparisonData(filteredData);
      setLoading(false);
    }, 1000);
  }, [selectedMonth, selectedVendor]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'matched': return 'bg-green-100 text-green-800';
      case 'mismatch': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateSummary = () => {
    const totalEmployees = comparisonData.length;
    const matched = comparisonData.filter(d => d.status === 'matched').length;
    const mismatched = comparisonData.filter(d => d.status === 'mismatch').length;
    const totalDiscrepancies = comparisonData.reduce((sum, d) => sum + d.discrepancies.length, 0);
    const totalVariance = comparisonData.reduce((sum, d) => sum + d.variance, 0);
    
    return { totalEmployees, matched, mismatched, totalDiscrepancies, totalVariance };
  };

  const summary = calculateSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <GitCompare className="w-8 h-8 text-blue-600" />
              Payroll Data Comparison Engine
            </h2>
            <p className="text-gray-600">Compare payroll data between internal and vendor systems</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              {vendors.map(vendor => (
                <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="2024-01">January 2024</option>
              <option value="2024-02">February 2024</option>
              <option value="2024-03">March 2024</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{summary.totalEmployees}</p>
                <p className="text-sm text-blue-800">Total Employees</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{summary.matched}</p>
                <p className="text-sm text-green-800">Matched Records</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{summary.mismatched}</p>
                <p className="text-sm text-red-800">Mismatched Records</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{summary.totalDiscrepancies}</p>
                <p className="text-sm text-yellow-800">Discrepancies</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">₹{Math.abs(summary.totalVariance).toLocaleString('en-IN')}</p>
                <p className="text-sm text-purple-800">Total Variance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Detailed Comparison</h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
              <Download className="w-4 h-4" /> Export Report
            </button>
            <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg flex items-center gap-2">
              <FileCheck className="w-4 h-4" /> Generate Exception Report
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading comparison data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 text-left">Employee Details</th>
                  <th className="p-3 text-left">Basic Pay</th>
                  <th className="p-3 text-left">HRA</th>
                  <th className="p-3 text-left">Special Allowance</th>
                  <th className="p-3 text-left">PF</th>
                  <th className="p-3 text-left">Net Pay</th>
                  <th className="p-3 text-left">Variance</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{row.employeeName}</p>
                        <p className="text-sm text-gray-500">ID: {row.employeeId}</p>
                        <p className="text-sm text-gray-500">{row.department}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <p className="text-sm">Internal: ₹{row.internalBasic.toLocaleString('en-IN')}</p>
                        <p className="text-sm">Vendor: ₹{row.vendorBasic.toLocaleString('en-IN')}</p>
                        <div className={`text-xs ${row.internalBasic === row.vendorBasic ? 'text-green-600' : 'text-red-600'}`}>
                          {row.internalBasic === row.vendorBasic ? '✓ Match' : `Diff: ₹${Math.abs(row.internalBasic - row.vendorBasic).toLocaleString('en-IN')}`}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <p className="text-sm">Internal: ₹{row.internalHra.toLocaleString('en-IN')}</p>
                        <p className="text-sm">Vendor: ₹{row.vendorHra.toLocaleString('en-IN')}</p>
                        <div className={`text-xs ${row.internalHra === row.vendorHra ? 'text-green-600' : 'text-red-600'}`}>
                          {row.internalHra === row.vendorHra ? '✓ Match' : `Diff: ₹${Math.abs(row.internalHra - row.vendorHra).toLocaleString('en-IN')}`}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <p className="text-sm">Internal: ₹{row.internalSpecialAllowance.toLocaleString('en-IN')}</p>
                        <p className="text-sm">Vendor: ₹{row.vendorSpecialAllowance.toLocaleString('en-IN')}</p>
                        <div className={`text-xs ${row.internalSpecialAllowance === row.vendorSpecialAllowance ? 'text-green-600' : 'text-red-600'}`}>
                          {row.internalSpecialAllowance === row.vendorSpecialAllowance ? '✓ Match' : `Diff: ₹${Math.abs(row.internalSpecialAllowance - row.vendorSpecialAllowance).toLocaleString('en-IN')}`}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <p className="text-sm">Internal: ₹{row.internalPf.toLocaleString('en-IN')}</p>
                        <p className="text-sm">Vendor: ₹{row.vendorPf.toLocaleString('en-IN')}</p>
                        <div className={`text-xs ${row.internalPf === row.vendorPf ? 'text-green-600' : 'text-red-600'}`}>
                          {row.internalPf === row.vendorPf ? '✓ Match' : `Diff: ₹${Math.abs(row.internalPf - row.vendorPf).toLocaleString('en-IN')}`}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <p className="text-sm">Internal: ₹{row.internalNetPay.toLocaleString('en-IN')}</p>
                        <p className="text-sm">Vendor: ₹{row.vendorNetPay.toLocaleString('en-IN')}</p>
                        <div className={`text-xs font-medium ${row.internalNetPay === row.vendorNetPay ? 'text-green-600' : 'text-red-600'}`}>
                          {row.internalNetPay === row.vendorNetPay ? '✓ Match' : `Diff: ₹${Math.abs(row.internalNetPay - row.vendorNetPay).toLocaleString('en-IN')}`}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-sm ${row.variance === 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                        ₹{Math.abs(row.variance).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(row.status)}`}>
                        {row.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// 12. PAYROLL VALIDATION RULES ENGINE
// ============================================
const ValidationRulesEngine = () => {
  const [validationRules, setValidationRules] = useState([
    { id: 1, name: 'Basic Salary Range', description: 'Basic salary must be between ₹15,000 and ₹500,000', category: 'Salary', status: 'active', severity: 'high', lastTriggered: '2024-01-15' },
    { id: 2, name: 'HRA Percentage', description: 'HRA should not exceed 50% of basic salary', category: 'Allowance', status: 'active', severity: 'medium', lastTriggered: '2024-01-14' },
    { id: 3, name: 'PF Contribution', description: 'PF should be 12% of basic salary', category: 'Deduction', status: 'active', severity: 'high', lastTriggered: '2024-01-13' },
    { id: 4, name: 'Tax Calculation', description: 'Income tax should be calculated as per latest slabs', category: 'Tax', status: 'active', severity: 'critical', lastTriggered: '2024-01-12' },
    { id: 5, name: 'Net Pay Positive', description: 'Net pay must be greater than zero', category: 'Validation', status: 'active', severity: 'critical', lastTriggered: '2024-01-11' }
  ]);

  const [exceptionReports, setExceptionReports] = useState([
    { id: 1, ruleId: 2, employeeName: 'Jane Doe', description: 'HRA exceeds 50% of basic salary', status: 'pending', priority: 'high', createdAt: '2024-01-15' },
    { id: 2, ruleId: 3, employeeName: 'Robert Johnson', description: 'PF contribution mismatch', status: 'resolved', priority: 'medium', createdAt: '2024-01-14' },
    { id: 3, ruleId: 1, employeeName: 'Mike Wilson', description: 'Basic salary below minimum threshold', status: 'in-progress', priority: 'critical', createdAt: '2024-01-13' }
  ]);

  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    category: 'Salary',
    severity: 'medium'
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const addNewRule = () => {
    if (!newRule.name || !newRule.description) {
      alert('Please fill all required fields');
      return;
    }

    const rule = {
      id: Date.now(),
      name: newRule.name,
      description: newRule.description,
      category: newRule.category,
      status: 'active',
      severity: newRule.severity,
      lastTriggered: 'Never'
    };

    setValidationRules([...validationRules, rule]);
    setNewRule({ name: '', description: '', category: 'Salary', severity: 'medium' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Calculator className="w-8 h-8 text-blue-600" />
              Payroll Validation Rules Engine
            </h2>
            <p className="text-gray-600">Define and manage validation rules for payroll processing</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700">
              <RefreshCw className="w-4 h-4" /> Run Validation
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700">
              <FileCheck className="w-4 h-4" /> Generate Report
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{validationRules.length}</p>
                <p className="text-sm text-blue-800">Active Rules</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {exceptionReports.filter(r => r.status === 'resolved').length}
                </p>
                <p className="text-sm text-green-800">Resolved Exceptions</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {exceptionReports.filter(r => r.status === 'pending').length}
                </p>
                <p className="text-sm text-yellow-800">Pending Exceptions</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {exceptionReports.filter(r => r.priority === 'critical').length}
                </p>
                <p className="text-sm text-red-800">Critical Issues</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Validation Rules */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Validation Rules</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Rule
            </button>
          </div>

          {/* Add New Rule Form */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-3">Add New Validation Rule</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Rule Name"
                className="w-full px-3 py-2 border rounded-lg"
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              />
              <textarea
                placeholder="Rule Description"
                className="w-full px-3 py-2 border rounded-lg"
                rows="2"
                value={newRule.description}
                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="px-3 py-2 border rounded-lg"
                  value={newRule.category}
                  onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
                >
                  <option value="Salary">Salary</option>
                  <option value="Allowance">Allowance</option>
                  <option value="Deduction">Deduction</option>
                  <option value="Tax">Tax</option>
                  <option value="Validation">Validation</option>
                </select>
                <select
                  className="px-3 py-2 border rounded-lg"
                  value={newRule.severity}
                  onChange={(e) => setNewRule({ ...newRule, severity: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <button
                onClick={addNewRule}
                className="w-full bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Validation Rule
              </button>
            </div>
          </div>

          {/* Rules List */}
          <div className="space-y-3">
            {validationRules.map((rule) => (
              <div key={rule.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{rule.name}</h4>
                    <p className="text-sm text-gray-600">{rule.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(rule.severity)}`}>
                    {rule.severity.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Category: {rule.category}</span>
                  <span className="text-gray-500">Last triggered: {rule.lastTriggered}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exception Reports */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-semibold text-lg mb-4">Exception Reports</h3>
          
          <div className="space-y-3">
            {exceptionReports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{report.employeeName}</h4>
                    <p className="text-sm text-gray-600">{report.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Priority: {report.priority}</span>
                  <span className="text-gray-500">{report.createdAt}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">
                    View Details
                  </button>
                  <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200">
                    Resolve
                  </button>
                  <button className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200">
                    Escalate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 13. VENDOR SEARCH FILTER SYSTEM
// ============================================
const VendorSearchSystem = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const vendors = [
    { id: 1, name: 'TechPay Solutions', category: 'Payroll Processing', status: 'active', location: 'Mumbai', rating: 4.5, employees: 150 },
    { id: 2, name: 'PayMaster Inc', category: 'Tax Compliance', status: 'active', location: 'Delhi', rating: 4.2, employees: 200 },
    { id: 3, name: 'SalarySoft Ltd', category: 'HR Management', status: 'pending', location: 'Bangalore', rating: 4.0, employees: 100 },
    { id: 4, name: 'Compensation Pro', category: 'Payroll Processing', status: 'active', location: 'Chennai', rating: 4.8, employees: 180 },
    { id: 5, name: 'TaxEase Solutions', category: 'Tax Compliance', status: 'inactive', location: 'Hyderabad', rating: 3.9, employees: 120 },
    { id: 6, name: 'HR Cloud Systems', category: 'HR Management', status: 'active', location: 'Pune', rating: 4.3, employees: 90 }
  ];

  const categories = ['all', 'Payroll Processing', 'Tax Compliance', 'HR Management'];
  const statuses = ['all', 'active', 'pending', 'inactive'];
  const locations = ['all', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune'];

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || vendor.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || vendor.status === selectedStatus;
    const matchesLocation = selectedLocation === 'all' || vendor.location === selectedLocation;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-6">
          <Search className="w-8 h-8 text-blue-600" />
          Vendor Search & Filter System
        </h2>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors by name, category, or service type..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                {locations.map(location => (
                  <option key={location} value={location}>
                    {location === 'all' ? 'All Locations' : location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Showing {filteredVendors.length} of {vendors.length} vendors
            </p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSelectedLocation('all');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Vendor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <div key={vendor.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{vendor.name}</h3>
                <p className="text-gray-600 text-sm">{vendor.category}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.status)}`}>
                {vendor.status.toUpperCase()}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(vendor.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{vendor.rating}/5</span>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Location:</span>
                <span className="font-medium">{vendor.location}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Employees:</span>
                <span className="font-medium">{vendor.employees}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                View Details
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-lg">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No vendors found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

// ============================================
// 14. VENDOR PERFORMANCE RATING (UPDATED)
// ============================================
const VendorRatingSystem = () => {
  const [vendors, setVendors] = useState([
    { id: 1, name: 'TechPay Solutions', overallRating: 4.5, serviceQuality: 4.7, timeliness: 4.3, accuracy: 4.6, costEffectiveness: 4.4, lastUpdated: '2024-01-15' },
    { id: 2, name: 'PayMaster Inc', overallRating: 4.2, serviceQuality: 4.3, timeliness: 4.1, accuracy: 4.0, costEffectiveness: 4.5, lastUpdated: '2024-01-14' },
    { id: 3, name: 'SalarySoft Ltd', overallRating: 4.0, serviceQuality: 4.1, timeliness: 3.9, accuracy: 4.2, costEffectiveness: 3.8, lastUpdated: '2024-01-13' },
    { id: 4, name: 'Compensation Pro', overallRating: 4.8, serviceQuality: 4.9, timeliness: 4.7, accuracy: 4.8, costEffectiveness: 4.6, lastUpdated: '2024-01-12' }
  ]);

  const [feedback, setFeedback] = useState([
    { id: 1, vendorId: 1, rating: 5, comment: 'Excellent service and timely delivery. Payroll processing was flawless.', user: 'Finance Manager', date: '2024-01-15', helpful: 12 },
    { id: 2, vendorId: 1, rating: 4, comment: 'Good support team. Minor delays in monthly processing but overall good.', user: 'HR Executive', date: '2024-01-14', helpful: 8 },
    { id: 3, vendorId: 2, rating: 4, comment: 'Accurate calculations and responsive customer service team.', user: 'Payroll Admin', date: '2024-01-13', helpful: 5 },
    { id: 4, vendorId: 3, rating: 3, comment: 'Need improvement in response time for queries. Accuracy is good.', user: 'Operations Head', date: '2024-01-12', helpful: 2 },
    { id: 5, vendorId: 4, rating: 5, comment: 'Best vendor we have worked with! Exceptional service and support.', user: 'CFO', date: '2024-01-11', helpful: 15 }
  ]);

  const [newFeedback, setNewFeedback] = useState({
    vendorId: '',
    rating: 5,
    comment: '',
    category: 'service'
  });

  const [selectedVendor, setSelectedVendor] = useState(1);

  const addFeedback = () => {
    if (!newFeedback.vendorId || !newFeedback.comment.trim()) {
      alert('Please select vendor and provide feedback');
      return;
    }

    const feedbackItem = {
      id: Date.now(),
      vendorId: parseInt(newFeedback.vendorId),
      rating: newFeedback.rating,
      comment: newFeedback.comment,
      user: 'Current User',
      date: new Date().toISOString().split('T')[0],
      helpful: 0,
      category: newFeedback.category
    };

    setFeedback([feedbackItem, ...feedback]);
    
    // Update vendor rating
    setVendors(vendors.map(vendor => {
      if (vendor.id === parseInt(newFeedback.vendorId)) {
        const vendorFeedback = [...feedback, feedbackItem].filter(f => f.vendorId === vendor.id);
        const avgRating = vendorFeedback.reduce((sum, f) => sum + f.rating, 0) / vendorFeedback.length;
        return { ...vendor, overallRating: parseFloat(avgRating.toFixed(1)), lastUpdated: new Date().toISOString().split('T')[0] };
      }
      return vendor;
    }));

    setNewFeedback({ vendorId: '', rating: 5, comment: '', category: 'service' });
    alert('Thank you for your feedback!');
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-100';
    if (rating >= 4.0) return 'text-blue-600 bg-blue-100';
    if (rating >= 3.0) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRatingText = (rating) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4.0) return 'Good';
    if (rating >= 3.0) return 'Average';
    return 'Poor';
  };

  const filteredFeedback = feedback.filter(f => selectedVendor === 'all' || f.vendorId === selectedVendor);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              Vendor Rating & Feedback System
            </h2>
            <p className="text-gray-600">Rate vendors and provide feedback based on your experience</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Vendors</option>
              {vendors.map(vendor => (
                <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
              ))}
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700">
              <Download className="w-4 h-4" /> Export Ratings
            </button>
          </div>
        </div>

        {/* Vendor Rating Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {vendors.map((vendor, index) => (
            <div key={vendor.id} className={`p-4 rounded-lg border ${index === 0 ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-white'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index === 0 ? 'bg-yellow-100' : 'bg-blue-100'
                }`}>
                  {index === 0 ? <Award className="w-6 h-6 text-yellow-600" /> : <span className="font-bold text-blue-600">{index + 1}</span>}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{vendor.name}</h3>
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < Math.floor(vendor.overallRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getRatingColor(vendor.overallRating)}`}>
                      {vendor.overallRating}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Last updated: {vendor.lastUpdated}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Input Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            Rate a Vendor
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Vendor</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={newFeedback.vendorId}
                onChange={(e) => setNewFeedback({ ...newFeedback, vendorId: e.target.value })}
              >
                <option value="">Choose a vendor...</option>
                {vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewFeedback({ ...newFeedback, rating: star })}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star className={`w-8 h-8 ${star <= newFeedback.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
                <span className="text-lg font-bold">{newFeedback.rating}/5</span>
              </div>
              <p className="text-sm text-gray-600 text-center">{getRatingText(newFeedback.rating)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Category</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'service', label: 'Service', icon: <Users className="w-4 h-4" /> },
                  { value: 'timeliness', label: 'Timeliness', icon: <Clock className="w-4 h-4" /> },
                  { value: 'accuracy', label: 'Accuracy', icon: <CheckCircle className="w-4 h-4" /> },
                  { value: 'support', label: 'Support', icon: <UserCheck className="w-4 h-4" /> }
                ].map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setNewFeedback({ ...newFeedback, category: cat.value })}
                    className={`px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm ${
                      newFeedback.category === cat.value 
                        ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.icon}
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Feedback</label>
              <textarea
                placeholder="Share your experience with this vendor..."
                className="w-full px-3 py-2 border rounded-lg"
                rows="4"
                value={newFeedback.comment}
                onChange={(e) => setNewFeedback({ ...newFeedback, comment: e.target.value })}
              />
            </div>

            <button
              onClick={addFeedback}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <ThumbsUp className="w-5 h-5" />
              Submit Rating & Feedback
            </button>

            <div className="text-xs text-gray-500 text-center">
              Your feedback helps improve vendor services for everyone.
            </div>
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg">Recent Feedback & Reviews</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{filteredFeedback.length} reviews</span>
              <select 
                className="text-sm border rounded px-2 py-1"
                onChange={(e) => {
                  if (e.target.value === 'highest') {
                    setFeedback([...feedback].sort((a, b) => b.rating - a.rating));
                  } else if (e.target.value === 'lowest') {
                    setFeedback([...feedback].sort((a, b) => a.rating - b.rating));
                  } else if (e.target.value === 'recent') {
                    setFeedback([...feedback].sort((a, b) => new Date(b.date) - new Date(a.date)));
                  }
                }}
              >
                <option value="recent">Most Recent</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredFeedback.map((item) => {
              const vendor = vendors.find(v => v.id === item.vendorId);
              return (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(item.rating)}`}>
                          {item.rating}/5
                        </span>
                      </div>
                      <h4 className="font-medium">{vendor?.name}</h4>
                    </div>
                    <span className="text-xs text-gray-500">{item.date}</span>
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-3">{item.comment}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500">By: {item.user}</span>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" /> Helpful ({item.helpful})
                      </button>
                      <button className="text-xs text-gray-500 hover:text-red-600">
                        Report
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredFeedback.length === 0 && (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-gray-600 mb-2">No feedback yet</h4>
              <p className="text-sm text-gray-500">Be the first to rate this vendor!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// 15. MOU LEGAL APPROVAL WORKFLOW (ENHANCED)
// ============================================
const LegalApprovalWorkflow = () => {
  const [templates, setTemplates] = useState([
    { 
      id: 1, 
      name: 'Standard Vendor Agreement', 
      version: '2.1', 
      status: 'approved', 
      legalReviewer: 'Legal Team', 
      lastReviewed: '2024-01-15', 
      comments: 'All clauses approved',
      category: 'Vendor Agreement',
      riskLevel: 'low',
      daysPending: 0,
      documentUrl: '#'
    },
    { 
      id: 2, 
      name: 'Confidentiality Agreement', 
      version: '1.5', 
      status: 'pending', 
      legalReviewer: 'Pending', 
      lastReviewed: '2024-01-10', 
      comments: 'Awaiting legal review',
      category: 'NDA',
      riskLevel: 'medium',
      daysPending: 5,
      documentUrl: '#'
    },
    { 
      id: 3, 
      name: 'Service Level Agreement', 
      version: '3.0', 
      status: 'revision', 
      legalReviewer: 'John Doe', 
      lastReviewed: '2024-01-12', 
      comments: 'Clause 5.2 needs revision',
      category: 'SLA',
      riskLevel: 'high',
      daysPending: 3,
      documentUrl: '#'
    },
    { 
      id: 4, 
      name: 'Payment Terms Addendum', 
      version: '1.2', 
      status: 'approved', 
      legalReviewer: 'Legal Team', 
      lastReviewed: '2024-01-14', 
      comments: 'Approved with minor edits',
      category: 'Addendum',
      riskLevel: 'low',
      daysPending: 0,
      documentUrl: '#'
    }
  ]);

  const [workflowHistory, setWorkflowHistory] = useState([
    { id: 1, templateId: 2, action: 'Created', user: 'Admin', date: '2024-01-10', timestamp: '10:30 AM', comments: 'New template created' },
    { id: 2, templateId: 2, action: 'Submitted for Review', user: 'Admin', date: '2024-01-10', timestamp: '11:45 AM', comments: 'Sent to legal team' },
    { id: 3, templateId: 1, action: 'Approved', user: 'Legal Team', date: '2024-01-15', timestamp: '09:15 AM', comments: 'All clauses verified' },
    { id: 4, templateId: 3, action: 'Revision Requested', user: 'Legal Team', date: '2024-01-12', timestamp: '02:30 PM', comments: 'Clause 5.2 needs update' }
  ]);

  const [newComment, setNewComment] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [approvalStep, setApprovalStep] = useState('review');

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'revision': return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'rejected': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const approveTemplate = (templateId) => {
    setTemplates(templates.map(template => 
      template.id === templateId 
        ? { 
            ...template, 
            status: 'approved', 
            legalReviewer: 'Current User', 
            lastReviewed: new Date().toISOString().split('T')[0],
            daysPending: 0,
            comments: newComment || 'Template approved'
          }
        : template
    ));

    setWorkflowHistory([
      {
        id: Date.now(),
        templateId,
        action: 'Approved',
        user: 'Current User',
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        comments: newComment || 'Template approved'
      },
      ...workflowHistory
    ]);

    setNewComment('');
    alert('Template approved successfully!');
  };

  const requestRevision = (templateId) => {
    setTemplates(templates.map(template => 
      template.id === templateId 
        ? { 
            ...template, 
            status: 'revision', 
            legalReviewer: 'Current User', 
            lastReviewed: new Date().toISOString().split('T')[0],
            comments: newComment || 'Revision requested'
          }
        : template
    ));

    setWorkflowHistory([
      {
        id: Date.now(),
        templateId,
        action: 'Revision Requested',
        user: 'Current User',
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        comments: newComment || 'Revision requested'
      },
      ...workflowHistory
    ]);

    setNewComment('');
    alert('Revision requested!');
  };

  const rejectTemplate = (templateId) => {
    setTemplates(templates.map(template => 
      template.id === templateId 
        ? { 
            ...template, 
            status: 'rejected', 
            legalReviewer: 'Current User', 
            lastReviewed: new Date().toISOString().split('T')[0],
            comments: newComment || 'Template rejected'
          }
        : template
    ));

    setWorkflowHistory([
      {
        id: Date.now(),
        templateId,
        action: 'Rejected',
        user: 'Current User',
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        comments: newComment || 'Template rejected'
      },
      ...workflowHistory
    ]);

    setNewComment('');
    alert('Template rejected!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Scale className="w-8 h-8 text-blue-600" />
              MoU Legal Approval Workflow
            </h2>
            <p className="text-gray-600">Manage legal document reviews and approvals</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700">
              <Plus className="w-4 h-4" /> New Template
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700">
              <DownloadCloud className="w-4 h-4" /> Export All
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FileTextIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{templates.length}</p>
                <p className="text-sm text-blue-800">Total Templates</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {templates.filter(t => t.status === 'approved').length}
                </p>
                <p className="text-sm text-green-800">Approved</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {templates.filter(t => t.status === 'pending').length}
                </p>
                <p className="text-sm text-yellow-800">Pending Review</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Edit className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {templates.filter(t => t.status === 'revision').length}
                </p>
                <p className="text-sm text-orange-800">Needs Revision</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Approval Steps */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="font-semibold text-lg mb-4">Approval Workflow Steps</h3>
            <div className="flex items-center justify-between mb-6">
              {['review', 'legal', 'compliance', 'final'].map((step, index) => (
                <div key={step} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    approvalStep === step ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-sm capitalize">{step}</span>
                  {index < 3 && <div className="h-0.5 w-20 bg-gray-200 mt-5"></div>}
                </div>
              ))}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Current Step: {approvalStep.charAt(0).toUpperCase() + approvalStep.slice(1)}</span>
                <span className="text-sm text-gray-500">Estimated completion: 2 days</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>

          {/* Template List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Documents Pending Legal Review</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">All</button>
                <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">Pending</button>
                <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm">Approved</button>
              </div>
            </div>
            
            <div className="space-y-3">
              {templates.map((template) => (
                <div 
                  key={template.id} 
                  className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                    selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-lg">{template.name}</h4>
                        <span className="text-sm px-2 py-1 bg-gray-100 rounded">{template.version}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{template.comments}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Category: {template.category}</span>
                        <span>•</span>
                        <span>Last reviewed: {template.lastReviewed}</span>
                        <span>•</span>
                        <span>By: {template.legalReviewer}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(template.status)}`}>
                        {template.status.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${getRiskColor(template.riskLevel)}`}>
                        {template.riskLevel.toUpperCase()} RISK
                      </span>
                    </div>
                  </div>
                  
                  {template.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          approveTemplate(template.id);
                        }}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          requestRevision(template.id);
                        }}
                        className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 flex items-center justify-center gap-1"
                      >
                        <Edit className="w-4 h-4" /> Request Revision
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          rejectTemplate(template.id);
                        }}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Document Details & Comments */}
        <div className="space-y-6">
          {/* Document Details */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="font-semibold text-lg mb-4">Document Details</h3>
            
            {selectedTemplate ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                  <p className="font-medium">{selectedTemplate.name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                    <p className="text-sm">{selectedTemplate.version}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <p className="text-sm">{selectedTemplate.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                    <span className={`px-2 py-1 rounded text-xs ${getRiskColor(selectedTemplate.riskLevel)}`}>
                      {selectedTemplate.riskLevel.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedTemplate.status)}`}>
                      {selectedTemplate.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                  <p className="text-sm text-gray-600">{selectedTemplate.comments}</p>
                </div>
                
                <div className="pt-4 border-t">
                  <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" /> View Full Document
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Select a document to view details
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Comments & Review</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Audit Trail
              </button>
            </div>

            {/* Comment Input */}
            {selectedTemplate && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium mb-3">Add Comment</h4>
                <textarea
                  placeholder="Enter your comments here..."
                  className="w-full px-3 py-2 border rounded-lg mb-3"
                  rows="3"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => approveTemplate(selectedTemplate.id)}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => requestRevision(selectedTemplate.id)}
                    className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 text-sm"
                  >
                    Revise
                  </button>
                  <button
                    onClick={() => rejectTemplate(selectedTemplate.id)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}

            {/* Workflow History */}
            <div>
              <h4 className="font-medium mb-3">Workflow History</h4>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {workflowHistory
                  .filter(item => !selectedTemplate || item.templateId === selectedTemplate.id)
                  .map((item) => (
                    <div key={item.id} className="border-l-2 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">
                            {item.action}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">{item.comments}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-500 block">{item.date}</span>
                          <span className="text-xs text-gray-500">{item.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">By: {item.user}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 16. API SECURITY AUTHENTICATION
// ============================================
const APISecuritySystem = () => {
  const [apiCredentials, setApiCredentials] = useState([
    { id: 1, vendor: 'TechPay Solutions', apiKey: 'sk_live_***5678', secretKey: '******', authMethod: 'API Key', status: 'active', lastRotated: '2024-01-01', expiry: '2024-12-31' },
    { id: 2, vendor: 'PayMaster Inc', apiKey: 'sk_live_***1234', secretKey: '******', authMethod: 'OAuth 2.0', status: 'active', lastRotated: '2024-01-05', expiry: '2024-12-31' },
    { id: 3, vendor: 'SalarySoft Ltd', apiKey: 'sk_test_***abcd', secretKey: '******', authMethod: 'JWT Token', status: 'inactive', lastRotated: '2023-12-15', expiry: '2024-06-30' },
    { id: 4, vendor: 'Compensation Pro', apiKey: 'sk_live_***efgh', secretKey: '******', authMethod: 'API Key', status: 'active', lastRotated: '2024-01-10', expiry: '2024-12-31' }
  ]);

  const [securityLogs, setSecurityLogs] = useState([
    { id: 1, vendor: 'TechPay Solutions', action: 'API Key Rotation', user: 'System Admin', timestamp: '2024-01-01 10:30:00', status: 'success' },
    { id: 2, vendor: 'PayMaster Inc', action: 'Authentication Failure', user: 'API User', timestamp: '2024-01-02 14:15:00', status: 'failed' },
    { id: 3, vendor: 'SalarySoft Ltd', action: 'Credential Reset', user: 'Security Team', timestamp: '2024-01-03 09:45:00', status: 'success' },
    { id: 4, vendor: 'TechPay Solutions', action: 'Access Revoked', user: 'Admin', timestamp: '2024-01-04 16:20:00', status: 'success' }
  ]);

  const [newCredential, setNewCredential] = useState({
    vendor: '',
    authMethod: 'API Key',
    expiry: '2024-12-31'
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLogStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const generateApiKey = () => {
    return `sk_live_${Math.random().toString(36).substr(2, 16)}`;
  };

  const addCredential = () => {
    if (!newCredential.vendor) {
      alert('Please select vendor');
      return;
    }

    const credential = {
      id: Date.now(),
      vendor: newCredential.vendor,
      apiKey: generateApiKey(),
      secretKey: '******',
      authMethod: newCredential.authMethod,
      status: 'active',
      lastRotated: new Date().toISOString().split('T')[0],
      expiry: newCredential.expiry
    };

    setApiCredentials([...apiCredentials, credential]);
    
    setSecurityLogs([
      {
        id: Date.now(),
        vendor: newCredential.vendor,
        action: 'New Credential Created',
        user: 'Current User',
        timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
        status: 'success'
      },
      ...securityLogs
    ]);

    setNewCredential({ vendor: '', authMethod: 'API Key', expiry: '2024-12-31' });
  };

  const rotateApiKey = (credentialId) => {
    setApiCredentials(apiCredentials.map(credential => 
      credential.id === credentialId 
        ? { 
            ...credential, 
            apiKey: generateApiKey(),
            lastRotated: new Date().toISOString().split('T')[0]
          }
        : credential
    ));

    const credential = apiCredentials.find(c => c.id === credentialId);
    setSecurityLogs([
      {
        id: Date.now(),
        vendor: credential.vendor,
        action: 'API Key Rotated',
        user: 'Current User',
        timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
        status: 'success'
      },
      ...securityLogs
    ]);

    alert('API key rotated successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-green-600" />
          API Security & Authentication Management
        </h2>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Key className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{apiCredentials.length}</p>
                <p className="text-sm text-blue-800">API Credentials</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {apiCredentials.filter(c => c.status === 'active').length}
                </p>
                <p className="text-sm text-green-800">Active Credentials</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {apiCredentials.filter(c => new Date(c.expiry) < new Date()).length}
                </p>
                <p className="text-sm text-yellow-800">Expired Credentials</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {securityLogs.filter(l => l.status === 'failed').length}
                </p>
                <p className="text-sm text-red-800">Security Events</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Credentials Management */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">API Credentials</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Credential
            </button>
          </div>

          {/* Add Credential Form */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-3">Add New API Credential</h4>
            <div className="space-y-3">
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={newCredential.vendor}
                onChange={(e) => setNewCredential({ ...newCredential, vendor: e.target.value })}
              >
                <option value="">Select Vendor</option>
                <option value="TechPay Solutions">TechPay Solutions</option>
                <option value="PayMaster Inc">PayMaster Inc</option>
                <option value="SalarySoft Ltd">SalarySoft Ltd</option>
                <option value="Compensation Pro">Compensation Pro</option>
              </select>
              
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="px-3 py-2 border rounded-lg"
                  value={newCredential.authMethod}
                  onChange={(e) => setNewCredential({ ...newCredential, authMethod: e.target.value })}
                >
                  <option value="API Key">API Key</option>
                  <option value="OAuth 2.0">OAuth 2.0</option>
                  <option value="JWT Token">JWT Token</option>
                  <option value="Basic Auth">Basic Auth</option>
                </select>
                
                <input
                  type="date"
                  className="px-3 py-2 border rounded-lg"
                  value={newCredential.expiry}
                  onChange={(e) => setNewCredential({ ...newCredential, expiry: e.target.value })}
                />
              </div>

              <button
                onClick={addCredential}
                className="w-full bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4" /> Generate Credentials
              </button>
            </div>
          </div>

          {/* Credentials List */}
          <div className="space-y-3">
            {apiCredentials.map((credential) => (
              <div key={credential.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{credential.vendor}</h4>
                    <p className="text-sm text-gray-600">Auth Method: {credential.authMethod}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(credential.status)}`}>
                    {credential.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div className="text-gray-600">API Key:</div>
                  <div className="font-mono truncate">{credential.apiKey}</div>
                  <div className="text-gray-600">Secret Key:</div>
                  <div className="font-mono">{credential.secretKey}</div>
                  <div className="text-gray-600">Last Rotated:</div>
                  <div>{credential.lastRotated}</div>
                  <div className="text-gray-600">Expiry:</div>
                  <div>{credential.expiry}</div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => rotateApiKey(credential.id)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Rotate Key
                  </button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
                    <Eye className="w-3 h-3" />
                  </button>
                  <button className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">
                    <Lock className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Logs */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-semibold text-lg mb-4">Security Audit Logs</h3>
          
          <div className="space-y-3">
            {securityLogs.map((log) => (
              <div key={log.id} className="border-l-4 border-blue-500 pl-4 py-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{log.vendor}</h4>
                    <p className="text-sm text-gray-600">{log.action}</p>
                  </div>
                  <span className={`text-sm font-medium ${getLogStatusColor(log.status)}`}>
                    {log.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>By: {log.user}</span>
                  <span>{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 17. PAYROLL RECONCILIATION ENGINE
// ============================================
const PayrollReconciliationEngine = () => {
  const [reconciliationJobs, setReconciliationJobs] = useState([
    { id: 1, name: 'January 2024 Payroll', status: 'completed', date: '2024-01-31', records: 150, matched: 145, mismatched: 5, duration: '2m 15s' },
    { id: 2, name: 'December 2023 Payroll', status: 'completed', date: '2023-12-31', records: 148, matched: 148, mismatched: 0, duration: '1m 45s' },
    { id: 3, name: 'November 2023 Payroll', status: 'completed', date: '2023-11-30', records: 145, matched: 142, mismatched: 3, duration: '2m 30s' },
    { id: 4, name: 'October 2023 Payroll', status: 'failed', date: '2023-10-31', records: 140, matched: 0, mismatched: 140, duration: '5m 10s' },
    { id: 5, name: 'September 2023 Payroll', status: 'completed', date: '2023-09-30', records: 135, matched: 135, mismatched: 0, duration: '1m 30s' }
  ]);

  const [reports, setReports] = useState([
    { id: 1, name: 'Monthly Reconciliation Summary', type: 'summary', generated: '2024-01-31', size: '2.4 MB' },
    { id: 2, name: 'Discrepancy Analysis Report', type: 'analysis', generated: '2024-01-31', size: '1.8 MB' },
    { id: 3, name: 'Vendor Performance Report', type: 'performance', generated: '2024-01-31', size: '3.2 MB' },
    { id: 4, name: 'Audit Trail Report', type: 'audit', generated: '2024-01-31', size: '4.1 MB' }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('2024-01');

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const runReconciliation = () => {
    setIsRunning(true);
    
    // Simulate reconciliation process
    setTimeout(() => {
      const newJob = {
        id: Date.now(),
        name: `${selectedPeriod} Payroll`,
        status: 'completed',
        date: new Date().toISOString().split('T')[0],
        records: Math.floor(Math.random() * 50) + 100,
        matched: Math.floor(Math.random() * 45) + 95,
        mismatched: Math.floor(Math.random() * 5),
        duration: `${Math.floor(Math.random() * 3) + 1}m ${Math.floor(Math.random() * 60)}s`
      };

      setReconciliationJobs([newJob, ...reconciliationJobs]);
      setIsRunning(false);
      alert('Reconciliation completed successfully!');
    }, 3000);
  };

  const calculateSummary = () => {
    const totalJobs = reconciliationJobs.length;
    const completed = reconciliationJobs.filter(j => j.status === 'completed').length;
    const failed = reconciliationJobs.filter(j => j.status === 'failed').length;
    const totalRecords = reconciliationJobs.reduce((sum, j) => sum + j.records, 0);
    const matchedRecords = reconciliationJobs.reduce((sum, j) => sum + j.matched, 0);
    
    return { totalJobs, completed, failed, totalRecords, matchedRecords };
  };

  const summary = calculateSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <GitMerge className="w-8 h-8 text-blue-600" />
              Payroll Reconciliation Engine
            </h2>
            <p className="text-gray-600">Automated reconciliation and reporting system</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="2024-01">January 2024</option>
              <option value="2023-12">December 2023</option>
              <option value="2023-11">November 2023</option>
            </select>
            <button
              onClick={runReconciliation}
              disabled={isRunning}
              className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                isRunning 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Running...
                </>
              ) : (
                <>
                  <Repeat className="w-4 h-4" /> Run Reconciliation
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FileBarChart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{summary.totalJobs}</p>
                <p className="text-sm text-blue-800">Total Jobs</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{summary.completed}</p>
                <p className="text-sm text-green-800">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{summary.failed}</p>
                <p className="text-sm text-red-800">Failed Jobs</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Database className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{summary.totalRecords}</p>
                <p className="text-sm text-purple-800">Total Records</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {((summary.matchedRecords / summary.totalRecords) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-yellow-800">Match Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reconciliation Jobs */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-semibold text-lg mb-4">Reconciliation Jobs</h3>
          
          <div className="space-y-3">
            {reconciliationJobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{job.name}</h4>
                    <p className="text-sm text-gray-500">Date: {job.date}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Records:</span>
                      <span className="font-medium">{job.records}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Matched:</span>
                      <span className="font-medium text-green-600">{job.matched}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mismatched:</span>
                      <span className="font-medium text-red-600">{job.mismatched}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{job.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Match Rate:</span>
                      <span className="font-medium">
                        {((job.matched / job.records) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">
                    View Details
                  </button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
                    <Download className="w-3 h-3" />
                  </button>
                  {job.status === 'failed' && (
                    <button className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">
                      Retry
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reports */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Generated Reports</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2">
              <FileBarChart className="w-4 h-4" /> Generate All Reports
            </button>
          </div>

          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{report.name}</h4>
                    <p className="text-sm text-gray-500 capitalize">Type: {report.type}</p>
                  </div>
                  <span className="text-sm text-gray-500">{report.generated}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Size: {report.size}</span>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> View
                    </button>
                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 flex items-center gap-1">
                      <Download className="w-3 h-3" /> Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Report */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-blue-600" />
              Monthly Summary Report
            </h4>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Total Reconciliation Jobs</p>
                <p className="text-2xl font-bold">{summary.totalJobs}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {((summary.completed / summary.totalJobs) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Records Processed</span>
                <span className="font-medium">{summary.totalRecords}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Matched Records</span>
                <span className="font-medium text-green-600">{summary.matchedRecords}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Overall Match Rate</span>
                <span className="font-medium">
                  {((summary.matchedRecords / summary.totalRecords) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              Download Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollVendorManagementSystem;