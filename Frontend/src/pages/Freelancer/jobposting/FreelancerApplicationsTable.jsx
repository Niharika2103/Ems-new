// FreelancerApplicationsTable.js
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
import { Visibility, Edit, Schedule } from "@mui/icons-material";
import {
  DatePicker,
  TimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";

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
const interviewTypes = [
  "Technical Round 1",
  "Technical Round 2",
  "Manager Round",
  "HR Round",
  "Final Round",
];

const getStatusIndex = (status) => {
  const upper = (status || "APPLIED").toUpperCase();
  const idx = STATUS_STEPS.indexOf(upper);
  if (idx !== -1) return idx;
  return STATUS_STEPS.length - 1;
};

const isTerminalStatus = (status) =>
  ["HIRED", "REJECTED"].includes(status?.toUpperCase());

// ---------- helpers to format local date/time ----------
const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);

const formatDateLocal = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${year}-${month}-${day}`; // yyyy-mm-dd
};

const formatTimeLocal = (date) => {
  const d = new Date(date);
  const hours = pad2(d.getHours());
  const minutes = pad2(d.getMinutes());
  const seconds = "00";
  return `${hours}:${minutes}:${seconds}`; // HH:mm:ss
};

const formatDateTime = (value) => {
  if (!value) return "Not Provided";
  const d = new Date(value);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// ========== MOCK DATA GENERATION ==========
const generateMockData = () => {
  const jobTitles = [
    "Frontend Developer", "UI/UX Designer", "Full Stack Developer",
    "React Specialist", "Mobile App Developer", "Backend Engineer",
    "DevOps Consultant", "Data Analyst"
  ];
  const freelancerNames = [
    "Alex Johnson", "Maria Garcia", "David Chen", "Sarah Williams",
    "James Wilson", "Emma Brown", "Michael Lee", "Sophia Martinez"
  ];
  const skills = [
    "React, JavaScript, HTML/CSS", "UI/UX, Figma, Prototyping",
    "Node.js, MongoDB, Express", "Python, Django, PostgreSQL",
    "AWS, Docker, CI/CD", "React Native, Firebase",
    "TypeScript, Next.js, GraphQL", "Java, Spring Boot, Microservices"
  ];
  const locations = ["Remote", "New York", "London", "Berlin", "Toronto", "Sydney"];
  const statuses = ["APPLIED", "SCREENING", "INTERVIEW", "DECISION", "HIRED", "REJECTED"];
  
  const applications = [];
  const startDate = new Date(2024, 0, 1);
  
  for (let i = 1; i <= 25; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const appliedDate = new Date(startDate);
    appliedDate.setDate(startDate.getDate() + Math.floor(Math.random() * 180));
    
    applications.push({
      id: i,
      appId: `APP${1000 + i}`,
      candidateName: freelancerNames[Math.floor(Math.random() * freelancerNames.length)],
      jobTitle: jobTitles[Math.floor(Math.random() * jobTitles.length)],
      appliedOn: formatDateTime(appliedDate),
      status: status,
      skills: skills[Math.floor(Math.random() * skills.length)],
      experience: `${Math.floor(Math.random() * 10) + 1}`,
      location: locations[Math.floor(Math.random() * locations.length)],
    });
  }
  return applications;
};

const generateMockPanels = () => {
  const panelNames = ["Tech Interview Panel", "Design Review Panel", "Final Hiring Panel"];
  const members = [
    { id: 1, employee_id: 101, name: "John Smith", role: "Senior Developer", fullname: "John Smith", designation: "Senior Developer" },
    { id: 2, employee_id: 102, name: "Lisa Wong", role: "Design Lead", fullname: "Lisa Wong", designation: "Design Lead" },
    { id: 3, employee_id: 103, name: "Robert Kim", role: "Project Manager", fullname: "Robert Kim", designation: "Project Manager" },
    { id: 4, employee_id: 104, name: "Emma Davis", role: "HR Manager", fullname: "Emma Davis", designation: "HR Manager" },
  ];
  
  return panelNames.map((name, index) => ({
    id: index + 1,
    panel_name: name,
    name: name,
    members: members.slice(0, 2 + (index % 3)).map(m => ({
      id: m.employee_id,
      employee_id: m.employee_id,
      name: m.name,
      role: m.role,
      fullname: m.fullname,
      designation: m.designation,
    })),
    status: "Active",
  }));
};

/* ================= RESCHEDULE POPUP ================= */
const RescheduleInterviewDialog = ({
  open,
  onClose,
  interviewData,
  panels,
  onSubmit,
}) => {
  const navigate = useNavigate();

  const [roundName, setRoundName] = useState(
    interviewData?.interview_type || ""
  );

  const [selectedPanelId, setSelectedPanelId] = useState("");
  const [selectedInterviewerIds, setSelectedInterviewerIds] = useState([]);

  const [interviewDate, setInterviewDate] = useState(null);
  const [interviewTime, setInterviewTime] = useState(null);
  const [meetingLink, setMeetingLink] = useState(
    interviewData?.location || ""
  );

  const selectedPanel =
    panels.find((p) => p.id === selectedPanelId) || null;
  const panelMembers = selectedPanel?.members || [];

  const toggleInterviewer = (memberId) => {
    setSelectedInterviewerIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle>
        Reschedule Interview — {interviewData?.candidate_name}
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2} mt={1}>
          {/* Round name */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              label="Interview Round Name"
              value={roundName}
              onChange={(e) => setRoundName(e.target.value)}
            />
          </Grid>

          {/* Panel select */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>Select Interview Panel</InputLabel>
              <Select
                value={selectedPanelId}
                label="Select Interview Panel"
                onChange={(e) => {
                  setSelectedPanelId(e.target.value);
                  setSelectedInterviewerIds([]);
                }}
              >
                {panels.map((panel) => (
                  <MenuItem key={panel.id} value={panel.id}>
                    {panel.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="body2" mt={1}>
              Don't see a panel?{" "}
              <span
                style={{ color: "#1976d2", cursor: "pointer" }}
                onClick={() => navigate("/recruitment/panel-management")}
              >
                CREATE NEW PANEL
              </span>
            </Typography>
          </Grid>

          {/* Interview date */}
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Interview Date *"
                value={interviewDate}
                onChange={(newValue) => setInterviewDate(newValue)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
          </Grid>

          {/* Panel members */}
          {selectedPanel && (
            <Grid item xs={12}>
              <Typography mt={2} fontWeight="bold">
                Select Interviewers ({panelMembers.length})
              </Typography>

              <Grid container spacing={1} mt={1}>
                {panelMembers.map((member) => (
                  <Grid item xs={12} md={6} key={member.id}>
                    <Box display="flex" alignItems="center">
                      <input
                        type="checkbox"
                        checked={selectedInterviewerIds.includes(member.id)}
                        onChange={() => toggleInterviewer(member.id)}
                        style={{ marginRight: 8 }}
                      />
                      <Typography variant="body2">
                        {member.name} ({selectedPanel.name}) - {member.role}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}

          {/* Time + meeting link */}
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TimePicker
                label="Interview Time *"
                value={interviewTime}
                onChange={(newValue) => setInterviewTime(newValue)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Meeting Link / Location"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>CANCEL</Button>

        <Button
          variant="contained"
          disabled={!roundName || !interviewDate || !interviewTime}
          onClick={() =>
            onSubmit({
              roundName,
              selectedPanelId,
              selectedInterviewerIds,
              interviewDate,
              interviewTime,
              meetingLink,
            })
          }
        >
          RESCHEDULE INTERVIEW
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* ================= MAIN COMPONENT ================= */
export default function FreelancerApplicationsTable() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [panels, setPanels] = useState([]);
  const [scheduleTab, setScheduleTab] = useState(0);
  const [interviewers, setInterviewers] = useState([]);
  const [interviewsList, setInterviewsList] = useState([]);
  const [interviewSelectDialog, setInterviewSelectDialog] = useState(false);
  const [selectedInterviewId, setSelectedInterviewId] = useState(null);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState(null);

  // Interview scheduling form
  const [interviewDate, setInterviewDate] = useState(new Date());
  const [interviewTime, setInterviewTime] = useState(new Date());
  const [interviewType, setInterviewType] = useState("");
  const [interviewer, setInterviewer] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [selectedPanels, setSelectedPanels] = useState([]);

  // ----------------- FILTER STATE -----------------
  const [filters, setFilters] = useState({
    status: "",
    skills: "",
    experience: "",
    location: "",
    startDate: "",
    endDate: "",
  });

  // ----------------- LOAD ALL APPLICATIONS INITIALLY ----------------
  useEffect(() => {
    const mockApps = generateMockData();
    const mockPanels = generateMockPanels();
    
    const rows = mockApps.map((app, index) => ({
      id: index + 1,
      appId: app.appId,
      candidateName: app.candidateName,
      jobTitle: app.jobTitle,
      appliedOn: app.appliedOn,
      status: app.status,
    }));

    setApplications(rows);
    setPanels(mockPanels);
    
    const allMembers = mockPanels.flatMap((panel) => panel.members);
    setInterviewers(allMembers);
  }, []);

  // ----------------- APPLY FILTERS -----------------
  const handleFilter = async () => {
    const filtered = applications.filter(app => {
      if (filters.status && app.status !== filters.status) return false;
      if (filters.skills && !app.skills?.toLowerCase().includes(filters.skills.toLowerCase())) return false;
      if (filters.experience && !app.experience?.includes(filters.experience)) return false;
      if (filters.location && !app.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.startDate || filters.endDate) {
        const appDate = new Date(app.appliedOn.split(' ')[0]);
        if (filters.startDate && appDate < new Date(filters.startDate)) return false;
        if (filters.endDate && appDate > new Date(filters.endDate)) return false;
      }
      return true;
    });

    const rows = filtered.map((app, index) => ({
      id: index + 1,
      appId: app.appId,
      candidateName: app.candidateName,
      jobTitle: app.jobTitle,
      appliedOn: app.appliedOn,
      status: app.status,
    }));

    setApplications(rows);
  };

  // ----------------- REMOVE FILTERS + LOAD ALL -----------------
  const handleClearFilters = async () => {
    setFilters({
      status: "",
      skills: "",
      experience: "",
      location: "",
      startDate: "",
      endDate: "",
    });

    const mockApps = generateMockData();
    const rows = mockApps.map((app, index) => ({
      id: index + 1,
      appId: app.appId,
      candidateName: app.candidateName,
      jobTitle: app.jobTitle,
      appliedOn: app.appliedOn,
      status: app.status,
    }));

    setApplications(rows);
  };

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

    const updatedRow = { ...selectedRow, status: newStatus };
    setSelectedRow(updatedRow);

    setApplications((prev) =>
      prev.map((app) =>
        app.appId === selectedRow.appId ? { ...app, status: newStatus } : app
      )
    );
  };

  // ================= SCHEDULE INTERVIEW =================
  const handleScheduleInterview = (row) => {
    setSelectedRow(row);
    setScheduleDialogOpen(true);
    setScheduleTab(0);
    setInterviewDate(new Date());
    setInterviewTime(new Date());
    setInterviewType("");
    setInterviewer("");
    setMeetingLink("");
    setSelectedPanels([]);
  };

  const handleUpdateStatus = async (row) => {
    setSelectedRow(row);
    setStatusDialogOpen(true);

    // Generate mock interviews
    const mockInterviews = [
      {
        interview_id: 1,
        interview_type: "Technical Round 1",
        interview_date: formatDateLocal(new Date()),
        interview_time: "14:30:00",
        location: "https://meet.google.com/abc-defg-hij"
      },
      {
        interview_id: 2,
        interview_type: "HR Round",
        interview_date: formatDateLocal(new Date(Date.now() + 86400000)),
        interview_time: "11:00:00",
        location: "https://meet.google.com/xyz-uvw-rst"
      }
    ];
    setInterviewsList(mockInterviews);
    setSelectedInterviewId(null);
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedRow) return;

    const updatedRow = { ...selectedRow, status: newStatus };
    setSelectedRow(updatedRow);

    setApplications((prev) =>
      prev.map((app) =>
        app.appId === selectedRow.appId ? { ...app, status: newStatus } : app
      )
    );
    setStatusDialogOpen(false);
  };

  const handleScheduleSubmit = async () => {
    if (!selectedRow) return;

    // -------- Direct scheduling ----------
    if (scheduleTab === 0) {
      if (!interviewDate || !interviewTime) {
        alert("Please select both date and time.");
        return;
      }

      const combinedDate = new Date(interviewDate);
      combinedDate.setHours(interviewTime.getHours());
      combinedDate.setMinutes(interviewTime.getMinutes());

      const formattedDate = formatDateLocal(interviewDate);
      const formattedTime = formatTimeLocal(interviewTime);

      const generatedLink = meetingLink || `https://meet.google.com/${Math.random().toString(36).substring(7)}`;

      const updatedRow = {
        ...selectedRow,
        status: "INTERVIEW",
        interviewDate: combinedDate.toISOString(),
        interviewType,
        interviewer,
        meetingLink: generatedLink,
      };

      setSelectedRow(updatedRow);

      setApplications((prev) =>
        prev.map((app) =>
          app.appId === selectedRow.appId
            ? { ...app, status: "INTERVIEW" }
            : app
        )
      );

      setScheduleDialogOpen(false);

      alert(`Interview scheduled.\nGoogle Meet link:\n${generatedLink}`);
    }
    // -------- Panel scheduling ----------
    else {
      if (selectedPanels.length === 0) {
        alert("Please select at least one panel.");
        return;
      }

      const selectedPanelData = panels.filter((p) =>
        selectedPanels.includes(p.id)
      );

      const panelNames = selectedPanelData.map((p) => p.name).join(" + ");
      const allMembers = selectedPanelData.flatMap((p) => p.members);
      const interviewerNames = [...new Set(allMembers.map((m) => m.name))].join(
        ", "
      );

      const generatedLink = meetingLink || `https://meet.google.com/${Math.random().toString(36).substring(7)}`;

      const updatedRow = {
        ...selectedRow,
        status: "INTERVIEW",
        interviewType: `Panel - ${panelNames}`,
        interviewer: interviewerNames,
        meetingLink: generatedLink,
      };

      setSelectedRow(updatedRow);

      setApplications((prev) =>
        prev.map((app) =>
          app.appId === selectedRow.appId
            ? { ...app, status: "INTERVIEW" }
            : app
        )
      );

      setScheduleDialogOpen(false);

      alert(`Panel interview scheduled.\nGoogle Meet link:\n${generatedLink}`);
    }
  };

  // ======== RESCHEDULE FUNCTION ========
  const handleRescheduleInterview = () => {
    if (interviewsList.length === 0) {
      alert("No interviews found.");
      return;
    }

    const latest = interviewsList[interviewsList.length - 1];

    setRescheduleData({
      interview_id: latest.interview_id,
      candidate_name: selectedRow?.candidateName,
      interview_type: latest.interview_type,
      location: latest.location,
    });

    setRescheduleDialogOpen(true);
  };

  // ======== CANCEL FUNCTION ========
  const handleCancelInterview = () => {
    if (interviewsList.length === 0) {
      alert("No interviews found.");
      return;
    }
    setSelectedInterviewId(null);
    setInterviewSelectDialog(true);
  };

  const executeCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this interview?"))
      return;

    alert("Interview cancelled successfully!");
    setInterviewSelectDialog(false);
    setStatusDialogOpen(false);
    handleClearFilters();
  };

  // ======== SUBMIT RESCHEDULE ========
  const submitReschedule = async (form) => {
    alert("Interview rescheduled successfully!");
    setRescheduleDialogOpen(false);
    setStatusDialogOpen(false);
    handleClearFilters();
  };

  const handleNavigateToPanelManagement = () => {
    navigate("/recruitment/panel-management");
  };

  const handlePanelSelectionChange = (event) => {
    const { value } = event.target;
    setSelectedPanels(typeof value === "string" ? value.split(",") : value);
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
            <option value="HIRED">Hired</option>
            <option value="REJECTED">Rejected</option>
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

        {/* ================= SCHEDULE INTERVIEW DIALOG ================= */}
        <Dialog
          open={scheduleDialogOpen}
          onClose={() => setScheduleDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Schedule Interview — {selectedRow?.candidateName}
          </DialogTitle>
          <DialogContent>
            <Tabs
              value={scheduleTab}
              onChange={(e, newValue) => setScheduleTab(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab label="Direct Scheduling" />
              <Tab label="Panel Scheduling" />
            </Tabs>

            {scheduleTab === 0 ? (
              // -------- Direct Scheduling Tab --------
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Interview Date *"
                    value={interviewDate}
                    onChange={setInterviewDate}
                    minDate={new Date()}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    PopperProps={{
                      style: { zIndex: 99999 },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TimePicker
                    label="Interview Time *"
                    value={interviewTime}
                    onChange={setInterviewTime}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    PopperProps={{
                      style: { zIndex: 99999 },
                    }}
                  />
                </Grid>
                {/* Interview Type */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel
                      shrink
                      sx={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: 'rgba(0, 0, 0, 0.87)',
                      }}
                    >
                      Interview Type *
                    </InputLabel>
                    <Select
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value)}
                      label="Interview Type *"
                      displayEmpty
                      sx={{
                        fontSize: '1.05rem',
                        minHeight: '56px',
                        '& .MuiSelect-select': {
                          paddingTop: '14px',
                          paddingBottom: '14px',
                          fontSize: '1.05rem',
                        },
                      }}
                    >
                      <MenuItem value="" disabled>
                        <em>Select interview type</em>
                      </MenuItem>
                      {interviewTypes.map((type) => (
                        <MenuItem key={type} value={type} sx={{ fontSize: '1.05rem' }}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Interviewer */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel
                      shrink
                      sx={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: 'rgba(0, 0, 0, 0.87)',
                      }}
                    >
                      Interviewer *
                    </InputLabel>
                    <Select
                      value={interviewer}
                      onChange={(e) => setInterviewer(e.target.value)}
                      label="Interviewer *"
                      displayEmpty
                      sx={{
                        fontSize: '1.05rem',
                        minHeight: '56px',
                        '& .MuiSelect-select': {
                          paddingTop: '14px',
                          paddingBottom: '14px',
                          fontSize: '1.05rem',
                        },
                      }}
                    >
                      <MenuItem value="" disabled>
                        <em>Select interviewer</em>
                      </MenuItem>
                      {interviewers.map((m) => (
                        <MenuItem key={m.id} value={`${m.name} - ${m.role}`} sx={{ fontSize: '1.05rem' }}>
                          {m.name} — {m.role}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Meeting Link (Paste manually)"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="Paste Google Meet link here"
                    helperText="This link will be stored in the DB (location column) and used as meeting_link."
                  />
                </Grid>
              </Grid>
            ) : (
              // -------- Panel Scheduling Tab --------
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
                        minHeight: "56px",
                        "& .MuiSelect-select": {
                          padding: "12px 14px",
                          minHeight: "32px",
                          fontSize: "0.875rem",
                        },
                      }}
                      renderValue={(selected) => (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {selected.map((value) => {
                            const panel = panels.find((p) => p.id === value);
                            return panel ? (
                              <Chip key={value} label={panel.name} size="small" />
                            ) : null;
                          })}
                        </Box>
                      )}
                    >
                      {panels
                        .filter((panel) => panel.status === "Active")
                        .map((panel) => (
                          <MenuItem key={panel.id} value={panel.id}>
                            {panel.name} ({panel.members.length} members)
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ mt: 1 }}
                  >
                    Don't see a suitable panel?{" "}
                    <Button
                      size="small"
                      onClick={handleNavigateToPanelManagement}
                      sx={{ minWidth: "auto", p: 0 }}
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
                        {selectedPanels.map((panelId) => {
                          const panel = panels.find((p) => p.id === panelId);
                          return panel ? (
                            <Box key={panel.id} sx={{ mb: 2 }}>
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                color="primary"
                              >
                                {panel.name}
                              </Typography>
                              <Box sx={{ pl: 1 }}>
                                {panel.members.map((member) => (
                                  <Typography
                                    key={member.id}
                                    variant="body2"
                                    color="textSecondary"
                                  >
                                    • {member.name} - {member.role}
                                  </Typography>
                                ))}
                              </Box>
                            </Box>
                          ) : null;
                        })}
                      </Box>
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
                scheduleTab === 0
                  ? !interviewDate || !interviewTime
                  : selectedPanels.length === 0
              }
            >
              Schedule Interview
            </Button>
          </DialogActions>
        </Dialog>

        {/* ================= UPDATE STATUS DIALOG ================= */}
        <Dialog
          open={statusDialogOpen}
          onClose={() => setStatusDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Update Status for {selectedRow?.candidateName}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" mb={2}>
              Current status:{" "}
              <strong>{STATUS_LABEL[selectedRow?.status] || "Unknown"}</strong>
            </Typography>

            {selectedRow?.status === "INTERVIEW" && (
              <Box display="flex" flexDirection="column" gap={1.5} mb={2}>
                <Button
                  variant="outlined"
                  color="warning"
                  fullWidth
                  onClick={handleRescheduleInterview}
                >
                  RESCHEDULE INTERVIEW
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={handleCancelInterview}
                >
                  CANCEL INTERVIEW
                </Button>
              </Box>
            )}

            <Box display="flex" flexDirection="column" gap={1.5}>
              {Object.entries(STATUS_LABEL).map(([status, label]) => {
                // hide DECISION, HIRED, REJECTED from this list
                if (
                  status === "HIRED" ||
                  status === "REJECTED" ||
                  status === "DECISION"
                )
                  return null;

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
                      cursor: isInvalid ? "not-allowed" : "pointer",
                    }}
                    size="large"
                  >
                    {label}
                    {isInvalid && (
                      <Typography
                        ml={1}
                        color="textSecondary"
                        fontSize="0.875rem"
                      >
                        (locked)
                      </Typography>
                    )}
                  </Button>
                );
              })}

              {/* Final decisions */}
              <Button
                variant="contained"
                color="success"
                fullWidth
                sx={{ justifyContent: "flex-start", py: 1.5 }}
                onClick={() => handleStatusUpdate("HIRED")}
              >
                HIRED
              </Button>

              <Button
                variant="contained"
                color="error"
                fullWidth
                sx={{ justifyContent: "flex-start", py: 1.5 }}
                onClick={() => handleStatusUpdate("REJECTED")}
              >
                REJECTED
              </Button>
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setStatusDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* ===== SELECT INTERVIEW DIALOG (for CANCEL only now) ===== */}
        <Dialog
          open={interviewSelectDialog}
          onClose={() => setInterviewSelectDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Select Interview to Cancel</DialogTitle>
          <DialogContent>
            {interviewsList.length === 0 ? (
              <Typography>No interviews found.</Typography>
            ) : (
              interviewsList.map((intv) => (
                <Button
                  key={intv.interview_id}
                  fullWidth
                  variant="outlined"
                  sx={{ my: 1 }}
                  onClick={() => {
                    setSelectedInterviewId(intv.interview_id);
                  }}
                >
                  {intv.interview_type} — {intv.interview_date}{" "}
                  {intv.interview_time}
                </Button>
              ))
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setInterviewSelectDialog(false)}>
              Close
            </Button>

            <Button
              variant="contained"
              disabled={!selectedInterviewId}
              onClick={executeCancel}
            >
              Cancel Interview
            </Button>
          </DialogActions>
        </Dialog>

        {/* ===== RESCHEDULE POPUP ===== */}
        {rescheduleDialogOpen && rescheduleData && (
          <RescheduleInterviewDialog
            open={rescheduleDialogOpen}
            onClose={() => setRescheduleDialogOpen(false)}
            interviewData={rescheduleData}
            panels={panels}
            onSubmit={submitReschedule}
          />
        )}
      </Box>
    </LocalizationProvider>
  );
}