// import React from 'react';
// import {
//   Box,
//   Typography,
//   Grid,
//   Card,
//   CardContent,
//   Button,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Chip,
// } from '@mui/material';
// import {
//   Refresh as RefreshIcon,
//   Download as DownloadIcon,
//   FilterAlt as FilterIcon,
//   TrendingUp as TrendingUpIcon,
// } from '@mui/icons-material';

// const PayrollAnalytics = () => {
//   const payrollData = [
//     { department: 'Engineering', payroll: '$450,000', variance: '+2.3%', headcount: 45 },
//     { department: 'Sales', payroll: '$320,000', variance: '+5.1%', headcount: 32 },
//     { department: 'Marketing', payroll: '$180,000', variance: '-1.2%', headcount: 18 },
//     { department: 'HR', payroll: '$120,000', variance: '+0.8%', headcount: 12 },
//     { department: 'Finance', payroll: '$150,000', variance: '+3.2%', headcount: 15 },
//   ];

//   const metrics = [
//     { label: 'Total Monthly Payroll', value: '$1,220,000', trend: 'up', change: '+2.1%' },
//     { label: 'Avg Salary', value: '$85,200', trend: 'up', change: '+1.8%' },
//     { label: 'Overtime Cost', value: '$23,500', trend: 'down', change: '-5.2%' },
//     { label: 'Tax Compliance', value: '100%', trend: 'stable', change: '0%' },
//   ];

//  return (
//   <Box>
//     {/* HEADER */}
//     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//       <Typography variant="h4">Payroll Analytics</Typography>
//       <Box sx={{ display: 'flex', gap: 1 }}>
//         <Button variant="outlined" startIcon={<FilterIcon />}>Filter</Button>
//         <Button variant="outlined" startIcon={<RefreshIcon />}>Refresh</Button>
//         <Button variant="contained" startIcon={<DownloadIcon />}>Export</Button>
//       </Box>
//     </Box>

//     {/* METRICS */}
//     <Grid container spacing={3} sx={{ mb: 3 }}>
//       {metrics.map((metric, index) => (
//         <Grid item xs={12} sm={6} md={3} key={index}>
//           <Card>
//             <CardContent>
//               <Typography color="text.secondary" gutterBottom>{metric.label}</Typography>
//               <Typography variant="h5">{metric.value}</Typography>
//               <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
//                 <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5 }} />
//                 <Typography variant="body2" sx={{ color: 'success.main' }}>
//                   {metric.change} from last month
//                 </Typography>
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>
//       ))}
//     </Grid>

//     {/* PERIOD FILTER */}
//     <Box sx={{ mb: 3 }}>
//       <FormControl sx={{ minWidth: 120 }} size="small">
//         <InputLabel>Period</InputLabel>
//         <Select label="Period" defaultValue="current">
//           <MenuItem value="current">Current Month</MenuItem>
//           <MenuItem value="last">Last Month</MenuItem>
//           <MenuItem value="quarter">This Quarter</MenuItem>
//           <MenuItem value="year">This Year</MenuItem>
//         </Select>
//       </FormControl>
//     </Box>

//     {/* FULL WIDTH PAYROLL BY DEPARTMENT FIXED */}
//     <Grid container spacing={3}>
//       <Grid item xs={12} md={12}>   {/* 🔥 FULL WIDTH HERE MACHAN */}
//         <Card sx={{ width: "100%" }}>
//           <CardContent>
//             <Typography variant="h6" gutterBottom>
//               Payroll by Department
//             </Typography>

//             <TableContainer component={Paper} sx={{ width: "100%" }}>
//               <Table sx={{ width: "100%" }}>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>Department</TableCell>
//                     <TableCell align="right">Payroll</TableCell>
//                     <TableCell align="right">Variance</TableCell>
//                     <TableCell align="right">Headcount</TableCell>
//                   </TableRow>
//                 </TableHead>

//                 <TableBody>
//                   {payrollData.map((row, index) => (
//                     <TableRow key={index}>
//                       <TableCell>{row.department}</TableCell>
//                       <TableCell align="right">{row.payroll}</TableCell>
//                       <TableCell align="right">
//                         <Chip
//                           label={row.variance}
//                           color={row.variance.startsWith('+') ? 'success' : 'error'}
//                           size="small"
//                         />
//                       </TableCell>
//                       <TableCell align="right">{row.headcount}</TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>

//               </Table>
//             </TableContainer>

//           </CardContent>
//         </Card>
//       </Grid>
//     </Grid>
//   </Box>
// );

// };

// export default PayrollAnalytics;

import React, { useState, useEffect } from "react";
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
  CircularProgress,
} from "@mui/material";

import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterAlt as FilterIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";

