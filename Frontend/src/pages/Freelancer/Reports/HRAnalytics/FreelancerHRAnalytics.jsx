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
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

const FreelancerHRAnalytics = () => {
  const employeeData = [
    { name: 'John Smith', department: 'Engineering', performance: 4.5, turnoverRisk: 'Low', tenure: '3.2 years' },
    { name: 'Sarah Johnson', department: 'Marketing', performance: 3.8, turnoverRisk: 'Medium', tenure: '1.5 years' },
    { name: 'Mike Chen', department: 'Sales', performance: 4.2, turnoverRisk: 'Low', tenure: '4.1 years' },
    { name: 'Emily Davis', department: 'HR', performance: 4.7, turnoverRisk: 'Low', tenure: '2.8 years' },
    { name: 'David Wilson', department: 'Engineering', performance: 3.5, turnoverRisk: 'High', tenure: '0.8 years' },
  ];

  const metrics = [
    { label: 'Employee Turnover', value: '12.5%', trend: 'down', change: '-2.3%' },
    { label: 'Avg Time to Hire', value: '32 days', trend: 'stable', change: '+1 day' },
    { label: 'Training Completion', value: '87%', trend: 'up', change: '+5%' },
    { label: 'Employee Satisfaction', value: '4.2/5', trend: 'up', change: '+0.3' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">HR Analytics</Typography>
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
                  {metric.trend === 'up' ? (
                    <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5 }} />
                  ) : metric.trend === 'down' ? (
                    <TrendingDownIcon sx={{ color: 'error.main', mr: 0.5 }} />
                  ) : null}
                  <Typography
                    variant="body2"
                    sx={{
                      color: metric.trend === 'up' ? 'success.main' : metric.trend === 'down' ? 'error.main' : 'text.secondary',
                    }}
                  >
                    {metric.change} from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Department</InputLabel>
            <Select label="Department" defaultValue="all">
              <MenuItem value="all">All Departments</MenuItem>
              <MenuItem value="engineering">Engineering</MenuItem>
              <MenuItem value="marketing">Marketing</MenuItem>
              <MenuItem value="sales">Sales</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Risk Level</InputLabel>
            <Select label="Risk Level" defaultValue="all">
              <MenuItem value="all">All Levels</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Employee Performance & Turnover Risk
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Performance Rating</TableCell>
                  <TableCell>Turnover Risk</TableCell>
                  <TableCell>Tenure</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employeeData.map((employee, index) => (
                  <TableRow key={index}>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.performance}/5</TableCell>
                    <TableCell>
                      <Chip
                        label={employee.turnoverRisk}
                        color={
                          employee.turnoverRisk === 'Low'
                            ? 'success'
                            : employee.turnoverRisk === 'Medium'
                            ? 'warning'
                            : 'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{employee.tenure}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FreelancerHRAnalytics;