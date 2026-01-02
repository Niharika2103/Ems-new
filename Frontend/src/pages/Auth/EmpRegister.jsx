import React, { useState, useRef } from "react";
import {
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Paper,
  MenuItem,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  employeeRegister,
  employeeUploadExcel,
  employeeBulkInsert,
  clearPreview,
  updatePreviewRow,
  deletePreviewRow,
} from "../../features/auth/employeeSlice";
import { validateEmployeeRegistration } from "../../utils/validation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EmployeePreviewTable from "../../components/EmployeePreviewTable";
import { useLocation } from "react-router-dom";



export default function EmployeeRegisterForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, preview } = useSelector((state) => state.employee);
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const freelancerData = location.state || {};
  const [formData, setFormData] = useState({
    fullName: freelancerData.name || "",
    email: freelancerData.email || "",
    // employeeId: "",
    dateOfJoining: getTodayDate(),
    role: "employee",
    address: "",
    phone: "",
    department: "",
    designation: "",
    employmentType: "",
    // countryCode: "+91",
  });
  const [errors, setErrors] = useState({});
  const [openPreview, setOpenPreview] = useState(false);
  const fileInputRef = useRef(null);
  const [editIndex, setEditIndex] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [rowErrors, setRowErrors] = useState([]);

  // -------------------- Helper --------------------
  const normalizeEmail = (email) => {
    if (!email) return "";
    if (typeof email === "object") {
      if (email.text) return email.text.trim();
      if (email.result) return email.result.trim();
      if (email.richText) return email.richText.map(rt => rt.text).join("").trim();
      return String(email).trim();
    }
    return String(email).trim();
  };
  const validateEmployee = (emp) => {
    const errors = {};
    const validDepartments = ["HR", "Finance", "IT", "Sales"];
    const emailValue = normalizeEmail(emp.email);

    if (!emailValue) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue))
      errors.email = "Invalid email format";

    if (!emp.fullName || !/^[A-Za-z ]{3,}$/.test(emp.fullName))
      errors.fullName = "Full name should have at least 3 letters (alphabets only)";

    if (!emp.phone || !/^[0-9]{10}$/.test(String(emp.phone).trim()))
      errors.phone = "Phone must be 10 digits";

    if (!emp.address || emp.address.length < 5)
      errors.address = "Address should be at least 5 characters";

    if (!emp.department || !validDepartments.includes(emp.department))
      errors.department = "Department must be one of HR, Finance, IT, Sales";


    if (!emp.designation || emp.designation.trim().length < 2) {
      errors.designation = "Designation is required";
    }


    const validTypes = ["freelancer", "contract", "fulltime"];
    if (!emp.employmentType) {
      errors.employmentType = "Employment type is required";
    } else if (!validTypes.includes(emp.employmentType)) {
      errors.employmentType =
        "Employment type must be fulltime, contract, or freelancer";
    }
    if (
      emp.dateOfJoining &&
      (isNaN(Date.parse(emp.dateOfJoining)) ||
        new Date(emp.dateOfJoining) > new Date())
    )
      errors.dateOfJoining = "Invalid date of joining";

    return { errors, validatedEmp: { ...emp, email: emailValue } };
  };

  // -------------------- Handlers --------------------
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateEmployeeRegistration(formData);

    if (Object.keys(validationErrors).length === 0) {
      dispatch(employeeRegister(formData))
        .unwrap()
        .then((res) => {
          toast.success(res.message || "Registration successful!");

          const type = formData.employmentType;

          setFormData({
            fullName: "",
            email: "",
            dateOfJoining: "",
            role: "employee",
            address: "",
            phone: "",
            department: "",
            designation: "",
            employmentType: "",

            // countryCode: "+91",
          });
          if (type === "freelancer") {
            navigate("/dashboard/freelancer/info");
          } else {
            navigate("/dashboard/emp_requestTable");
          }
        })
        .catch((err) => {
          toast.error(err.error || "Registration failed.");
        });
    } else {
      setErrors(validationErrors);
    }
  };

  // Format date to YYYY-MM-DD for date input
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d)) return "";
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleEdit = (index, row) => {
    setEditIndex(index);
    setEditRow({
      ...row,
      email: normalizeEmail(row.email), // make sure email is string
      fullName: row.fullName || "",
      phone: row.phone || "",
      address: row.address || "",
      dateOfJoining: formatDate(row.dateOfJoining), // format for date input
      department: row.department || "",
      designation: row.designation || "",           // <-- add
      employmentType: row.employmentType || "",

    });
  };


  const handleChangeRow = (key, value) => {
    setEditRow({ ...editRow, [key]: value });
  };

  const handleSave = (index) => {
    // Normalize email and date before saving
    const updatedRow = {
      ...editRow,
      email: normalizeEmail(editRow.email),
      // dateOfJoining: editRow.dateOfJoining ? formatDate(editRow.dateOfJoining) : null,
      dateOfJoining: editRow.dateOfJoining || null,

    };

    dispatch(updatePreviewRow({ index, updatedRow })); // save to redux preview
    setEditIndex(null);
    setEditRow({});
  };


  const handleDelete = (index) => {
    dispatch(deletePreviewRow(index));
  };

  const handleAddEmployees = async () => {
    if (preview.length === 0) return;

    let isValid = true;
    let allErrors = [];
    const cleanedEmployees = [];

    preview.forEach((emp, index) => {
      const { errors: empErrors, validatedEmp } = validateEmployee(emp);
      if (Object.keys(empErrors).length > 0) {
        isValid = false;
        allErrors.push({ index, errors: empErrors });
      } else {
        cleanedEmployees.push({
          fullName: validatedEmp.fullName.trim(),
          email: validatedEmp.email.trim(),
          phone: String(validatedEmp.phone).trim(),
          address: validatedEmp.address.trim(),
          department: validatedEmp.department.trim(),
          designation: validatedEmp.designation.trim(),
          employmentType: validatedEmp.employmentType.trim(),
          dateOfJoining: validatedEmp.dateOfJoining
            ? String(validatedEmp.dateOfJoining).trim()
            : null,
        });
      }
    });

    if (!isValid) {
      setRowErrors(allErrors);
      return;
    }

    // Remove duplicates
    const uniqueEmployees = [];
    const seenEmails = new Set();
    for (const emp of cleanedEmployees) {
      if (!seenEmails.has(emp.email)) {
        seenEmails.add(emp.email);
        uniqueEmployees.push(emp);
      }
    }

    if (uniqueEmployees.length === 0) {
      toast.error("No valid employees to insert. Please check your Excel file.");
      return;
    }

    try {
      await dispatch(employeeBulkInsert({ employees: uniqueEmployees })).unwrap();
      toast.success("Employees inserted successfully!");
      dispatch(clearPreview());
      setOpenPreview(false);
      navigate("/dashboard/emp_requestTable");
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    dispatch(employeeUploadExcel(formData))
      .unwrap()
      .then((res) => {
        if (res.preview?.length > 0) {
          setOpenPreview(true);
        } else {
          toast.warning("No valid employees found in uploaded file(s).");
        }
      })
      .catch((err) => toast.error(err.message || "Error processing file(s)."));
  };

  // -------------------- JSX --------------------
  return (
    <Box className="flex justify-center items-center bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Paper elevation={4} sx={{ p: 4, width: "100%", borderRadius: "16px", bgcolor: "white" }}>
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
          Employee Registration Form
        </Typography>

        {/* Upload Excel */}
        <Box mb={3} textAlign="center">
          <Button variant="outlined" component="label">
            Upload Excel File(s)
            <input
              type="file"
              hidden
              accept=".xlsx,.xls"
              multiple
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
          </Button>
          <Button
            variant="outlined"
            disabled={preview.length === 0 || loading}
            onClick={() => setOpenPreview(true)}
            sx={{ ml: 2 }}
          >
            Preview Employees
          </Button>
        </Box>


        {/* Single employee form */}
        <Box>
          <Grid container spacing={3}>
            {/* Row 1: 4 fields */}
            <Grid item xs={12} sm={3}>
              <TextField
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.fullName}
                helperText={errors.fullName}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Email ID"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.email}
                helperText={errors.email}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                type="date"
                label="Date of Joining"
                name="dateOfJoining"
                value={formData.dateOfJoining || ""}
                onChange={handleChange}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: getTodayDate() }}
                error={!!errors.dateOfJoining}
                helperText={errors.dateOfJoining}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
  <TextField
    label="Phone Number"
    name="phone"
    value={formData.phone}
    fullWidth
    size="small"
    required
    error={!!errors.phone}
    helperText={errors.phone || "Enter 10-digit mobile number"}
    inputProps={{
      inputMode: "numeric",
      pattern: "[0-9]*",
      maxLength: 10,
    }}
    onChange={(e) => {
      const value = e.target.value.replace(/\D/g, ""); // ❌ remove letters
      if (value.length <= 10) {
        setFormData({ ...formData, phone: value });
      }
    }}
  />
