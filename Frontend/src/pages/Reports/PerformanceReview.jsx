import React, { useState, useEffect } from "react";
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
  Alert,
  Snackbar,
} from "@mui/material";
import { submitSelfReviewApi } from "../../api/authApi";
import { decodeToken } from "../../api/decodeToekn"; // ✅ Your existing decoder

export default function PerformanceReview() {
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const tokenData = decodeToken(); // Decodes JWT and extracts claims

  // Get UUID from token (critical for backend)
  const empUUID = tokenData?.id || null;

  const [form, setForm] = useState({
    employeeName: storedUser.fullName || tokenData?.name || "Anu",
    employeeCode: storedUser.employeeId || tokenData?.employeeId || "",
    designation: storedUser.designation || "Developer", // token doesn't include this
    employeeRating: null,
    employeeStrengths: "",
    employeeImprovements: "",
    employeeComment: "",
    status: "Pending",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Show error if token is invalid or missing
  useEffect(() => {
    if (!tokenData) {
      setSnackbar({
        open: true,
        message: "Authentication required. Please log in again.",
        severity: "error",
      });
    }
  }, [tokenData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (newValue) => {
    setForm((prev) => ({ ...prev, employeeRating: newValue }));
  };

  const submitSelfReview = async () => {
    if (!empUUID) {
      setSnackbar({
        open: true,
        message: "Employee UUID not found. Please log in again.",
        severity: "error",
      });
      return;
    }

    if (form.employeeRating === null) {
      setSnackbar({
        open: true,
        message: "Please provide your self rating.",
        severity: "warning",
      });
      return;
    }

    const payload = {
      employee_uuid: empUUID, // ✅ From decoded JWT
      employee_name: form.employeeName,
      designation: form.designation,
      self_rating: form.employeeRating,
      self_strengths: form.employeeStrengths,
      self_improvements: form.employeeImprovements,
      self_comments: form.employeeComment,
    };

    try {
      await submitSelfReviewApi(payload);
      setForm((prev) => ({ ...prev, status: "Self Reviewed" }));
      setSnackbar({
        open: true,
        message: "Self review submitted successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Submission error:", err);
      setSnackbar({
        open: true,
        message: "Failed to submit review. Please try again.",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ maxWidth: 850, mx: "auto", mt: 4 }}>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
        Employee Performance Review
      </Typography>

      <Card sx={{ mb: 3, p: 2, backgroundColor: "#eef3ff" }}>
        <Chip
          label={`Status: ${form.status}`}
          color={form.status === "Self Reviewed" ? "success" : "warning"}
          sx={{ fontSize: 16, fontWeight: 600 }}
        />
      </Card>

      <Card sx={{ p: 4, boxShadow: 4 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Self Review
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Employee Name"
              value={form.employeeName}
              fullWidth
              disabled
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Employee ID"
              value={form.employeeCode}
              fullWidth
              disabled
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Designation"
              value={form.designation}
              fullWidth
              disabled
            />
          </Grid>

          <Grid item xs={12}>
            <Typography fontWeight={600} sx={{ mb: 1 }}>
              Self Rating
            </Typography>
            <Rating
              value={form.employeeRating}
              onChange={(e, newValue) => handleRatingChange(newValue)}
              size="large"
              
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Strengths"
              name="employeeStrengths"
              value={form.employeeStrengths}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Areas of Improvement"
              name="employeeImprovements"
              value={form.employeeImprovements}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Comments"
              name="employeeComment"
              value={form.employeeComment}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              fullWidth
              sx={{ py: 2 }}
              onClick={submitSelfReview}
              disabled={form.status === "Self Reviewed"}
            >
              {form.status === "Self Reviewed" ? "Already Submitted" : "Submit Self Review"}
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}