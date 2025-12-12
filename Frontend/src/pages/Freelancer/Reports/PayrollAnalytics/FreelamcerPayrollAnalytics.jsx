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
  TextField,
  Menu,
  TablePagination,
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

  // ⭐ Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Dummy Payroll Data
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

  // Apply Filters
  useEffect(() => {
    let result = payrollData;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(emp => emp.name.toLowerCase().includes(term));
    }

    if (departmentFilter !== 'all') {
      result = result.filter(emp => emp.department.toLowerCase() === departmentFilter);
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      result = result.filter(emp => {
        const pay = new Date(emp.payDate);
        return pay >= start && pay < end;
      });
    }

    setFilteredData(result);
  }, [searchTerm, departmentFilter, startDate, endDate, payrollData]);

  const handleExport = (format) => {
    alert(`Exporting Payroll Report as ${format}...`);
    setAnchorEl(null);
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="medium">Payroll Analytics</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => window.location.reload()}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={(e) => setAnchorEl(e.currentTarget)}>
            Export
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => handleExport('PDF')}>PDF</MenuItem>
            <MenuItem onClick={() => handleExport('Excel')}>Excel (.xlsx)</MenuItem>
            <MenuItem onClick={() => handleExport('CSV')}>CSV</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
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
          <Select value={departmentFilter} label="Department" onChange={(e) => setDepartmentFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="engineering">Engineering</MenuItem>
            <MenuItem value="marketing">Marketing</MenuItem>
            <MenuItem value="sales">Sales</MenuItem>
            <MenuItem value="hr">HR</MenuItem>
            <MenuItem value="finance">Finance</MenuItem>
          </Select>
        </FormControl>

        <TextField label="Start Date" type="date" size="small" InputLabelProps={{ shrink: true }}
          value={startDate} onChange={(e) => setStartDate(e.target.value)} />

        <TextField label="End Date" type="date" size="small" InputLabelProps={{ shrink: true }}
          value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </Box>

      {/* Table */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" fontWeight="medium" gutterBottom>
            Employee Payroll Details
          </Typography>

          <TableContainer component={Paper} sx={{ maxHeight: 550 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Employee Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell align="right">Base Salary</TableCell>
                  <TableCell align="right">Bonus</TableCell>
                  <TableCell align="right">Total Pay</TableCell>
                  <TableCell align="right">Pay Date</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((emp) => (
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
                    <TableCell colSpan={6} align="center">
                      No payroll records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* ⭐ PAGINATION */}
            <TablePagination
              component="div"
              count={filteredData.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FreelamcerPayrollAnalytics;
