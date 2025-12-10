// src/components/reports/PayrollAnalytics.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Menu,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

const getToday = () => new Date().toISOString().split('T')[0];

const FreelamcerPayrollAnalytics = () => {
  const [payrollData, setPayrollData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState(getToday());
  const [anchorEl, setAnchorEl] = useState(null);

  // 🔹 Realistic dummy data: employee-level payroll with dates
  useEffect(() => {
    const dummyPayroll = [
      { id: 1, name: 'Alex Johnson', department: 'Engineering', salary: 95000, bonus: 8000, total: 103000, payDate: '2025-11-30' },
      { id: 2, name: 'Maria Garcia', department: 'Marketing', salary: 78000, bonus: 5000, total: 83000, payDate: '2025-11-30' },
      { id: 3, name: 'Raj Patel', department: 'Engineering', salary: 92000, bonus: 0, total: 92000, payDate: '2025-12-15' },
      { id: 4, name: 'Linda Chen', department: 'Sales', salary: 85000, bonus: 12000, total: 97000, payDate: '2025-11-30' },
      { id: 5, name: 'James Wilson', department: 'HR', salary: 72000, bonus: 3000, total: 75000, payDate: '2025-11-30' },
      { id: 6, name: 'Sophie Müller', department: 'Engineering', salary: 98000, bonus: 10000, total: 108000, payDate: '2025-11-30' },
      { id: 7, name: 'Carlos Rodriguez', department: 'Sales', salary: 80000, bonus: 9000, total: 89000, payDate: '2025-11-30' },
      { id: 8, name: 'Aisha Khan', department: 'Finance', salary: 90000, bonus: 7000, total: 97000, payDate: '2025-12-15' },
    ];
    setPayrollData(dummyPayroll);
    setFilteredData(dummyPayroll);
  }, []);

  useEffect(() => {
    let result = payrollData;

    // Search by employee name
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(emp => emp.name.toLowerCase().includes(term));
    }

    // Department filter
    if (departmentFilter !== 'all') {
      result = result.filter(emp => emp.department.toLowerCase() === departmentFilter);
    }

    // Date range filter (by payDate)
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1); // include end date

      result = result.filter(emp => {
        const pay = new Date(emp.payDate);
        return pay >= start && pay < end;
      });
    }

    setFilteredData(result);
  }, [searchTerm, departmentFilter, startDate, endDate, payrollData]);

  const handleExport = (format) => {
    console.log(`[AUDIT] Payroll report exported in ${format}`);
    alert(`Exporting Payroll Analytics report as ${format}...`);
    setAnchorEl(null);
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="medium">
          Payroll Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            Export
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => handleExport('PDF')}>PDF</MenuItem>
            <MenuItem onClick={() => handleExport('Excel')}>Excel (.xlsx)</MenuItem>
            <MenuItem onClick={() => handleExport('CSV')}>CSV</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Filters + Search */}
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end' }}>
        <TextField
          size="small"
          placeholder="Search employee..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 0.5 }} /> }}
          sx={{ minWidth: 220 }}
        />

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Department</InputLabel>
          <Select
            value={departmentFilter}
            label="Department"
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <MenuItem value="all">All Departments</MenuItem>
            <MenuItem value="engineering">Engineering</MenuItem>
            <MenuItem value="marketing">Marketing</MenuItem>
            <MenuItem value="sales">Sales</MenuItem>
            <MenuItem value="hr">HR</MenuItem>
            <MenuItem value="finance">Finance</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Start Date"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          sx={{ minWidth: 140 }}
        />

        <TextField
          label="End Date"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          sx={{ minWidth: 140 }}
        />
      </Box>

      {/* Payroll Table */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" fontWeight="medium" gutterBottom>
            Employee Payroll Details
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {filteredData.length} record(s) found
          </Typography>

          <TableContainer component={Paper} sx={{ maxHeight: 550, overflow: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Employee Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Base Salary</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Bonus</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Total Pay</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Pay Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((emp) => (
                    <TableRow key={emp.id} hover>
                      <TableCell>{emp.name}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell align="right">${emp.salary.toLocaleString()}</TableCell>
                      <TableCell align="right">${emp.bonus.toLocaleString()}</TableCell>
                      <TableCell align="right">${emp.total.toLocaleString()}</TableCell>
                      <TableCell align="right">{emp.payDate}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">
                        No payroll records match the selected filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FreelamcerPayrollAnalytics;