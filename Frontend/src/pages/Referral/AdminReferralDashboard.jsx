import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  IconButton,
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
  Download,
  Schedule,
  Group,
  CalendarToday
} from "@mui/icons-material";
import { DatePicker, TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getAllReferralsAdmin,
  updateReferralStatusAdmin
} from "../../features/auth/adminSlice";

// ===== STATUS WORKFLOW CONFIG =====
const STATUS_ORDER = {
  submitted: 0,
  shortlisted: 1,
  interview: 2,
  hired: 3,
  rejected: 3,
};

const isTerminalStatus = (status) => ["hired", "rejected"].includes(status);

const statusColors = {
  submitted: "default",
  shortlisted: "primary",
  interview: "warning",
  hired: "success",
  rejected: "error"
};

const statusLabels = {
  submitted: "Submitted",
  shortlisted: "Shortlisted",
  interview: "Interview",
  hired: "Hired",
  rejected: "Rejected"
};

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

// Mock panel data - you can replace this with actual API calls
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
  {
    id: 3,
    name: 'Management Interview Panel',
    members: [
      { id: 5, name: 'Lisa Brown', role: 'Director', department: 'Management' },
      { id: 6, name: 'Robert Taylor', role: 'VP Engineering', department: 'Management' },
    ],
    skills: ['Leadership', 'Strategy', 'Management'],
    status: 'Active',
  },
];

const normalizeReferral = (ref) => ({
  id: ref.id,
  referralId: ref.referral_id,
  candidateName: ref.candidate_name || "—",
  candidateEmail: ref.candidate_email || "—",
  candidatePhone: ref.phone_number || "—",
  position: ref.position || "—",
  experience: ref.work_exp || "",
  referredBy: ref.referrer_name || "—",
  referralDate: ref.referred_at,
  status: (ref.status || "Submitted").toLowerCase(),
  resumeUrl: ref.resume ? `/uploads/resumes/${ref.resume.resume}` : null,
  resumeName: ref.resume?.resume || "resume.pdf",
  interviewDate: ref.interview_date,
  interviewType: ref.interview_type,
  interviewer: ref.interviewer,
  meetingLink: ref.meeting_link,
  interviewNotes: ref.interview_notes,
});

