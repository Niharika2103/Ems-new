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
    const getDecoded = async () => {
      try {
        const decoded = await decodeToken();
        setUserId(decoded.id);
        // In a real app, you would fetch salary structure data here
        // For demo purposes, we'll set mock data
        setTimeout(() => {
          setSalaryStructure({
            employeeName: "John Doe",
            employeeId: "EMP00123",
            designation: "Senior Software Engineer",
            dateOfJoining: "2022-06-15",
            dateOfBirth: "1990-03-25",
            location: "Bangalore",
            employmentType: "Permanent",

            // IDs
            panNumber: "ABCDE1234F",
            uanNumber: "123456789012",
            pfNumber: "PF1234567",
            esiNumber: "ESI987654",

            // Bank
            bankName: "HDFC Bank",
            accountNumber: "XXXXXX1234",
            ifscCode: "HDFC0001234",
            paymentMethod: "Bank Transfer",

            // Earnings
            basicPay: "50000",
            houseRentAllowance: "20000",
            medicalAllowance: "5000",
            conveyanceAllowance: "3000",
            specialAllowance: "15000",
            otherAllowance: "2000",
            driftAllowance: "1000",

            // Deductions
            providentFund: "3000",
            professionalTax: "200",
            incomeTax: "5000",
            loanDeductions: "0",
            TotalDeductions: "8200",

            // Dates & Days
            effectiveFrom: "2024-01-01",
            effectiveTo: "2024-12-31",
            payableDays: "30",
            lossofDaysDays: "0",
            lossofpayreversalDays: "0",
          });
        }, 500);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    };
    getDecoded();
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