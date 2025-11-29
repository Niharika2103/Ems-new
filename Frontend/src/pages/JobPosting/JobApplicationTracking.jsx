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
  filterApplicationsApi,
} from "../../api/authApi";

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

const getStatusIndex = (status) =>
  STATUS_STEPS.indexOf((status || "APPLIED").toUpperCase());

export default function ApplicationTrackingTable() {
  const [open, setOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  // ----------------- FILTER STATE -----------------
  const [filters, setFilters] = useState({
    status: "",
    skills: "",
    experience: "",
    location: "",
    startDate: "",
    endDate: "",
  });

  // ----------------- APPLY FILTERS -----------------
  const handleFilter = async () => {
    try {
      const res = await filterApplicationsApi(filters);
      const list = res.data.applications || [];

      const rows = list.map((app, index) => ({
        id: index + 1,
        appId: app.application_id,
        jobTitle: app.job_title?.trim() ? app.job_title : "Unknown Title",
        appliedOn: app.applied_date || "Not Provided",
        status: (app.status || "APPLIED").toUpperCase(),
      }));

      setApplications(rows);
    } catch (err) {
      console.error("Filter error:", err);
      alert("Failed to filter applications");
    }
  };

  // ----------------- REMOVE FILTERS -----------------
  const handleClearFilters = async () => {
    setFilters({
      status: "",
      skills: "",
      experience: "",
      location: "",
      startDate: "",
      endDate: "",
    });

    try {
      const res = await getAllApplicationsApi();
      const list = res.data.applications || [];

      const rows = list.map((app, index) => ({
        id: index + 1,
        appId: app.application_id,
        jobTitle: app.job_title?.trim() ? app.job_title : "Unknown Title",
        appliedOn: app.applied_date || "Not Provided",
        status: (app.status || "APPLIED").toUpperCase(),
      }));

      setApplications(rows);
    } catch (err) {
      console.error("Error loading all applications:", err);
    }
  };

  // ---------------- LOAD ALL APPLICATIONS INITIALLY ----------------
  useEffect(() => {
    handleClearFilters();
  }, []);

  const handleOpen = (row) => {
    setSelectedRow({ ...row });
    setOpen(true);
  };

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
      await updateApplicationStatusApi(selectedRow.appId, newStatus.toUpperCase());

      const updatedRow = { ...selectedRow, status: newStatus };
      setSelectedRow(updatedRow);

      setApplications((prev) =>
        prev.map((app) =>
          app.appId === selectedRow.appId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      console.error("Update status error:", err);
      alert("Failed to update status");
    }
  };

  // ------------------ TABLE COLUMNS ------------------
  const columns = [
    { field: "id", headerName: "Serial_No", width: 110 },
    { field: "jobTitle", headerName: "Job Title", width: 220 },
    { field: "appliedOn", headerName: "Applied On", width: 200 },

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
      width: 140,
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

      {/* ---------------- FILTER SECTION ---------------- */}
      <Box
        display="flex"
        gap={2}
        mb={2}
        flexWrap="wrap"
        sx={{ bgcolor: "#fff", p: 2, borderRadius: 2 }}
      >
        <select
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, status: e.target.value }))
          }
          style={{ padding: "8px", borderRadius: "5px" }}
          value={filters.status}
        >
          <option value="">Status</option>
          <option value="APPLIED">Applied</option>
          <option value="SCREENING">Screening</option>
          <option value="INTERVIEW">Interview</option>
          <option value="DECISION">Decision</option>
        </select>

        <input
          type="text"
          placeholder="Skills"
          value={filters.skills}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, skills: e.target.value }))
          }
          style={{ padding: "8px", borderRadius: "5px" }}
        />

        <input
          type="text"
          placeholder="Location"
          value={filters.location}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, location: e.target.value }))
          }
          style={{ padding: "8px", borderRadius: "5px" }}
        />

        <input
          type="text"
          placeholder="Experience (ex: 1)"
          value={filters.experience}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, experience: e.target.value }))
          }
          style={{ padding: "8px", borderRadius: "5px" }}
        />

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, startDate: e.target.value }))
          }
          style={{ padding: "8px", borderRadius: "5px" }}
        />

        <input
          type="date"
          value={filters.endDate}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, endDate: e.target.value }))
          }
          style={{ padding: "8px", borderRadius: "5px" }}
        />

        {/* APPLY FILTERS BUTTON */}
        <Button
          variant="contained"
          onClick={handleFilter}
          sx={{
            backgroundColor: "#1976d2",
            color: "white",
            px: 3,
            py: 1,
            fontWeight: "bold",
            borderRadius: "6px",
            "&:hover": { backgroundColor: "#115293" },
          }}
        >
          APPLY FILTERS
        </Button>

        {/* REMOVE FILTERS BUTTON (MATCHING STYLE) */}
        <Button
          variant="contained"
          onClick={handleClearFilters}
          sx={{
            backgroundColor: "#d32f2f",
            color: "white",
            px: 3,
            py: 1,
            fontWeight: "bold",
            borderRadius: "6px",
            "&:hover": { backgroundColor: "#9a0007" },
          }}
        >
          REMOVE FILTERS
        </Button>
      </Box>

      {/* ------------------ TABLE ------------------ */}
      <Box sx={{ height: 480, bgcolor: "#fff" }}>
        <DataGrid rows={applications} columns={columns} pageSize={8} />
      </Box>

      {/* ------------------ MODAL ------------------ */}
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

              <Typography variant="subtitle1">{selectedRow.jobTitle}</Typography>

              <Typography variant="body2" color="text.secondary" mb={2}>
                Applied On: {selectedRow.appliedOn}
              </Typography>

              <Stepper
                activeStep={getStatusIndex(selectedRow.status)}
                alternativeLabel
              >
                {STATUS_STEPS.map((dbStatus) => (
                  <Step key={dbStatus}>
                    <StepLabel>{STATUS_LABEL[dbStatus]}</StepLabel>
                  </Step>
                ))}
              </Stepper>

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
                  disabled={
                    getStatusIndex(selectedRow.status) ===
                    STATUS_STEPS.length - 1
                  }
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
