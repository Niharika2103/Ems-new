import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
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
  TablePagination,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterAlt as FilterIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

const FreelancerPayrollAnalytics = () => {
  const [period, setPeriod] = useState('current');
  const [year, setYear] = useState('2025');
  const [month, setMonth] = useState('January');
  const [department, setDepartment] = useState('All');

  // pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const payrollData = [
    { department: 'Engineering', payroll: '$450,000', variance: '+2.3%', headcount: 45 },
    { department: 'Sales', payroll: '$320,000', variance: '+5.1%', headcount: 32 },
    { department: 'Marketing', payroll: '$180,000', variance: '-1.2%', headcount: 18 },
    { department: 'HR', payroll: '$120,000', variance: '+0.8%', headcount: 12 },
    { department: 'Finance', payroll: '$150,000', variance: '+3.2%', headcount: 15 },
  ];

  const metrics = [
    { label: 'Total Monthly Payroll', value: '$1,220,000', change: '+2.1%' },
    { label: 'Avg Salary', value: '$85,200', change: '+1.8%' },
    { label: 'Overtime Cost', value: '$23,500', change: '-5.2%' },
    { label: 'Tax Compliance', value: '100%', change: '0%' },
  ];

  const filteredData =
    department === 'All'
      ? payrollData
      : payrollData.filter((row) => row.department === department);

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      {/* HEADER */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Payroll Analytics</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<FilterIcon />}>Filter</Button>
          <Button variant="outlined" startIcon={<RefreshIcon />}>Refresh</Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>Export</Button>
        </Box>
      </Box>

      {/* METRICS */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Typography color="text.secondary">{metric.label}</Typography>
                <Typography variant="h5">{metric.value}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5 }} />
                  <Typography variant="body2" color="success.main">
                    {metric.change} from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* FILTERS */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Period</InputLabel>
          <Select value={period} label="Period" onChange={(e) => setPeriod(e.target.value)}>
            <MenuItem value="current">Current Month</MenuItem>
            <MenuItem value="last">Last Month</MenuItem>
            <MenuItem value="quarter">This Quarter</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
          <Select value={year} label="Year" onChange={(e) => setYear(e.target.value)}>
            <MenuItem value="2025">2025</MenuItem>
            <MenuItem value="2024">2024</MenuItem>
            <MenuItem value="2023">2023</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Month</InputLabel>
          <Select value={month} label="Month" onChange={(e) => setMonth(e.target.value)}>
            {[
              'January','February','March','April','May','June',
              'July','August','September','October','November','December'
            ].map((m) => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Department</InputLabel>
          <Select value={department} label="Department" onChange={(e) => setDepartment(e.target.value)}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Engineering">Engineering</MenuItem>
            <MenuItem value="Sales">Sales</MenuItem>
            <MenuItem value="Marketing">Marketing</MenuItem>
            <MenuItem value="HR">HR</MenuItem>
            <MenuItem value="Finance">Finance</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* PAYROLL TABLE */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Payroll by Department
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Department</TableCell>
                  <TableCell align="right">Payroll</TableCell>
                  <TableCell align="right">Variance</TableCell>
                  <TableCell align="right">Headcount</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.department}</TableCell>
                    <TableCell align="right">{row.payroll}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={row.variance}
                        color={row.variance.startsWith('+') ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">{row.headcount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* PAGINATION */}
          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 20]}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default FreelancerPayrollAnalytics;
