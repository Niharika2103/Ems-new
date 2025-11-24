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
import { useState } from "react";
import UploadFileIcon from "@mui/icons-material/UploadFile";

export default function ReferralForm() {
  const [form, setForm] = useState({
    employeeId: "EMP56789",
    referrerName: "John Doe",
    fullName: "",
    email: "",
    phone: "",
    experience: "",
    resume: null,
  });

  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleResume = (e) => {
    const file = e.target.files[0];

    if (file?.type !== "application/pdf") {
      setError("Only PDF files allowed");
      return;
    }

    setForm({ ...form, resume: file });
  };

  const handleSubmit = () => {
    if (!form.fullName || !form.email || !form.phone || !form.resume) {
      setError("All fields are required");
      return;
    }
    setOpen(true);
  };

  return (
    <Paper 
      elevation={4}
      sx={{ p: 4, borderRadius: "16px", mb: 4 }}
    >
      <Typography variant="h6" mb={3} fontWeight={500}>
        Submit a Referral
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Referrer Name" value={form.referrerName} disabled />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Employee ID" value={form.employeeId} disabled />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Candidate Full Name" name="fullName" onChange={handleChange} />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Email ID" name="email" onChange={handleChange} />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Phone Number" name="phone" onChange={handleChange} />
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

        <Grid item xs={12}>
          <Button variant="contained" fullWidth size="large" onClick={handleSubmit}>
            Submit Referral
          </Button>
        </Grid>
      </Grid>

      {/* Snackbars */}
      <Snackbar open={open} autoHideDuration={3000} onClose={() => setOpen(false)}>
        <Alert severity="success">Referral Submitted Successfully!</Alert>
      </Snackbar>

      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError("")}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Paper>
  );
}
