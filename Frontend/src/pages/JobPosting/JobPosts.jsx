import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Modal,
  Divider,
  Chip,
  Container,
  Button,
  Slider,
  Grid,
  TextField,
  FormLabel,
} from "@mui/material";

import { LocationOn, AttachMoney } from "@mui/icons-material";

import {
  getPublishedJobPostsApi,
  applyForJobApi,
  parseResumeApi, // parse-resume API from backend
} from "../../api/authApi";

// ================= JOB CARD =================
const JobCard = ({ job, onClick }) => (
  <Card
    onClick={onClick}
    sx={{
      mb: 3,
      borderRadius: 3,
      p: 2,
      boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
      cursor: "pointer",
    }}
  >
    <Typography variant="h6" fontWeight={700}>
      {job.title}
    </Typography>
    <Typography color="gray">{job.company}</Typography>

    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
      <LocationOn sx={{ fontSize: 18, color: "#444", mr: 1 }} />
      <Typography>{job.location}</Typography>
    </Box>

    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
      <AttachMoney sx={{ fontSize: 18, color: "#1e8449", mr: 1 }} />
      <Typography>
        ₹{job.salaryMin / 100000}L - ₹{job.salaryMax / 100000}L
      </Typography>
    </Box>

    <Chip label={job.type} size="small" sx={{ mt: 2 }} />

    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
      {job.skills.slice(0, 3).map((skill, index) => (
        <Chip
          key={index}
          label={skill}
          size="small"
          sx={{
            background: "#f1f1f1",
            fontSize: "12px",
            borderRadius: "6px",
          }}
        />
      ))}
    </Box>
  </Card>
);

const EMAIL_DOMAIN_REGEX = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
const ALLOWED_EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "company.com","zigmaneural.com"];


// ================= MAIN COMPONENT =================
const JobPost = () => {
  const [jobs, setJobs] = useState([]);
  const [open, setOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [dateFilter, setDateFilter] = useState("all");
  const [minSalary, setMinSalary] = useState(0);

  // formData includes skills and experience now
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    skills: "",
    experience: "",
    resume: null,
  });

  // ================= LOAD PUBLISHED JOBS =================
  useEffect(() => {
    loadPublishedJobs();
  }, []);

  const loadPublishedJobPosts = async () => {
    loadPublishedJobs();
  };

  const loadPublishedJobs = async () => {
    try {
      const res = await getPublishedJobPostsApi();
      const jobList = res.data.jobs || [];

      const formatted = jobList.map((job) => {
        let salaryMin = 0,
          salaryMax = 0;

        if (job.salary_range?.includes("-")) {
          const parts = job.salary_range.split("-");
          salaryMin = Number(parts[0].replace(/\D/g, "")) * 100000;
          salaryMax = Number(parts[1].replace(/\D/g, "")) * 100000;
        }

        const postedDate = new Date(job.posted_date);
        const today = new Date();
        const diffDays = Math.floor(
          (today - postedDate) / (1000 * 60 * 60 * 24)
        );

        return {
          id: job.job_id,
          job_id: job.job_id,
          title: job.job_title,
          company: job.company || "—",
          salaryMin,
          salaryMax,
          description: job.description,
          location: job.location,
          experience: job.experience_level,
          type: job.employment_type,
          postedDaysAgo: diffDays,
          skills: job.requirements?.split(",").map((s) => s.trim()) || [],
        };
      });

      setJobs(formatted);
    } catch (err) {
      console.log("Error fetching published jobs:", err);
    }
  };

  // ================= FILTER JOBS =================
  const filteredJobs = jobs.filter((job) => {
    if (dateFilter !== "all") {
      let limit = parseInt(dateFilter);
      if (job.postedDaysAgo > limit) return false;
    }

    if (job.salaryMin < minSalary * 100000) return false;

    return true;
  });

  // ================= APPLY FORM INPUT CHANGE =================
  // const handleChange = (e) => {
  //   const { name, value, files } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: files ? files[0] : value,
  //   }));
  // };

