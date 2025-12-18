import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Chip,
  Divider,
  Rating,
  TextField,
  Grid,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

/* ================= DUMMY INTERVIEW DATA ================= */
const initialInterviews = [
  {
    id: "INT-037",
    candidate: "Anugeethika",
    role: "Software Engineer",
    round: "Technical Round 3",
    date: "18 Dec 2025, 10:30 AM",
    feedbackSubmitted: false,
    feedback: null,
  },
  {
    id: "INT-038",
    candidate: "Rohit Kumar",
    role: "Backend Developer",
    round: "HR Round",
    date: "17 Dec 2025, 02:00 PM",
    feedbackSubmitted: true,
    feedback: {
      technical: 4,
      communication: 3,
      problemSolving: 3,
      attitude: 4,
      recommendation: "HOLD",
      comments: "Good communication, average technical depth.",
    },
  },
];

export default function PanelistFeedback() {
  const [interviews, setInterviews] = useState(initialInterviews);
  const [selectedInterview, setSelectedInterview] = useState(null);

  /* ================= FEEDBACK FORM STATE ================= */
  const [skills, setSkills] = useState({
    technical: 0,
    communication: 0,
    problemSolving: 0,
    attitude: 0,
  });
  const [recommendation, setRecommendation] = useState("");
  const [comments, setComments] = useState("");

  /* ================= SUBMIT FEEDBACK (DUMMY) ================= */
  const handleSubmit = () => {
    setInterviews((prev) =>
      prev.map((i) =>
        i.id === selectedInterview.id
          ? {
              ...i,
              feedbackSubmitted: true,
              feedback: {
                ...skills,
                recommendation,
                comments,
              },
            }
          : i
      )
    );

    setSelectedInterview(null);
    setSkills({
      technical: 0,
      communication: 0,
      problemSolving: 0,
      attitude: 0,
    });
    setRecommendation("");
    setComments("");
  };

  /* ================= TABLE VIEW ================= */
  if (!selectedInterview) {
    return (
      <Box p={4} bgcolor="#f5f7fb" minHeight="100vh">
        <Typography variant="h4" fontWeight={600} mb={3}>
          My Interview Feedback
        </Typography>

        <Paper elevation={2}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f1f3f6" }}>
                <TableCell>Interview ID</TableCell>
                <TableCell>Candidate</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Round</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {interviews.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.candidate}</TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>{row.round}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.feedbackSubmitted ? "Submitted" : "Pending"}
                      color={row.feedbackSubmitted ? "success" : "warning"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                      disabled={row.feedbackSubmitted}
                      onClick={() => setSelectedInterview(row)}
                    >
                      Submit Feedback
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    );
  }

  /* ================= FEEDBACK FORM VIEW ================= */
  return (
    <Box p={4} bgcolor="#f5f7fb" minHeight="100vh">
      <Paper elevation={3} sx={{ p: 4, maxWidth: 1000, mx: "auto", borderRadius: 3 }}>
        <Typography variant="h4" fontWeight={600} align="center">
          Panel Feedback
        </Typography>

        <Typography align="center" color="text.secondary" mt={1}>
          Candidate: <b>{selectedInterview.candidate}</b> • Round:{" "}
          <b>{selectedInterview.round}</b> • Interview ID:{" "}
          <b>{selectedInterview.id}</b>
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* ===== EXISTING FEEDBACK (READ ONLY) ===== */}
        {selectedInterview.feedback && (
          <Box mb={4}>
            <Typography variant="h6" mb={1}>
              Submitted Feedback
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography>Technical: {selectedInterview.feedback.technical}/5</Typography>
              <Typography>Communication: {selectedInterview.feedback.communication}/5</Typography>
              <Typography>Problem Solving: {selectedInterview.feedback.problemSolving}/5</Typography>
              <Typography>Attitude: {selectedInterview.feedback.attitude}/5</Typography>
              <Typography mt={1}>
                Recommendation: <b>{selectedInterview.feedback.recommendation}</b>
              </Typography>
              <Typography mt={1} fontStyle="italic">
                “{selectedInterview.feedback.comments}”
              </Typography>
            </Paper>
          </Box>
        )}

        {/* ===== FEEDBACK FORM ===== */}
        {!selectedInterview.feedbackSubmitted && (
          <>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Skill Evaluation
            </Typography>

            <Grid container spacing={3}>
              {[
                { key: "technical", label: "Technical Competency" },
                { key: "communication", label: "Communication Skills" },
                { key: "problemSolving", label: "Problem Solving Ability" },
                { key: "attitude", label: "Attitude & Professionalism" },
              ].map((skill) => (
                <Grid item xs={12} md={6} key={skill.key}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography fontWeight={500}>{skill.label}</Typography>
                    <Rating
                      value={skills[skill.key]}
                      onChange={(e, val) =>
                        setSkills({ ...skills, [skill.key]: val })
                      }
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Box mt={4}>
              <FormControl fullWidth>
                <InputLabel>Final Recommendation</InputLabel>
                <Select
                  value={recommendation}
                  label="Final Recommendation"
                  onChange={(e) => setRecommendation(e.target.value)}
                >
                  <MenuItem value="HIRE">Hire</MenuItem>
                  <MenuItem value="HOLD">Hold</MenuItem>
                  <MenuItem value="REJECT">Reject</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box mt={4}>
              <TextField
                label="Overall Feedback"
                multiline
                rows={4}
                fullWidth
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Provide your overall assessment and justification..."
              />
            </Box>

            <Stack direction="row" justifyContent="flex-end" spacing={2} mt={4}>
              <Button variant="outlined" onClick={() => setSelectedInterview(null)}>
                Back
              </Button>
              <Button
                variant="contained"
                disabled={!recommendation || !comments.trim()}
                onClick={handleSubmit}
              >
                Submit Feedback
              </Button>
            </Stack>
          </>
        )}
      </Paper>
    </Box>
  );
}
