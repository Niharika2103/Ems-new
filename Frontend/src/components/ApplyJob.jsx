import React, { useState } from "react";
import {
  Box,
  Modal,
  Typography,
  Grid,
  TextField,
  Button,
  FormLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const ApplyJob = () => {
  const navigate = useNavigate();

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
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Application Submitted Successfully!");
    navigate(-1);
  };

  return (
    <Modal open={true} onClose={() => navigate(-1)}>
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
          Apply for this Job
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Full Name"
                name="fullName"
                fullWidth
                required
                value={formData.fullName}
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
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                name="phone"
                fullWidth
                required
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormLabel>Upload Resume *</FormLabel>
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
              <FormLabel>Upload Cover Letter *</FormLabel>
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
              <FormLabel>Other Required Documents</FormLabel>
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
  );
};

export default ApplyJob;
