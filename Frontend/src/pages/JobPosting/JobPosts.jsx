import React, { useState } from "react";
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

// ----------------- JOBS DATA -----------------
const jobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "Google",
    salaryMin: 1800000,
    salaryMax: 3000000,
    postedDaysAgo: 1,
    description:
      "We are looking for a skilled Frontend Developer with strong React.js experience.",
    location: "Bangalore",
    skills: ["React.js", "JavaScript", "CSS"],
    experience: "2–5 years",
    type: "Full-time",
  },
  {
    id: 2,
    title: "React Developer",
    company: "Microsoft",
    salaryMin: 2000000,
    salaryMax: 3500000,
    postedDaysAgo: 4,
    description:
      "Develop high performance React components for Microsoft's platforms.",
    location: "Hyderabad",
    skills: ["React", "TypeScript", "REST APIs"],
    experience: "3–6 years",
    type: "Full-time",
  },
  {
    id: 3,
    title: "UI/UX Designer",
    company: "Amazon",
    salaryMin: 1200000,
    salaryMax: 2200000,
    postedDaysAgo: 7,
    description:
      "Design world-class UX/UI for Amazon apps with strong usability.",
    location: "Chennai",
    skills: ["Figma", "UX Research", "UI Design"],
    experience: "2–4 years",
    type: "Full-time",
  },
  {
    id: 4,
    title: "Backend Developer",
    company: "Amazon",
    salaryMin: 2200000,
    salaryMax: 3800000,
    postedDaysAgo: 2,
    description:
      "Build scalable backend services & APIs for high-volume systems.",
    location: "Hyderabad, India",
    skills: ["Node.js", "AWS", "MongoDB", "Microservices"],
    experience: "3–6 years",
    type: "Full-time",
  },
  {
    id: 5,
    title: "Full Stack Developer",
    company: "Netflix",
    salaryMin: 3000000,
    salaryMax: 5000000,
    postedDaysAgo: 7,
    description:
      "Work on distributed apps using React, Node.js and AWS.",
    location: "Remote",
    skills: ["React.js", "Node.js", "Docker", "SQL"],
    experience: "4–8 years",
    type: "Remote",
  },
];

// ---------------- JOB CARD ----------------
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
    <Typography variant="h6" fontWeight={700}>{job.title}</Typography>
    <Typography color="gray">{job.company}</Typography>

    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
      <LocationOn sx={{ fontSize: 18, color: "#444", mr: 1 }} />
      <Typography>{job.location}</Typography>
    </Box>

    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
      <AttachMoney sx={{ fontSize: 18, color: "#1e8449", mr: 1 }} />
      <Typography>{`₹${job.salaryMin / 100000}L - ₹${job.salaryMax / 100000}L`}</Typography>
    </Box>

    <Chip label={job.type} size="small" sx={{ mt: 2 }} />

    {/* SKILLS PREVIEW */}
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

// ---------------- MAIN COMPONENT ----------------
const JobPost = () => {
  const [open, setOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [dateFilter, setDateFilter] = useState("all");
  const [minSalary, setMinSalary] = useState(0);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    resume: null,
    coverLetter: null,
    documents: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    alert("Application Submitted!");
    setApplyOpen(false);
    setOpen(false);
  };

  const handleOpen = (job) => {
    setSelectedJob(job);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedJob(null);
    setOpen(false);
  };

  // ---------------- FILTER LOGIC ----------------
  const filteredJobs = jobs.filter((job) => {
    if (dateFilter === "24" && job.postedDaysAgo > 1) return false;
    if (dateFilter === "3" && job.postedDaysAgo > 3) return false;
    if (dateFilter === "7" && job.postedDaysAgo > 7) return false;

    if (job.salaryMin < minSalary * 100000) return false;

    return true;
  });

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#f5f7fa", py: 4 }}>
      <Container maxWidth="xl" sx={{ display: "flex", gap: 3 }}>

        {/* ------------ LEFT FILTERS ------------ */}
        <Box
          sx={{
            width: 280,
            background: "#fff",
            borderRadius: 3,
            p: 3,
            height: "fit-content",
            position: "sticky",
            top: 20,
            boxShadow: "0 4px 18px rgba(0,0,0,0.07)",
          }}
        >
          <Typography variant="h6" fontWeight={700} mb={3}>
            Filters
          </Typography>

          {/* DATE POSTED */}
          <Typography fontWeight={600} mb={1}>
            Date Posted
          </Typography>

          <Box sx={{ ml: 1, display: "flex", flexDirection: "column", gap: 1 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="radio"
                name="date"
                checked={dateFilter === "all"}
                onChange={() => setDateFilter("all")}
              />
              <span>All</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="radio"
                name="date"
                checked={dateFilter === "24"}
                onChange={() => setDateFilter("24")}
              />
              <span>Last 24 hours</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="radio"
                name="date"
                checked={dateFilter === "3"}
                onChange={() => setDateFilter("3")}
              />
              <span>Last 3 days</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="radio"
                name="date"
                checked={dateFilter === "7"}
                onChange={() => setDateFilter("7")}
              />
              <span>Last 7 days</span>
            </label>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* SALARY SLIDER */}
          <Typography fontWeight={600} mb={1}>
            Minimum Salary (Lakhs)
          </Typography>

          <Slider
            value={minSalary}
            onChange={(e, val) => setMinSalary(val)}
            step={1}
            min={0}
            max={30}
            valueLabelDisplay="auto"
          />

          <Typography mt={1} color="gray">
            Selected: ₹{minSalary} Lakhs
          </Typography>
        </Box>

        {/* ------------ RIGHT JOB LIST ------------ */}
        <Box sx={{ flex: 1, height: "85vh", overflowY: "scroll", pr: 2 }}>
          <Typography variant="h5" fontWeight={700} mb={3}>
            Jobs — Filtered Results
          </Typography>

          {filteredJobs.length === 0 ? (
            <Typography>No jobs match your filters.</Typography>
          ) : (
            filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} onClick={() => handleOpen(job)} />
            ))
          )}
        </Box>
      </Container>

      {/* ---------------- JOB DETAILS MODAL ---------------- */}
      <Modal open={open} onClose={handleClose}>
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

              <Typography>
                📍 <b>Location:</b> {selectedJob.location}
              </Typography>

              <Typography>
                💰 <b>Salary:</b> ₹{selectedJob.salaryMin / 100000}L - ₹
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
                onClick={() => setApplyOpen(true)}
              >
                Apply Now
              </Button>
            </>
          )}
        </Box>
      </Modal>

      {/* ---------------- APPLY FORM MODAL ---------------- */}
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
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone"
                  name="phone"
                  fullWidth
                  required
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormLabel>Resume *</FormLabel>
                <TextField
                  type="file"
                  name="resume"
                  fullWidth
                  required
                  inputProps={{ accept: ".pdf,.doc,.docx" }}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormLabel>Cover Letter *</FormLabel>
                <TextField
                  type="file"
                  name="coverLetter"
                  fullWidth
                  required
                  inputProps={{ accept: ".pdf,.doc,.docx" }}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormLabel>Documents</FormLabel>
                <TextField
                  type="file"
                  name="documents"
                  fullWidth
                  inputProps={{ accept: ".pdf,.jpg,.png,.doc,.docx" }}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Button type="submit" fullWidth variant="contained" sx={{ py: 1.5 }}>
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
