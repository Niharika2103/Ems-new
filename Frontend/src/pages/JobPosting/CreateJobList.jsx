import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAdminJobPostApi } from "../../api/authApi";

import {
  Box,
  Card,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Button,
  Divider,
  Chip,
  InputAdornment,
  Container,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  WorkOutline,
  BusinessCenter,
  LocationOn,
  AttachMoney,
  CalendarToday,
  Code,
  Description,
  CorporateFare,
  Schedule,
  TrendingUp,
  Category,
} from "@mui/icons-material";

const JobList = () => {
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);
  // Function to get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    department: "",
    experience: "",
    type: "",
    salaryMin: "",
    salaryMax: "",
    postedOn:getCurrentDate(),
    skills: "",
    description: "",
  });

  const departments = [
    "Engineering",
    "Human Resources",
    "Sales",
    "Marketing",
    "Finance",
    "Operations",
    "Information Technology",
    "Product Management",
    "Research & Development",
    "Customer Success"
  ];

  const jobTypes = [
    "Full-time",
    "Part-time", 
    "Internship",
    "Contract",
    "Remote",
    "Hybrid"
  ];

  const experienceLevels = [
    "Entry Level (0-2 years)",
    "Junior (2-4 years)",
    "Mid-Level (4-7 years)",
    "Senior (7-10 years)",
    "Lead (10+ years)"
  ];

  const locations = [
    "Bangalore, India",
    "Hyderabad, India", 
    "Pune, India",
    "Gurgaon, India",
    "Mumbai, India",
    "Chennai, India",
    "Remote - India",
    "United States",
    "Europe",
    "Asia Pacific"
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // CORRECT PAYLOAD (matching your backend)
    const payload = {
      job_title: form.title,
      company: form.company,
      experience: form.experience,
      description: form.description,
      requirements: form.skills,
      salary_range: `${form.salaryMin} - ${form.salaryMax} LPA`,
      location: form.location,
      created_by: "ADMIN_ID_HERE",
      department: form.department,
      employment_type: form.type,
      posted_on: form.postedOn,
      status: "PUBLISHED",  // 🔥 Must include this
    };

    const res = await createAdminJobPostApi(payload);

    console.log("Job Created:", res.data);

    setOpenSnackbar(true);

    setTimeout(() => {
      navigate("/published-jobs");
    }, 1000);

  } catch (error) {
    console.error("Error creating job:", error);
  } finally {
    setLoading(false);
  }
};



  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
          py: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Container maxWidth="md">
          <Paper
            elevation={1}
            sx={{
              borderRadius: "12px",
              overflow: "hidden",
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                backgroundColor: "#5086dbff",
                color: "white",
                p: 4,
                borderBottom: "1px solid #334155",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <BusinessCenter 
                  sx={{ 
                    fontSize: 32, 
                    mr: 2,
                    color: "#60a5fa"
                  }} 
                />
                <Box>
                  <Typography variant="h4" fontWeight={600} sx={{ mb: 0.5 }}>
                    Create Job Posting
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#cbd5e1", fontWeight: 400 }}>
                    Fill in the details to publish a new job opportunity
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Form Section */}
            <Box component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
              <Grid container spacing={3}>
                
                {/* Job Title */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: "#374151" }}>
                    Job Title *
                  </Typography>
                  <TextField
                    fullWidth
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Senior Frontend Developer"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WorkOutline sx={{ color: "#6b7280", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                        "&:hover fieldset": {
                          borderColor: "#3b82f6",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#3b82f6",
                          borderWidth: "1px",
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Company */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: "#374151" }}>
                    Company *
                  </Typography>
                  <TextField
                    fullWidth
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Tech Solutions Inc."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CorporateFare sx={{ color: "#6b7280", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                      },
                    }}
                  />
                </Grid>

                {/* Location */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: "#374151" }}>
                    Location *
                  </Typography>
                  <TextField
                    fullWidth
                    select
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn sx={{ color: "#6b7280", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                      },
                    }}
                  >
                    {locations.map((location) => (
                      <MenuItem 
                        key={location} 
                        value={location}
                        sx={{ fontSize: 14, py: 1.5 }}
                      >
                        {location}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Department */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: "#374151" }}>
                    Department *
                  </Typography>
                  <TextField
                    fullWidth
                    select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Category sx={{ color: "#6b7280", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                      },
                    }}
                  >
                    {departments.map((dept) => (
                      <MenuItem 
                        key={dept} 
                        value={dept}
                        sx={{ fontSize: 14, py: 1.5 }}
                      >
                        {dept}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Experience */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: "#374151" }}>
                    Experience Level *
                  </Typography>
                  <TextField
                    fullWidth
                    select
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TrendingUp sx={{ color: "#6b7280", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                      },
                    }}
                  >
                    {experienceLevels.map((exp) => (
                      <MenuItem 
                        key={exp} 
                        value={exp}
                        sx={{ fontSize: 14, py: 1.5 }}
                      >
                        {exp}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Job Type */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: "#374151" }}>
                    Job Type *
                  </Typography>
                  <TextField
                    fullWidth
                    select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Schedule sx={{ color: "#6b7280", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                      },
                    }}
                  >
                    {jobTypes.map((type) => (
                      <MenuItem 
                        key={type} 
                        value={type}
                        sx={{ fontSize: 14, py: 1.5 }}
                      >
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Salary Range */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: "#374151" }}>
                    Minimum Salary (LPA) *
                  </Typography>
                  <TextField
                    fullWidth
                    name="salaryMin"
                    type="number"
                    value={form.salaryMin}
                    onChange={handleChange}
                    required
                    placeholder="0"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoney sx={{ color: "#6b7280", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography variant="body2" color="#6b7280">
                            LPA
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: "#374151" }}>
                    Maximum Salary (LPA) *
                  </Typography>
                  <TextField
                    fullWidth
                    name="salaryMax"
                    type="number"
                    value={form.salaryMax}
                    onChange={handleChange}
                    required
                    placeholder="0"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoney sx={{ color: "#6b7280", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography variant="body2" color="#6b7280">
                            LPA
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                      },
                    }}
                  />
                </Grid>

                {/* Posted Date */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: "#374151" }}>
                    Posted Date *
                  </Typography>
                  <TextField
                    fullWidth
                    type="date"
                    name="postedOn"
                    InputLabelProps={{ shrink: true }}
                    value={form.postedOn}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday sx={{ color: "#6b7280", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                      },
                    }}
                  />
                </Grid>

                {/* Skills */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: "#374151" }}>
                    Required Skills
                  </Typography>
                  <TextField
                    fullWidth
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    placeholder="React, Node.js, MongoDB, AWS"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Code sx={{ color: "#6b7280", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                      },
                    }}
                  />
                </Grid>

                {/* Skills Preview */}
                {form.skills && (
                  <Grid item xs={12}>
                    <Box sx={{ p: 2, backgroundColor: "#f8fafc", borderRadius: "8px" }}>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: "#374151" }}>
                        Skills Preview:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {form.skills.split(",").map((skill, index) => (
                          skill.trim() && (
                            <Chip
                              key={index}
                              label={skill.trim()}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: "#d1d5db",
                                color: "#374151",
                                fontWeight: 500,
                                fontSize: "12px",
                              }}
                            />
                          )
                        ))}
                      </Box>
                    </Box>
                  </Grid>
                )}

                {/* Job Description */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: "#374151" }}>
                    Job Description *
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    placeholder="Describe the role, responsibilities, and requirements..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ mt: -16 }}>
                          <Description sx={{ color: "#6b7280", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                        alignItems: "flex-start",
                      },
                      "& .MuiInputAdornment-root": {
                        alignItems: "flex-start",
                        paddingTop: 2,
                      },
                    }}
                  />
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Box sx={{ pt: 2 }}>
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      sx={{
                        py: 2,
                        fontSize: "16px",
                        fontWeight: 600,
                        borderRadius: "8px",
                        backgroundColor: "#3476dfff",
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: "#347de3ff",
                        },
                        "&:disabled": {
                          backgroundColor: "#9ca3af",
                        },
                      }}
                    >
                      {loading ? "Publishing..." : "Publish Job Opportunity"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Job published successfully! Redirecting to published jobs...
        </Alert>
      </Snackbar>
    </>
  );
};

export default JobList;