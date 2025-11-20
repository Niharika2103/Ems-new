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
  Calculate,
  Download,
  RestartAlt,
  Fingerprint,
  AccountBalance,
  CalendarMonth
} from '@mui/icons-material';

const SalaryStructure = () => {
  const [activeStep, setActiveStep] = useState(0);

  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };


  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    designation: '',
    dateOfJoining: getCurrentDate(),
    dateOfBirth: getCurrentDate(),

    panNumber: '',
    aadharNumber: '',
    uanNumber: '',
    pfNumber: '',
    esiNumber: '',

    bankName: '',
    accountNumber: '',
    ifscCode: '',
    paymentMethod: '',

    // Salary components
    basicPay: '',
    houseRentAllowance: '',
    medicalAllowance: '',
    conveyanceAllowance: '',
    specialAllowance: '',
    otherAllowance: '',
    driftAllowance: '',   // NEW

    // Deductions
    providentFund: '',
    professionalTax: '',
    incomeTax: '',
    TotalDeductions: '',
    loanDeductions: '',

    // Attendance
    effectiveFrom: getCurrentDate(),
    effectiveTo: getCurrentDate(),
    payableDays: '',
    lossofDaysDays: '',
    lossofpayreversalDays: '',

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

  // TOTAL CALCULATION
  const calculateTotals = () => {
    const basic = parseFloat(formData.basicPay) || 0;
    const hra = parseFloat(formData.houseRentAllowance) || 0;
    const medical = parseFloat(formData.medicalAllowance) || 0;
    const conveyance = parseFloat(formData.conveyanceAllowance) || 0;
    const special = parseFloat(formData.specialAllowance) || 0;
    const other = parseFloat(formData.otherAllowance) || 0;
    const drift = parseFloat(formData.driftAllowance) || 0;

    const pf = parseFloat(formData.providentFund) || 0;
    const pt = parseFloat(formData.professionalTax) || 0;
    const tax = parseFloat(formData.incomeTax) || 0;
    const loan = parseFloat(formData.loanDeductions) || 0;

    const totalDeductions = parseFloat(formData.TotalDeductions) || (pf + pt + tax + loan);

    const grossSalary = basic + hra + medical + conveyance + special + other + drift;

    const netSalary = grossSalary - totalDeductions;

    return { grossSalary, totalDeductions, netSalary };
  };

  const totals = calculateTotals();

  const handleNext = () => setActiveStep(prev => prev + 1);
  const handleBack = () => setActiveStep(prev => prev - 1);
  const handleReset = () => window.location.reload();

  // STEP CONTENT
  const renderStepContent = (step) => {
    switch (step) {

      // ========== STEP 1 ==========
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" color="primary" sx={{ display: "flex", gap: 1 }}>
              <AccountCircle /> Employee Information
            </Typography>

            <Grid container spacing={3}>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Employee Name"
                  name="employeeName" value={formData.employeeName} onChange={handleChange} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Employee ID"
                  name="employeeId" value={formData.employeeId} onChange={handleChange} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Designation"
                  name="designation" value={formData.designation} onChange={handleChange} />
              </Grid>

              {/* Employment Type */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth
                  sx={{ "& .MuiInputBase-root": { height: 60, borderRadius: "10px" } }}
                >
                  <InputLabel>Employment Type</InputLabel>
                  <Select name="employmentType" label="Employment Type"
                    value={formData.employmentType} onChange={handleChange}>
                    {employmentTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              {/* Dates */}
              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="date" label="Date of Joining"
                  name="dateOfJoining" InputLabelProps={{ shrink: true }}
                  value={formData.dateOfJoining} onChange={handleChange} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="date" label="Date of Birth"
                  name="dateOfBirth" InputLabelProps={{ shrink: true }}
                  value={formData.dateOfBirth} onChange={handleChange} />
              </Grid>

              {/* Location */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth
                  sx={{ "& .MuiInputBase-root": { height: 60, borderRadius: "10px" } }}
                >
                  <InputLabel>Location</InputLabel>
                  <Select name="location" label="Location"
                    value={formData.location} onChange={handleChange}>
                    {locations.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

            </Grid>
          </Box>
        );

      // ========== STEP 2 ==========
      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" color="primary" sx={{ display: "flex", gap: 1 }}>
              <Fingerprint /> Bank & Government IDs
            </Typography>

            <Grid container spacing={3}>

              <Grid item xs={12} sm={6}><TextField fullWidth label="PAN Number" name="panNumber" value={formData.panNumber} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Aadhar Number" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="UAN Number" name="uanNumber" value={formData.uanNumber} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="PF Number" name="pfNumber" value={formData.pfNumber} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="ESI Number" name="esiNumber" value={formData.esiNumber} onChange={handleChange} /></Grid>

              <Grid item xs={12}><Divider /><Typography variant="h6" sx={{ mt: 2, display: "flex", gap: 1 }}><AccountBalance /> Bank Details</Typography></Grid>

              <Grid item xs={12} sm={6}><TextField fullWidth label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Account Number" name="accountNumber" value={formData.accountNumber} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="IFSC Code" name="ifscCode" value={formData.ifscCode} onChange={handleChange} /></Grid>

              {/* Payment Method */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth
                  sx={{ "& .MuiInputBase-root": { height: 60, borderRadius: "10px" } }}
                >
                  <InputLabel>Payment Method</InputLabel>
                  <Select name="paymentMethod" label="Payment Method"
                    value={formData.paymentMethod} onChange={handleChange}>
                    {paymentMethods.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

            </Grid>
          </Box>
        );

      // ========== STEP 3 ==========
      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" color="primary" sx={{ display: "flex", gap: 1 }}>
              <AttachMoney /> Salary Components
            </Typography>

            <Grid container spacing={3}>

              {/* Earnings */}
              <Grid item xs={12} sm={6}><TextField fullWidth label="Basic Pay" type="number" name="basicPay" value={formData.basicPay} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="HRA" type="number" name="houseRentAllowance" value={formData.houseRentAllowance} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Medical Allowance" type="number" name="medicalAllowance" value={formData.medicalAllowance} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Conveyance Allowance" type="number" name="conveyanceAllowance" value={formData.conveyanceAllowance} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Special Allowance" type="number" name="specialAllowance" value={formData.specialAllowance} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Other Allowance" type="number" name="otherAllowance" value={formData.otherAllowance} onChange={handleChange} /></Grid>

              {/* NEW — Drift Allowance */}
              <Grid item xs={12} sm={6}><TextField fullWidth label="Drift Allowance" type="number" name="driftAllowance" value={formData.driftAllowance} onChange={handleChange} /></Grid>

              <Grid item xs={12}><Divider /><Typography variant="subtitle1" color="primary">Deductions</Typography></Grid>

              <Grid item xs={12} sm={6}><TextField fullWidth label="Provident Fund" type="number" name="providentFund" value={formData.providentFund} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Professional Tax" type="number" name="professionalTax" value={formData.professionalTax} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Income Tax (TDS)" type="number" name="incomeTax" value={formData.incomeTax} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Loan Deductions" type="number" name="loanDeductions" value={formData.loanDeductions} onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Total Deductions" type="number" name="TotalDeductions" value={formData.TotalDeductions} onChange={handleChange} /></Grid>

              {/* Attendance Section */}
              <Grid item xs={12}><Divider /><Typography variant="subtitle1" color="primary" sx={{ display: "flex", gap: 1 }}><CalendarMonth /> Attendance & Days</Typography></Grid>

              {/* Effective From */}
              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="date" label="Effective From"
                  name="effectiveFrom" InputLabelProps={{ shrink: true }}
                  value={formData.effectiveFrom} onChange={handleChange}
                  sx={{ "& .MuiInputBase-root": { height: 55 } }} />
              </Grid>

              {/* Effective To */}
              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="date" label="Effective To"
                  name="effectiveTo" InputLabelProps={{ shrink: true }}
                  value={formData.effectiveTo} onChange={handleChange}
                  sx={{ "& .MuiInputBase-root": { height: 55 } }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Payable Days" type="number"
                  name="payableDays" value={formData.payableDays} onChange={handleChange}
                  sx={{ "& .MuiInputBase-root": { height: 55 } }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Loss of Pay Days" type="number"
                  name="lossofDaysDays" value={formData.lossofDaysDays} onChange={handleChange}
                  sx={{ "& .MuiInputBase-root": { height: 55 } }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Loss of Pay Reversal Days" type="number"
                  name="lossofpayreversalDays" value={formData.lossofpayreversalDays} onChange={handleChange}
                  sx={{ "& .MuiInputBase-root": { height: 55 } }} />
              </Grid>

            </Grid>
          </Box>
        );

      // ========== STEP 4 ==========
      case 3:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ display: "flex", gap: 1 }}>
              <Calculate /> Review Salary Structure
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              Review all details before saving.
            </Alert>

            <Grid container spacing={3}>

              {/* LEFT SIDE */}
              <Grid item xs={12} md={6}>
                {/* Employee Details Card */}
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ display: "flex", gap: 1 }}>
                      <AccountCircle /> Employee Details
                    </Typography>

                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow><TableCell>Name</TableCell><TableCell>{formData.employeeName}</TableCell></TableRow>
                          <TableRow><TableCell>Employee ID</TableCell><TableCell>{formData.employeeId}</TableCell></TableRow>
                          <TableRow><TableCell>Designation</TableCell><TableCell>{formData.designation}</TableCell></TableRow>
                          <TableRow><TableCell>DOJ</TableCell><TableCell>{formData.dateOfJoining}</TableCell></TableRow>
                          <TableRow><TableCell>DOB</TableCell><TableCell>{formData.dateOfBirth}</TableCell></TableRow>
                          <TableRow><TableCell>Location</TableCell><TableCell>{formData.location}</TableCell></TableRow>
                          <TableRow><TableCell>Employment Type</TableCell><TableCell>{formData.employmentType}</TableCell></TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>

                {/* IDs & Bank */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ display: "flex", gap: 1 }}>
                      <Fingerprint /> IDs & Bank
                    </Typography>

                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow><TableCell>PAN</TableCell><TableCell>{formData.panNumber}</TableCell></TableRow>
                          <TableRow><TableCell>Aadhar</TableCell><TableCell>{formData.aadharNumber}</TableCell></TableRow>
                          <TableRow><TableCell>UAN</TableCell><TableCell>{formData.uanNumber}</TableCell></TableRow>
                          <TableRow><TableCell>Bank</TableCell><TableCell>{formData.bankName}</TableCell></TableRow>
                          <TableRow><TableCell>Account No</TableCell><TableCell>{formData.accountNumber}</TableCell></TableRow>
                          <TableRow><TableCell>Payment Method</TableCell><TableCell>{formData.paymentMethod}</TableCell></TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>

                  </CardContent>
                </Card>
              </Grid>

              {/* RIGHT SIDE */}
              <Grid item xs={12} md={6}>
                {/* Salary Breakdown Card */}
                <Card>
                  <CardContent>
                    <Typography variant="h6">Salary Breakdown</Typography>

                    {/* Earnings */}
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Earnings</strong></TableCell>
                            <TableCell align="right"><strong>Amount</strong></TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          <TableRow><TableCell>Basic Pay</TableCell><TableCell align="right">{formData.basicPay}</TableCell></TableRow>
                          <TableRow><TableCell>HRA</TableCell><TableCell align="right">{formData.houseRentAllowance}</TableCell></TableRow>
                          <TableRow><TableCell>Medical Allowance</TableCell><TableCell align="right">{formData.medicalAllowance}</TableCell></TableRow>
                          <TableRow><TableCell>Conveyance Allowance</TableCell><TableCell align="right">{formData.conveyanceAllowance}</TableCell></TableRow>
                          <TableRow><TableCell>Special Allowance</TableCell><TableCell align="right">{formData.specialAllowance}</TableCell></TableRow>
                          <TableRow><TableCell>Other Allowance</TableCell><TableCell align="right">{formData.otherAllowance}</TableCell></TableRow>

                          {/* Drift Allowance */}
                          <TableRow><TableCell>Drift Allowance</TableCell><TableCell align="right">{formData.driftAllowance}</TableCell></TableRow>

                          <TableRow sx={{ bgcolor: "#eeeeee" }}>
                            <TableCell><strong>Gross Salary</strong></TableCell>
                            <TableCell align="right"><strong>{totals.grossSalary.toFixed(2)}</strong></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Deductions */}
                    <TableContainer sx={{ mt: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Deductions</strong></TableCell>
                            <TableCell align="right"><strong>Amount</strong></TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          <TableRow><TableCell>PF</TableCell><TableCell align="right">{formData.providentFund}</TableCell></TableRow>
                          <TableRow><TableCell>Professional Tax</TableCell><TableCell align="right">{formData.professionalTax}</TableCell></TableRow>
                          <TableRow><TableCell>Income Tax</TableCell><TableCell align="right">{formData.incomeTax}</TableCell></TableRow>
                          <TableRow><TableCell>Loan Deductions</TableCell><TableCell align="right">{formData.loanDeductions}</TableCell></TableRow>

                          <TableRow sx={{ bgcolor: "#eeeeee" }}>
                            <TableCell><strong>Total Deductions</strong></TableCell>
                            <TableCell align="right"><strong>{totals.totalDeductions}</strong></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Net Salary */}
                    <Box sx={{ mt: 2, p: 2, bgcolor: "green", color: "white", borderRadius: 1, textAlign: "center" }}>
                      <Typography variant="h6">Net Salary: ₹{totals.netSalary.toFixed(2)}</Typography>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">Attendance Details</Typography>
                      <Typography>Effective From: {formData.effectiveFrom}</Typography>
                      <Typography>Effective To: {formData.effectiveTo}</Typography>
                      <Typography>Payable Days: {formData.payableDays}</Typography>
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
        return null;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <AttachMoney sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Salary Structure Management</Typography>
          <Chip label="Payroll System" color="secondary" />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" align="center" color="primary">Employee Salary Structure</Typography>
          <Typography align="center" sx={{ mb: 2 }}>Define and manage employee salary components</Typography>

          <Stepper activeStep={activeStep} sx={{ mt: 4, mb: 4 }}>
            {steps.map(label => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>

          <form>
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
                  <Button variant="contained" color="primary" startIcon={<Download />}>
                    Save Salary Structure
                  </Button>
                ) : (
                  <Button variant="contained" color="primary" onClick={handleNext}>
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