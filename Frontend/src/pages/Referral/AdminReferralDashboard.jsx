// import { useState, useEffect } from "react";
// import {
//   Box,
//   Typography,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Chip,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Grid,
//   Card,
//   CardContent,
//   Alert,
//   CircularProgress,
//   IconButton,
//   Menu,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Select,
//   Stepper,
//   Step,
//   StepLabel,
//   GlobalStyles
// } from "@mui/material";
// import {
//   FilterList,
//   Visibility,
//   Edit,
//   Download,
//   Schedule
// } from "@mui/icons-material";
// import { DatePicker, TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// // Mock data with resume files
// const mockReferrals = [
//   {
//     id: 1,
//     candidateName: "John Doe",
//     candidateEmail: "john.doe@example.com",
//     candidatePhone: "+1234567890",
//     position: "Frontend Developer",
//     experience: "3 years",
//     skills: ["React", "JavaScript", "CSS"],
//     referredBy: "Alice Smith",
//     referralDate: "2024-01-15",
//     status: "shortlisted",
//     resumeUrl: "/resumes/john_doe.pdf",
//     resumeName: "john_doe_resume.pdf",
//     notes: "Strong React background",
//     interviewSchedule: null
//   },
//   {
//     id: 2,
//     candidateName: "Jane Smith",
//     candidateEmail: "jane.smith@example.com",
//     candidatePhone: "+1234567891",
//     position: "Backend Developer",
//     experience: "5 years",
//     skills: ["Node.js", "Python", "AWS"],
//     referredBy: "Bob Johnson",
//     referralDate: "2024-01-14",
//     status: "interview",
//     resumeUrl: "/resumes/jane_smith.pdf",
//     resumeName: "jane_smith_resume.pdf",
//     notes: "Excellent backend skills",
//     interviewSchedule: {
//       date: "2024-01-20T10:00:00",
//       duration: "2 hours",
//       interviewType: "Technical Round 1",
//       interviewer: "Tech Lead - Backend",
//       meetingLink: "https://meet.google.com/abc-def-ghi",
//       notes: "Technical interview focusing on Node.js and system design"
//     }
//   }
// ];

// const statusColors = {
//   shortlisted: "primary",
//   interview: "warning",
//   hired: "success",
//   rejected: "error"
// };

// const statusLabels = {
//   shortlisted: "Shortlisted",
//   interview: "Interview Scheduled",
//   hired: "Hired",
//   rejected: "Rejected"
// };

// const interviewTypes = [
//   "Technical Round 1",
//   "Technical Round 2",
//   "Manager Round",
//   "HR Round",
//   "Final Round"
// ];

// const interviewers = [
//   "Tech Lead - Frontend",
//   "Tech Lead - Backend",
//   "Engineering Manager",
//   "HR Manager",
//   "CTO"
// ];

// // Global styles to fix z-index issues
// const globalStyles = (
//   <GlobalStyles styles={{
//     '.MuiPickersPopper-root': {
//       zIndex: '9999 !important',
//     },
//     '.MuiPickersPopper-paper': {
//       zIndex: '9999 !important',
//     },
//     '.MuiDialog-root': {
//       zIndex: '1300 !important',
//     }
//   }} />
// );

// export default function AdminReferralDashboard() {
//   const [referrals, setReferrals] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedReferral, setSelectedReferral] = useState(null);
//   const [viewDialogOpen, setViewDialogOpen] = useState(false);
//   const [statusDialogOpen, setStatusDialogOpen] = useState(false);
//   const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
//   const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
//   const [filterAnchorEl, setFilterAnchorEl] = useState(null);
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [searchTerm, setSearchTerm] = useState("");
  
//   // Interview scheduling form state
//   const [interviewDate, setInterviewDate] = useState(null);
//   const [interviewTime, setInterviewTime] = useState(null);
//   const [interviewType, setInterviewType] = useState("");
//   const [interviewer, setInterviewer] = useState("");
//   const [meetingLink, setMeetingLink] = useState("");
//   const [interviewNotes, setInterviewNotes] = useState("");
//   const [activeStep, setActiveStep] = useState(0);

