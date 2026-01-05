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

import { submitSelfReviewApi, getEmployeePerformanceReviewApi } from "../../api/authApi";
import { decodeToken } from "../../api/decodeToekn";

export default function PerformanceReview() {

  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const tokenData = decodeToken();

  const empUUID = tokenData?.id || null;

  const [form, setForm] = useState({
    employeeName: storedUser.fullName || tokenData?.name || "",
    employeeCode: storedUser.employeeId || tokenData?.employeeId || "",
    designation: storedUser.designation || "",
    employeeRating: null,
    employeeStrengths: "",
    employeeImprovements: "",
    employeeComment: "",
    status: "Pending",
    tlRating: null,
    tlComments: ""
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ================= FETCH EXISTING REVIEW =================
  useEffect(() => {
    if (!empUUID) return;

    const fetchReview = async () => {
      try {
        const res = await getEmployeePerformanceReviewApi(empUUID);

       setForm(prev => ({
  ...prev,
  employeeName: res.data.employee_name,
  designation: res.data.designation,
  employeeCode: res.data.employee_code,
  employeeRating: res.data.self_rating,
  employeeStrengths: res.data.self_strengths || "",
  employeeImprovements: res.data.self_improvements || "",
  employeeComment: res.data.self_comments || "",
  status: res.data.status,
  tlRating: res.data.tl_rating,
  tlComments: res.data.tl_comments
}));

      } catch (err) {
        console.log("No existing review yet");
      }
    };

    fetchReview();

    // 🔁 auto refresh every 10 seconds
    const interval = setInterval(fetchReview, 10000);

    return () => clearInterval(interval);
  }, [empUUID]);

  // ================= FORM INPUT HANDLERS =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (newValue) => {
    setForm(prev => ({ ...prev, employeeRating: newValue }));
  };

  // ================= SUBMIT SELF REVIEW =================
  const submitSelfReview = async () => {
    if (!empUUID) {
      setSnackbar({
        open: true,
        message: "Employee UUID not found. Please login again.",
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
      employee_uuid: empUUID,
      employee_name: form.employeeName,
      designation: form.designation,
      self_rating: form.employeeRating,
      self_strengths: form.employeeStrengths,
      self_improvements: form.employeeImprovements,
      self_comments: form.employeeComment,
    };

    try {
      await submitSelfReviewApi(payload);

      setForm(prev => ({
        ...prev,
        status: "Self Reviewed",
      }));

      setSnackbar({
        open: true,
        message: "Self review submitted successfully!",
        severity: "success",
      });

    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Failed to submit review. Try again.",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ maxWidth: 850, mx: "auto", mt: 4 }}>

      <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
        Employee Performance Review
      </Typography>

      {/* STATUS */}
      <Card sx={{ mb: 3, p: 2, backgroundColor: "#eef3ff" }}>
        <Chip
          label={`Status: ${form.status}`}
          color={
            form.status === "Approved"
              ? "success"
              : form.status === "Rejected"
              ? "error"
              : "warning"
          }
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
            <TextField label="Employee Name" value={form.employeeName} fullWidth disabled />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField label="Employee ID" value={form.employeeCode} fullWidth disabled />
          </Grid>

          <Grid item xs={12}>
            <TextField label="Designation" value={form.designation} fullWidth disabled />
          </Grid>

          <Grid item xs={12}>
            <Typography fontWeight={600}>Self Rating</Typography>
            <Rating
              value={form.employeeRating}
              onChange={(e, newValue) => handleRatingChange(newValue)}
              size="large"
              disabled={form.status !== "Pending" && form.status !== "Self Reviewed"}
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
              disabled={form.status !== "Pending" && form.status !== "Self Reviewed"}
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
              disabled={form.status !== "Pending" && form.status !== "Self Reviewed"}
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
              disabled={form.status !== "Pending" && form.status !== "Self Reviewed"}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              fullWidth
              sx={{ py: 2 }}
              onClick={submitSelfReview}
              disabled={form.status === "Self Reviewed" || form.status === "Approved"}
            >
              {form.status === "Approved"
                ? "Approved by Admin"
                : form.status === "Self Reviewed"
                ? "Already Submitted"
                : "Submit Self Review"}
            </Button>
          </Grid>

          {/* ================= SHOW TL REVIEW TO EMPLOYEE ================= */}
          {(form.tlRating || form.tlComments) && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" fontWeight={600}>
                  Team Lead Review
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography fontWeight={600}>TL Rating</Typography>
                <Rating value={form.tlRating || 0} readOnly size="large" />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="TL Comments"
                  value={form.tlComments || ""}
                  multiline
                  rows={3}
                  fullWidth
                  disabled
                />
              </Grid>
            </>
          )}
        </Grid>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
