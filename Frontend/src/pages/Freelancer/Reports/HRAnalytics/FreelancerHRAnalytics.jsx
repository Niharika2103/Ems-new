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
  TextField,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

const FreelancerHRAnalytics = () => {
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const employeeData = [
    { name: 'John Smith', department: 'Engineering', performance: 4.5, turnoverRisk: 'Low', tenure: '3.2 years' },
    { name: 'Sarah Johnson', department: 'Marketing', performance: 3.8, turnoverRisk: 'Medium', tenure: '1.5 years' },
    { name: 'Mike Chen', department: 'Sales', performance: 4.2, turnoverRisk: 'Low', tenure: '4.1 years' },
    { name: 'Emily Davis', department: 'HR', performance: 4.7, turnoverRisk: 'Low', tenure: '2.8 years' },
    { name: 'David Wilson', department: 'Engineering', performance: 3.5, turnoverRisk: 'High', tenure: '0.8 years' },
  ];

  // 🔍 Filter the table
  const filteredData = employeeData.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.turnoverRisk.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      departmentFilter === "all" || emp.department.toLowerCase() === departmentFilter;

    const matchesRisk =
      riskFilter === "all" || emp.turnoverRisk.toLowerCase() === riskFilter;

    return matchesSearch && matchesDepartment && matchesRisk;
  });

  return (
    <Box>

      {/* Title + Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">HR Analytics</Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Export
          </Button>
        </Box>
      </Box>

      {/* 🔍 Smaller Search Bar */}
      <Box sx={{ mb: 3, width: '300px' }}> 
        <TextField
          fullWidth
          size="small"
          label="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
        />
      </Box>

      {/* Dropdown Filters */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Department</InputLabel>
            <Select
              label="Department"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <MenuItem value="all">All Departments</MenuItem>
              <MenuItem value="engineering">Engineering</MenuItem>
              <MenuItem value="marketing">Marketing</MenuItem>
              <MenuItem value="sales">Sales</MenuItem>
              <MenuItem value="hr">HR</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Risk Level</InputLabel>
            <Select
              label="Risk Level"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <MenuItem value="all">All Levels</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Table Section */}
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
                {filteredData.length > 0 ? (
                  filteredData.map((employee, index) => (
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No matching records found
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

export default FreelancerHRAnalytics;
