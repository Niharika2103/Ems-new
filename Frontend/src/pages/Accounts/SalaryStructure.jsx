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
  CalendarMonth
} from '@mui/icons-material';

const SalaryStructure = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Employee Information
    employeeName: '',
    employeeId: '',
    designation: '',
    dateOfJoining: '',
    dateOfBirth: '',
    
    // Government IDs
    panNumber: '',
    aadharNumber: '',
    uanNumber: '',
    pfNumber: '',
    esiNumber: '',
    
    // Bank Details
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    
    // Salary Structure - Earnings
    basicPay: '',
    houseRentAllowance: '',
    medicalAllowance: '',
    conveyanceAllowance: '',
    specialAllowance: '',
    otherAllowance: '',
    
    // Salary Structure - Deductions
    providentFund: '',
    professionalTax: '',
    incomeTax: '',
    TotalDeductions: '',
    loanDeductions: '',
   
    // Payment Details
    payableDays: '',
    paymentMethod: '',
    standardDays: '',
    lossofDaysDays: '',
    lossofpayreversalDays: '',
    
    // Additional Fields
    location: '',
    employmentType: 'Permanent'
  });

  const steps = ['Employee Details', 'Bank & IDs', 'Salary Components', 'Review & Generate'];

  const employmentTypes = ['Permanent', 'Contract', 'Intern', 'Trainee', 'Consultant'];
  const paymentMethods = ['Bank Transfer', 'Cash', 'Cheque'];
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
    const basic = parseFloat(formData.basicPay) || 0;
    const hra = parseFloat(formData.houseRentAllowance) || 0;
    const medical = parseFloat(formData.medicalAllowance) || 0;
    const conveyance = parseFloat(formData.conveyanceAllowance) || 0;
    const special = parseFloat(formData.specialAllowance) || 0;
    const other = parseFloat(formData.otherAllowance) || 0;

    // Deductions
    const pf = parseFloat(formData.providentFund) || 0;
    const pt = parseFloat(formData.professionalTax) || 0;
    const tax = parseFloat(formData.incomeTax) || 0;
    const loan = parseFloat(formData.loanDeductions) || 0;
    const totalDeductions = parseFloat(formData.TotalDeductions) || (pf + pt + tax + loan);

    const grossSalary = basic + hra + medical + conveyance + special + other;
    const netSalary = grossSalary - totalDeductions;

    return {
      grossSalary,
      totalDeductions,
      netSalary,
      totalEarnings: grossSalary,
      totalAllowances: hra + medical + conveyance + special + other
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
      dateOfJoining: '',
      dateOfBirth: '',
      panNumber: '',
      aadharNumber: '',
      uanNumber: '',
      pfNumber: '',
      esiNumber: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      basicPay: '',
      houseRentAllowance: '',
      medicalAllowance: '',
      conveyanceAllowance: '',
      specialAllowance: '',
      otherAllowance: '',
      providentFund: '',
      professionalTax: '',
      incomeTax: '',
      TotalDeductions: '',
      loanDeductions: '',
      payableDays: '',
      paymentMethod: '',
      standardDays: '',
      lossofDaysDays: '',
      lossofpayreversalDays: '',
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
              <AccountCircle /> Employee Information
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
                <TextField
                  required
                  fullWidth
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
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
              <Fingerprint /> Bank & Government IDs
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
                  label="ESI Number"
                  name="esiNumber"
                  value={formData.esiNumber}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBalance /> Bank Details
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
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    label="Payment Method"
                  >
                    {paymentMethods.map(method => (
                      <MenuItem key={method} value={method}>{method}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoney /> Salary Components
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
            
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Basic Pay"
                  name="basicPay"
                  type="number"
                  value={formData.basicPay}
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
                  label="Other Allowance"
                  name="otherAllowance"
                  type="number"
                  value={formData.otherAllowance}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom color="primary">
                  Deductions
                </Typography>
              </Grid>

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
                  label="Loan Deductions"
                  name="loanDeductions"
                  type="number"
                  value={formData.loanDeductions}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total Deductions"
                  name="TotalDeductions"
                  type="number"
                  value={formData.TotalDeductions}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarMonth /> Attendance & Days
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Payable Days"
                  name="payableDays"
                  type="number"
                  value={formData.payableDays}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, max: 31 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Standard Days"
                  name="standardDays"
                  type="number"
                  value={formData.standardDays}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, max: 31 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Loss of Pay Days"
                  name="lossofDaysDays"
                  type="number"
                  value={formData.lossofDaysDays}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, max: 31 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Loss of Pay Reversal Days"
                  name="lossofpayreversalDays"
                  type="number"
                  value={formData.lossofpayreversalDays}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, max: 31 } }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Calculate /> Review Salary Structure
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Review all information before saving the salary structure.
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
                          <TableRow><TableCell><strong>DOJ</strong></TableCell><TableCell>{formData.dateOfJoining}</TableCell></TableRow>
                          <TableRow><TableCell><strong>DOB</strong></TableCell><TableCell>{formData.dateOfBirth}</TableCell></TableRow>
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
                      <Fingerprint /> IDs & Bank
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow><TableCell><strong>PAN</strong></TableCell><TableCell>{formData.panNumber}</TableCell></TableRow>
                          <TableRow><TableCell><strong>Aadhar</strong></TableCell><TableCell>{formData.aadharNumber}</TableCell></TableRow>
                          <TableRow><TableCell><strong>UAN</strong></TableCell><TableCell>{formData.uanNumber}</TableCell></TableRow>
                          <TableRow><TableCell><strong>Bank</strong></TableCell><TableCell>{formData.bankName}</TableCell></TableRow>
                          <TableRow><TableCell><strong>Account No.</strong></TableCell><TableCell>{formData.accountNumber}</TableCell></TableRow>
                          <TableRow><TableCell><strong>Payment Method</strong></TableCell><TableCell>{formData.paymentMethod}</TableCell></TableRow>
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
                          <TableRow><TableCell>Basic Pay</TableCell><TableCell align="right">{parseFloat(formData.basicPay || 0).toFixed(2)}</TableCell></TableRow>
                          <TableRow><TableCell>HRA</TableCell><TableCell align="right">{parseFloat(formData.houseRentAllowance || 0).toFixed(2)}</TableCell></TableRow>
                          <TableRow><TableCell>Medical Allowance</TableCell><TableCell align="right">{parseFloat(formData.medicalAllowance || 0).toFixed(2)}</TableCell></TableRow>
                          <TableRow><TableCell>Conveyance</TableCell><TableCell align="right">{parseFloat(formData.conveyanceAllowance || 0).toFixed(2)}</TableCell></TableRow>
                          <TableRow><TableCell>Special Allowance</TableCell><TableCell align="right">{parseFloat(formData.specialAllowance || 0).toFixed(2)}</TableCell></TableRow>
                          <TableRow><TableCell>Other Allowance</TableCell><TableCell align="right">{parseFloat(formData.otherAllowance || 0).toFixed(2)}</TableCell></TableRow>
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
                          <TableRow><TableCell>Loan Deductions</TableCell><TableCell align="right">{parseFloat(formData.loanDeductions || 0).toFixed(2)}</TableCell></TableRow>
                          <TableRow sx={{ bgcolor: 'action.hover' }}><TableCell><strong>Total Deductions</strong></TableCell><TableCell align="right"><strong>{totals.totalDeductions.toFixed(2)}</strong></TableCell></TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: 1 }}>
                      <Typography variant="h6" align="center">
                        Net Salary: ₹{totals.netSalary.toFixed(2)}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Days Information:</Typography>
                      <Typography>Payable Days: {formData.payableDays}</Typography>
                      <Typography>Standard Days: {formData.standardDays}</Typography>
                      <Typography>Loss of Pay Days: {formData.lossofDaysDays}</Typography>
                      <Typography>LOP Reversal Days: {formData.lossofpayreversalDays}</Typography>
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
            Salary Structure Management
          </Typography>
          <Chip label="Payroll System" color="secondary" />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center" color="primary">
            Employee Salary Structure
          </Typography>
          <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
            Define and manage employee salary components
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