//   useEffect(() => {
//     const fetchReferrals = async () => {
//       try {
//         setLoading(true);
//         await new Promise(resolve => setTimeout(resolve, 1000));
//         setReferrals(mockReferrals);
//       } catch (error) {
//         console.error("Error fetching referrals:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchReferrals();
//   }, []);

//   const handleViewDetails = (referral) => {
//     setSelectedReferral(referral);
//     setViewDialogOpen(true);
//   };

//   const handleUpdateStatus = (referral) => {
//     setSelectedReferral(referral);
//     setStatusDialogOpen(true);
//   };

//   const handleStatusUpdate = async (newStatus) => {
//     try {
//       if (newStatus === "shortlisted") {
//         setStatusDialogOpen(false);
//         setScheduleDialogOpen(true);
//         resetScheduleForm();
//       } else {
//         setReferrals(prev =>
//           prev.map(ref =>
//             ref.id === selectedReferral.id
//               ? { ...ref, status: newStatus }
//               : ref
//           )
//         );
//         setStatusDialogOpen(false);
//         setSelectedReferral(null);
//       }
//     } catch (error) {
//       console.error("Error updating status:", error);
//     }
//   };

//   const handleViewResume = (referral) => {
//     setSelectedReferral(referral);
//     setResumeDialogOpen(true);
//   };

//   const handleDownloadResume = (referral) => {
//     const link = document.createElement('a');
//     link.href = referral.resumeUrl;
//     link.download = referral.resumeName || 'resume.pdf';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleScheduleInterview = (referral) => {
//     setSelectedReferral(referral);
//     setScheduleDialogOpen(true);
//     resetScheduleForm();
//   };

//   const resetScheduleForm = () => {
//     setInterviewDate(null);
//     setInterviewTime(null);
//     setInterviewType("");
//     setInterviewer("");
//     setMeetingLink("");
//     setInterviewNotes("");
//     setActiveStep(0);
//   };

//   const handleScheduleSubmit = async () => {
//     try {
//       const scheduledDateTime = new Date(interviewDate);
//       if (interviewTime) {
//         scheduledDateTime.setHours(interviewTime.getHours());
//         scheduledDateTime.setMinutes(interviewTime.getMinutes());
//       }

//       const interviewSchedule = {
//         date: scheduledDateTime.toISOString(),
//         duration: "2 hours",
//         interviewType,
//         interviewer,
//         meetingLink,
//         notes: interviewNotes
//       };

//       setReferrals(prev =>
//         prev.map(ref =>
//           ref.id === selectedReferral.id
//             ? { 
//                 ...ref, 
//                 status: "interview",
//                 interviewSchedule 
//               }
//             : ref
//         )
//       );

//       setScheduleDialogOpen(false);
//       setSelectedReferral(null);
//       resetScheduleForm();
//     } catch (error) {
//       console.error("Error scheduling interview:", error);
//     }
//   };

//   const handleFilterClick = (event) => {
//     setFilterAnchorEl(event.currentTarget);
//   };

//   const handleFilterClose = () => {
//     setFilterAnchorEl(null);
//   };

//   const handleStatusFilter = (status) => {
//     setStatusFilter(status);
//     handleFilterClose();
//   };

//   const handleNextStep = () => {
//     if (activeStep === 0) {
//       if (!interviewDate || !interviewTime) {
//         alert("Please select both date and time");
//         return;
//       }
//     } else if (activeStep === 1) {
//       if (!interviewType || !interviewer) {
//         alert("Please fill all required fields");
//         return;
//       }
//     }
//     setActiveStep((prev) => prev + 1);
//   };

//   const handleBackStep = () => {
//     setActiveStep((prev) => prev - 1);
//   };

//   const filteredReferrals = referrals.filter(referral => {
//     const matchesStatus = statusFilter === "all" || referral.status === statusFilter;
//     const matchesSearch = referral.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          referral.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          referral.referredBy.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesStatus && matchesSearch;
//   });

//   const getStatusCount = (status) => {
//     return referrals.filter(ref => ref.status === status).length;
//   };

