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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Visibility,
  Edit,
  Schedule,
  Group,
} from "@mui/icons-material";
import { DatePicker, TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";

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

// Mock panel data
const mockPanels = [
  {
    id: 1,
    name: 'Technical Interview Panel',
    members: [
      { id: 1, name: 'John Smith', role: 'Tech Lead', department: 'Engineering' },
      { id: 2, name: 'Sarah Chen', role: 'Senior Developer', department: 'Engineering' },
    ],
    skills: ['JavaScript', 'React', 'Node.js'],
    status: 'Active',
  },
  {
    id: 2,
    name: 'HR Interview Panel',
    members: [
      { id: 3, name: 'Emily Davis', role: 'HR Manager', department: 'Human Resources' },
      { id: 4, name: 'David Wilson', role: 'Recruiter', department: 'Human Resources' },
    ],
    skills: ['Communication', 'Culture Fit', 'Behavioral'],
    status: 'Active',
  },
];

const interviewTypes = [
  "Technical Round 1",
  "Technical Round 2",
  "Manager Round",
  "HR Round",
  "Final Round"
];

const interviewers = [
  "Tech Lead - Frontend",
  "Tech Lead - Backend",
  "Engineering Manager",
  "HR Manager",
  "CTO"
];

// Step index helper (FIXED)
const getStatusIndex = (status) =>
  STATUS_STEPS.indexOf((status || "APPLIED").toUpperCase());

const isTerminalStatus = (status) => ["HIRED", "REJECTED"].includes(status?.toUpperCase());

export default function ApplicationTrackingTable() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [panels, setPanels] = useState(mockPanels);
  const [scheduleTab, setScheduleTab] = useState(0);

  // Interview scheduling form
  const [interviewDate, setInterviewDate] = useState(null);
  const [interviewTime, setInterviewTime] = useState(null);
  const [interviewType, setInterviewType] = useState("");
  const [interviewer, setInterviewer] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [selectedPanels, setSelectedPanels] = useState([]);

  // ================= LOAD DATA =================
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await getAllApplicationsApi();
        const list = res.data.applications || [];

        const rows = list.map((app, index) => ({
          id: index + 1, // SERIAL NUMBER
          appId: app.application_id, // REAL DB ID
          jobTitle: app.job_title?.trim() ? app.job_title : "Unknown Title",
          appliedOn: app.applied_date || "Not Provided",
         
          // FIXED: convert DB status to uppercase
          status: (app.status || "APPLIED").toUpperCase(),
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

    const newStatus = STATUS_STEPS[newIndex]; // Already uppercase

    try {
      // FIXED: send uppercase status to backend
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

  // ================= SCHEDULE INTERVIEW =================
  const handleScheduleInterview = (row) => {
    setSelectedRow(row);
    setScheduleDialogOpen(true);
    setScheduleTab(0);
    setInterviewDate(null);
    setInterviewTime(null);
    setInterviewType("");
    setInterviewer("");
    setMeetingLink("");
    setSelectedPanels([]);
  };

  const handleUpdateStatus = (row) => {
    setSelectedRow(row);
    setStatusDialogOpen(true);
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedRow) return;

    try {
      await updateApplicationStatusApi(selectedRow.appId, newStatus.toUpperCase());

      const updatedRow = { ...selectedRow, status: newStatus };
      setSelectedRow(updatedRow);

      setApplications((prev) =>
        prev.map((app) =>
          app.appId === selectedRow.appId ? { ...app, status: newStatus } : app
        )
      );
      setStatusDialogOpen(false);
    } catch (err) {
      console.error("Update status error:", err);
      alert("Failed to update status");
    }
  };

  const handleScheduleSubmit = async () => {
    if (!selectedRow) return;

    if (scheduleTab === 0) {
      // Direct scheduling
      if (!interviewDate || !interviewTime) {
        alert("Please select both date and time.");
        return;
      }

      const combinedDate = new Date(interviewDate);
      combinedDate.setHours(interviewTime.getHours());
      combinedDate.setMinutes(interviewTime.getMinutes());

      try {
        // Update status to INTERVIEW and add interview details
        await updateApplicationStatusApi(selectedRow.appId, "INTERVIEW");
        
        const updatedRow = { 
          ...selectedRow, 
          status: "INTERVIEW",
          interviewDate: combinedDate.toISOString(),
          interviewType: interviewType,
          interviewer: interviewer,
          meetingLink: meetingLink,
        };
        setSelectedRow(updatedRow);

        setApplications((prev) =>
          prev.map((app) =>
            app.appId === selectedRow.appId ? { ...app, status: "INTERVIEW" } : app
          )
        );
        setScheduleDialogOpen(false);
      } catch (err) {
        console.error("Failed to schedule interview:", err);
        alert("Failed to schedule interview");
      }
    } else {
      // Panel-based scheduling
      if (selectedPanels.length === 0) {
        alert("Please select at least one panel.");
        return;
      }

      const selectedPanelData = panels.filter(p => selectedPanels.includes(p.id));
      const panelNames = selectedPanelData.map(p => p.name).join(' + ');
      const allMembers = selectedPanelData.flatMap(p => p.members);
      const interviewerNames = [...new Set(allMembers.map(m => m.name))].join(', ');
      
      try {
        await updateApplicationStatusApi(selectedRow.appId, "INTERVIEW");
        
        const updatedRow = { 
          ...selectedRow, 
          status: "INTERVIEW",
          interviewType: `Panel - ${panelNames}`,
          interviewer: interviewerNames,
         
        };
        setSelectedRow(updatedRow);

        setApplications((prev) =>
          prev.map((app) =>
            app.appId === selectedRow.appId ? { ...app, status: "INTERVIEW" } : app
          )
        );
        setScheduleDialogOpen(false);
      } catch (err) {
        console.error("Failed to schedule panel interview:", err);
        alert("Failed to schedule panel interview");
      }
    }
  };

  // ================= NAVIGATION =================
  const handleNavigateToPanelManagement = () => {
    navigate("/recruitment/panel-management");
  };

  // ================= PANEL SELECTION =================
  const handlePanelSelectionChange = (event) => {
    const { value } = event.target;
    setSelectedPanels(typeof value === 'string' ? value.split(',') : value);
  };

  // ================= TABLE COLUMNS =================
  const columns = [
    { field: "id", headerName: "Serial_No", width: 110 },
    { field: "jobTitle", headerName: "Job Title", width: 220 },
   
    { field: "appliedOn", headerName: "Applied On", width: 150 },

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
      width: 180,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <IconButton
            size="small"
            onClick={() => handleOpen(params.row)}
            color="info"
            title="View Details"
          >
            <Visibility />
          </IconButton>

          {params.row.status === "SCREENING" && (
            <IconButton
              size="small"
              onClick={() => handleScheduleInterview(params.row)}
              color="warning"
              title="Schedule Interview"
            >
              <Schedule />
            </IconButton>
          )}

          {!isTerminalStatus(params.row.status) && (
            <IconButton
              size="small"
              onClick={() => handleUpdateStatus(params.row)}
              color="primary"
              title="Update Status"
            >
              <Edit />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={3}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Job Application Tracking
        </Typography>

        <Box sx={{ height: 480, bgcolor: "#fff" }}>
          <DataGrid rows={applications} columns={columns} pageSize={8} />
        </Box>

        {/* ================= PROGRESS MODAL ================= */}
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
                  {selectedRow.jobTitle}
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

        {/* ================= SCHEDULE INTERVIEW DIALOG ================= */}
        <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Schedule Interview — {selectedRow?.candidateName}
          </DialogTitle>
          <DialogContent>
            <Tabs value={scheduleTab} onChange={(e, newValue) => setScheduleTab(newValue)} sx={{ mb: 2 }}>
              <Tab label="Direct Scheduling" />
              <Tab label="Panel Scheduling" />
            </Tabs>

            {scheduleTab === 0 ? (
              // Direct Scheduling Tab
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Interview Date *"
                    value={interviewDate}
                    onChange={setInterviewDate}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    minDate={new Date()}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TimePicker
                    label="Interview Time *"
                    value={interviewTime}
                    onChange={setInterviewTime}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Interview Type</InputLabel>
                    <Select 
                      value={interviewType} 
                      onChange={(e) => setInterviewType(e.target.value)} 
                      label="Interview Type"
                      sx={{ 
                        minHeight: '56px',
                        '& .MuiSelect-select': {
                          padding: '12px 14px',
                          fontSize: '0.875rem'
                        }
                      }}
                    >
                      {interviewTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Interviewer</InputLabel>
                    <Select 
                      value={interviewer} 
                      onChange={(e) => setInterviewer(e.target.value)} 
                      label="Interviewer"
                      sx={{ 
                        minHeight: '56px',
                        '& .MuiSelect-select': {
                          padding: '12px 14px',
                          fontSize: '0.875rem'
                        }
                      }}
                    >
                      {interviewers.map(person => <MenuItem key={person} value={person}>{person}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Meeting Link"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                  />
                </Grid>
              </Grid>
            ) : (
              // Panel Scheduling Tab
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Select Interview Panels *</InputLabel>
                    <Select 
                      multiple
                      value={selectedPanels}
                      onChange={handlePanelSelectionChange}
                      label="Select Interview Panels *"
                      sx={{ 
                        minHeight: '56px',
                        '& .MuiSelect-select': {
                          padding: '12px 14px',
                          minHeight: '32px',
                          fontSize: '0.875rem'
                        }
                      }}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const panel = panels.find(p => p.id === value);
                            return panel ? (
                              <Chip key={value} label={panel.name} size="small" />
                            ) : null;
                          })}
                        </Box>
                      )}
                    >
                      {panels.filter(panel => panel.status === 'Active').map(panel => (
                        <MenuItem key={panel.id} value={panel.id}>
                          {panel.name} ({panel.members.length} members)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                    Don't see a suitable panel?{' '}
                    <Button 
                      size="small" 
                      onClick={handleNavigateToPanelManagement}
                      sx={{ minWidth: 'auto', p: 0 }}
                    >
                      Create new panel
                    </Button>
                  </Typography>
                </Grid>

                {selectedPanels.length > 0 && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Selected Panels ({selectedPanels.length}):
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        {selectedPanels.map(panelId => {
                          const panel = panels.find(p => p.id === panelId);
                          return panel ? (
                            <Box key={panel.id} sx={{ mb: 2 }}>
                              <Typography variant="body2" fontWeight="bold" color="primary">
                                {panel.name}
                              </Typography>
                              <Box sx={{ pl: 1 }}>
                                {panel.members.map(member => (
                                  <Typography key={member.id} variant="body2" color="textSecondary">
                                    • {member.name} - {member.role}
                                  </Typography>
                                ))}
                              </Box>
                            </Box>
                          ) : null;
                        })}
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      
                    </Grid>
                  </>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleScheduleSubmit} 
              variant="contained" 
              disabled={
                (scheduleTab === 0 ? (!interviewDate || !interviewTime) : (selectedPanels.length === 0))
              }
            >
              Schedule Interview
            </Button>
          </DialogActions>
        </Dialog>

        {/* ================= UPDATE STATUS DIALOG ================= */}
        <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Status for {selectedRow?.candidateName}</DialogTitle>
          <DialogContent>
            <Typography variant="body1" mb={2}>
              Current status: <strong>{STATUS_LABEL[selectedRow?.status] || "Unknown"}</strong>
            </Typography>
            <Box display="flex" flexDirection="column" gap={1.5}>
              {Object.entries(STATUS_LABEL).map(([status, label]) => {
                if (status === "HIRED" || status === "REJECTED") return null; // Hide terminal statuses from quick update
                
                const isCurrent = selectedRow?.status === status;
                const currentIndex = getStatusIndex(selectedRow?.status);
                const statusIndex = getStatusIndex(status);
                const isInvalid = statusIndex < currentIndex;

                return (
                  <Button
                    key={status}
                    variant={isCurrent ? "contained" : "outlined"}
                    color={STATUS_COLOR[status] || "primary"}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={isInvalid}
                    sx={{ 
                      justifyContent: "flex-start", 
                      py: 1.5,
                      opacity: isInvalid ? 0.6 : 1,
                      cursor: isInvalid ? "not-allowed" : "pointer"
                    }}
                    size="large"
                  >
                    {label}
                    {isInvalid && (
                      <Typography ml={1} color="textSecondary" fontSize="0.875rem">(locked)</Typography>
                    )}
                  </Button>
                );
              })}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}