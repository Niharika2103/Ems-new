import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Checkbox,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Breadcrumbs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import {
  Home as HomeIcon,
  AccountBalance as AccountsIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  SelectAll as SelectAllIcon,
  Clear as ClearIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const PayrollSystem = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [payrollResult, setPayrollResult] = useState(null);
  const [filters, setFilters] = useState({
    department: '',
    search: ''
  });

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchEmployees = async () => {
      const mockEmployees = [
        { id: 1, name: 'John Doe', department: 'Engineering', baseSalary: 5000, employmentType: 'full-time' },
        { id: 2, name: 'Jane Smith', department: 'Marketing', baseSalary: 4500, employmentType: 'full-time' },
        { id: 3, name: 'Mike Johnson', department: 'Engineering', baseSalary: 5500, employmentType: 'full-time' },
        { id: 4, name: 'Sarah Wilson', department: 'HR', baseSalary: 4000, employmentType: 'full-time' },
        { id: 5, name: 'David Brown', department: 'Finance', baseSalary: 6000, employmentType: 'freelancer' },
        { id: 6, name: 'Emily Davis', department: 'Marketing', baseSalary: 4800, employmentType: 'full-time' },
      ];
      setEmployees(mockEmployees);
    };
    
    fetchEmployees();
  }, []);

  // Filter employees based on search and department
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(filters.search.toLowerCase());
    const matchesDepartment = !filters.department || emp.department === filters.department;
    return matchesSearch && matchesDepartment;
  });

  // Selection handlers
  const toggleEmployeeSelection = (employeeId) => {
    const newSelection = new Set(selectedEmployees);
    if (newSelection.has(employeeId)) {
      newSelection.delete(employeeId);
    } else {
      newSelection.add(employeeId);
    }
    setSelectedEmployees(newSelection);
  };

  const selectAllEmployees = () => {
    const allIds = new Set(filteredEmployees.map(emp => emp.id));
    setSelectedEmployees(allIds);
  };

  const clearSelection = () => {
    setSelectedEmployees(new Set());
  };

  // Payroll run handler
  const runPayroll = async () => {
    if (selectedEmployees.size === 0) {
      return;
    }

    setIsProcessing(true);
    setPayrollResult(null);

    try {
      const payrollData = {
        employeeIds: Array.from(selectedEmployees),
        payrollDate: new Date().toISOString().split('T')[0],
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear()
      };

      // Replace with actual API call
      const response = await mockPayrollAPI(payrollData);
      
      setPayrollResult({
        success: true,
        message: `Payroll processed successfully for ${selectedEmployees.size} employees`,
        data: response
      });
      
      // Clear selection after successful processing
      setSelectedEmployees(new Set());
      
    } catch (error) {
      setPayrollResult({
        success: false,
        message: 'Payroll processing failed',
        error: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Mock API function
  const mockPayrollAPI = (payrollData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const selectedEmployeesData = employees.filter(emp => 
          payrollData.employeeIds.includes(emp.id)
        );
        const totalAmount = selectedEmployeesData.reduce((sum, emp) => sum + emp.baseSalary, 0);
        
        resolve({
          totalProcessed: payrollData.employeeIds.length,
          totalAmount: totalAmount,
          timestamp: new Date().toISOString(),
          payrollPeriod: `${payrollData.month} ${payrollData.year}`
        });
      }, 2000);
    });
  };

  // Calculate total selected salary
  const totalSelectedSalary = employees
    .filter(emp => selectedEmployees.has(emp.id))
    .reduce((sum, emp) => sum + emp.baseSalary, 0);

  const getEmploymentTypeChip = (type) => {
    const chipProps = {
      'full-time': { label: 'Full Time', color: 'success' },
      'freelancer': { label: 'Freelancer', color: 'warning' },
    }[type] || { label: type, color: 'default' };

    return <Chip {...chipProps} size="small" variant="outlined" />;
  };

  // Check if payroll button should be enabled
  const isPayrollButtonEnabled = selectedEmployees.size > 0 && !isProcessing;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Dashboard
        </Link>
        <Link to="/accounts" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <AccountsIcon sx={{ mr: 0.5 }} fontSize="small" />
          Accounts
        </Link>
        <Typography color="text.primary">Payroll</Typography>
      </Breadcrumbs>

      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Payroll Processing System
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Calculate and process salaries for selected employees
        </Typography>
      </Box>

      {/* Filters Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  placeholder="Search employees..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  InputProps={{
                    startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                  }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Department"
                  value={filters.department}
                  onChange={(e) => setFilters({...filters, department: e.target.value})}
                  InputProps={{
                    startAdornment: <FilterIcon color="action" sx={{ mr: 1 }} />,
                  }}
                  size="small"
                >
                  <MenuItem value="">All Departments</MenuItem>
                  <MenuItem value="Engineering">Engineering</MenuItem>
                  <MenuItem value="Marketing">Marketing</MenuItem>
                  <MenuItem value="HR">HR</MenuItem>
                  <MenuItem value="Finance">Finance</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: { md: 'flex-end' } }}>
              <Tooltip title="Select all employees">
                <Button
                  startIcon={<SelectAllIcon />}
                  onClick={selectAllEmployees}
                  variant="outlined"
                  size="small"
                >
                  Select All
                </Button>
              </Tooltip>
              <Tooltip title="Clear selection">
                <Button
                  startIcon={<ClearIcon />}
                  onClick={clearSelection}
                  variant="outlined"
                  size="small"
                >
                  Clear
                </Button>
              </Tooltip>
              <Typography variant="body2" color="text.secondary">
                {selectedEmployees.size} employees selected
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Employees Table */}
      <Paper sx={{ mb: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedEmployees.size > 0 && selectedEmployees.size < filteredEmployees.length}
                    checked={filteredEmployees.length > 0 && selectedEmployees.size === filteredEmployees.length}
                    onChange={selectAllEmployees}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Employee Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Employment Type</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Base Salary</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow
                  key={employee.id}
                  hover
                  selected={selectedEmployees.has(employee.id)}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleEmployeeSelection(employee.id)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedEmployees.has(employee.id)}
                      onChange={() => toggleEmployeeSelection(employee.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {employee.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {employee.department}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getEmploymentTypeChip(employee.employmentType)}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight="medium">
                      ${employee.baseSalary.toLocaleString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEmployees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No employees found matching your criteria
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Action Section */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Total Selected: <Typography component="span" color="primary.main" fontWeight="bold">
                  {selectedEmployees.size} employees
                </Typography>
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Amount: <Typography component="span" color="success.main" fontWeight="bold">
                  ${totalSelectedSalary.toLocaleString()}
                </Typography>
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: { md: 'flex-end' } }}>
              <Button
                startIcon={isProcessing ? <CircularProgress size={20} /> : <RefreshIcon />}
                onClick={runPayroll}
                disabled={!isPayrollButtonEnabled}
                variant="contained"
                size="large"
                color="success"
                sx={{ minWidth: 200 }}
              >
                {isProcessing ? 'Processing...' : `Run Payroll (${selectedEmployees.size})`}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Section */}
      {payrollResult && (
        <Alert
          severity={payrollResult.success ? 'success' : 'error'}
          sx={{ mt: 3 }}
          icon={payrollResult.success ? <CheckCircleIcon /> : <ErrorIcon />}
        >
          <Typography variant="h6" gutterBottom>
            {payrollResult.success ? 'Payroll Processing Successful' : 'Payroll Processing Failed'}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {payrollResult.message}
          </Typography>
          {payrollResult.data && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2">
                    <strong>Total Processed:</strong> {payrollResult.data.totalProcessed} employees
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2">
                    <strong>Total Amount:</strong> ${payrollResult.data.totalAmount.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2">
                    <strong>Payroll Period:</strong> {payrollResult.data.payrollPeriod}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
          {payrollResult.error && (
            <Box sx={{ mt: 1, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Error:</strong> {payrollResult.error}
              </Typography>
            </Box>
          )}
        </Alert>
      )}
    </Box>
  );
};

export default PayrollSystem;