//   const steps = ['Select Date & Time', 'Interview Details', 'Confirmation'];

//   const renderScheduleStep = (step) => {
//     switch (step) {
//       case 0:
//         return (
//           <Grid container spacing={3}>
//             <Grid item xs={12} md={6}>
//               <DatePicker
//                 label="Interview Date *"
//                 value={interviewDate}
//                 onChange={(newValue) => setInterviewDate(newValue)}
//                 renderInput={(params) => (
//                   <TextField 
//                     {...params} 
//                     fullWidth 
//                   />
//                 )}
//                 minDate={new Date()}
//                 PopperProps={{
//                   style: { 
//                     zIndex: 9999 
//                   }
//                 }}
//                 OpenPickerButtonProps={{
//                   style: { zIndex: 1 }
//                 }}
//               />
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <TimePicker
//                 label="Interview Time *"
//                 value={interviewTime}
//                 onChange={(newValue) => setInterviewTime(newValue)}
//                 renderInput={(params) => (
//                   <TextField 
//                     {...params} 
//                     fullWidth 
//                   />
//                 )}
//                 PopperProps={{
//                   style: { 
//                     zIndex: 9999 
//                   }
//                 }}
//                 OpenPickerButtonProps={{
//                   style: { zIndex: 1 }
//                 }}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <Alert severity="info">
//                 <Typography variant="body2">
//                   <strong>Interview Duration:</strong> 2 hours
//                 </Typography>
//               </Alert>
//             </Grid>
//           </Grid>
//         );
      
//       case 1:
//         return (
//           <Grid container spacing={3}>
//             <Grid item xs={12} md={6}>
//               <FormControl fullWidth>
//                 <InputLabel>Interview Type *</InputLabel>
//                 <Select
//                   value={interviewType}
//                   label="Interview Type *"
//                   onChange={(e) => setInterviewType(e.target.value)}
//                 >
//                   {interviewTypes.map((type) => (
//                     <MenuItem key={type} value={type}>
//                       {type}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <FormControl fullWidth>
//                 <InputLabel>Interviewer *</InputLabel>
//                 <Select
//                   value={interviewer}
//                   label="Interviewer *"
//                   onChange={(e) => setInterviewer(e.target.value)}
//                 >
//                   {interviewers.map((person) => (
//                     <MenuItem key={person} value={person}>
//                       {person}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 label="Meeting Link"
//                 value={meetingLink}
//                 onChange={(e) => setMeetingLink(e.target.value)}
//                 placeholder="https://meet.google.com/abc-def-ghi"
//                 helperText="Google Meet, Zoom, or Teams link"
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 label="Additional Notes (Optional)"
//                 value={interviewNotes}
//                 onChange={(e) => setInterviewNotes(e.target.value)}
//                 multiline
//                 rows={4}
//                 placeholder="Any specific topics to cover, interview format, or instructions for the candidate..."
//               />
//             </Grid>
//           </Grid>
//         );
      
//       case 2:
//         const scheduledDate = interviewDate && interviewTime ? new Date(interviewDate) : null;
//         if (scheduledDate && interviewTime) {
//           scheduledDate.setHours(interviewTime.getHours());
//           scheduledDate.setMinutes(interviewTime.getMinutes());
//         }

