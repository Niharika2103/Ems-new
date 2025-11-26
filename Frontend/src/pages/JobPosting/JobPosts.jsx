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
} from "@mui/material";
import {
  BusinessCenter,
  LocationOn,
  AttachMoney,
} from "@mui/icons-material";

// ----------------- JOBS DATA -----------------
const jobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "Google",
    salaryMin: 1800000,
    salaryMax: 3000000,
    postedDaysAgo: 1, // for filter
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
    skills: ["Figma", "UX Research"],
    experience: "2–4 years",
    type: "Full-time",
  },
  
  {
    id: 4,
    title: "Frontend Developer",
    company: "Google",
    salaryMin: 1800000,
    salaryMax: 3000000,
    postedDaysAgo: 1,
    description:
      "We are seeking a skilled Frontend Developer experienced in React.js and modern UI frameworks to build scalable web applications.",
    location: "Bangalore, India",
    skills: ["React.js", "JavaScript", "Material UI", "HTML", "CSS"],
    experience: "2–5 years",
    type: "Full-time",
  },

  {
    id: 5,
    title: "Backend Developer",
    company: "Amazon",
    salaryMin: 2200000,
    salaryMax: 3800000,
    postedDaysAgo: 2,
    description:
      "Build highly scalable backend APIs and distributed microservices to support high-traffic Amazon systems.",
    location: "Hyderabad, India",
    skills: ["Node.js", "AWS", "MongoDB", "Microservices"],
    experience: "3–6 years",
    type: "Full-time",
  },

  {
    id: 6,
    title: "UI/UX Designer",
    company: "Microsoft",
    salaryMin: 1500000,
    salaryMax: 2500000,
    postedDaysAgo: 5,
    description:
      "Design intuitive user interfaces for enterprise products with strong wireframing and prototyping skills.",
    location: "Noida, India",
    skills: ["Figma", "Adobe XD", "Wireframing", "User Research"],
    experience: "2–4 years",
    type: "Full-time",
  },

  {
    id: 7,
    title: "Full Stack Developer",
    company: "Netflix",
    salaryMin: 3000000,
    salaryMax: 5000000,
    postedDaysAgo: 7,
    description:
      "Work on large-scale distributed applications using React, Node.js and cloud technologies.",
    location: "Remote",
    skills: ["React.js", "Node.js", "AWS", "Docker", "SQL"],
    experience: "4–8 years",
    type: "Remote",
  },

  {
    id: 8,
    title: "Data Scientist",
    company: "Meta",
    salaryMin: 2500000,
    salaryMax: 4200000,
    postedDaysAgo: 3,
    description:
      "Build predictive machine learning models and analyze large-scale data to drive decision-making.",
    location: "Gurgaon, India",
    skills: ["Python", "Machine Learning", "TensorFlow", "SQL", "Data Analysis"],
    experience: "3–6 years",
    type: "Full-time",
  }
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
  </Card>
);

// ---------------- MAIN COMPONENT ----------------
const JobPost = () => {
  const [open, setOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // FILTER STATES
  const [dateFilter, setDateFilter] = useState("all");
  const [minSalary, setMinSalary] = useState(0);

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
    // Date posted filter
    if (dateFilter === "24" && job.postedDaysAgo > 1) return false;
    if (dateFilter === "3" && job.postedDaysAgo > 3) return false;
    if (dateFilter === "7" && job.postedDaysAgo > 7) return false;

    // Salary filter
    if (job.salaryMin < minSalary * 100000) return false;

    return true;
  });

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "#f5f7fa",
        py: 4,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="xl" sx={{ display: "flex", gap: 3 }}>
        
        {/* ------------ LEFT FILTERS (Sticky) ------------ */}
        <Box
          sx={{
            width: 280,
            background: "#fff",
            borderRadius: 2,
            p: 3,
            height: "fit-content",
            position: "sticky",
            top: 20,
            boxShadow: "0 3px 14px rgba(0,0,0,0.08)",
          }}
        >
          <Typography variant="h6" fontWeight={700} mb={2}>
            Filters
          </Typography>

          {/* DATE FILTER */}
          <Typography fontWeight={600} mb={1}>
            Date Posted
          </Typography>

          <Box sx={{ ml: 1 }}>
            <Typography>
              <input
                type="radio"
                name="date"
                checked={dateFilter === "all"}
                onChange={() => setDateFilter("all")}
              />{" "}
              All
            </Typography>
            <Typography>
              <input
                type="radio"
                name="date"
                checked={dateFilter === "24"}
                onChange={() => setDateFilter("24")}
              />{" "}
              Last 24 hours
            </Typography>
            <Typography>
              <input
                type="radio"
                name="date"
                checked={dateFilter === "3"}
                onChange={() => setDateFilter("3")}
              />{" "}
              Last 3 days
            </Typography>
            <Typography>
              <input
                type="radio"
                name="date"
                checked={dateFilter === "7"}
                onChange={() => setDateFilter("7")}
              />{" "}
              Last 7 days
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* SALARY FILTER */}
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

        {/* ------------ RIGHT JOB LIST (Scrollable) ------------ */}
        <Box
          sx={{
            flex: 1,
            height: "85vh",
            overflowY: "scroll",
            pr: 2,
          }}
        >
          <Typography variant="h5" fontWeight={700} mb={3}>
            Jobs — Filtered Results
          </Typography>

          {filteredJobs.length === 0 ? (
            <Typography>No jobs found with selected filters.</Typography>
          ) : (
            filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} onClick={() => handleOpen(job)} />
            ))
          )}
        </Box>
      </Container>

      {/* ---------------- JOB MODAL ---------------- */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            background: "white",
            width: 550,
            p: 4,
            borderRadius: 3,
            mx: "auto",
            mt: 10,
            boxShadow: "0px 8px 30px rgba(0,0,0,0.15)",
          }}
        >
          {selectedJob && (
            <>
              <Typography variant="h4" fontWeight={700}>
                {selectedJob.title}
              </Typography>

              <Typography color="gray" mb={2}>
                {selectedJob.company}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography>
                📍 <b>Location:</b> {selectedJob.location}
              </Typography>

              <Typography>
                💰 <b>Salary:</b> ₹{selectedJob.salaryMin / 100000}L - ₹
                {selectedJob.salaryMax / 100000}L
              </Typography>

              <Typography>
                💼 <b>Experience:</b> {selectedJob.experience}
              </Typography>

              <Typography mt={2} mb={1} fontWeight={700}>
                Description
              </Typography>
              <Typography color="gray">{selectedJob.description}</Typography>

              <Typography mt={3} mb={1} fontWeight={700}>
                Skills Required
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {selectedJob.skills.map((skill) => (
                  <Chip key={skill} label={skill} />
                ))}
              </Box>

              <Button fullWidth variant="contained" sx={{ mt: 3 }}>
                Apply Now
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default JobPost;
