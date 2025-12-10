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

export default function PerformanceReview() {
  const [role, setRole] = useState("employee"); // employee OR tl

  const [form, setForm] = useState({
    employeeName: "",
    employeeId: "",
    designation: "",
    employeeRating: null,
    employeeStrengths: "",
    employeeImprovements: "",
    employeeComment: "",
    status: "Pending",
  });

  const [showLetter, setShowLetter] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitSelfReview = () => {
    if (!form.employeeRating) return alert("Please give your self rating");
    setForm({ ...form, status: "Self Reviewed" });
    alert("Self Review Submitted");
  };

  const approveReview = () => {
    if (!form.tlRating) return alert("TL rating required");
    setForm({ ...form, status: "Approved" });
    setShowLetter(true);
  };

  return (
    <Box sx={{ maxWidth: 850, mx: "auto", mt: 4 }}>

      <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
        Employee Performance Review
      </Typography>

      <Card sx={{ mb: 3, p: 2, background: "#eef3ff" }}>
        <Chip
          label={`Status: ${form.status}`}
          color={form.status === "Approved" ? "success" : "warning"}
          sx={{ fontSize: 16, p: 2 }}
        />
      </Card>

      {/* ====================== SELF REVIEW (EMPLOYEE) ====================== */}
      {!showLetter && role === "employee" && (
        <Card sx={{ p: 4, boxShadow: 4 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Employee Self Review
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Employee Name"
                name="employeeName"
                value={form.employeeName}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Employee ID"
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Designation"
                name="designation"
                value={form.designation}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <Typography fontWeight={600}>Self Rating</Typography>
              <Rating
                value={form.employeeRating}
                onChange={(e, val) =>
                  setForm({ ...form, employeeRating: val })
                }
                size="large"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Key Strengths"
                name="employeeStrengths"
                multiline
                rows={3}
                fullWidth
                value={form.employeeStrengths}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Areas of Improvement"
                name="employeeImprovements"
                multiline
                rows={3}
                fullWidth
                value={form.employeeImprovements}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Self Comments"
                name="employeeComment"
                multiline
                rows={4}
                fullWidth
                value={form.employeeComment}
                onChange={handleChange}
              />
            </Grid>

           <Grid item xs={12}>
              <Button
                variant="contained"
                fullWidth
                sx={{ py: 2 }}
                onClick={submitSelfReview}
              >
                Submit Self Review
              </Button>
            </Grid>
          </Grid>
        </Card>
      )}

      {/* ====================== TL REVIEW (TL MODE) ====================== */}
      {!showLetter && role === "tl" && form.status !== "Approved" && (
        <Card sx={{ p: 4, boxShadow: 4 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Team Lead Review
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {/* EMPLOYEE DETAILS READONLY */}
          <Typography><strong>Name:</strong> {form.employeeName}</Typography>
          <Typography><strong>ID:</strong> {form.employeeId}</Typography>
          <Typography><strong>Designation:</strong> {form.designation}</Typography>

          <Divider sx={{ my: 2 }} />

          <Typography><strong>Employee Rating:</strong></Typography>
          <Rating value={form.employeeRating} readOnly />

          <Typography sx={{ mt: 2 }}><strong>Employee Strengths:</strong></Typography>
          <Typography>{form.employeeStrengths}</Typography>

          <Typography sx={{ mt: 2 }}><strong>Employee Improvements:</strong></Typography>
          <Typography>{form.employeeImprovements}</Typography>

          <Typography sx={{ mt: 2 }}><strong>Self Comments:</strong></Typography>
          <Typography>{form.employeeComment}</Typography>

          <Divider sx={{ my: 3 }} />

          <Typography fontWeight={600}>TL Rating</Typography>
          <Rating
            value={form.tlRating}
            onChange={(e, val) => setForm({ ...form, tlRating: val })}
            size="large"
          />

          <TextField
            label="TL Final Comments"
            multiline
            rows={4}
            fullWidth
            sx={{ mt: 2 }}
            name="tlComment"
            value={form.tlComment}
            onChange={handleChange}
          />

          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 3, py: 2 }}
            onClick={approveReview}
          >
            Approve & Generate Letter
          </Button>
        </Card>
      )}

      {/* ====================== FINAL LETTER ====================== */}
      {showLetter && (
        <Card sx={{ p: 4, mt: 4, boxShadow: 5, background: "#f6fff6" }}>
          <Typography variant="h5" fontWeight={700}>
            Performance Appraisal Letter
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography><strong>Name:</strong> {form.employeeName}</Typography>
          <Typography><strong>ID:</strong> {form.employeeId}</Typography>
          <Typography><strong>Designation:</strong> {form.designation}</Typography>

          <Typography sx={{ mt: 3 }}><strong>Employee Rating:</strong></Typography>
          <Rating value={form.employeeRating} readOnly />

          <Typography sx={{ mt: 3 }}><strong>TL Rating:</strong></Typography>
          <Rating value={form.tlRating} readOnly />

          <Typography sx={{ mt: 3 }}><strong>TL Comments:</strong></Typography>
          <Typography>{form.tlComment}</Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body1">
            This official appraisal letter acknowledges your performance for the
            evaluation period.
          </Typography>

          <Typography sx={{ mt: 4 }}><strong>— Team Lead</strong></Typography>
        </Card>
      )}
    </Box>
  );
}
