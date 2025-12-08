import React from 'react';
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
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterAlt as FilterIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

const PayrollAnalytics = () => {
  const payrollData = [
    { department: 'Engineering', payroll: '$450,000', variance: '+2.3%', headcount: 45 },
    { department: 'Sales', payroll: '$320,000', variance: '+5.1%', headcount: 32 },
    { department: 'Marketing', payroll: '$180,000', variance: '-1.2%', headcount: 18 },
    { department: 'HR', payroll: '$120,000', variance: '+0.8%', headcount: 12 },
    { department: 'Finance', payroll: '$150,000', variance: '+3.2%', headcount: 15 },
  ];

  const metrics = [
    { label: 'Total Monthly Payroll', value: '$1,220,000', trend: 'up', change: '+2.1%' },
    { label: 'Avg Salary', value: '$85,200', trend: 'up', change: '+1.8%' },
    { label: 'Overtime Cost', value: '$23,500', trend: 'down', change: '-5.2%' },
    { label: 'Tax Compliance', value: '100%', trend: 'stable', change: '0%' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Payroll Analytics</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<FilterIcon />}>
            Filter
          </Button>
          <Button variant="outlined" startIcon={<RefreshIcon />}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Export
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  {metric.label}
                </Typography>
                <Typography variant="h5" component="div">
                  {metric.value}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5 }} />
                  <Typography variant="body2" sx={{ color: 'success.main' }}>
                    {metric.change} from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel>Period</InputLabel>
          <Select label="Period" defaultValue="current">
            <MenuItem value="current">Current Month</MenuItem>
            <MenuItem value="last">Last Month</MenuItem>
            <MenuItem value="quarter">This Quarter</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
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
                    {payrollData.map((row, index) => (
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
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          
        </Grid>
      </Grid>
    </Box>
  );
};

export default PayrollAnalytics;