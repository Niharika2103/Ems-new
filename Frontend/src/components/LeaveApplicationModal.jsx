import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
} from "@mui/material";

const LeaveApplicationModal = ({ open, onClose, leaveType, onSubmit }) => {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    document: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 450,
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 3,
          p: 4,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          {leaveType} Application
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Start Date"
              name="startDate"
              type="date"
              fullWidth
              value={formData.startDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="End Date"
              name="endDate"
              type="date"
              fullWidth
              value={formData.endDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Reason"
              name="reason"
              fullWidth
              multiline
              rows={3}
              value={formData.reason}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Button variant="outlined" component="label">
              Upload Supporting Document
              <input
                hidden
                type="file"
                name="document"
                accept=".pdf,.jpg,.png"
                onChange={handleChange}
              />
            </Button>
            {formData.document && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {formData.document.name}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sx={{ textAlign: "right", mt: 2 }}>
            <Button onClick={onClose} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              Submit
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};
export default LeaveApplicationModal;
