import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Snackbar,
  Alert,
  Grid
} from "@mui/material";
import { useState, useEffect } from "react";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useDispatch, useSelector } from "react-redux";
import { createReferral } from "../features/auth/employeeSlice";
import { getMyEmployeeProfileApi } from "../api/authApi";


export default function ReferralForm() {
  const dispatch = useDispatch();

  
// const storedUser = JSON.parse(localStorage.getItem("user"));
// const referrerName = storedUser?.name || storedUser?.fullName || "";
// const employeeId   = storedUser?.employeeId || "";

const [referrerName, setReferrerName] = useState("");
const [employeeId, setEmployeeId] = useState("");

useEffect(() => {
  getMyEmployeeProfileApi()
    .then((res) => {
      const data = res.data.data;
      setReferrerName(data.employee_name);
      setEmployeeId(data.employee_id);
    })
    .catch((err) => {
      console.error("Failed to fetch employee profile", err);
    });
}, []);

const { referralLoading, referralError, referralSuccess } = useSelector((state) => state.employee);

  

  const [form, setForm] = useState({
    candidate_name: "",
    candidate_email: "",
    phone_number: "",
    position: "", 
    experience: "",
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleResume = (e) => {
    const file = e.target.files[0];

    if (file && file.type !== "application/pdf") {
      setSnackbar({
        open: true,
        message: "Only PDF files allowed",
        type: "error",
      });
      return;
    }
    setResumeFile(file);
  };

  const handleSubmit = () => {
    if (
      !form.candidate_name ||
      !form.candidate_email ||
      !form.phone_number ||
       !form.position || 
      !resumeFile
    ) {
      setSnackbar({
        open: true,
        message: "All fields are required",
        type: "error",
      });
      return;
    }

    const fd = new FormData();
    fd.append("candidate_name", form.candidate_name);
    fd.append("candidate_email", form.candidate_email);
    fd.append("phone_number", form.phone_number);
    fd.append("work_exp", form.experience);
    fd.append("position", form.position || "Not Provided");
    fd.append("resume", resumeFile);

    dispatch(createReferral(fd))
      .unwrap()
      .then(() => {
        setSnackbar({
          open: true,
          message: "Referral Submitted Successfully!",
          type: "success",
        });
        setForm({
          candidate_name: "",
          candidate_email: "",
          phone_number: "",
          experience: "",
        });
        setResumeFile(null);
      })
      .catch((err) => {
        setSnackbar({
          open: true,
          message: err?.error || "Error submitting referral",
          type: "error",
        });
      });
  };

  return (
    <Paper elevation={4} sx={{ p: 4, borderRadius: "16px", mb: 4 }}>
      <Typography variant="h6" mb={3} fontWeight={500}>
        Submit a Referral
      </Typography>

      <Grid container spacing={3}>

        {/* Auto-fetched fields (disabled) */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Referrer Name"
            value={referrerName}
            disabled
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Employee ID"
            value={employeeId}
            disabled
          />
        </Grid>

        {/* Candidate details */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Candidate Full Name"
            name="candidate_name"
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email ID"
            name="candidate_email"
            type="email"
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Phone Number"
            name="phone_number"
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Button
            variant="outlined"
            fullWidth
            component="label"
            startIcon={<UploadFileIcon />}
          >
            Upload Resume (PDF)
            <input type="file" hidden onChange={handleResume} />
          </Button>
          {resumeFile && (
            <Typography fontSize={14} mt={1}>
              Selected: {resumeFile.name}
            </Typography>
          )}
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Work Experience"
            name="experience"
            multiline
            rows={3}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
  <TextField
    fullWidth
    label="Position"
    name="position"
    value={form.position}
    onChange={handleChange}
    required
  />
</Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleSubmit}
            disabled={referralLoading}
          >
            {referralLoading ? "Submitting..." : "Submit Referral"}
          </Button>
        </Grid>
      </Grid>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.type}>{snackbar.message}</Alert>
      </Snackbar>
    </Paper>
  );
}
