import React, { useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Button,
  Divider,
} from "@mui/material";

const JobList= () => {
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    department: "",
    experience: "",
    type: "",
    salaryMin: "",
    salaryMax: "",
    postedOn: "",
    skills: "",
    description: "",
  });

  const departments = [
    "Engineering",
    "Human Resources",
    "Sales",
    "Marketing",
    "Finance",
  ];

  const jobTypes = ["Full-time", "Part-time", "Internship", "Contract", "Remote"];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <Box
      sx={{
        p: 4,
        background: "#f3f5f7",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Card
        sx={{
          width: "950px",
          borderRadius: "18px",
          boxShadow: "0px 8px 26px rgba(0,0,0,0.1)",
          p: 4,
          background: "#fff",
        }}
      >
        <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
          Create Job Opportunity
        </Typography>

        <Typography sx={{ color: "gray", mb: 4 }}>
          Enter job details clearly. All fields are required for publishing.
        </Typography>

        <Divider sx={{ mb: 4 }} />

        {/* ---- FORM GRID ---- */}
        <Grid container spacing={3}>

          {/* Job Title */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Job Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              InputLabelProps={{ sx: { fontSize: 18, fontWeight: 600 } }}
              sx={{
                "& .MuiInputBase-root": {
                  height: 60,
                  fontSize: 17,
                },
              }}
            />
          </Grid>

          {/* Company */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Company Name"
              name="company"
              value={form.company}
              onChange={handleChange}
              InputLabelProps={{ sx: { fontSize: 18, fontWeight: 600 } }}
              sx={{
                "& .MuiInputBase-root": {
                  height: 60,
                  fontSize: 17,
                },
              }}
            />
          </Grid>

          {/* Location */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={form.location}
              onChange={handleChange}
              InputLabelProps={{ sx: { fontSize: 18, fontWeight: 600 } }}
              sx={{
                "& .MuiInputBase-root": {
                  height: 60,
                  fontSize: 17,
                },
              }}
            />
          </Grid>

          {/* Department */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Department"
              name="department"
              value={form.department}
              onChange={handleChange}
              InputLabelProps={{ sx: { fontSize: 18, fontWeight: 600 } }}
              sx={{
                "& .MuiInputBase-root": {
                  height: 60,
                  fontSize: 17,
                },
              }}
            >
              {departments.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Experience */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Experience (e.g., 2–5 years)"
              name="experience"
              value={form.experience}
              onChange={handleChange}
              InputLabelProps={{ sx: { fontSize: 18, fontWeight: 600 } }}
              sx={{
                "& .MuiInputBase-root": {
                  height: 60,
                  fontSize: 17,
                },
              }}
            />
          </Grid>

          {/* Job Type */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Job Type"
              name="type"
              value={form.type}
              onChange={handleChange}
              InputLabelProps={{ sx: { fontSize: 18, fontWeight: 600 } }}
              sx={{
                "& .MuiInputBase-root": {
                  height: 60,
                  fontSize: 17,
                },
              }}
            >
              {jobTypes.map((j) => (
                <MenuItem key={j} value={j}>
                  {j}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Salary Min */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Minimum Salary (in Lakhs)"
              name="salaryMin"
              type="number"
              value={form.salaryMin}
              onChange={handleChange}
              InputLabelProps={{ sx: { fontSize: 18, fontWeight: 600 } }}
              sx={{
                "& .MuiInputBase-root": {
                  height: 60,
                  fontSize: 17,
                },
              }}
            />
          </Grid>

          {/* Salary Max */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Maximum Salary (in Lakhs)"
              name="salaryMax"
              type="number"
              value={form.salaryMax}
              onChange={handleChange}
              InputLabelProps={{ sx: { fontSize: 18, fontWeight: 600 } }}
              sx={{
                "& .MuiInputBase-root": {
                  height: 60,
                  fontSize: 17,
                },
              }}
            />
          </Grid>

          {/* Posted Date */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="date"
              label="Posted Date"
              name="postedOn"
              InputLabelProps={{
                shrink: true,
                sx: { fontSize: 18, fontWeight: 600 },
              }}
              value={form.postedOn}
              onChange={handleChange}
              sx={{
                "& .MuiInputBase-root": {
                  height: 60,
                  fontSize: 17,
                },
              }}
            />
          </Grid>

          {/* Skills */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Skills (comma separated)"
              name="skills"
              value={form.skills}
              onChange={handleChange}
              InputLabelProps={{ sx: { fontSize: 18, fontWeight: 600 } }}
              sx={{
                "& .MuiInputBase-root": {
                  height: 60,
                  fontSize: 17,
                },
              }}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={4}
              label="Job Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              InputLabelProps={{ sx: { fontSize: 18, fontWeight: 600 } }}
              sx={{
                "& .MuiInputBase-root": {
                  fontSize: 17,
                },
              }}
            />
          </Grid>

          {/* Submit */}
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mt: 3,
                py: 2,
                fontSize: "18px",
                fontWeight: 700,
                borderRadius: "12px",
                background: "#1a73e8",
                "&:hover": { background: "#0d47a1" },
              }}
            >
              Publish Job Opportunity
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default JobList;
