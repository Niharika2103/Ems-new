import { useState, useEffect } from "react";
import { API_BASES } from "../../utils/constants";
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
  Alert,
  CircularProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Tooltip,
  TablePagination,
} from "@mui/material";
import {
  Visibility,
  Edit,
  Download,
  Add as AddIcon,
  Schedule as ScheduleIcon,
  CalendarToday, // Add this
  AccessTime,    // Add this
  Timer,         // Add this

} from "@mui/icons-material";
import { DatePicker, TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Redux
import { getAllReferralsAdmin, updateReferralStatusAdmin } from "../../features/auth/adminSlice";

// APIs
import {
  getAllPanelsApi,
  scheduleInterviewReferralApi,
  rescheduleInterviewReferralApi
} from "../../api/authApi";

const EMPLOYEE_URL = API_BASES.EMPLOYEE;

// ===== STATUS CONFIG =====
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

// const normalizeReferral = (ref) => ({
//   id: ref.id,
//   referralId: ref.referral_id,
//   candidateName: ref.candidate_name || "—",
//   candidateEmail: ref.candidate_email || "—",
//   candidatePhone: ref.phone_number || "—",
//   position: ref.position || "—",
//   experience: ref.work_exp || "",
//   referredBy: ref.referrer_name || "—",
//   referralDate: ref.referred_at,
//   status: (ref.status || "Submitted").toLowerCase(),
  // resumeUrl: ref.resume ? `/uploads/resumes/${ref.resume.resume}` : null,
  // resumeName: ref.resume?.resume || "resume.pdf",

  
//   interviewDate: ref.interview_date,
//   interviewType: ref.interview_type,
//   interviewer: ref.interviewer,
//   meetingLink: ref.meeting_link,
//   interviewNotes: ref.interview_notes,
// });

 const normalizeReferral = (ref) => {
  let resumeUrl = null;
  let resumeName = "resume.pdf";

  // ✅ Case 1: Backend already sends full URL
  if (typeof ref.resume === "string") {
    resumeUrl = ref.resume;
    resumeName = ref.resume.split("/").pop();
  }

  // ✅ Case 2: Backend sends JSON { resume: "file.pdf" }
  else if (
    ref.resume &&
    typeof ref.resume === "object" &&
    ref.resume.resume
  ) {

    resumeUrl = `${EMPLOYEE_URL}/uploads/${ref.resume.resume}`;
    resumeName = ref.resume.resume;
  }

  return {
    id: ref.id,
    referralId: ref.referral_id,
    candidateName: ref.candidate_name || "—",
    candidateEmail: ref.candidate_email || "—",
    candidatePhone: ref.phone_number || "—",
    position: ref.position || "—",
    experience: ref.work_exp || "",
    referredBy: ref.referrer_name || "—",
    referralDate: ref.referred_at,
    status: (ref.status || "submitted").toLowerCase(),

    resumeUrl,
    resumeName,

    interviewDate: ref.interview_date,
    interviewType: ref.interview_type,
    interviewer: ref.interviewer,
    meetingLink: ref.meeting_link,
    interviewNotes: ref.interview_notes,
  };
};



export default function AdminReferralDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allReferrals, referralsLoading, error, referralActionLoading } = useSelector((state) => state.admin);

  // Dialog states
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  //const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleMode, setScheduleMode] = useState("new"); // "new" or "reschedule"

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Scheduling form state
  const [panels, setPanels] = useState([]);
  const [loadingPanels, setLoadingPanels] = useState(false);
  const [selectedPanelNames, setSelectedPanelNames] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [roundName, setRoundName] = useState("");
  const [interviewDate, setInterviewDate] = useState(null);
  const [interviewTime, setInterviewTime] = useState(null);
  const [meetingLink, setMeetingLink] = useState("");

  // Pagination
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(10);


  // Fetch data
  useEffect(() => {
    dispatch(getAllReferralsAdmin());
  }, [dispatch]);

  useEffect(() => {
    const fetchPanels = async () => {
      setLoadingPanels(true);
      try {
        const res = await getAllPanelsApi();
        setPanels(res.data || []);
      } catch (err) {
        console.error("Failed to load panels:", err);
      } finally {
        setLoadingPanels(false);
      }
    };
    fetchPanels();
  }, []);

  // Handlers
  const handleViewDetails = (referral) => {
    setSelectedReferral(referral);
    setViewDialogOpen(true);
  };

  // const handleScheduleInterview = (referral, mode) => {
  //   setSelectedReferral(referral);
  //   setScheduleMode(mode);
  //   setScheduleDialogOpen(true);
  //   setSelectedPanelNames([]);
  //   setSelectedMemberIds([]);
  //   setRoundName(mode === "reschedule" ? referral.interviewType || "" : "");
  //   setInterviewDate(null);
  //   setInterviewTime(null);
  //   setMeetingLink(referral.meetingLink || "");
  // };
  const handleScheduleInterview = (referral, mode) => {
  setSelectedReferral(referral);
  setScheduleMode(mode);
  setScheduleDialogOpen(true);
  setSelectedPanelNames([]);
  setSelectedMemberIds([]);
  setRoundName(mode === "reschedule" ? referral.interviewType || "" : "");
  
  // ✅ Set default date to current date
  const now = new Date();
  setInterviewDate(now);
  
  // ✅ Set default time to next hour (e.g., if it's 10:15, set to 11:00)
  const nextHour = new Date(now);
  nextHour.setHours(nextHour.getHours() + 1);
  nextHour.setMinutes(0, 0, 0);
  
  // Format as HH:MM
  const defaultTime = `${nextHour.getHours().toString().padStart(2, '0')}:${nextHour.getMinutes().toString().padStart(2, '0')}`;
  setInterviewTime(defaultTime);
  
  setMeetingLink(referral.meetingLink || "");
};

  const handleUpdateStatus = (referral) => {
    setSelectedReferral(referral);
    setStatusDialogOpen(true);
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const titleCaseStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
      await dispatch(
        updateReferralStatusAdmin({ id: selectedReferral.id, status: titleCaseStatus })
      ).unwrap();
      setStatusDialogOpen(false);
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update status.");
    }
  };

  // const handleViewResume = (referral) => {
  //   setSelectedReferral(referral);
  //   setResumeDialogOpen(true);
  // };


    // const handleDownloadResume = (referral) => {
  //   if (!referral.resumeUrl) return;
  //   const link = document.createElement("a");
  //   link.href = referral.resumeUrl;
  //   link.download = referral.resumeName;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  
  const handleViewResume = (resumeUrl) => {
  if (!resumeUrl) return;
  window.open(resumeUrl, "_blank", "noopener,noreferrer");
};


