import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  MenuItem,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ProjectSave } from "../../features/Project/projectsSlice";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";

const ProjectForm = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.project);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "IN_PROGRESS",
    estimatedCost: "",     // ➕ NEW FIELD
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resultAction = await dispatch(ProjectSave(formData));
      if (ProjectSave.fulfilled.match(resultAction)) {
        alert("✅ Project saved successfully!");
        setFormData({
          name: "",
          description: "",
          startDate: "",
          endDate: "",
          status: "IN_PROGRESS",
          estimatedCost: "",   // RESET NEW FIELD
        });
        navigate("/dashboard/fetch_project");
      }
    } catch (err) {
      console.error("Failed to save project:", err);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
        overflowY: "auto",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 500,
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
        }}
      >
        {/* Header */}
        <Box textAlign="center" mb={3}>
          <WorkOutlineIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
          <Typography variant="h5" fontWeight={600}>
            Add New Project
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fill in the details to create a new project
          </Typography>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Project Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              required
            />

            {/* ➕ New Estimated Cost Field */}
            <TextField
  label="Estimated Cost"
  name="estimatedCost"
  type="number"
  value={formData.estimatedCost}
  onChange={handleChange}
  fullWidth
  required
  inputProps={{
    min: 0,
    step: "0.01",
    style: { MozAppearance: "textfield" }, // Remove arrows in Firefox
  }}
  InputProps={{
    sx: {
      "input::-webkit-outer-spin-button": {
        WebkitAppearance: "none",
        margin: 0,
      },
      "input::-webkit-inner-spin-button": {
        WebkitAppearance: "none",
        margin: 0,
      },
    },
  }}
/>

            <TextField
              label="Start Date"
              name="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              label="End Date"
              name="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              fullWidth
              required
            >
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="NOT_STARTED">Not Started</MenuItem>
            </TextField>

            <Box textAlign="right" mt={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} color="inherit" />}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                }}
              >
                {loading ? "Saving..." : "Save Project"}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ProjectForm;
