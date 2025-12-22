import React, { useState, useEffect } from "react";
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
  Divider,
  TextField,
  Stack,
  Alert,
} from "@mui/material";

// APIs
import { getMyInterviewsApi, addPanelFeedbackApi } from "../../api/authApi";

// Utilities
import { decodeToken } from "../../api/decodeToekn"; // Fix typo if possible

// Custom 10-point rating component (matches your example)
const Rating10 = ({ value, onChange }) => (
  <Box mb={3}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
      <Typography variant="body2" fontWeight="medium" color="text.secondary">
        Rating
      </Typography>
      <Typography variant="body2" fontWeight="bold" color="primary">
        {value}/10
      </Typography>
    </Stack>
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(10, 1fr)",
        gap: 1,
        maxWidth: 600,
        mx: "auto",
      }}
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
        <Button
          key={n}
          variant={n <= value ? "contained" : "outlined"}
          onClick={() => onChange(n)}
          sx={{
            py: 1,
            fontSize: "0.875rem",
            minWidth: 0,
            textTransform: "none",
            fontWeight: "bold",
            ...(n <= value
              ? {
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" },
                }
              : {
                  borderColor: "grey.400",
                  color: "text.primary",
                  "&:hover": { bgcolor: "grey.50" },
                }),
          }}
        >
          {n}
        </Button>
      ))}
    </Box>
  </Box>
);

export default function PanelistFeedback() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");

  // Fetch interviews
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await getMyInterviewsApi();
        const mapped = response.data.map((row) => ({
          id: row.interview_id,
          candidate: row.candidate_name,
          role: row.position,
          round: row.round_name,
          date: new Date(row.interview_date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          feedbackSubmitted: row.feedback_submitted,
          _raw: row,
        }));
        setInterviews(mapped);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch interviews:", err);
        setError("Failed to load interviews.");
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  const handleSubmit = async () => {
    const interviewId = selectedInterview._raw.interview_id;
    const user = decodeToken();
    const panelMemberId = user?.id;

    if (!panelMemberId) {
      setError("User not authenticated.");
      return;
    }

    if (rating < 1 || rating > 10) {
      alert("Please select a rating between 1 and 10.");
      return;
    }

    if (!comments.trim()) {
      alert("Please provide feedback comments.");
      return;
    }

    const feedbackData = {
      panel_member: panelMemberId,
      rating,
      comments,
    };

    setSubmitting(true);
    try {
      await addPanelFeedbackApi(interviewId, feedbackData);

      setInterviews((prev) =>
        prev.map((i) =>
          i.id === selectedInterview.id
            ? { ...i, feedbackSubmitted: true }
            : i
        )
      );

      setSelectedInterview(null);
      setRating(0);
      setComments("");
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // === Loading / Error ===
  if (loading) {
    return (
      <Box p={4} display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Loading your interviews...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // === Interview List (Status column REMOVED) ===
  if (!selectedInterview) {
    return (
      <Box p={4} bgcolor="#f5f7fb" minHeight="100vh">
        <Typography variant="h4" fontWeight={600} mb={3}>
          My Interview Feedback
        </Typography>

        {interviews.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography>No interviews assigned to you.</Typography>
          </Paper>
        ) : (
          <Paper elevation={2}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f1f3f6" }}>
                  <TableCell>Interview ID</TableCell>
                  <TableCell>Candidate</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Round</TableCell>
                  <TableCell>Date</TableCell>
                  {/* ❌ Status removed */}
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
                    {/* ❌ Status cell removed */}
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        disabled={row.feedbackSubmitted}
                        onClick={() => setSelectedInterview(row)}
                      >
                        {row.feedbackSubmitted ? "Feedback Submitted" : "Submit Feedback"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Box>
    );
  }

  // === Feedback Form (Your Desired Style) ===
  return (
    <Box p={4} bgcolor="#f5f7fb" minHeight="100vh">
      <Paper elevation={3} sx={{ p: 4, maxWidth: 700, mx: "auto", borderRadius: 3 }}>
        <Typography variant="h4" fontWeight={600} align="center" mb={1}>
          Interview Feedback
        </Typography>
        <Typography align="center" color="text.secondary" mb={3}>
          Candidate: <b>{selectedInterview.candidate}</b> • Round:{" "}
          <b>{selectedInterview.round}</b> • Interview ID: <b>{selectedInterview.id}</b>
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Rating (1–10 buttons) */}
        <Rating10 value={rating} onChange={setRating} />

        {/* Comments */}
        <Box mb={3}>
          <Typography variant="body2" fontWeight="medium" mb={1} color="text.secondary">
            Comments
          </Typography>
          <TextField
            multiline
            rows={5}
            fullWidth
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Provide your detailed feedback, strengths, concerns, and overall impression..."
            variant="outlined"
          />
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button variant="outlined" onClick={() => setSelectedInterview(null)}>
            Back
          </Button>
          <Button
            variant="contained"
            disabled={rating === 0 || !comments.trim() || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}