import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { fetchallemployee } from "../../features/employeesDetails/employeesSlice";
import { saveSalaryStructure, getsalarybyid } from "../../features/Salarystructure/salaryStructureSlice";
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
const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const SalaryStructure = () => {
  const mapBackendToForm = (data) => ({

    
    // Earnings
    basicPay: data.basicPay ?? "",
    houseRentAllowance: data.hra ?? "",
    driftAllowance: data.da ?? "",
    conveyanceAllowance: data.conveyanceAllowance ?? "",
    medicalAllowance: data.medicalAllowance ?? "",
    specialAllowance: data.specialAllowance ?? "",
    otherAllowance: data.otherAllowances ?? "",

    // Deductions
    providentFund: data.pfEmployee ?? "",
    professionalTax: data.professionalTax ?? "",
    incomeTax: data.incomeTax ?? "",
    loanDeductions: data.loanDeduction ?? "",
    TotalDeductions: data.totalDeductions ?? "",

    // IDs
    panNumber: data.panNumber ?? "",
    pfNumber: data.pfNumber ?? "",
    uanNumber: data.uanNumber ?? "",
    esiNumber: data.esi ?? "",

    // Bank
    bankName: data.bankName ?? "",
    accountNumber: data.accountNumber ?? "",
    ifscCode: data.ifscCode ?? "",
    paymentMethod: data.paymentMethod ?? "",

    // Days
    payableDays: data.payableDays ?? "",
    lossofDaysDays: data.lossOfDays ?? "",
    lossofpayreversalDays: data.lossOfPayReversalDays ?? "",

    // Others
    location: data.location ?? "",
  });


  const initialFormData = {
    employeeName: '',
    employeeId: '',
    designation: '',
    dateOfJoining: getCurrentDate(),
    dateOfBirth:  getCurrentDate(),

    panNumber: '',
    // aadharNumber: '',
    uanNumber: '',
    pfNumber: '',
    esiNumber: '',

    bankName: '',
    accountNumber: '',
    ifscCode: '',
    paymentMethod: '',

    basicPay: '',
    houseRentAllowance: '',
    medicalAllowance: '',
    conveyanceAllowance: '',
    specialAllowance: '',
    otherAllowance: '',
    driftAllowance: '',

    providentFund: '',
    professionalTax: '',
    incomeTax: '',
    TotalDeductions: '',
    loanDeductions: '',

    effectiveFrom:  getCurrentDate(),
    effectiveTo:  getCurrentDate(),
    payableDays: '',
    lossofDaysDays: '',
    lossofpayreversalDays: '',

    location: '',
    employmentType: ''
  };
  const initialFormData1 = {

    id: '',
    panNumber: '',
    // aadharNumber: '',
    uanNumber: '',
    pfNumber: '',
    esiNumber: '',

    bankName: '',
    accountNumber: '',
    ifscCode: '',
    paymentMethod: '',

    basicPay: '',
    houseRentAllowance: '',
    medicalAllowance: '',
    conveyanceAllowance: '',
    specialAllowance: '',
    otherAllowance: '',
    driftAllowance: '',

    providentFund: '',
    professionalTax: '',
    incomeTax: '',
    TotalDeductions: '',
    loanDeductions: '',

    effectiveFrom: getCurrentDate(),
    effectiveTo:  getCurrentDate(),
    payableDays: '',
    lossofDaysDays: '',
    lossofpayreversalDays: '',

    location: '',
    employmentType: ''
  };

  const [activeStep, setActiveStep] = useState(0);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(initialFormData);
  const [formData1, setFormData1] = useState(initialFormData1);
  const navigate = useNavigate();

  // errors: { fieldName: "error message" }
  const [errors, setErrors] = useState({});
  const steps = ['Employee Details', 'Bank & IDs', 'Salary Components', 'Review & Generate'];
  const employmentTypes = ['Permanent', 'Contract', 'Intern', 'Trainee', 'Consultant'];
  const paymentMethods = ['Bank Transfer', 'Cash', 'Cheque'];
  const locations = ['Bangalore', 'Hyderabad', 'Pune', 'Gurgaon', 'Mumbai', 'Chennai', 'Remote'];

  const { list, loading } = useSelector((state) => ({
    list: state.employeeDetails?.list || [],
  }));
  const location = useLocation();
  const emailFromQuery = new URLSearchParams(location.search).get('email');


  useEffect(() => {
    const loadAll = async () => {
      if (!emailFromQuery) return;
      try {
        // 1) fetch employee by email
        const empRes = await dispatch(fetchallemployee(emailFromQuery));
        const emp = empRes?.payload;
        if (!emp) {
          toast.error("Employee not found");
          return;
        }

        // set employee fields (formData1)
        setFormData1(prev => ({
          ...prev,
          id: emp.id,
          employeeName: emp.name || "",
          employeeId: emp.employee_id || "",
          designation: emp.designation || "",
          dateOfJoining: emp.date_of_joining ? emp.date_of_joining.split("T")[0] : getCurrentDate(),
          email: emp.email || "",
          dateOfBirth: emp.dob ? emp.dob.split("T")[0] : getCurrentDate(),
        }));

        // 2) fetch salary by employee id (in the same flow)
        if (emp.id) {
          const salRes = await dispatch(getsalarybyid(emp.id));
          const salary = salRes?.payload;
          if (salary) {
            setFormData(prev => ({
              ...prev,
              ...mapBackendToForm(salary),
              // optionally copy employee fields to formData if your UI expects them there:
              employeeName: emp.name || "",
              employeeId: emp.employee_id || "",
              designation: emp.designation || "",
              dateOfJoining: emp.date_of_joining ? emp.date_of_joining.split("T")[0] : "",
              dateOfBirth: emp.dob ? emp.dob.split("T")[0] : "",
            }));
          } else {
            // no salary found — keep defaults (or clear fields as needed)
          }
        }
      } catch (error) {
        console.error("Error loading profile or salary:", error);
        toast.error("Failed to load employee or salary data. Please try again.");
      }
    };

    loadAll();
  }, [dispatch, emailFromQuery]);


  const handleChange = (e) => {
    const { name, value } = e.target;
     if (name === "accountNumber") {
    if (!/^\d*$/.test(value)) return; // prevents non-digits
  }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // clear error for this field as user types/changes
    setErrors(prev => {
      if (!prev[name]) return prev;
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
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

    const totalDeductions = formData.TotalDeductions
      ? parseFloat(formData.TotalDeductions) || 0
      : (pf + pt + tax + loan);

    const grossSalary = basic + hra + medical + conveyance + special + other + drift;

    const netSalary = grossSalary - totalDeductions;

    return { grossSalary, totalDeductions, netSalary };
  };

  const totals = calculateTotals();

  const handleNext = () => {
    const stepErrors = validateStep(activeStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      // don't advance
      return;
    }
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => setActiveStep(prev => prev - 1);
  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
    setActiveStep(0);
  };

  // --- Validation helpers & rules ---
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/i; // PAN format
  const aadharRegex = /^\d{12}$/;
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;

  const isValidDate = (d) => {
    return !isNaN(new Date(d).getTime());
  };

  const validateStep = (step) => {
    const e = {};

    if (step === 0) {
      if (!formData.location) {
        e.location = 'Select location.';
      }
    }
    if (step === 1) {
      // PAN & Aadhar validation
      if (!formData.panNumber || !panRegex.test(formData.panNumber.trim())) {
        e.panNumber = 'Enter a valid PAN (e.g. ABCDE1234F).';
      }
      if (!formData.paymentMethod) {
        e.paymentMethod = 'Select payment method.';
      }

      // bank details required when payment method is Bank Transfer
      if (formData.paymentMethod === 'Bank Transfer') {
        if (!formData.bankName || formData.bankName.trim().length === 0) {
          e.bankName = 'Bank name is required for bank transfer.';
        }
        if (!formData.accountNumber || formData.accountNumber.trim().length < 6) {
          e.accountNumber = 'Enter a valid account number (min 6 chars).';
        }
        if (!formData.ifscCode || !ifscRegex.test(formData.ifscCode.trim())) {
          e.ifscCode = 'Enter valid IFSC (e.g. ABCD0EFG123).';
        }
      }
    }

    if (step === 2) {
      // Basic pay mandatory and numeric
      const basic = parseFloat(formData.basicPay);
      if (isNaN(basic) || basic <= 0) {
        e.basicPay = 'Basic Pay is required and must be greater than 0.';
      }

      // All numeric fields should not be negative
      const numericFields = [
        'houseRentAllowance',
        'medicalAllowance',
        'conveyanceAllowance',
        'specialAllowance',
        'otherAllowance',
        'driftAllowance',
        'providentFund',
        'professionalTax',
        'incomeTax',
        'loanDeductions',
        'TotalDeductions'
      ];
      numericFields.forEach((f) => {
        if (formData[f] !== '' && formData[f] !== null) {
          const val = parseFloat(formData[f]);
          if (isNaN(val)) {
            e[f] = 'Must be a valid number.';
          } else if (val < 0) {
            e[f] = 'Cannot be negative.';
          }
        }
      });

      // Dates: effectiveFrom <= effectiveTo
      if (!isValidDate(formData.effectiveFrom)) {
        e.effectiveFrom = 'Enter a valid date.';
      }
      if (!isValidDate(formData.effectiveTo)) {
        e.effectiveTo = 'Enter a valid date.';
      }

      if (isValidDate(formData.effectiveFrom) && isValidDate(formData.effectiveTo)) {
        if (new Date(formData.effectiveFrom) > new Date(formData.effectiveTo)) {
          e.effectiveFrom = 'Effective From must be before or equal to Effective To.';
          e.effectiveTo = 'Effective To must be after or equal to Effective From.';
        }
      }

      // Payable days range
      if (formData.payableDays !== '') {
        const pd = parseFloat(formData.payableDays);
        if (isNaN(pd) || pd < 0 || pd > 31) {
          e.payableDays = 'Enter payable days (0 - 31).';
        }
      }

      if (formData.lossofDaysDays !== '') {
        const ld = parseFloat(formData.lossofDaysDays);
        if (isNaN(ld) || ld < 0 || ld > 31) {
          e.lossofDaysDays = 'Enter LOP days (0 - 31).';
        }
      }
      if (formData.lossofpayreversalDays !== '') {
        const lr = parseFloat(formData.lossofpayreversalDays);
        if (isNaN(lr) || lr < 0 || lr > 31) {
          e.lossofpayreversalDays = 'Enter LOP reversal days (0 - 31).';
        }
      }
    }

    return e;
  };

  const validateAll = () => {
    const allErrors = {
      ...validateStep(0),
      ...validateStep(1),
      ...validateStep(2)
    };
    return allErrors;
  };


  const handleSave = async () => {
    const allErrors = validateAll();
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);

      if (Object.keys(validateStep(0)).length > 0) setActiveStep(0);
      else if (Object.keys(validateStep(1)).length > 0) setActiveStep(1);
      else if (Object.keys(validateStep(2)).length > 0) setActiveStep(2);

      return;
    }

    const payload = {
      employeeId: formData1.id,
      location: formData.location,

      panNumber: formData.panNumber,
      pfNumber: formData.pfNumber,
      uanNumber: formData.uanNumber,
      esi: formData.esiNumber,  // ✔ correct key name

      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      ifscCode: formData.ifscCode,
      paymentMethod: formData.paymentMethod,

      effectiveFrom: formData.effectiveFrom,
      effectiveTo: formData.effectiveTo,

      // Earnings
      basicPay: formData.basicPay,
      hra: formData.houseRentAllowance,
      da: formData.driftAllowance,
      conveyanceAllowance: formData.conveyanceAllowance,
      medicalAllowance: formData.medicalAllowance,
      specialAllowance: formData.specialAllowance,
      otherAllowances: formData.otherAllowance,

      // Deductions
      pfEmployee: formData.providentFund,
      pfEmployer: 0,
      professionalTax: formData.professionalTax,
      incomeTax: formData.incomeTax,
      loanDeduction: formData.loanDeductions,
      esi: formData.esiNumber,
      otherDeductions: formData.otherAllowance,
      // Days
      lossOfDays: formData.lossofDaysDays,
      lossOfPayReversalDays: formData.lossofpayreversalDays,
      payableDays: formData.payableDays,
    };


    try {
      const res = await dispatch(saveSalaryStructure(payload));
      console.log("dispatch result:", res);

      if (res?.payload?.id) {
        toast.success("Salary Structure Saved Successfully!");
         setTimeout(() => navigate("/dashboard/emp_requestTable", { replace: true }), 2000);
      } else {
        toast.error("Failed to save salary structure");
      }
    } catch (err) {
      toast.error("Error while saving");
    }
  };



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
                  name="employeeName" value={formData1.employeeName} InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Employee ID"
                  name="employeeId" value={formData1.employeeId}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Designation"
                  name="designation" value={formData1.designation} InputProps={{ readOnly: true }}
                />
              </Grid>



              {/* Employment Type */}
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Employment Type"
                  name="employmentType" value={formData1.employmentType} InputProps={{ readOnly: true }}
                />
              </Grid>

              {/* Dates */}
              {/* <Grid item xs={12} sm={6}>
                <TextField fullWidth type="date" label="Date of Joining"
                  name="dateOfJoining" InputLabelProps={{ shrink: true }}
                  value={formData1.dateOfJoining} InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="date" label="Date of Birth"
                  name="dateOfBirth" InputLabelProps={{ shrink: true }}
                  value={formData1.dateOfBirth} InputProps={{ readOnly: true }}
                />
              </Grid> */}

              <Grid item xs={12} sm={6}>
  <TextField
    fullWidth
    type="date"
    label="Date of Joining"
    name="dateOfJoining"
    InputLabelProps={{ shrink: true }}
    value={formData1.dateOfJoining || getCurrentDate()}
    inputProps={{ max: getCurrentDate() }}  
    onChange={(e) =>
      setFormData1(prev => ({
        ...prev,
        dateOfJoining: e.target.value
      }))
    }
  />
</Grid>

<Grid item xs={12} sm={6}>
  <TextField
    fullWidth
    type="date"
    label="Date of Birth"
    name="dateOfBirth"
    InputLabelProps={{ shrink: true }}
    value={formData1.dateOfBirth  || getCurrentDate()}
    inputProps={{ max: getCurrentDate() }}  
    onChange={(e) =>
      setFormData1(prev => ({
        ...prev,
        dateOfBirth: e.target.value
      }))
    }
  />
</Grid>


              {/* Location */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth
                  sx={{  minWidth: 200, "& .MuiInputBase-root": { height: 60, borderRadius: "10px",fontSize: "16px" },
                  "& .MuiInputLabel-root": {
        fontSize: "16px", // ⬅️ Bigger label text
      }
    }}
                  error={!!errors.location}
                >
                  <InputLabel>Location</InputLabel>
                  <Select name="location" label="Location"
                    value={formData.location} onChange={handleChange}>
                    {locations.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                  </Select>
                  {errors.location && <Typography color="error" variant="caption">{errors.location}</Typography>}
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

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="PAN Number" name="panNumber" value={formData.panNumber} onChange={handleChange}
                  error={!!errors.panNumber} helperText={errors.panNumber || ''} />
              </Grid>

              {/* <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Aadhar Number" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange}
                  error={!!errors.aadharNumber} helperText={errors.aadharNumber || ''} />
              </Grid> */}

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="UAN Number" name="uanNumber" value={formData.uanNumber} onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="PF Number" name="pfNumber" value={formData.pfNumber} onChange={handleChange} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="ESI Number" name="esiNumber" value={formData.esiNumber ?? ""} onChange={handleChange} />
              </Grid>

              <Grid item xs={12}><Divider /><Typography variant="h6" sx={{ mt: 2, display: "flex", gap: 1 }}><AccountBalance /> Bank Details</Typography></Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange}
                  error={!!errors.bankName} helperText={errors.bankName || ''} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Account Number" name="accountNumber" value={formData.accountNumber} onChange={handleChange}
                  error={!!errors.accountNumber} helperText={errors.accountNumber || ''} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="IFSC Code" name="ifscCode" value={formData.ifscCode} onChange={handleChange}
                  error={!!errors.ifscCode} helperText={errors.ifscCode || ''} />
              </Grid>

              {/* Payment Method */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth
                  sx={{ minWidth: 200, "& .MuiInputBase-root": { height: 60, borderRadius: "10px", fontSize: "16px" }, "& .MuiInputLabel-root": {
        fontSize: "16px", // ⬅️ Larger label
      }}}
                  error={!!errors.paymentMethod}
                >
                  <InputLabel>Payment Method</InputLabel>
                  <Select name="paymentMethod" label="Payment Method"
                    value={formData.paymentMethod} onChange={handleChange}>
                    {paymentMethods.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                  </Select>
                  {errors.paymentMethod && <Typography color="error" variant="caption">{errors.paymentMethod}</Typography>}
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
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Basic Pay" type="number" name="basicPay" value={formData.basicPay} onChange={handleChange}
                  error={!!errors.basicPay} helperText={errors.basicPay || ''} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="HRA" type="number" name="houseRentAllowance" value={formData.houseRentAllowance} onChange={handleChange}
                  error={!!errors.houseRentAllowance} helperText={errors.houseRentAllowance || ''} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Medical Allowance" type="number" name="medicalAllowance" value={formData.medicalAllowance} onChange={handleChange}
                  error={!!errors.medicalAllowance} helperText={errors.medicalAllowance || ''} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Conveyance Allowance" type="number" name="conveyanceAllowance" value={formData.conveyanceAllowance} onChange={handleChange}
                  error={!!errors.conveyanceAllowance} helperText={errors.conveyanceAllowance || ''} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Special Allowance" type="number" name="specialAllowance" value={formData.specialAllowance} onChange={handleChange}
                  error={!!errors.specialAllowance} helperText={errors.specialAllowance || ''} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Other Allowance" type="number" name="otherAllowance" value={formData.otherAllowance} onChange={handleChange}
                  error={!!errors.otherAllowance} helperText={errors.otherAllowance || ''} />
              </Grid>

              {/* NEW — Drift Allowance */}
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Drift Allowance" type="number" name="driftAllowance" value={formData.driftAllowance} onChange={handleChange}
                  error={!!errors.driftAllowance} helperText={errors.driftAllowance || ''} />
              </Grid>

              <Grid item xs={12}><Divider /><Typography variant="subtitle1" color="primary">Deductions</Typography></Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Provident Fund" type="number" name="providentFund" value={formData.providentFund} onChange={handleChange}
                  error={!!errors.providentFund} helperText={errors.providentFund || ''} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Professional Tax" type="number" name="professionalTax" value={formData.professionalTax} onChange={handleChange}
                  error={!!errors.professionalTax} helperText={errors.professionalTax || ''} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Income Tax (TDS)" type="number" name="incomeTax" value={formData.incomeTax} onChange={handleChange}
                  error={!!errors.incomeTax} helperText={errors.incomeTax || ''} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Loan Deductions" type="number" name="loanDeductions" value={formData.loanDeductions ?? ""} onChange={handleChange}
                  error={!!errors.loanDeductions} helperText={errors.loanDeductions || ''} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Total Deductions" type="number" name="TotalDeductions" value={formData.TotalDeductions} onChange={handleChange}
                  error={!!errors.TotalDeductions} helperText={errors.TotalDeductions || ''} />
              </Grid>

              {/* Attendance Section */}
              <Grid item xs={12}><Divider /><Typography variant="subtitle1" color="primary" sx={{ display: "flex", gap: 1 }}><CalendarMonth /> Attendance & Days</Typography></Grid>

              {/* Effective From */}
              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="date" label="Effective From"
                  name="effectiveFrom" InputLabelProps={{ shrink: true }}
                  value={formData.effectiveFrom} onChange={handleChange}
                  error={!!errors.effectiveFrom} helperText={errors.effectiveFrom || ''} sx={{ "& .MuiInputBase-root": { height: 55 } }} />
              </Grid>

              {/* Effective To */}
              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="date" label="Effective To"
                  name="effectiveTo" InputLabelProps={{ shrink: true }}
                  value={formData.effectiveTo} onChange={handleChange}
                  error={!!errors.effectiveTo} helperText={errors.effectiveTo || ''} sx={{ "& .MuiInputBase-root": { height: 55 } }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Payable Days" type="number"
                  name="payableDays" value={formData.payableDays} onChange={handleChange}
                  error={!!errors.payableDays} helperText={errors.payableDays || ''} sx={{ "& .MuiInputBase-root": { height: 55 } }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Loss of Pay Days" type="number"
                  name="lossofDaysDays" value={formData.lossofDaysDays} onChange={handleChange}
                  error={!!errors.lossofDaysDays} helperText={errors.lossofDaysDays || ''} sx={{ "& .MuiInputBase-root": { height: 55 } }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Loss of Pay Reversal Days" type="number"
                  name="lossofpayreversalDays" value={formData.lossofpayreversalDays ?? ''} onChange={handleChange}
                  error={!!errors.lossofpayreversalDays} helperText={errors.lossofpayreversalDays || ''} sx={{ "& .MuiInputBase-root": { height: 55 } }} />
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
                            <TableCell align="right"><strong>{totals.totalDeductions.toFixed(2)}</strong></TableCell>
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
    <ToastContainer position="top-right" autoClose={3000} />
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

          <form onSubmit={(e) => e.preventDefault()}>
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
                  <Button variant="contained" type="button" color="primary" startIcon={<Download />} onClick={handleSave}>
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
