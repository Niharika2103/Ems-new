import React, { useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Rating,
  Button,
  Divider,
  Chip,
  Grid,
} from "@mui/material";

export default function AdminPerformanceReview() {
  const [form, setForm] = useState({
    employeeName: "John Doe",
    employeeId: "EMP123",
    designation: "Software Engineer",
    employeeRating: 4,
    employeeStrengths: "Teamwork, leadership, punctuality",
    employeeImprovements: "Better communication needed",
    employeeComment: "I have improved in backend and want to work on frontend.",
    tlRating: null,
    tlComment: "",
    status: "Pending", // Pending -> Approved / Rejected
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const updateTLRating = (value) => {
    setForm({ ...form, tlRating: value });
  };

  const approveLetter = () => {
    setForm({ ...form, status: "Approved" });
    alert("Performance Review Approved");
  };

  const rejectLetter = () => {
    setForm({ ...form, status: "Rejected" });
    alert("Performance Review Rejected");
  };

  return (
    <Box sx={{ maxWidth: 850, mx: "auto", mt: 4 }}>

      <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
        Admin – Performance Review Approval
      </Typography>

      <Card sx={{ mb: 3, p: 2, background: "#eef3ff" }}>
        <Chip
          label={`Status: ${form.status}`}
          color={
            form.status === "Approved"
              ? "success"
              : form.status === "Rejected"
              ? "error"
              : "warning"
          }
          sx={{ fontSize: 16, p: 2 }}
        />
      </Card>

      <Card sx={{ p: 4, boxShadow: 4 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Employee Self Review (Read Only)
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Employee Info */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Employee Name"
              value={form.employeeName}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Employee ID"
              value={form.employeeId}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Designation"
              value={form.designation}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>

          {/* Employee Self Rating */}
          <Grid item xs={12}>
            <Typography fontWeight={600}>Self Rating</Typography>
            <Rating value={form.employeeRating} readOnly />
          </Grid>

          {/* Strengths */}
          <Grid item xs={12}>
            <TextField
              label="Employee Strengths"
              value={form.employeeStrengths}
              multiline
              rows={3}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>

          {/* Improvements */}
          <Grid item xs={12}>
            <TextField
              label="Areas of Improvement"
              value={form.employeeImprovements}
              multiline
              rows={3}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>

          {/* Self Comments */}
          <Grid item xs={12}>
            <TextField
              label="Self Comments"
              value={form.employeeComment}
              multiline
              rows={4}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>

          {/* ================== TL Review (Editable Only for TL Fields) ================== */}
          <Grid item xs={12}>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              TL Review (Editable)
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography fontWeight={600}>TL Rating</Typography>
            <Rating
              value={form.tlRating}
              onChange={(e, val) => updateTLRating(val)}
              size="large"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="TL Final Comments"
              value={form.tlComment}
              onChange={handleChange}
              name="tlComment"
              multiline
              rows={4}
              fullWidth
            />
          </Grid>

          {/* ================== Approve / Reject Buttons ================== */}
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              sx={{ py: 2 }}
              onClick={approveLetter}
            >
              Approve
            </Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              color="error"
              fullWidth
              sx={{ py: 2 }}
              onClick={rejectLetter}
            >
              Reject
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}
