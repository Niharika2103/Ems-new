import  { useState } from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";

const LeaveApplicationModal = ({ open, onClose, leaveType, onSubmit }) => {
  const [startDate, setStartDate] = useState("");

  const handleSubmit = () => {
    if (startDate) {
      onSubmit({ startDate });
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 3,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Apply for {leaveType}
        </Typography>

        <TextField
          label="Start Date"
          type="date"
          fullWidth
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />

        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!startDate}>
            Submit
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default LeaveApplicationModal; 