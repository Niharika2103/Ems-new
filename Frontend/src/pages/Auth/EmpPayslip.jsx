import React, { useState, useEffect } from "react";
import { downloadPayslipApi } from "../../api/authApi";
import { decodeToken } from "../../api/decodeToekn";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Popover,
  Paper,
  Container,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  Divider,
  Alert,
  Chip,
  Grid,
  Stepper,
  Step,
  StepLabel,
  AppBar,
  Toolbar,
} from "@mui/material";
import { CalendarToday } from "@mui/icons-material";
import {
  AccountCircle,
  AttachMoney,
  Calculate,
  Fingerprint,
  AccountBalance,
  CalendarMonth,
} from "@mui/icons-material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import dayjs from "dayjs";

const EmpPayslip = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [userId, setUserId] = useState(null);
  const [salaryStructure, setSalaryStructure] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalendarOpen = (event) => setAnchorEl(event.currentTarget);
  const handleCalendarClose = () => setAnchorEl(null);

  const handleMonthSelect = (date) => {
    setSelectedDate(date);
    handleCalendarClose();
  };

  useEffect(() => {
  const fetchData = async () => {
    try {
      const decoded = await decodeToken();
      setUserId(decoded.id);

      // Call backend API
      const res = await fetch(`http://localhost:5004/employee/salary/${decoded.id}`);
      const data = await res.json();

      if (!data.success) {
        console.error(data.error);
        return;
      }

      const e = data.employee;
      const s = data.salary;

      setSalaryStructure({
        employeeName: e.name || "",
        employeeId: e.employee_id || "",
        designation: e.designation || "",
        dateOfJoining: e.date_of_joining || "",
        dateOfBirth: e.dob || "",
        location: e.location || "",
        employmentType: e.employment_type || "",

        // IDs → from salary table (s), NOT employee table (e)
        panNumber: s.pan_number || "",
        uanNumber: s.uan_number || "",
        pfNumber: s.pf_number || "",
        esiNumber: s.esi_number || "",

        // Bank → from salary table (s)
        bankName: s.bank_name || "",
        accountNumber: s.account_number || "",
        ifscCode: s.ifsc_code || "",
        paymentMethod: s.payment_method || "",

        // Salary
        basicPay: s.basic_pay || 0,
        houseRentAllowance: s.hra || 0,
        medicalAllowance: s.medical_allowance || 0,
        conveyanceAllowance: s.conveyance_allowance || 0,
        specialAllowance: s.special_allowance || 0,
        otherAllowance: s.other_allowances || 0,
        driftAllowance: s.da || 0,

        providentFund: s.pf_employee || 0,
        professionalTax: s.professional_tax || 0,
        incomeTax: s.income_tax || 0,
        loanDeductions: s.loan_deduction || 0,
        TotalDeductions: s.total_deductions || 0,

        effectiveFrom: s.effective_from || "",
        effectiveTo: s.effective_to || "",
        payableDays: s.payable_days || 0,
        lossofDaysDays: s.loss_of_days || 0,
        lossofpayreversalDays: s.loss_of_pay_reversal_days || 0,
      });



    } catch (error) {
      console.error("Error fetching salary:", error);
    }
  };

  fetchData();
}, []);

  const downloadPayslip = async () => {
    if (!selectedDate) return;

    const month = dayjs(selectedDate).format("MMMM").toUpperCase();
    const year = dayjs(selectedDate).format("YYYY");

    try {
      const response = await downloadPayslipApi(userId, month, year);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Payslip-${month}-${year}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Payslip download failed:", error);
      alert("Payslip not found for this month");
    }
  };

  // Calculate totals for display
  const calculateTotals = () => {
    if (!salaryStructure) return { grossSalary: 0, totalDeductions: 0, netSalary: 0 };

    const basic = parseFloat(salaryStructure.basicPay) || 0;
    const hra = parseFloat(salaryStructure.houseRentAllowance) || 0;
    const medical = parseFloat(salaryStructure.medicalAllowance) || 0;
    const conveyance = parseFloat(salaryStructure.conveyanceAllowance) || 0;
    const special = parseFloat(salaryStructure.specialAllowance) || 0;
    const other = parseFloat(salaryStructure.otherAllowance) || 0;
    const drift = parseFloat(salaryStructure.driftAllowance) || 0;

    const pf = parseFloat(salaryStructure.providentFund) || 0;
    const pt = parseFloat(salaryStructure.professionalTax) || 0;
    const tax = parseFloat(salaryStructure.incomeTax) || 0;
    const loan = parseFloat(salaryStructure.loanDeductions) || 0;

    const totalDeductions = parseFloat(salaryStructure.TotalDeductions) || (pf + pt + tax + loan);
    const grossSalary = basic + hra + medical + conveyance + special + other + drift;
    const netSalary = grossSalary - totalDeductions;

    return { grossSalary, totalDeductions, netSalary };
  };

  const totals = calculateTotals();
  const steps = ['Employee Details', 'Bank & IDs', 'Salary Components', 'Review'];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Existing Download Section */}
      <Box sx={{ p: 2 }}>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            width: 480,
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {/* LEFT SECTION */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton
              color="primary"
              onClick={handleCalendarOpen}
              sx={{
                border: "1px solid #ccc",
                padding: "6px",
                borderRadius: "10px",
              }}
            >
              <CalendarToday sx={{ fontSize: 22 }} />
            </IconButton>

            <Box>
              <Typography sx={{ fontSize: "14px", color: "#666" }}>
                Select Month
              </Typography>

              <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>
                {selectedDate
                  ? dayjs(selectedDate).format("MMMM YYYY")
                  : "Not Selected"}
              </Typography>
            </Box>
          </Box>

          {/* RIGHT SECTION BUTTON */}
          <Button
            variant="contained"
            sx={{
              py: 1,
              px: 3,
              fontSize: "14px",
              borderRadius: "10px",
            }}
            disabled={!selectedDate}
            onClick={downloadPayslip}
          >
            Download
          </Button>

          {/* Calendar Popover */}
          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handleCalendarClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          >
            <Calendar
              onClickMonth={handleMonthSelect}
              view="year"
              value={selectedDate}
            />
          </Popover>
        </Paper>
      </Box>

      {/* Salary Structure Section - READ ONLY */}
      {salaryStructure && (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h4" align="center" color="primary">
              Salary Structure (Read Only)
            </Typography>
            <Typography align="center" sx={{ mb: 2 }}>
              View your current salary structure details
            </Typography>

            <Stepper activeStep={3} sx={{ mt: 4, mb: 4 }}>
              {steps.map(label => (
                <Step key={label}><StepLabel>{label}</StepLabel></Step>
              ))}
            </Stepper>

            <AppBar position="static" sx={{ mb: 3 }}>
              <Toolbar>
                <AttachMoney sx={{ mr: 2 }} />
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  Current Salary Structure
                </Typography>
                <Chip label="Active" color="success" />
              </Toolbar>
            </AppBar>

            <Grid container spacing={3}>
              {/* LEFT SIDE */}
              <Grid item xs={12} md={6}>
                {/* Employee Details Card */}
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ display: "flex", gap: 1, mb: 2 }}>
                      <AccountCircle /> Employee Details
                    </Typography>

                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow><TableCell>Name</TableCell><TableCell>{salaryStructure.employeeName}</TableCell></TableRow>
                          <TableRow><TableCell>Employee ID</TableCell><TableCell>{salaryStructure.employeeId}</TableCell></TableRow>
                          <TableRow><TableCell>Designation</TableCell><TableCell>{salaryStructure.designation}</TableCell></TableRow>
                          <TableRow><TableCell>Date of Joining</TableCell><TableCell>{salaryStructure.dateOfJoining}</TableCell></TableRow>
                          <TableRow><TableCell>Date of Birth</TableCell><TableCell>{salaryStructure.dateOfBirth}</TableCell></TableRow>
                          <TableRow><TableCell>Location</TableCell><TableCell>{salaryStructure.location}</TableCell></TableRow>
                          <TableRow><TableCell>Employment Type</TableCell><TableCell>{salaryStructure.employmentType}</TableCell></TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>

                {/* IDs & Bank */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ display: "flex", gap: 1, mb: 2 }}>
                      <Fingerprint /> IDs & Bank Details
                    </Typography>

                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow><TableCell>PAN Number</TableCell><TableCell>{salaryStructure.panNumber}</TableCell></TableRow>
                          <TableRow><TableCell>UAN Number</TableCell><TableCell>{salaryStructure.uanNumber}</TableCell></TableRow>
                          <TableRow><TableCell>PF Number</TableCell><TableCell>{salaryStructure.pfNumber}</TableCell></TableRow>
                          <TableRow><TableCell>ESI Number</TableCell><TableCell>{salaryStructure.esiNumber}</TableCell></TableRow>
                          <TableRow><TableCell>Bank Name</TableCell><TableCell>{salaryStructure.bankName}</TableCell></TableRow>
                          <TableRow><TableCell>Account Number</TableCell><TableCell>{salaryStructure.accountNumber}</TableCell></TableRow>
                          <TableRow><TableCell>IFSC Code</TableCell><TableCell>{salaryStructure.ifscCode}</TableCell></TableRow>
                          <TableRow><TableCell>Payment Method</TableCell><TableCell>{salaryStructure.paymentMethod}</TableCell></TableRow>
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
                    <Typography variant="h6" sx={{ mb: 2 }}>Salary Breakdown</Typography>

                    {/* Earnings */}
                    <Typography variant="subtitle1" color="primary" sx={{ mb: 1 }}>
                      Earnings
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow><TableCell>Basic Pay</TableCell><TableCell align="right">₹{salaryStructure.basicPay}</TableCell></TableRow>
                          <TableRow><TableCell>House Rent Allowance</TableCell><TableCell align="right">₹{salaryStructure.houseRentAllowance}</TableCell></TableRow>
                          <TableRow><TableCell>Medical Allowance</TableCell><TableCell align="right">₹{salaryStructure.medicalAllowance}</TableCell></TableRow>
                          <TableRow><TableCell>Conveyance Allowance</TableCell><TableCell align="right">₹{salaryStructure.conveyanceAllowance}</TableCell></TableRow>
                          <TableRow><TableCell>Special Allowance</TableCell><TableCell align="right">₹{salaryStructure.specialAllowance}</TableCell></TableRow>
                          <TableRow><TableCell>Other Allowance</TableCell><TableCell align="right">₹{salaryStructure.otherAllowance}</TableCell></TableRow>
                          <TableRow><TableCell>Drift Allowance</TableCell><TableCell align="right">₹{salaryStructure.driftAllowance}</TableCell></TableRow>
                          <TableRow sx={{ bgcolor: "#eeeeee" }}>
                            <TableCell><strong>Gross Salary</strong></TableCell>
                            <TableCell align="right"><strong>₹{totals.grossSalary.toFixed(2)}</strong></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Divider sx={{ my: 2 }} />

                    {/* Deductions */}
                    <Typography variant="subtitle1" color="primary" sx={{ mb: 1 }}>
                      Deductions
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow><TableCell>Provident Fund</TableCell><TableCell align="right">₹{salaryStructure.providentFund}</TableCell></TableRow>
                          <TableRow><TableCell>Professional Tax</TableCell><TableCell align="right">₹{salaryStructure.professionalTax}</TableCell></TableRow>
                          <TableRow><TableCell>Income Tax</TableCell><TableCell align="right">₹{salaryStructure.incomeTax}</TableCell></TableRow>
                          <TableRow><TableCell>Loan Deductions</TableCell><TableCell align="right">₹{salaryStructure.loanDeductions}</TableCell></TableRow>
                          <TableRow sx={{ bgcolor: "#eeeeee" }}>
                            <TableCell><strong>Total Deductions</strong></TableCell>
                            <TableCell align="right"><strong>₹{totals.totalDeductions.toFixed(2)}</strong></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Net Salary */}
                    <Box sx={{ mt: 3, p: 2, bgcolor: "#1976d2", color: "white", borderRadius: 1, textAlign: "center" }}>
                      <Typography variant="h6">
                        Net Salary: ₹{totals.netSalary.toFixed(2)}
                      </Typography>
                    </Box>

                    {/* Attendance Details */}
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" color="primary" sx={{ display: "flex", gap: 1, mb: 1 }}>
                        <CalendarMonth /> Attendance & Days
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableBody>
                            <TableRow><TableCell>Effective From</TableCell><TableCell>{salaryStructure.effectiveFrom}</TableCell></TableRow>
                            <TableRow><TableCell>Effective To</TableCell><TableCell>{salaryStructure.effectiveTo}</TableCell></TableRow>
                            <TableRow><TableCell>Payable Days</TableCell><TableCell>{salaryStructure.payableDays}</TableCell></TableRow>
                            <TableRow><TableCell>Loss of Pay Days</TableCell><TableCell>{salaryStructure.lossofDaysDays}</TableCell></TableRow>
                            <TableRow><TableCell>LOP Reversal Days</TableCell><TableCell>{salaryStructure.lossofpayreversalDays}</TableCell></TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 3 }}>
              This is a read-only view of your salary structure. For any changes, please contact the HR department.
            </Alert>
          </Paper>
        </Container>
      )}
    </Box>
  );
};

export default EmpPayslip;