</Grid>


            {/* Row 2: 2 fields */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.address}
                helperText={errors.address}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                size="small"
                name="department"
                label="Department"
                value={formData.department || ""}
                onChange={handleChange}
                error={!!errors.department}
                helperText={errors.department}
                required
                sx={{
                  minWidth: 200,
                  maxWidth: 400,
                  '& .MuiInputBase-root': {
                    height: 40,
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '10px 14px',
                  },
                }}
              >
                <MenuItem value="">Select Department</MenuItem>
                <MenuItem value="HR">HR</MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
                <MenuItem value="IT">IT</MenuItem>
                <MenuItem value="Sales">Sales</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.designation}
                helperText={errors.designation}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                size="small"
                name="employmentType"
                label="Employment Type"
                value={formData.employmentType || ""}
                onChange={handleChange}
                error={!!errors.employmentType}
                helperText={errors.employmentType}
                required
                sx={{
                  minWidth: 200,
                  maxWidth: 400,
                  "& .MuiInputBase-root": { height: 40 },
                  "& .MuiOutlinedInput-input": { padding: "10px 14px" },
                }}
              >
                <MenuItem value="">Select Type</MenuItem>
                <MenuItem value="fulltime">Full Time</MenuItem>
                <MenuItem value="contract">Contract</MenuItem>
                <MenuItem value="freelancer">Freelancer</MenuItem>
              </TextField>
            </Grid>


            <Grid item xs={12} textAlign="center">
              <Button
                variant="contained"
                sx={{ px: 8, py: 1.2 }}
                disabled={loading}
                onClick={handleSubmit}   //  call directly
              >
                {loading ? "Registering..." : "Register"}
              </Button>
            </Grid>

          </Grid>
        </Box>


        {preview.length > 0 && (
          <EmployeePreviewTable
            open={openPreview}
            onClose={() => setOpenPreview(false)}
            preview={preview}
            rowErrors={rowErrors}
            editIndex={editIndex}
            editRow={editRow}
            handleEdit={handleEdit}
            handleSave={handleSave}
            handleChangeRow={handleChangeRow}
            handleDelete={handleDelete}
            handleAddEmployees={handleAddEmployees}
          />
        )}
      </Paper>
    </Box>
  );
}