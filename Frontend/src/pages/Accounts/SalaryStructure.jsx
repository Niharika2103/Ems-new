import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Box,
  Divider,
  Stepper,
  Step,
  StepLabel,
  AppBar,
  Toolbar,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  AccountCircle,
  AttachMoney,
  Receipt,
  Calculate,
  Download,
  RestartAlt,
  Fingerprint,
  AccountBalance,
  CorporateFare
} from '@mui/icons-material';

const SalaryStructure = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Employee Personal Information
    employeeName: '',
    employeeId: '',
    designation: '',
    department: '',
    email: '',
    phoneNumber: '',
    dateOfJoining: '',
    
    // Government IDs
    panNumber: '',
    aadharNumber: '',
    uanNumber: '',
    pfNumber: '',
    esicNumber: '',
    
    // Bank Details
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    bankBranch: '',
    
    // Company Information
    companyName: '',
    companyAddress: '',
    companyPAN: '',
    companyTAN: '',
    
    // Salary Structure - Earnings
    basicSalary: '',
    houseRentAllowance: '',
    medicalAllowance: '',
    conveyanceAllowance: '',
    specialAllowance: '',
    bonus: '',
    overtime: '',
    incentives: '',
    shiftAllowance: '',
    projectAllowance: '',
    
    // Salary Structure - Deductions
    providentFund: '',
    professionalTax: '',
    incomeTax: '',
    otherDeductions: '',
    loanRecovery: '',
    insurancePremium: '',
    
    // Pay Period
    payPeriod: '',
    payDate: '',
    workingDays: '',
    
    // Leave Information
    paidLeaves: '',
    unpaidLeaves: '',
    sickLeaves: '',
    casualLeaves: '',
    
    // Additional MNC Fields
    costCenter: '',
    projectCode: '',
    location: '',
    employmentType: 'Permanent'
  });

  const steps = ['Employee Details', 'Government IDs & Bank', 'Salary Structure', 'Deductions', 'Review & Generate'];

  const employmentTypes = ['Permanent', 'Contract', 'Intern', 'Trainee', 'Consultant'];
  const locations = ['Bangalore', 'Hyderabad', 'Pune', 'Gurgaon', 'Mumbai', 'Chennai', 'Remote'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate totals
  const calculateTotals = () => {
    // Earnings
    const basic = parseFloat(formData.basicSalary) || 0;
    const hra = parseFloat(formData.houseRentAllowance) || 0;
    const medical = parseFloat(formData.medicalAllowance) || 0;
    const conveyance = parseFloat(formData.conveyanceAllowance) || 0;
    const special = parseFloat(formData.specialAllowance) || 0;
    const bonus = parseFloat(formData.bonus) || 0;
    const overtime = parseFloat(formData.overtime) || 0;
    const incentives = parseFloat(formData.incentives) || 0;
    const shiftAllowance = parseFloat(formData.shiftAllowance) || 0;
    const projectAllowance = parseFloat(formData.projectAllowance) || 0;

    // Deductions
    const pf = parseFloat(formData.providentFund) || 0;
    const pt = parseFloat(formData.professionalTax) || 0;
    const tax = parseFloat(formData.incomeTax) || 0;
    const other = parseFloat(formData.otherDeductions) || 0;
    const loan = parseFloat(formData.loanRecovery) || 0;
    const insurance = parseFloat(formData.insurancePremium) || 0;

    const grossSalary = basic + hra + medical + conveyance + special + bonus + overtime + incentives + shiftAllowance + projectAllowance;
    const totalDeductions = pf + pt + tax + other + loan + insurance;
    const netSalary = grossSalary - totalDeductions;

    return {
      grossSalary,
      totalDeductions,
      netSalary,
      totalEarnings: grossSalary,
      totalAllowances: hra + medical + conveyance + special + shiftAllowance + projectAllowance,
      totalBonusIncentives: bonus + overtime + incentives
    };
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Salary Structure Data:', formData);
    alert('Salary Structure saved successfully!');
  };

  const handleReset = () => {
    setFormData({
      employeeName: '',
      employeeId: '',
      designation: '',
      department: '',
      email: '',
      phoneNumber: '',
      dateOfJoining: '',
      panNumber: '',
      aadharNumber: '',
      uanNumber: '',
      pfNumber: '',
      esicNumber: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      bankBranch: '',
      companyName: '',
      companyAddress: '',
      companyPAN: '',
      companyTAN: '',
      basicSalary: '',
      houseRentAllowance: '',
      medicalAllowance: '',
      conveyanceAllowance: '',
      specialAllowance: '',
      bonus: '',
      overtime: '',
      incentives: '',
      shiftAllowance: '',
      projectAllowance: '',
      providentFund: '',
      professionalTax: '',
      incomeTax: '',
      otherDeductions: '',
      loanRecovery: '',
      insurancePremium: '',
      payPeriod: '',
      payDate: '',
      workingDays: '',
      paidLeaves: '',
      unpaidLeaves: '',
      sickLeaves: '',
      casualLeaves: '',
      costCenter: '',
      projectCode: '',
      location: '',
      employmentType: 'Permanent'
    });
    setActiveStep(0);
  };

  const totals = calculateTotals();

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountCircle /> Employee Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Employee Name"
                  name="employeeName"
                  value={formData.employeeName}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Employee ID"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Date of Joining"
                  name="dateOfJoining"
                  type="date"
                  value={formData.dateOfJoining}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Employment Type</InputLabel>
                  <Select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleChange}
                    label="Employment Type"
                  >
                    {employmentTypes.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Location</InputLabel>
                  <Select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    label="Location"
                  >
                    {locations.map(loc => (
                      <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Fingerprint /> Government IDs & Bank Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="PAN Number"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleChange}
                  variant="outlined"
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Aadhar Number"
                  name="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={handleChange}
                  variant="outlined"
                  inputProps={{ maxLength: 12 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="UAN Number"
                  name="uanNumber"
                  value={formData.uanNumber}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="PF Number"
                  name="pfNumber"
                  value={formData.pfNumber}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ESIC Number"
                  name="esicNumber"
                  value={formData.esicNumber}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBalance /> Bank Account Details
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bank Name"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Account Number"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="IFSC Code"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bank Branch"
                  name="bankBranch"
                  value={formData.bankBranch}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoney /> Earnings & Allowances
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Basic Salary"
                  name="basicSalary"
                  type="number"
                  value={formData.basicSalary}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="House Rent Allowance (HRA)"
                  name="houseRentAllowance"
                  type="number"
                  value={formData.houseRentAllowance}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Medical Allowance"
                  name="medicalAllowance"
                  type="number"
                  value={formData.medicalAllowance}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Conveyance Allowance"
                  name="conveyanceAllowance"
                  type="number"
                  value={formData.conveyanceAllowance}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Special Allowance"
                  name="specialAllowance"
                  type="number"
                  value={formData.specialAllowance}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bonus"
                  name="bonus"
                  type="number"
                  value={formData.bonus}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Overtime"
                  name="overtime"
                  type="number"
                  value={formData.overtime}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Incentives"
                  name="incentives"
                  type="number"
                  value={formData.incentives}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Shift Allowance"
                  name="shiftAllowance"
                  type="number"
                  value={formData.shiftAllowance}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Project Allowance"
                  name="projectAllowance"
                  type="number"
                  value={formData.projectAllowance}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Receipt /> Deductions & Company Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Provident Fund (PF)"
                  name="providentFund"
                  type="number"
                  value={formData.providentFund}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Professional Tax"
                  name="professionalTax"
                  type="number"
                  value={formData.professionalTax}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Income Tax (TDS)"
                  name="incomeTax"
                  type="number"
                  value={formData.incomeTax}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Other Deductions"
                  name="otherDeductions"
                  type="number"
                  value={formData.otherDeductions}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Loan Recovery"
                  name="loanRecovery"
                  type="number"
                  value={formData.loanRecovery}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Insurance Premium"
                  name="insurancePremium"
                  type="number"
                  value={formData.insurancePremium}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CorporateFare /> Company Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company PAN"
                  name="companyPAN"
                  value={formData.companyPAN}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company TAN"
                  name="companyTAN"
                  value={formData.companyTAN}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cost Center"
                  name="costCenter"
                  value={formData.costCenter}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Project Code"
                  name="projectCode"
                  value={formData.projectCode}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Address"
                  name="companyAddress"
                  value={formData.companyAddress}
                  onChange={handleChange}
                  variant="outlined"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 4:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Calculate /> Review & Generate Salary Structure
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Review all information before saving the salary structure. This will create an official record.
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountCircle /> Employee Details
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow><TableCell><strong>Name</strong></TableCell><TableCell>{formData.employeeName}</TableCell></TableRow>
                          <TableRow><TableCell><strong>Employee ID</strong></TableCell><TableCell>{formData.employeeId}</TableCell></TableRow>
                          <TableRow><TableCell><strong>Designation</strong></TableCell><TableCell>{formData.designation}</TableCell></TableRow>
                          <TableRow><TableCell><strong>Department</strong></TableCell><TableCell>{formData.department}</TableCell></TableRow>
                          <TableRow><TableCell><strong>Email</strong></TableCell><TableCell>{formData.email}</TableCell></TableRow>
                          <TableRow><TableCell><strong>Phone</strong></TableCell><TableCell>{formData.phoneNumber}</TableCell></TableRow>
                          <TableRow><TableCell><strong>Location</strong></TableCell><TableCell>{formData.location}</TableCell></TableRow>
                          <TableRow><TableCell><strong>Employment Type</strong></TableCell><TableCell>{formData.employmentType}</TableCell></TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Fingerprint /> Government IDs
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow><TableCell><strong>PAN</strong></TableCell><TableCell>{formData.panNumber}</TableCell></TableRow>
                          <TableRow><TableCell><strong>Aadhar</strong></TableCell><TableCell>{formData.aadharNumber}</TableCell></TableRow>
                          <TableRow><TableCell><strong>UAN</strong></TableCell><TableCell>{formData.uanNumber}</TableCell></TableRow>
                          <TableRow><TableCell><strong>PF Number</strong></TableCell><TableCell>{formData.pfNumber}</TableCell></TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Salary Breakdown</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Earnings</strong></TableCell>
                            <TableCell align="right"><strong>Amount (₹)</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow><TableCell>Basic Salary</TableCell><TableCell align="right">{parseFloat(formData.basicSalary || 0).toFixed(2)}</TableCell></TableRow>
                          <TableRow><TableCell>HRA</TableCell><TableCell align="right">{parseFloat(formData.houseRentAllowance || 0).toFixed(2)}</TableCell></TableRow>
                          <TableRow><TableCell>Medical Allowance</TableCell><TableCell align="right">{parseFloat(formData.medicalAllowance || 0).toFixed(2)}</TableCell></TableRow>
                          <TableRow><TableCell>Conveyance</TableCell><TableCell align="right">{parseFloat(formData.conveyanceAllowance || 0).toFixed(2)}</TableCell></TableRow>
                          <TableRow><TableCell>Special Allowance</TableCell><TableCell align="right">{parseFloat(formData.specialAllowance || 0).toFixed(2)}</TableCell></TableRow>
                          <TableRow><TableCell>Bonus & Incentives</TableCell><TableCell align="right">{totals.totalBonusIncentives.toFixed(2)}</TableCell></TableRow>
                          <TableRow sx={{ bgcolor: 'action.hover' }}><TableCell><strong>Gross Salary</strong></TableCell><TableCell align="right"><strong>{totals.grossSalary.toFixed(2)}</strong></TableCell></TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <TableContainer sx={{ mt: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Deductions</strong></TableCell>
                            <TableCell align="right"><strong>Amount (₹)</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow><TableCell>Provident Fund</TableCell><TableCell align="right">{parseFloat(formData.providentFund || 0).toFixed(2)}</TableCell></TableRow>
                          <TableRow><TableCell>Professional Tax</TableCell><TableCell align="right">{parseFloat(formData.professionalTax || 0).toFixed(2)}</TableCell></TableRow>
                          <TableRow><TableCell>Income Tax</TableCell><TableCell align="right">{parseFloat(formData.incomeTax || 0).toFixed(2)}</TableCell></TableRow>
                          <TableRow><TableCell>Other Deductions</TableCell><TableCell align="right">{parseFloat(formData.otherDeductions || 0).toFixed(2)}</TableCell></TableRow>
                          <TableRow sx={{ bgcolor: 'action.hover' }}><TableCell><strong>Total Deductions</strong></TableCell><TableCell align="right"><strong>{totals.totalDeductions.toFixed(2)}</strong></TableCell></TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: 1 }}>
                      <Typography variant="h6" align="center">
                        Net Salary: ₹{totals.netSalary.toFixed(2)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <AttachMoney sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Salary Structure Management System
          </Typography>
        
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center" color="primary">
            Employee Salary Structure
          </Typography>
          <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
            Define and manage comprehensive employee salary components
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mt: 4, mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form onSubmit={handleSubmit}>
            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<RestartAlt />}
                variant="outlined"
              >
                Back
              </Button>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  onClick={handleReset}
                  variant="outlined"
                  color="secondary"
                  startIcon={<RestartAlt />}
                >
                  Reset All
                </Button>

                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<Download />}
                    size="large"
                  >
                    Save Salary Structure
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    color="primary"
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default SalaryStructure;