//         return (
//           <Box>
//             <Typography variant="h6" gutterBottom color="primary">
//               Please confirm the interview details:
//             </Typography>
//             <Grid container spacing={2} sx={{ mt: 1 }}>
//               <Grid item xs={12} sm={6}>
//                 <Typography variant="subtitle2" color="textSecondary">Candidate Name:</Typography>
//                 <Typography variant="body1" fontWeight="bold">{selectedReferral?.candidateName}</Typography>
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <Typography variant="subtitle2" color="textSecondary">Position:</Typography>
//                 <Typography variant="body1">{selectedReferral?.position}</Typography>
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <Typography variant="subtitle2" color="textSecondary">Interview Date:</Typography>
//                 <Typography variant="body1" fontWeight="bold">
//                   {scheduledDate ? scheduledDate.toLocaleDateString('en-US', { 
//                     weekday: 'long', 
//                     year: 'numeric', 
//                     month: 'long', 
//                     day: 'numeric' 
//                   }) : 'Not set'}
//                 </Typography>
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <Typography variant="subtitle2" color="textSecondary">Interview Time:</Typography>
//                 <Typography variant="body1" fontWeight="bold">
//                   {scheduledDate ? scheduledDate.toLocaleTimeString('en-US', { 
//                     hour: '2-digit', 
//                     minute: '2-digit',
//                     hour12: true 
//                   }) : 'Not set'}
//                 </Typography>
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <Typography variant="subtitle2" color="textSecondary">Duration:</Typography>
//                 <Typography variant="body1">2 hours</Typography>
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <Typography variant="subtitle2" color="textSecondary">Interview Type:</Typography>
//                 <Typography variant="body1">{interviewType}</Typography>
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <Typography variant="subtitle2" color="textSecondary">Interviewer:</Typography>
//                 <Typography variant="body1">{interviewer}</Typography>
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <Typography variant="subtitle2" color="textSecondary">Meeting Link:</Typography>
//                 <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
//                   {meetingLink || 'Not provided'}
//                 </Typography>
//               </Grid>
//               {interviewNotes && (
//                 <Grid item xs={12}>
//                   <Typography variant="subtitle2" color="textSecondary">Additional Notes:</Typography>
//                   <Typography variant="body1" sx={{ fontStyle: 'italic', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
//                     {interviewNotes}
//                   </Typography>
//                 </Grid>
//               )}
//             </Grid>
//             <Alert severity="success" sx={{ mt: 2 }}>
//               Status will be automatically updated to "Interview Scheduled" after confirmation.
//             </Alert>
//           </Box>
//         );
      
//       default:
//         return null;
//     }
//   };

//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       {globalStyles}
//       <Box p={4} sx={{ background: "#f4f7fb", minHeight: "100vh" }}>
//         <Typography variant="h4" fontWeight={600} mb={2}>
//           Referral Management Dashboard
//         </Typography>

//         {/* Statistics Cards */}
//         <Grid container spacing={3} mb={4}>
//           <Grid item xs={12} sm={6} md={3}>
//             <Card>
//               <CardContent>
//                 <Typography color="textSecondary" gutterBottom>
//                   Total Referrals
//                 </Typography>
//                 <Typography variant="h4" component="div">
//                   {referrals.length}
//                 </Typography>
//               </CardContent>
//             </Card>
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <Card>
//               <CardContent>
//                 <Typography color="textSecondary" gutterBottom>
//                   Shortlisted
//                 </Typography>
//                 <Typography variant="h4" component="div" color="primary">
//                   {getStatusCount("shortlisted")}
//                 </Typography>
//               </CardContent>
//             </Card>
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <Card>
//               <CardContent>
//                 <Typography color="textSecondary" gutterBottom>
//                   Interview
//                 </Typography>
//                 <Typography variant="h4" component="div" color="orange">
//                   {getStatusCount("interview")}
//                 </Typography>
//               </CardContent>
//             </Card>
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <Card>
//               <CardContent>
//                 <Typography color="textSecondary" gutterBottom>
//                   Hired
//                 </Typography>
//                 <Typography variant="h4" component="div" color="green">
//                   {getStatusCount("hired")}
//                 </Typography>
//               </CardContent>
//             </Card>
//           </Grid>
//         </Grid>

//         {/* Filters and Actions */}
//         <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
//           <TextField
//             placeholder="Search candidates, positions, or referrers..."
//             variant="outlined"
//             size="small"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             sx={{ width: 400 }}
//           />
          
//           <Box>
          