export default function AdminReferralDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allReferrals, referralsLoading, error, referralActionLoading } = useSelector((state) => state.admin);

  const [selectedReferral, setSelectedReferral] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [panels, setPanels] = useState(mockPanels);
  const [scheduleTab, setScheduleTab] = useState(0); // 0 for direct, 1 for panel

  // Interview scheduling form
  const [interviewDate, setInterviewDate] = useState(null);
  const [interviewTime, setInterviewTime] = useState(null);
  const [interviewType, setInterviewType] = useState("");
  const [interviewer, setInterviewer] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [selectedPanels, setSelectedPanels] = useState([]);

  useEffect(() => {
    dispatch(getAllReferralsAdmin());
  }, [dispatch]);

  const handleViewDetails = (referral) => {
    setSelectedReferral(referral);
    setViewDialogOpen(true);
  };

  const handleScheduleInterview = (referral) => {
    setSelectedReferral(referral);
    setScheduleDialogOpen(true);
    setScheduleTab(0);
    setInterviewDate(null);
    setInterviewTime(null);
    setInterviewType("");
    setInterviewer("");
    setMeetingLink("");
    setSelectedPanels([]);
  };

  const handleUpdateStatus = (referral) => {
    setSelectedReferral(referral);
    setStatusDialogOpen(true);
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const titleCaseStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
      await dispatch(
        updateReferralStatusAdmin({ 
          id: selectedReferral.id, 
          status: titleCaseStatus 
        })
      ).unwrap();
      setStatusDialogOpen(false);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleScheduleSubmit = async () => {
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
        await dispatch(
          updateReferralStatusAdmin({
            id: selectedReferral.id,
            status: "Interview",
            interview_date: combinedDate.toISOString(),
            interview_type: interviewType,
            interviewer: interviewer,
            meeting_link: meetingLink,
          })
        ).unwrap();
        setScheduleDialogOpen(false);
      } catch (err) {
        console.error("Failed to schedule interview:", err);
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
        await dispatch(
          updateReferralStatusAdmin({
            id: selectedReferral.id,
            status: "Interview",
            interview_type: `Panel - ${panelNames}`,
            interviewer: interviewerNames,
           
          })
        ).unwrap();
        setScheduleDialogOpen(false);
      } catch (err) {
        console.error("Failed to schedule panel interview:", err);
      }
    }
  };

  const handleViewResume = (referral) => {
    setSelectedReferral(referral);
    setResumeDialogOpen(true);
  };

  const handleDownloadResume = (referral) => {
    if (!referral.resumeUrl) return;
    const link = document.createElement('a');
    link.href = referral.resumeUrl;
    link.download = referral.resumeName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ✅ Only keep navigation for create new panel
  const handleNavigateToPanelManagement = () => {
    navigate("/recruitment/panel-management");
  };

  // ✅ Handle multiple panel selection
  const handlePanelSelectionChange = (event) => {
    const { value } = event.target;
    setSelectedPanels(typeof value === 'string' ? value.split(',') : value);
  };

  const filteredReferrals = allReferrals
    .map(normalizeReferral)
    .filter(referral => {
      const matchesStatus = statusFilter === "all" || referral.status === statusFilter;
      const matchesSearch = 
        referral.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        referral.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        referral.referredBy.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });

  if (referralsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={4} sx={{ background: "#f4f7fb", minHeight: "100vh" }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.error || error.message || "Failed to load referrals"}
          </Alert>
        )}

        <Typography variant="h4" fontWeight={600} mb={2}>
          Referral Management Dashboard
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <TextField
            placeholder="Search candidates, positions, or referrers..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 400 }}
          />
          <Box>
            <Button size="small" onClick={() => setStatusFilter("all")} color={statusFilter === "all" ? "primary" : "inherit"}>All</Button>
            {Object.keys(statusLabels).map(status => (
              <Button key={status} size="small" onClick={() => setStatusFilter(status)} color={statusFilter === status ? "primary" : "inherit"} sx={{ ml: 1 }}>{statusLabels[status]}</Button>
            ))}
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Candidate</strong></TableCell>
                <TableCell><strong>Position</strong></TableCell>
                <TableCell><strong>Experience</strong></TableCell>
                <TableCell><strong>Referred By</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Resume</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReferrals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary">No referrals found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReferrals.map((referral) => (
                  <TableRow key={referral.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{referral.candidateName}</Typography>
                        <Typography variant="body2" color="textSecondary">{referral.candidateEmail}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{referral.position}</TableCell>
                    <TableCell>{referral.experience}</TableCell>
                    <TableCell>{referral.referredBy}</TableCell>
                    <TableCell>
                      {referral.referralDate
                        ? new Date(referral.referralDate).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusLabels[referral.status] || referral.status}
                        color={statusColors[referral.status] || "default"}
                        size="small"
                      />
                      {referral.interviewDate && (
                        <Typography variant="caption" display="block" color="textSecondary">
                          {new Date(referral.interviewDate).toLocaleString()}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        {referral.resumeUrl && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleViewResume(referral)}
                              color="primary"
                              title="Preview Resume"
                            >
                              <Visibility />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadResume(referral)}
                              color="secondary"
                              title="Download Resume"
                            >
                              <Download />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(referral)}
                          color="info"
                          title="View Details"
                        >
                          <Visibility />
                        </IconButton>

                        {referral.status === "shortlisted" && (
                          <IconButton
                            size="small"
                            onClick={() => handleScheduleInterview(referral)}
                            color="warning"
                            title="Schedule Interview"
                          >
                            <Schedule />
                          </IconButton>
                        )}

                        {!isTerminalStatus(referral.status) && (
                          <IconButton
                            size="small"
                            onClick={() => handleUpdateStatus(referral)}
                            color="primary"
                            title="Update Status"
                          >
                            <Edit />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Schedule Interview Dialog */}
        <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Schedule Interview — {selectedReferral?.candidateName}
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
                      sx={{ minHeight: '56px' }}
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
                      sx={{ minHeight: '56px' }}
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
                      sx={{ minHeight: '56px' }}
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
                referralActionLoading || 
                (scheduleTab === 0 ? (!interviewDate || !interviewTime) : (selectedPanels.length === 0))
              }
            >
              {referralActionLoading ? "Scheduling..." : "Schedule Interview"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Update Status Dialog */}
        <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Status for {selectedReferral?.candidateName}</DialogTitle>
          <DialogContent>
            <Typography variant="body1" mb={2}>
              Current status: <strong>{statusLabels[selectedReferral?.status] || "Unknown"}</strong>
            </Typography>
            <Box display="flex" flexDirection="column" gap={1.5}>
              {Object.entries(statusLabels).map(([status, label]) => {
                const isCurrent = selectedReferral?.status === status;
                const isBefore = STATUS_ORDER[status] < STATUS_ORDER[selectedReferral?.status];
                const isTerminal = isTerminalStatus(selectedReferral?.status);
                const isInvalid = isBefore || isTerminal;

                return (
                  <Button
                    key={status}
                    variant={isCurrent ? "contained" : "outlined"}
                    color={statusColors[status] || "primary"}
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
                    {isBefore && (
                      <Typography ml={1} color="textSecondary" fontSize="0.875rem">(locked)</Typography>
                    )}
                    {isTerminal && (
                      <Typography ml={1} color="textSecondary" fontSize="0.875rem">(final)</Typography>
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

        {/* Resume Dialog */}
        <Dialog open={resumeDialogOpen} onClose={() => setResumeDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Resume Preview</DialogTitle>
          <DialogContent>
            {selectedReferral?.resumeUrl ? (
              <iframe
                src={selectedReferral.resumeUrl}
                title="Resume Preview"
                width="100%"
                height="500px"
                style={{ border: "1px solid #ddd" }}
              />
            ) : (
              <Typography>No resume available.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setResumeDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}