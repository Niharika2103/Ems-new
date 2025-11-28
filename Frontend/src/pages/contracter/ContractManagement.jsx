// components/ContractManagement.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { format } from 'date-fns';

const ContractManagement = () => {
  // State management
  const [contracts, setContracts] = useState([]);
  const [employees] = useState([
    { id: 1, name: 'John Doe', position: 'Software Engineer', department: 'IT', email: 'john.doe@company.com' },
    { id: 2, name: 'Jane Smith', position: 'Project Manager', department: 'Management', email: 'jane.smith@company.com' },
    { id: 3, name: 'Mike Johnson', position: 'UI/UX Designer', department: 'Design', email: 'mike.johnson@company.com' },
    { id: 4, name: 'Sarah Wilson', position: 'QA Engineer', department: 'Testing', email: 'sarah.wilson@company.com' },
    { id: 5, name: 'David Brown', position: 'DevOps Engineer', department: 'Operations', email: 'david.brown@company.com' }
  ]);

  const [formData, setFormData] = useState({
    id: '',
    employeeId: '',
    contractTitle: '',
    startDate: '',
    endDate: '',
    paymentType: '',
    paymentAmount: '',
    paymentTerms: '',
    scopeOfWork: ''
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Load contracts from localStorage
  useEffect(() => {
    const savedContracts = localStorage.getItem('contracts');
    if (savedContracts) {
      setContracts(JSON.parse(savedContracts));
    }
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      id: '',
      employeeId: '',
      contractTitle: '',
      startDate: '',
      endDate: '',
      paymentType: '',
      paymentAmount: '',
      paymentTerms: '',
      scopeOfWork: ''
    });
    setErrors({});
  };

  // Open dialog for edit
  const handleEdit = (contract) => {
    setFormData(contract);
    setIsEditing(true);
    setIsViewing(false);
    setDialogOpen(true);
  };

  // Open dialog for view
  const handleView = (contract) => {
    setFormData(contract);
    setIsViewing(true);
    setIsEditing(false);
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
    setSuccessMessage('');
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.employeeId) newErrors.employeeId = 'Employee is required';
    if (!formData.contractTitle) newErrors.contractTitle = 'Contract title is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.paymentType) newErrors.paymentType = 'Payment type is required';
    if (!formData.paymentAmount) newErrors.paymentAmount = 'Payment amount is required';
    if (!formData.paymentTerms) newErrors.paymentTerms = 'Payment terms are required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const contractsData = JSON.parse(localStorage.getItem('contracts') || '[]');
    
    if (isEditing) {
      // Update existing contract
      const updatedContracts = contractsData.map(contract =>
        contract.id === formData.id ? formData : contract
      );
      setContracts(updatedContracts);
      localStorage.setItem('contracts', JSON.stringify(updatedContracts));
      setSuccessMessage('Contract updated successfully!');
    }

    // Auto-close after success
    setTimeout(() => {
      handleCloseDialog();
    }, 1500);
  };

  // Delete contract
  const handleDelete = (contract) => {
    if (window.confirm(`Are you sure you want to delete the contract "${contract.contractTitle}"?`)) {
      const updatedContracts = contracts.filter(c => c.id !== contract.id);
      setContracts(updatedContracts);
      localStorage.setItem('contracts', JSON.stringify(updatedContracts));
    }
  };

  // Generate PDF
  const generatePdf = (contract) => {
    const employee = employees.find(e => e.id === parseInt(contract.employeeId));
    const pdfContent = `
      CONTRACT AGREEMENT
      =================
      
      Employee: ${employee?.name || 'N/A'}
      Position: ${employee?.position || 'N/A'}
      Contract Title: ${contract.contractTitle}
      Start Date: ${contract.startDate}
      End Date: ${contract.endDate}
      Payment Type: ${contract.paymentType}
      Payment Amount: $${contract.paymentAmount}
      Payment Terms: ${contract.paymentTerms}
      
      Scope of Work:
      ${contract.scopeOfWork}
    `;

    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract-${contract.contractTitle}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get payment type color
  const getPaymentTypeColor = (type) => {
    switch (type) {
      case 'Hourly': return 'primary';
      case 'Monthly': return 'secondary';
      case 'Fixed': return 'success';
      default: return 'default';
    }
  };

  // DataGrid columns
  const columns = [
    {
      field: 'employee',
      headerName: 'EMPLOYEE',
      width: 200,
      renderCell: (params) => {
        const employee = employees.find(emp => emp.id === parseInt(params.row.employeeId));
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              {employee?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {employee?.position}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'contractTitle',
      headerName: 'CONTRACT TITLE',
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      )
    },
    {
      field: 'startDate',
      headerName: 'START DATE',
      width: 120,
      renderCell: (params) => format(new Date(params.value), 'MMM dd, yyyy')
    },
    {
      field: 'endDate',
      headerName: 'END DATE',
      width: 120,
      renderCell: (params) => format(new Date(params.value), 'MMM dd, yyyy')
    },
    {
      field: 'paymentType',
      headerName: 'PAYMENT TYPE',
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getPaymentTypeColor(params.value)}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      field: 'paymentAmount',
      headerName: 'AMOUNT',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">
          ${parseFloat(params.value).toLocaleString()}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'ACTIONS',
      width: 250,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Contract">
            <IconButton
              onClick={() => handleView(params.row)}
              color="info"
              size="small"
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Contract">
            <IconButton
              onClick={() => handleEdit(params.row)}
              color="primary"
              size="small"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Contract">
            <IconButton
              onClick={() => handleDelete(params.row)}
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download PDF">
            <IconButton
              onClick={() => generatePdf(params.row)}
              color="success"
              size="small"
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  const getSelectedEmployee = () => {
    return employees.find(emp => emp.id === parseInt(formData.employeeId));
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Contract Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          View, update, delete, and download employee contracts
        </Typography>
      </Box>

      {/* Contracts Table */}
      <Paper elevation={2} sx={{ width: '100%' }}>
        {contracts.length === 0 ? (
          <Box p={4} textAlign="center">
            <Alert severity="info">
              No contracts found.
            </Alert>
          </Box>
        ) : (
          <DataGrid
            rows={contracts}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            sx={{
              border: 0,
              '& .MuiDataGrid-cell:hover': {
                backgroundColor: 'action.hover',
              },
            }}
            autoHeight
            disableRowSelectionOnClick
          />
        )}
      </Paper>

      {/* Contract Form Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold">
            {isViewing ? 'View Contract' : 'Edit Contract'}
          </Typography>
        </DialogTitle>

        <DialogContent>
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Box display="flex" gap={3}>
              {/* Left Column - Form */}
              <Box flex={1}>
                {/* Employee Selection */}
                <FormControl fullWidth error={!!errors.employeeId} sx={{ mb: 2 }}>
                  <InputLabel>Employee</InputLabel>
                  <Select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    label="Employee"
                    disabled={isViewing}
                  >
                    {employees.map(employee => (
                      <MenuItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Contract Title */}
                <TextField
                  fullWidth
                  label="Contract Title"
                  name="contractTitle"
                  value={formData.contractTitle}
                  onChange={handleInputChange}
                  error={!!errors.contractTitle}
                  helperText={errors.contractTitle}
                  disabled={isViewing}
                  sx={{ mb: 2 }}
                />

                {/* Dates */}
                <Box display="flex" gap={2} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    error={!!errors.startDate}
                    helperText={errors.startDate}
                    disabled={isViewing}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    label="End Date"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    error={!!errors.endDate}
                    helperText={errors.endDate}
                    disabled={isViewing}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>

                {/* Payment Information */}
                <Box display="flex" gap={2} sx={{ mb: 2 }}>
                  <FormControl fullWidth error={!!errors.paymentType}>
                    <InputLabel>Payment Type</InputLabel>
                    <Select
                      name="paymentType"
                      value={formData.paymentType}
                      onChange={handleInputChange}
                      label="Payment Type"
                      disabled={isViewing}
                    >
                      <MenuItem value="Hourly">Hourly</MenuItem>
                      <MenuItem value="Monthly">Monthly</MenuItem>
                      <MenuItem value="Fixed">Fixed</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Payment Amount ($)"
                    name="paymentAmount"
                    type="number"
                    value={formData.paymentAmount}
                    onChange={handleInputChange}
                    error={!!errors.paymentAmount}
                    helperText={errors.paymentAmount}
                    disabled={isViewing}
                  />
                </Box>

                {/* Payment Terms */}
                <FormControl fullWidth error={!!errors.paymentTerms} sx={{ mb: 2 }}>
                  <InputLabel>Payment Terms</InputLabel>
                  <Select
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleInputChange}
                    label="Payment Terms"
                    disabled={isViewing}
                  >
                    <MenuItem value="Net 7">Net 7</MenuItem>
                    <MenuItem value="Net 15">Net 15</MenuItem>
                    <MenuItem value="Net 30">Net 30</MenuItem>
                    <MenuItem value="Milestone Based">Milestone Based</MenuItem>
                  </Select>
                </FormControl>

                {/* Scope of Work */}
                <TextField
                  fullWidth
                  label="Scope of Work"
                  name="scopeOfWork"
                  value={formData.scopeOfWork}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  disabled={isViewing}
                  placeholder="Describe the scope of work..."
                />
              </Box>

              {/* Right Column - Employee Info */}
              <Box width={200}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Employee Info
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {getSelectedEmployee() ? (
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        {getSelectedEmployee().name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {getSelectedEmployee().position}
                      </Typography>
                      <Chip 
                        label={getSelectedEmployee().department} 
                        size="small" 
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="caption" display="block">
                        {getSelectedEmployee().email}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                      Select employee
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleCloseDialog}
            startIcon={<CancelIcon />}
            color="inherit"
          >
            {isViewing ? 'Close' : 'Cancel'}
          </Button>
          {!isViewing && (
            <Button
              onClick={handleSubmit}
              variant="contained"
              startIcon={<SaveIcon />}
            >
              Update Contract
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContractManagement;