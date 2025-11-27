import React, { useState } from "react";
import {
  Box,
  Typography,
  Modal,
  Stepper,
  Step,
  StepLabel,
  Button,
  Chip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const steps = ["Applied", "Screening", "Interview", "Decision"];

const initialApplications = [
  {
    id: 1,
    jobTitle: "Frontend Developer",
    company: "Google",
    appliedOn: "2025-01-10",
    status: "Interview",
  },
  {
    id: 2,
    jobTitle: "Backend Developer",
    company: "Microsoft",
    appliedOn: "2025-01-14",
    status: "Screening",
  },
  {
    id: 3,
    jobTitle: "UI/UX Designer",
    company: "Adobe",
    appliedOn: "2025-01-18",
    status: "Decision",
  },
  {
    id: 4,
    jobTitle: "React Developer",
    company: "Amazon",
    appliedOn: "2025-01-23",
    status: "Applied",
  },
];

const getStatusIndex = (status) => steps.indexOf(status);

export default function ApplicationTrackingTable() {
  const [open, setOpen] = useState(false);
  const [applications, setApplications] = useState(initialApplications);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleOpen = (row) => {
    setSelectedRow({ ...row }); // avoid mutating original
    setOpen(true);
  };

  // ---- UPDATE STATUS ----
  const updateStatus = (direction) => {
    const currentIndex = getStatusIndex(selectedRow.status);
    let newIndex = currentIndex;

    if (direction === "next" && currentIndex < steps.length - 1) {
      newIndex++;
    } else if (direction === "prev" && currentIndex > 0) {
      newIndex--;
    }

    const updatedStatus = steps[newIndex];

    // Update inside modal
    const updatedRow = { ...selectedRow, status: updatedStatus };
    setSelectedRow(updatedRow);

    // Update in table list
    setApplications((prev) =>
      prev.map((app) =>
        app.id === selectedRow.id ? { ...app, status: updatedStatus } : app
      )
    );
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "jobTitle", headerName: "Job Title", width: 200 },
    { field: "company", headerName: "Company", width: 180 },
    { field: "appliedOn", headerName: "Applied On", width: 150 },

    {
      field: "status",
      headerName: "Current Status",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === "Applied"
              ? "default"
              : params.value === "Screening"
              ? "info"
              : params.value === "Interview"
              ? "warning"
              : "success"
          }
          size="small"
        />
      ),
    },

    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => handleOpen(params.row)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Job Application Tracking
      </Typography>

      <Box sx={{ height: 400, bgcolor: "#fff" }}>
        <DataGrid rows={applications} columns={columns} pageSize={5} />
      </Box>

      {/* Modal */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            width: 500,
            p: 4,
            bgcolor: "#fff",
            borderRadius: 2,
            mx: "auto",
            mt: "10%",
          }}
        >
          {selectedRow && (
            <>
              <Typography variant="h6" mb={1} fontWeight="bold">
                Application Progress
              </Typography>
              <Typography variant="subtitle1">
                {selectedRow.jobTitle} — {selectedRow.company}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Applied On: {selectedRow.appliedOn}
              </Typography>

              <Stepper
                activeStep={getStatusIndex(selectedRow.status)}
                alternativeLabel
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* ADMIN CONTROLS */}
              <Box display="flex" justifyContent="space-between" mt={3}>
                <Button
                  variant="outlined"
                  disabled={getStatusIndex(selectedRow.status) === 0}
                  onClick={() => updateStatus("prev")}
                >
                  Previous Step
                </Button>

                <Button
                  variant="contained"
                  disabled={
                    getStatusIndex(selectedRow.status) === steps.length - 1
                  }
                  onClick={() => updateStatus("next")}
                >
                  Next Step
                </Button>
              </Box>

              <Box textAlign="right" mt={3}>
                <Button variant="contained" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