import {
  getMonthlyPayrollSummaryApi,
  getDepartmentWisePayrollApi,
  getPayrollTrendApi,
  getPayrollTrend3Api,
  getPayrollTrend12Api,
} from "../../api/authApi";

const monthMap = {
  January: "01",
  February: "02",
  March: "03",
  April: "04",
  May: "05",
  June: "06",
  July: "07",
  August: "08",
  September: "09",
  October: "10",
  November: "11",
  December: "12",
};

const toTitle = (str = "") =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const PayrollAnalytics = () => {
  const [period, setPeriod] = useState("current");
  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("January");
  const [department, setDepartment] = useState("All");

  const [metrics, setMetrics] = useState([]);
  const [payrollData, setPayrollData] = useState([]);

  const [trendData, setTrendData] = useState([]);
  const [trend3Months, setTrend3Months] = useState([]);
  const [trend12Months, setTrend12Months] = useState([]);

  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // ✅ FIX — Prevent invalid month when Period changes
  const handlePeriodChange = (value) => {
    setPeriod(value);

    if (value === "current") {
      setMonth("January"); // or dynamically set current month
    }

    if (value === "year") {
      // This avoids sending wrong month values (18, 22, etc.)
      setMonth("January");
    }

    if (value === "last") {
      setMonth("December");
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const monthNumber = Number(monthMap[month]).toString();

      // 1️⃣ Summary
      const summary = await getMonthlyPayrollSummaryApi(monthNumber, year);
      const s = summary.data;

      setMetrics([
        { label: "Total Monthly Payroll", value: `$${s.totalGross}`, change: "+2.1%" },
        {
          label: "Avg Salary",
          value:
            s.totalEmployees > 0
              ? `$${Math.round(s.totalNet / s.totalEmployees)}`
              : "$0",
          change: "+1.8%",
        },
        { label: "Overtime Cost", value: `$${s.totalDeductions}`, change: "-5.2%" },
        { label: "Tax Compliance", value: "100%", change: "0%" },
      ]);

      // 2️⃣ Department Wise Payroll
      const deptRes = await getDepartmentWisePayrollApi(monthNumber, year);
      const deptData = deptRes.data.departmentPayroll || [];

      const formatted = deptData.map((d) => ({
        departmentKey: d.department.trim().toLowerCase(),
        department: toTitle(d.department.trim()),
        payroll: `$${d.total_gross}`,
        variance: "+0%",
        headcount: d.total_employees,
      }));

      setPayrollData(formatted);

      // 3️⃣ Trend – 6 months
      const trendRes = await getPayrollTrendApi(6);
      setTrendData(trendRes.data.trend);

      // 4️⃣ Trend – 3 months
      const t3 = await getPayrollTrend3Api();
      setTrend3Months(t3.data.trend);

      // 5️⃣ Trend – 12 months
      const t12 = await getPayrollTrend12Api();
      setTrend12Months(t12.data.trend);

      setLoading(false);
    } catch (err) {
      console.error("LOAD ERROR:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [month, year]);

  // FIXED FILTER
  const filteredData =
    department === "All"
      ? payrollData
      : payrollData.filter(
          (d) => d.departmentKey === department.trim().toLowerCase()
        );

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Payroll Analytics</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" startIcon={<FilterIcon />}>
            Filter
          </Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Export
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* METRIC CARDS */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {metrics.map((metric, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary">{metric.label}</Typography>
                    <Typography variant="h5">{metric.value}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <TrendingUpIcon sx={{ color: "success.main", mr: 0.5 }} />
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
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            {/* FIXED PERIOD SELECT */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Period</InputLabel>
              <Select value={period} onChange={(e) => handlePeriodChange(e.target.value)}>
                <MenuItem value="current">Current Month</MenuItem>
                <MenuItem value="last">Last Month</MenuItem>
                <MenuItem value="quarter">This Quarter</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Year</InputLabel>
              <Select value={year} onChange={(e) => setYear(e.target.value)}>
                <MenuItem value="2025">2025</MenuItem>
                <MenuItem value="2024">2024</MenuItem>
                <MenuItem value="2023">2023</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Month</InputLabel>
              <Select value={month} onChange={(e) => setMonth(e.target.value)}>
                {Object.keys(monthMap).map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* FIXED DEPARTMENT DROPDOWN */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Department</InputLabel>
              <Select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>

                {payrollData.map((d) => (
                  <MenuItem key={d.departmentKey} value={d.departmentKey}>
                    {d.department}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* TABLE */}
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
                    {paginatedData.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{row.department}</TableCell>
                        <TableCell align="right">{row.payroll}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={row.variance}
                            color={row.variance.startsWith("+") ? "success" : "error"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">{row.headcount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

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
        </>
      )}
    </Box>
  );
};

export default PayrollAnalytics;