//           </Box>
//         </Box>

       
//         {/* Referrals Table */}
//         <TableContainer component={Paper}>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell><strong>Candidate</strong></TableCell>
//                 <TableCell><strong>Position</strong></TableCell>
//                 <TableCell><strong>Experience</strong></TableCell>
//                 <TableCell><strong>Referred By</strong></TableCell>
//                 <TableCell><strong>Date</strong></TableCell>
//                 <TableCell><strong>Status</strong></TableCell>
//                 <TableCell><strong>Resume</strong></TableCell>
//                 <TableCell><strong>Actions</strong></TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {filteredReferrals.map((referral) => (
//                 <TableRow key={referral.id} hover>
//                   <TableCell>
//                     <Box>
//                       <Typography variant="subtitle2">
//                         {referral.candidateName}
//                       </Typography>
//                       <Typography variant="body2" color="textSecondary">
//                         {referral.candidateEmail}
//                       </Typography>
//                     </Box>
//                   </TableCell>
//                   <TableCell>{referral.position}</TableCell>
//                   <TableCell>{referral.experience}</TableCell>
//                   <TableCell>{referral.referredBy}</TableCell>
//                   <TableCell>
//                     {new Date(referral.referralDate).toLocaleDateString()}
//                   </TableCell>
//                   <TableCell>
//                     <Chip
//                       label={statusLabels[referral.status]}
//                       color={statusColors[referral.status]}
//                       size="small"
//                     />
//                     {referral.interviewSchedule && (
//                       <Typography variant="caption" display="block" color="textSecondary">
//                         {new Date(referral.interviewSchedule.date).toLocaleDateString()}
//                       </Typography>
//                     )}
//                   </TableCell>
//                   <TableCell>
//                     <Box display="flex" gap={1}>
//                       <IconButton
//                         size="small"
//                         onClick={() => handleViewResume(referral)}
//                         color="primary"
//                         title="Preview Resume"
//                       >
//                         <Visibility />
//                       </IconButton>
//                       <IconButton
//                         size="small"
//                         onClick={() => handleDownloadResume(referral)}
//                         color="secondary"
//                         title="Download Resume"
//                       >
//                         <Download />
//                       </IconButton>
//                     </Box>
//                   </TableCell>
//                   <TableCell>
//                     <Box display="flex" gap={1}>
//                       <IconButton
//                         size="small"
//                         onClick={() => handleViewDetails(referral)}
//                         color="info"
//                         title="View Details"
//                       >
//                         <Visibility />
//                       </IconButton>
//                       {referral.status === "shortlisted" && (
//                         <IconButton
//                           size="small"
//                           onClick={() => handleScheduleInterview(referral)}
//                           color="warning"
//                           title="Schedule Interview"
//                         >
//                           <Schedule />
//                         </IconButton>
//                       )}
//                       <IconButton
//                         size="small"
//                         onClick={() => handleUpdateStatus(referral)}
//                         color="primary"
//                         title="Update Status"
//                       >
//                         <Edit />
//                       </IconButton>
//                     </Box>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>

//         {filteredReferrals.length === 0 && (
//           <Alert severity="info" sx={{ mt: 2 }}>
//             No referrals found matching your criteria.
//           </Alert>
//         )}

//         {/* Schedule Interview Dialog */}
//         <Dialog
//           open={scheduleDialogOpen}
//           onClose={() => setScheduleDialogOpen(false)}
//           maxWidth="md"
//           fullWidth
//           sx={{
//             '& .MuiDialog-paper': {
//               minHeight: '500px'
//             }
//           }}
//           disableEnforceFocus
//         >
//           <DialogTitle>
//             Schedule Interview - {selectedReferral?.candidateName}
//           </DialogTitle>
//           <DialogContent>
//             <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }}>
//               {steps.map((label) => (
//                 <Step key={label}>
//                   <StepLabel>{label}</StepLabel>
//                 </Step>
//               ))}
//             </Stepper>