const handleDownloadResume = (resumeUrl) => {
  if (!resumeUrl) return;

  const filename = resumeUrl.split("/").pop();

  const downloadUrl =
    `${EMPLOYEE_URL}/employee/download/${filename}`;

  window.location.href = downloadUrl; // 🔥 force download
};






  const handleNavigateToPanelManagement = () => {
    navigate("/recruitment/panel-management");
  };
  
  const generateJitsiLink = (candidateName = "Interview") => {
  const randomId = Math.random().toString(36).substring(2, 10);
  const roomName = `${candidateName.replace(/\s+/g, "")}_${Date.now()}_${randomId}`;
  return `https://meet.jit.si/${roomName}`;
};


  // ✅ MAIN FIX: Send correct field based on mode
  const handleScheduleSubmit = async () => {
    if (!roundName.trim()) {
      alert("Interview round name is required.");
      return;
    }
    if (selectedMemberIds.length === 0) {
      alert("Please select at least one interviewer.");
      return;
    }
    if (!interviewDate || !interviewTime || !meetingLink.trim()) {
      alert("Date, time, and meeting link are required.");
      return;
    }

    const dateStr = interviewDate instanceof Date
      ? interviewDate.toISOString().split("T")[0]
      : interviewDate;
    const timeStr = interviewTime instanceof Date
      ? interviewTime.toTimeString().slice(0, 5)
      : interviewTime;

    // ✅ Build payload with correct field name
    const interviewData = {
      round_name: roundName.trim(),
      interview_date: dateStr,
      interview_time: timeStr,
      interviewer_ids: selectedMemberIds,
    };

    if (scheduleMode === "reschedule") {
      interviewData.location = meetingLink.trim(); // ✅ backend expects 'location'
    } else {
      interviewData.meeting_link = meetingLink.trim(); // ✅ backend expects 'meeting_link'
    }

    try {
      if (scheduleMode === "reschedule") {
        await rescheduleInterviewReferralApi(selectedReferral.id, interviewData);
        alert("Interview rescheduled!");
      } else {
        await scheduleInterviewReferralApi(selectedReferral.id, interviewData);
        alert("New interview round scheduled!");
      }

      await dispatch(getAllReferralsAdmin());
      setScheduleDialogOpen(false);
    } catch (err) {
      console.error("Scheduling error:", err);
      alert("Failed to schedule interview.");
    }
  };

  const filteredReferrals = allReferrals
    .map(normalizeReferral)
    .filter((referral) => {
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
  const paginatedReferrals = filteredReferrals.slice(
  page * rowsPerPage,
  page * rowsPerPage + rowsPerPage
);


  const combinedMembers = selectedPanelNames.flatMap(panelName => {
    const panel = panels.find(p => p.panel_name === panelName);
    return panel ? panel.members.map(m => ({ ...m, sourcePanel: panelName })) : [];
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={4} sx={{ background: "#f4f7fb", minHeight: "100vh" }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error.message || "Failed to load referrals"}</Alert>}

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
            {Object.keys(statusLabels).map((status) => (
              <Button
                key={status}
                size="small"
                onClick={() => setStatusFilter(status)}
                color={statusFilter === status ? "primary" : "inherit"}
                sx={{ ml: 1 }}
              >
                {statusLabels[status]}
              </Button>
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
                paginatedReferrals.map((referral) => (
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
                          {new Date(referral.interviewDate).toLocaleString()} ({referral.interviewType})
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        {referral.resumeUrl && (
                          <>
                            {/* <IconButton size="small" onClick={() => handleViewResume(referral)} color="primary">
                              <Visibility />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDownloadResume(referral)} color="secondary">
                              <Download />
                            </IconButton> */}
                            <IconButton
                              size="small"
                              onClick={() => handleViewResume(referral.resumeUrl)}
                              color="primary"
                            >
                              <Visibility />
                            </IconButton>

                            <IconButton
                              size="small"
                              onClick={() =>
                                handleDownloadResume(referral.resumeUrl, referral.resumeName)
                              }
                              color="secondary"
                            >
                              <Download />
                            </IconButton>

                          </>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton size="small" onClick={() => handleViewDetails(referral)} color="info">
                          <Visibility />
                        </IconButton>

                        {/* Schedule New Round */}
                        {!isTerminalStatus(referral.status) && (
                          <Tooltip title="Schedule New Interview Round">
                            <IconButton
                              size="small"
                              onClick={() => handleScheduleInterview(referral, "new")}
                              color="primary"
                            >
                              <AddIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* ✅ Reschedule — for all "Interview" status */}
                        {referral.status === "interview" && (
                          <Tooltip title="Reschedule this interview">
                            <IconButton
                              size="small"
                              onClick={() => handleScheduleInterview(referral, "reschedule")}
                              color="warning"
                            >
                              <ScheduleIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* Status Update (includes "Interview") */}
                        {!isTerminalStatus(referral.status) && (
                          <Tooltip title="Update Status">
                            <IconButton
                              size="small"
                              onClick={() => handleUpdateStatus(referral)}
                              color="primary"
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
  component="div"
  count={filteredReferrals.length}
  page={page}
  onPageChange={(event, newPage) => setPage(newPage)}
  rowsPerPage={rowsPerPage}
  onRowsPerPageChange={(event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }}
  rowsPerPageOptions={[5, 10, 25]}
/>

        </TableContainer>

        {/* Schedule / Reschedule Dialog */}
        <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {scheduleMode === "reschedule"
              ? `Reschedule Interview — ${selectedReferral?.candidateName}`
              : `Schedule New Round — ${selectedReferral?.candidateName}`}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Interview Round Name *"
                  placeholder="e.g., Technical Round 1, HR Interview"
                  value={roundName}
                  onChange={(e) => setRoundName(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select Interview Panels</InputLabel>
                  <Select
                    multiple
                    value={selectedPanelNames}
                    onChange={(e) => setSelectedPanelNames(e.target.value)}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((name) => (
                          <Chip key={name} label={name} size="small" />
                        ))}
                      </Box>
                    )}
                    label="Select Interview Panels"
                  >
                    {loadingPanels ? (
                      <MenuItem disabled>Loading panels...</MenuItem>
                    ) : (
                      panels.map(panel => (
                        <MenuItem key={panel.panel_name} value={panel.panel_name}>
                          {panel.panel_name} ({panel.members?.length || 0} members)
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: "block" }}>
                  Don’t see a panel?{" "}
                  <Button size="small" onClick={handleNavigateToPanelManagement} sx={{ minWidth: "auto", p: 0 }}>
                    Create new panel
                  </Button>
                </Typography>
              </Grid>

              {selectedPanelNames.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Select Interviewers ({combinedMembers.length})
                  </Typography>
                  <Box sx={{ maxHeight: 250, overflow: "auto", border: "1px solid #eee", borderRadius: 1, p: 1 }}>
                    {combinedMembers.map((member) => (
                      <FormControlLabel
                        key={member.employee_id}
                        control={
                          <Checkbox
                            checked={selectedMemberIds.includes(member.employee_id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMemberIds(prev => [...prev, member.employee_id]);
                              } else {
                                setSelectedMemberIds(prev =>
                                  prev.filter(id => id !== member.employee_id)
                                );
                              }
                            }}
                          />
                        }
                        label={`${member.fullname} (${member.sourcePanel}) - ${member.designation || "—"}`}
                      />
                    ))}
                  </Box>
                </Grid>
              )}

              {/* ✅ FIXED DATE/TIME PICKERS */}
                           {/* ✅ ENHANCED DATE/TIME SELECTION */}
              <Grid item xs={12} md={6}>
                <DatePicker
  label="Interview Date *"
  value={interviewDate}
  onChange={setInterviewDate}
  minDate={new Date()}
  // ✅ Use modal mode for desktop to show calendar in front
  desktopModeMediaQuery="@media (min-width: 600px)"
  // ✅ Higher z-index to appear on top
  slotProps={{
    textField: { 
      fullWidth: true, 
      size: "medium",
      sx: {
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'white',
          '&:hover': {
            backgroundColor: '#f5f5f5',
          }
        }
      }
    },
    // ✅ Critical: Make calendar popup appear on top
    popper: { 
      sx: { 
        zIndex: 9999, // Very high z-index
        '& .MuiPaper-root': {
          boxShadow: '0px 5px 15px rgba(0,0,0,0.3)',
          border: '2px solid #1976d2'
        }
      },
      placement: "bottom-start",
      disablePortal: false // Allow it to break out of containers
    },
    // ✅ For mobile/dialog mode
    dialog: {
      sx: {
        zIndex: 9999,
        '& .MuiPaper-root': {
          boxShadow: '0px 5px 15px rgba(0,0,0,0.3)',
        }
      }
    }
  }}
  // ✅ Show calendar clearly
  views={['year', 'month', 'day']}
  openTo="day"
  reduceAnimations={false}
/>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="interview-time-label">
                    Interview Time *
                  </InputLabel>
                  <Select
                    labelId="interview-time-label"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    label="Interview Time *"
                    startAdornment={
                      <AccessTime sx={{ mr: 1, color: 'action.active' }} />
                    }
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 300,
                          zIndex: 1600 // Higher z-index
                        }
                      }
                    }}
                  >
                    <MenuItem value="">
                      <em>Select a time</em>
                    </MenuItem>
                    
                    {/* Generate time slots (9 AM to 6 PM in 30-min intervals) */}
                    {(() => {
                      const timeSlots = [];
                      const startHour = 9; // 9 AM
                      const endHour = 18; // 6 PM
                      
                      // Get current time
                      const now = new Date();
                      
                      for (let hour = startHour; hour < endHour; hour++) {
                        for (let minute = 0; minute < 60; minute += 30) {
                          // Format time as HH:MM
                          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                          
                          // Create time object for comparison
                          const slotTime = new Date();
                          slotTime.setHours(hour, minute, 0, 0);
                          
                          // Check if time is in the past for today
                          const isToday = interviewDate ? 
                            new Date(interviewDate).toDateString() === now.toDateString() : 
                            true;
                          
                          const isPastTime = isToday && slotTime < now;
                          
                          timeSlots.push(
                            <MenuItem 
                              key={timeString} 
                              value={timeString}
                              disabled={isPastTime}
                            >
                              <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                                <Typography>
                                  {`${hour % 12 === 0 ? 12 : hour % 12}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`}
                                </Typography>
                                {isPastTime && (
                                  <Chip 
                                    label="Past" 
                                    size="small" 
                                    color="error" 
                                    variant="outlined"
                                    sx={{ ml: 1 }}
                                  />
                                )}
                              </Box>
                            </MenuItem>
                          );
                        }
                      }
                      return timeSlots;
                    })()}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                  <AccessTime fontSize="small" sx={{ mr: 0.5 }} />
                  Select from 9:00 AM to 6:00 PM (30-minute intervals)
                </Typography>
              </Grid>

              <Grid container spacing={1}>
  <Grid item xs={9}>
    <TextField
      fullWidth
      label="Meeting Link *"
      value={meetingLink}
      onChange={(e) => setMeetingLink(e.target.value)}
      placeholder="Auto-generated interview link"
    />
  </Grid>

  <Grid item xs={3}>
    <Button
      fullWidth
      variant="outlined"
      onClick={() => {
        const link = generateJitsiLink(selectedReferral?.candidateName);
        setMeetingLink(link);
      }}
      sx={{ height: "56px" }}
    >
      Generate
    </Button>
  </Grid>
</Grid>

{/*               
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meeting Link / Location *"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                />
              </Grid> */}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleScheduleSubmit}
              variant="contained"
              disabled={
                referralActionLoading ||
                !roundName.trim() ||
                selectedMemberIds.length === 0 ||
                !interviewDate ||
                !interviewTime ||
                !meetingLink.trim()
              }
            >
              {referralActionLoading ? "Processing..." : scheduleMode === "reschedule" ? "Reschedule Interview" : "Schedule Round"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Status Update Dialog — includes "Interview" */}
        <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Status for {selectedReferral?.candidateName}</DialogTitle>
          <DialogContent>
            <Typography variant="body1" mb={2}>
              Current status: <strong>{statusLabels[selectedReferral?.status] || "Unknown"}</strong>
            </Typography>
            <Box display="flex" flexDirection="column" gap={1.5}>
              {Object.entries(statusLabels)
                .filter(([status]) => status !== "submitted") // ✅ Allow "Interview"
                .map(([status, label]) => {
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
                      sx={{ justifyContent: "flex-start", py: 1.5 }}
                      size="large"
                    >
                      {label}
                      {isBefore && <Typography ml={1} color="textSecondary" fontSize="0.875rem">(locked)</Typography>}
                      {isTerminal && <Typography ml={1} color="textSecondary" fontSize="0.875rem">(final)</Typography>}
                    </Button>
                  );
                })}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Resume & View Dialogs */}
        {/* <Dialog open={resumeDialogOpen} onClose={() => setResumeDialogOpen(false)} maxWidth="md" fullWidth>
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

        <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm">
          <DialogTitle>Referral Details</DialogTitle>
          <DialogContent>
            {selectedReferral && (
              <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {JSON.stringify(selectedReferral, null, 2)}
              </pre>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog> */}
      </Box>
    </LocalizationProvider>
  );
}