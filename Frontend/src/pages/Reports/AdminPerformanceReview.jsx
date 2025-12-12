// AdminPerformanceReview.jsx
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
  Snackbar,
  Alert,
} from "@mui/material";
import { updateTLReviewApi } from "../../api/authApi";

export default function AdminPerformanceReview({ employee, onStatusChange }) {
  const [form, setForm] = useState({
    id: employee.review_id,
    employeeName: employee.employee_name,
    employeeCode: employee.employee_code,
    designation: employee.designation,
    selfRating: employee.self_rating,
    tlRating: employee.tl_rating || null,
    tlComment: employee.tl_comments || "",
    status: employee.status,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const updateTLRating = (val) => {
    setForm((prev) => ({ ...prev, tlRating: val }));
  };

  const handleCommentChange = (e) => {
    setForm((prev) => ({ ...prev, tlComment: e.target.value }));
  };

  const submitTLReview = async (status) => {
    if (form.tlRating === null) {
      setSnackbar({
        open: true,
        message: "Please provide a TL rating.",
        severity: "warning",
      });
      return;
    }

    try {
      await updateTLReviewApi(form.id, {
        tl_rating: form.tlRating,
        tl_comments: form.tlComment,
        status,
      });

      setSnackbar({
        open: true,
        message: `Review ${status.toLowerCase()} successfully!`,
        severity: "success",
      });

      // Close after short delay
      setTimeout(() => {
        onStatusChange();
      }, 1000);
    } catch (err) {
      console.error("Update error:", err);
      setSnackbar({
        open: true,
        message: "Failed to update review. Please try again.",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ maxWidth: 850, mx: "auto", mt: 4 }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
        Admin – Performance Review Approval
      </Typography>

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

      <Card sx={{ p: 4 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Employee Self Review
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={6}>
            <TextField label="Name" value={form.employeeName} fullWidth disabled />
          </Grid>

          <Grid item xs={6}>
            <TextField label="Employee ID" value={form.employeeCode} fullWidth disabled />
          </Grid>

          <Grid item xs={12}>
            <TextField label="Designation" value={form.designation} fullWidth disabled />
          </Grid>

          <Grid item xs={12}>
            <Typography fontWeight={600}>Self Rating</Typography>
            <Rating value={form.selfRating || 0} readOnly size="large" />
          </Grid>

          {/* TL Review Section */}
          <Grid item xs={12}>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" fontWeight={600}>
              TL Review
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography fontWeight={600}>TL Rating</Typography>
            <Rating
              value={form.tlRating || 0}
              onChange={(e, val) => updateTLRating(val)}
              size="large"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="TL Comments"
              value={form.tlComment}
              onChange={handleCommentChange}
              multiline
              rows={4}
              fullWidth
            />
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={6}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              sx={{ py: 2 }}
              onClick={() => submitTLReview("Approved")}
            >
              Approve
            </Button>
          </Grid>

          <Grid item xs={6}>
            <Button
              variant="contained"
              color="error"
              fullWidth
              sx={{ py: 2 }}
              onClick={() => submitTLReview("Rejected")}
            >
              Reject
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}