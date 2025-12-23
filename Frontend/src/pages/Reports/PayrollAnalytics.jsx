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
  Alert,
  CircularProgress,
} from "@mui/material";

import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterAlt as FilterIcon,
} from "@mui/icons-material";

import {
  getMonthlyPayrollSummaryApi,
  getPayrollTrendApi,
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

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const formatMonthYear = (month, year) => {
  const name = monthNames[parseInt(month, 10) - 1] || `Month ${month}`;
  return `${name} ${year}`;
};

const PayrollAnalytics = () => {
  const [period, setPeriod] = useState("current");
  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("December");

  const [currentMetrics, setCurrentMetrics] = useState(null);
  const [hasCurrentPayroll, setHasCurrentPayroll] = useState(true);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(false);

  const getTrendLimit = () => {
    if (period === "quarter") return 3;
    if (period === "year") return 12;
    return 6;
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // ✅ Only load current month payroll if period is "current"
      if (period === "current") {
        const monthNumber = monthMap[month];
        if (!monthNumber) {
          throw new Error("Invalid month");
        }

        let currentData = null;
        let payrollExists = true;

        try {
          const summaryRes = await getMonthlyPayrollSummaryApi(monthNumber, year);
          currentData = summaryRes.data;
        } catch (summaryErr) {
          if (summaryErr.response?.status === 404) {
            payrollExists = false;
            currentData = null;
          } else {
            throw summaryErr;
          }
        }

        setCurrentMetrics(currentData);
        setHasCurrentPayroll(payrollExists);
      } else {
        // ✅ In trend mode: reset current metrics
        setCurrentMetrics(null);
        setHasCurrentPayroll(true); // not used, but clean
      }

      // ✅ Always load trend data
      const limit = getTrendLimit();
      const trendRes = await getPayrollTrendApi(limit);
      setTrendData(trendRes.data.trend || []);

      setLoading(false);
    } catch (err) {
      console.error("LOAD ERROR:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [month, year, period]);

  const handlePeriodChange = (value) => {
    setPeriod(value);
  };

  const avgSalary = currentMetrics?.totalEmployees > 0
    ? Math.round(currentMetrics.totalNet / currentMetrics.totalEmployees)
    : 0;

  return (
    <Box>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Payroll Analytics</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" startIcon={<FilterIcon />}>
            Filter
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
          >
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
          {/* === METRICS SECTION: ONLY FOR "current" period === */}
          {period === "current" && (
            <>
              {!hasCurrentPayroll ? (
                <Alert severity="info" sx={{ mb: 4 }}>
                  Payroll has not been generated yet for <strong>{month} {year}</strong>. 
                  It will be available after the month ends and payroll processing is complete.
                </Alert>
              ) : currentMetrics ? (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="text.secondary">Total Gross</Typography>
                        <Typography variant="h5">${currentMetrics.totalGross.toLocaleString()}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="text.secondary">Total Net</Typography>
                        <Typography variant="h5">${currentMetrics.totalNet.toLocaleString()}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="text.secondary">Avg Salary</Typography>
                        <Typography variant="h5">${avgSalary.toLocaleString()}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="text.secondary">Employees</Typography>
                        <Typography variant="h5">{currentMetrics.totalEmployees}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="error" sx={{ mb: 4 }}>
                  Failed to load payroll data for {month} {year}.
                </Alert>
              )}
            </>
          )}

          {/* FILTERS */}
          <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Period</InputLabel>
              <Select value={period} onChange={(e) => handlePeriodChange(e.target.value)}>
                <MenuItem value="current">Current Month</MenuItem>
                <MenuItem value="quarter">Last 3 Months</MenuItem>
                <MenuItem value="year">Last 12 Months</MenuItem>
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
              <Select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                // Optional: disable month selection in trend mode
                // disabled={period !== "current"}
              >
                {Object.keys(monthMap).map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* TREND TABLE — always shown */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payroll Trend ({trendData.length} Months)
              </Typography>

              {trendData.length === 0 ? (
                <Typography color="text.secondary">
                  No completed payroll records found.
                </Typography>
              ) : (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>Period</TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold" }}>Employees</TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold" }}>Gross Payroll</TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold" }}>Net Payroll</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {trendData.map((row, index) => (
                        <TableRow key={index} sx={{ '& td': { py: 1.5 } }}>
                          <TableCell>{formatMonthYear(row.month, row.year)}</TableCell>
                          <TableCell align="right">{row.total_employees}</TableCell>
                          <TableCell align="right">
                            ${Number(row.total_gross).toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            ${Number(row.total_net).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default PayrollAnalytics;