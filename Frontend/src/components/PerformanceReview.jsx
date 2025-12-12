import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Rating,
  Button,
  Divider,
  Grid,
} from "@mui/material";

export default function PerformanceLetter() {
  const [form, setForm] = useState({
    employeeName: "",
    employeeId: "",
    designation: "",
    tlRating: null,
    strengths: "",
    improvements: "",
    finalComments: "",
    status: "Draft", // Draft → Submitted → Released
  });

  const [letterGenerated, setLetterGenerated] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generateLetter = () => {
    if (
      !form.employeeName ||
      !form.employeeId ||
      !form.designation ||
      !form.tlRating
    ) {
      alert("Please fill required fields.");
      return;
    }
    setLetterGenerated(true);
    setForm({ ...form, status: "Released" });
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
        Performance Letter – TL Panel
      </Typography>

      {/* ------------------ TL PERFORMANCE FORM ------------------ */}
      {!letterGenerated && (
        <Card sx={{ p: 4, boxShadow: 4 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Fill Performance Details
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Employee Name"
                name="employeeName"
                fullWidth
                value={form.employeeName}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Employee ID"
                name="employeeId"
                fullWidth
                value={form.employeeId}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={12}>
              <TextField
                label="Designation"
                name="designation"
                fullWidth
                value={form.designation}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Typography fontWeight={600} sx={{ mb: 1 }}>
                Performance Rating (1–5)
              </Typography>
              <Rating
                name="tlRating"
                value={form.tlRating}
                onChange={(e, val) => setForm({ ...form, tlRating: val })}
                size="large"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Key Strengths"
                multiline
                rows={3}
                name="strengths"
                fullWidth
                value={form.strengths}
                onChange={handleChange}
                placeholder="Example: Leadership, punctuality, high code quality..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Areas of Improvement"
                multiline
                rows={3}
                name="improvements"
                fullWidth
                value={form.improvements}
                onChange={handleChange}
                placeholder="Example: Communication, documentation, domain knowledge..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Final Comments by TL"
                multiline
                rows={4}
                name="finalComments"
                fullWidth
                value={form.finalComments}
                onChange={handleChange}
                placeholder="Write the concluding remarks..."
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{ py: 1.5, borderRadius: 2 }}
                onClick={generateLetter}
              >
                Generate Performance Letter
              </Button>
            </Grid>
          </Grid>
        </Card>
      )}

      {/* ------------------ GENERATED PERFORMANCE LETTER ------------------ */}
      {letterGenerated && (
        <Card sx={{ p: 4, mt: 4, boxShadow: 4, background: "#f8fdf8" }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
            Performance Letter
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ mb: 2 }}>
            <Typography><strong>Employee Name:</strong> {form.employeeName}</Typography>
            <Typography><strong>Employee ID:</strong> {form.employeeId}</Typography>
            <Typography><strong>Designation:</strong> {form.designation}</Typography>
          </Box>

          <Typography sx={{ mt: 3 }}><strong>Performance Rating:</strong></Typography>
          <Rating value={form.tlRating} readOnly />

          <Typography sx={{ mt: 3 }}><strong>Strengths:</strong></Typography>
          <Typography>{form.strengths}</Typography>

          <Typography sx={{ mt: 3 }}><strong>Areas of Improvement:</strong></Typography>
          <Typography>{form.improvements}</Typography>

          <Typography sx={{ mt: 3 }}><strong>Final Comments:</strong></Typography>
          <Typography>{form.finalComments}</Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body1">
            This performance letter is issued based on your overall contribution
            and achievements during the evaluation cycle. Keep up the good work!
          </Typography>

          <Typography sx={{ mt: 4 }}><strong>— Team Lead</strong></Typography>
        </Card>
      )}
    </Box>
  );
}