const handleChange = (e) => {
  const { name, value, files } = e.target;

  // ✅ PHONE NUMBER RESTRICTION
  if (name === "phone") {
    const digitsOnly = value.replace(/\D/g, "");
    if (digitsOnly.length > 10) return;

    setFormData((prev) => ({
      ...prev,
      phone: digitsOnly,
    }));
    return;
  }

  // ✅ SKILLS RESTRICTION (handled below)
  if (name === "skills") {
    // Allow letters, numbers, +, #, ., commas, spaces
    const validSkills = value.replace(/[^a-zA-Z0-9+.#,\s]/g, "");

    setFormData((prev) => ({
      ...prev,
      skills: validSkills,
    }));
    return;
  }

  // ✅ EXPERIENCE RESTRICTION (YEARS ONLY)
if (name === "experience") {
  const digitsOnly = value.replace(/\D/g, "");
  if (digitsOnly.length > 2) return;

  setFormData((prev) => ({
    ...prev,
    experience: digitsOnly,
  }));
  return;
}


  setFormData((prev) => ({
    ...prev,
    [name]: files ? files[0] : value,
  }));
};



  // ================= RESUME PARSE (AUTO FILL) =================
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("resume", file);

    try {
      const res = await parseResumeApi(fd);
      const data = res?.data?.data || {};

      console.log("🔥 Auto-filled Data from Resume:", data);

      setFormData((prev) => ({
        ...prev,
        fullName: data.name || prev.fullName,
        email: data.email || prev.email,
        phone: data.phone || prev.phone,
        skills: data.skills || prev.skills,
        experience: data.experience || prev.experience,
        resume: file,
      }));
    } catch (err) {
      console.error("Resume parse failed", err);

      setFormData((prev) => ({
        ...prev,
        resume: file,
      }));
    }
  };

  // ================= APPLY SUBMIT =================
  const handleApplySubmit = async (e) => {
    e.preventDefault();

    if (!selectedJob) {
      alert("Please select a job before applying.");
      return;
    }
    // ✅ EMAIL VALIDATION
if (!EMAIL_DOMAIN_REGEX.test(formData.email)) {
  alert("Invalid email format");
  return;
}

const emailDomain = formData.email.split("@")[1];
if (!ALLOWED_EMAIL_DOMAINS.includes(emailDomain)) {
  alert(
    `Email domain must be one of: ${ALLOWED_EMAIL_DOMAINS.join(", ")}`
  );
  return;
}


    const fd = new FormData();
    fd.append("job_id", selectedJob.job_id);
    fd.append("candidate_name", formData.fullName);
    fd.append("email", formData.email);
    fd.append("phone", formData.phone);
    fd.append("skills", formData.skills);
    fd.append("experience", formData.experience);
    fd.append("resume", formData.resume);

    try {
      await applyForJobApi(fd);
      alert("Application submitted successfully!");
      setApplyOpen(false);
      setOpen(false);

      setFormData({
        fullName: "",
        email: "",
        phone: "",
        skills: "",
        experience: "",
        resume: null,
      });
    } catch (err) {
      console.error("Apply error", err);
      alert("Failed to submit application");
    }
  };

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#f5f7fa", py: 4 }}>
      <Container maxWidth="xl" sx={{ display: "flex", gap: 3 }}>
        {/* ================= FILTERS ================= */}
        <Box
          sx={{
            width: 280,
            background: "#fff",
            borderRadius: 3,
            p: 3,
            position: "sticky",
            top: 20,
            boxShadow: "0 4px 18px rgba(0,0,0,0.07)",
          }}
        >
          <Typography variant="h6" fontWeight={700} mb={3}>
            Filters
          </Typography>

          <Typography fontWeight={600} mb={1}>
            Date Posted
          </Typography>

          <Box sx={{ ml: 1, display: "flex", flexDirection: "column", gap: 1 }}>
            <label>
              <input
                type="radio"
                checked={dateFilter === "all"}
                onChange={() => setDateFilter("all")}
              />{" "}
              All
            </label>

            <label>
              <input
                type="radio"
                checked={dateFilter === "1"}
                onChange={() => setDateFilter("1")}
              />{" "}
              Last 24 hours
            </label>

            <label>
              <input
                type="radio"
                checked={dateFilter === "3"}
                onChange={() => setDateFilter("3")}
              />{" "}
              Last 3 days
            </label>

            <label>
              <input
                type="radio"
                checked={dateFilter === "7"}
                onChange={() => setDateFilter("7")}
              />{" "}
              Last 7 days
            </label>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography fontWeight={600} mb={1}>
            Minimum Salary (Lakhs)
          </Typography>

          <Slider
            value={minSalary}
            onChange={(e, val) => setMinSalary(val)}
            step={1}
            min={0}
            max={50}
            valueLabelDisplay="auto"
          />
        </Box>

        {/* ================= JOB LIST ================= */}
        <Box sx={{ flex: 1, height: "85vh", overflowY: "scroll", pr: 2 }}>
          <Typography variant="h5" fontWeight={700} mb={3}>
            Jobs — Filtered Results
          </Typography>

          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onClick={() => {
                setSelectedJob(job);
                setApplyOpen(false);
                setOpen(true);
              }}
            />
          ))}

          {filteredJobs.length === 0 && (
            <Typography>No jobs match your filters.</Typography>
          )}
        </Box>
      </Container>

      {/* ================= JOB DETAILS MODAL ================= */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            background: "white",
            width: 550,
            p: 4,
            borderRadius: 3,
            mx: "auto",
            mt: 10,
          }}
        >
          {selectedJob && (
            <>
              <Typography variant="h4" fontWeight={700}>
                {selectedJob.title}
              </Typography>

              <Typography color="gray">{selectedJob.company}</Typography>
              <Divider sx={{ my: 2 }} />

              <Typography>📍 Location: {selectedJob.location}</Typography>

              <Typography>
                💰 Salary: ₹
                {selectedJob.salaryMin / 100000}L - ₹
                {selectedJob.salaryMax / 100000}L
              </Typography>

              <Typography mt={2} mb={1} fontWeight={700}>
                Description
              </Typography>
              <Typography color="gray">{selectedJob.description}</Typography>

              <Typography mt={3} mb={1} fontWeight={700}>
                Skills Required
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {selectedJob.skills.map((skill, index) => (
                  <Chip key={index} label={skill} />
                ))}
              </Box>

              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 3 }}
                onClick={() => {
                  setApplyOpen(true);
                  setOpen(false);
                }}
              >
                Apply Now
              </Button>
            </>
          )}
        </Box>
      </Modal>

      {/* ================= APPLY FORM MODAL ================= */}
      <Modal open={applyOpen} onClose={() => setApplyOpen(false)}>
        <Box
          sx={{
            width: 600,
            bgcolor: "#fff",
            p: 3,
            borderRadius: 3,
            mx: "auto",
            mt: 8,
            maxHeight: "85vh",
            overflowY: "auto",
          }}
        >
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Apply for {selectedJob?.title}
          </Typography>

          <Box component="form" onSubmit={handleApplySubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Full Name"
                  name="fullName"
                  fullWidth
                  required
                  onChange={handleChange}
                  value={formData.fullName}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
  label="Email"
  name="email"
  type="email"
  fullWidth
  required
  onChange={handleChange}
  value={formData.email}
  placeholder="e.g. johndoe@gmail.com"
/>

              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
  label="Phone"
  name="phone"
  fullWidth
  required
  onChange={handleChange}
  value={formData.phone}
  inputProps={{
    maxLength: 10,
    inputMode: "numeric",
    pattern: "[0-9]*",
  }}
  placeholder="Enter 10-digit mobile number"
/>

              </Grid>

              {/* SKILLS */}
              <Grid item xs={12} sm={6}>
                <TextField
  label="Skills"
  name="skills"
  fullWidth
  onChange={handleChange}
  value={formData.skills}
  placeholder="e.g. Python3, React18, NodeJS, C++"
  helperText="Use letters, numbers, commas. Example: Python3, React18"
 />

              </Grid>

              {/* EXPERIENCE */}
              <Grid item xs={12} sm={6}>
                <TextField
  label="Experience (years)"
  name="experience"
  fullWidth
  onChange={handleChange}
  value={formData.experience}
  inputProps={{
    inputMode: "numeric",
    pattern: "[0-9]*",
    maxLength: 2,
  }}
  placeholder="e.g. 3"
/>

              </Grid>

              {/* RESUME UPLOAD (AUTO PARSE) */}
              <Grid item xs={12} sm={6}>
                <FormLabel>Resume *</FormLabel>
                <TextField
                  type="file"
                  name="resume"
                  fullWidth
                  required
                  inputProps={{ accept: ".pdf,.doc,.docx" }}
                  onChange={handleResumeUpload}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ py: 1.5 }}
                >
                  Submit Application
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default JobPost;