//             {renderScheduleStep(activeStep)}
//           </DialogContent>
//           <DialogActions sx={{ p: 3 }}>
//             <Button 
//               onClick={handleBackStep} 
//               disabled={activeStep === 0}
//               variant="outlined"
//             >
//               Back
//             </Button>
//             <Box sx={{ flex: '1 1 auto' }} />
//             <Button 
//               onClick={() => setScheduleDialogOpen(false)}
//               variant="outlined"
//               color="inherit"
//             >
//               Cancel
//             </Button>
//             <Button 
//               onClick={activeStep === steps.length - 1 ? handleScheduleSubmit : handleNextStep}
//               variant="contained"
//               disabled={
//                 (activeStep === 0 && (!interviewDate || !interviewTime)) ||
//                 (activeStep === 1 && (!interviewType || !interviewer))
//               }
//             >
//               {activeStep === steps.length - 1 ? 'Confirm & Schedule' : 'Next'}
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* Update Status Dialog */}
//         <Dialog
//           open={statusDialogOpen}
//           onClose={() => setStatusDialogOpen(false)}
//           maxWidth="sm"
//           fullWidth
//         >
//           <DialogTitle>Update Candidate Status</DialogTitle>
//           <DialogContent>
//             <Typography variant="body1" mb={3}>
//               Update status for <strong>{selectedReferral?.candidateName}</strong>
//             </Typography>
//             <Box display="flex" flexDirection="column" gap={2}>
//               {Object.entries(statusLabels).map(([status, label]) => (
//                 <Button
//                   key={status}
//                   variant={selectedReferral?.status === status ? "contained" : "outlined"}
//                   color={statusColors[status]}
//                   onClick={() => handleStatusUpdate(status)}
//                   sx={{ justifyContent: 'flex-start', py: 1.5 }}
//                   size="large"
//                 >
//                   {label}
//                 </Button>
//               ))}
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
//           </DialogActions>
//         </Dialog>
//       </Box>
//     </LocalizationProvider>
//   );
// }

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
} from "@mui/material";
import {
  Visibility,
  Edit,
  Download,
  Schedule  // ✅ Keep this icon
} from "@mui/icons-material";
import { DatePicker, TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useDispatch, useSelector } from "react-redux";
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
  const { allReferrals, referralsLoading, error, referralActionLoading } = useSelector((state) => state.admin);

  const [selectedReferral, setSelectedReferral] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Interview scheduling form
  const [interviewDate, setInterviewDate] = useState(null);
  const [interviewTime, setInterviewTime] = useState(null);
  const [interviewType, setInterviewType] = useState("");
  const [interviewer, setInterviewer] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");

  useEffect(() => {
    dispatch(getAllReferralsAdmin());
  }, [dispatch]);

  const handleViewDetails = (referral) => {
    setSelectedReferral(referral);
    setViewDialogOpen(true);
  };

  // ✅ NEW: Dedicated handler for scheduling
  const handleScheduleInterview = (referral) => {
    setSelectedReferral(referral);
    setScheduleDialogOpen(true);
    setInterviewDate(null);
    setInterviewTime(null);
    setInterviewType("");
    setInterviewer("");
    setMeetingLink("");
    setInterviewNotes("");
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
          interview_notes: interviewNotes,
        })
      ).unwrap();
      setScheduleDialogOpen(false);
    } catch (err) {
      console.error("Failed to schedule interview:", err);
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

  const getStatusCount = (status) => {
    return allReferrals.filter(ref => (ref.status || "Submitted").toLowerCase() === status).length;
  };

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

        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Total Referrals</Typography>
                <Typography variant="h4">{allReferrals.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Shortlisted</Typography>
                <Typography variant="h4" color="primary">{getStatusCount("shortlisted")}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Interview</Typography>
                <Typography variant="h4" color="orange">{getStatusCount("interview")}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Hired</Typography>
                <Typography variant="h4" color="green">{getStatusCount("hired")}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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

                        {/* ✅ DEDICATED SCHEDULE BUTTON (only for shortlisted) */}
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

                        {/* ✅ UPDATE STATUS BUTTON (for non-terminal) */}
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
        <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Schedule Interview — {selectedReferral?.candidateName}</DialogTitle>
          <DialogContent>
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
                  <Select value={interviewType} onChange={(e) => setInterviewType(e.target.value)} label="Interview Type">
                    {interviewTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Interviewer</InputLabel>
                  <Select value={interviewer} onChange={(e) => setInterviewer(e.target.value)} label="Interviewer">
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  multiline
                  rows={3}
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleScheduleSubmit} 
              variant="contained" 
              disabled={!interviewDate || !interviewTime || referralActionLoading}
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