import React, { useEffect, useState } from "react";
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

import {
  getAllApplicationsApi,
  updateApplicationStatusApi,
} from "../../api/authApi";

// Status order
const STATUS_STEPS = ["APPLIED", "SCREENING", "INTERVIEW", "DECISION"];

const STATUS_LABEL = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  DECISION: "Decision",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

const STATUS_COLOR = {
  APPLIED: "default",
  SCREENING: "info",
  INTERVIEW: "warning",
  DECISION: "success",
  HIRED: "success",
  REJECTED: "error",
};

// Step index helper
const getStatusIndex = (status) => STATUS_STEPS.indexOf(status || "APPLIED");

export default function ApplicationTrackingTable() {
  const [open, setOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  // ================= LOAD DATA =================
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await getAllApplicationsApi();
        const list = res.data.applications || [];

        const rows = list.map((app) => ({
          id: app.application_id,

          // 🟩 FIXED — Job title fallback
          jobTitle:
            app.job_title !== null &&
            app.job_title !== undefined &&
            app.job_title.trim() !== ""
              ? app.job_title
              : "Unknown Title",

          // 🟩 FIXED — Company fallback
          company:
            app.company !== null &&
            app.company !== undefined &&
            app.company.trim() !== ""
              ? app.company
              : "Unknown Company",

          appliedOn: app.applied_date || "Not Provided",

          status: app.status || "APPLIED",
        }));

        setApplications(rows);
      } catch (err) {
        console.error("Error loading applications:", err);
        alert("Failed to load applications");
      }
    };

    fetchApplications();
  }, []);

  // ================= MODAL OPEN =================
  const handleOpen = (row) => {
    setSelectedRow({ ...row });
    setOpen(true);
  };

  // ================= STATUS UPDATE =================
  const updateStatus = async (direction) => {
    if (!selectedRow) return;

    const currentIndex = getStatusIndex(selectedRow.status);
    let newIndex = currentIndex;

    if (direction === "next" && currentIndex < STATUS_STEPS.length - 1) {
      newIndex++;
    } else if (direction === "prev" && currentIndex > 0) {
      newIndex--;
    }

    const newStatus = STATUS_STEPS[newIndex];

    try {
      await updateApplicationStatusApi(selectedRow.id, newStatus);

      // Update inside UI
      const updatedRow = { ...selectedRow, status: newStatus };
      setSelectedRow(updatedRow);

      setApplications((prev) =>
        prev.map((app) =>
          app.id === selectedRow.id ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      console.error("Update status error:", err);
      alert("Failed to update status");
    }
  };

  // ================= TABLE COLUMNS =================
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "jobTitle", headerName: "Job Title", width: 220 },
    { field: "company", headerName: "Company", width: 180 },
    { field: "appliedOn", headerName: "Applied On", width: 180 },

    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => {
        const value = params.value || "APPLIED";
        return (
          <Chip
            label={STATUS_LABEL[value] || value}
            color={STATUS_COLOR[value] || "default"}
            size="small"
          />
        );
      },
    },

    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <Button variant="contained" size="small" onClick={() => handleOpen(params.row)}>
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

      <Box sx={{ height: 450, bgcolor: "#fff" }}>
        <DataGrid rows={applications} columns={columns} pageSize={5} />
      </Box>

      {/* ================= MODAL ================= */}
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

              <Stepper activeStep={getStatusIndex(selectedRow.status)} alternativeLabel>
                {STATUS_STEPS.map((dbStatus) => (
                  <Step key={dbStatus}>
                    <StepLabel>{STATUS_LABEL[dbStatus]}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* BUTTONS */}
              <Box display="flex" justifyContent="space-between" mt={3}>
                <Button
                  variant="outlined"
                  disabled={getStatusIndex(selectedRow.status) === 0}
                  onClick={() => updateStatus("prev")}
                >
                  Previous
                </Button>

                <Button
                  variant="contained"
                  disabled={getStatusIndex(selectedRow.status) === STATUS_STEPS.length - 1}
                  onClick={() => updateStatus("next")}
                >
                  Next
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
