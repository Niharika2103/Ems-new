import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Avatar,
  Stack,
  InputAdornment,
  IconButton,
  Tooltip,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

const PanelFeedbackTable = () => {
  const navigate = useNavigate(); // Initialize useNavigate hook
  
  // Sample data
  const [data, setData] = useState([
    {
      id: 1,
      interviewId: 'INT-2024-001',
      candidateName: 'John Doe',
      panelMember: 'Dr. Sarah Smith',
      interviewDate: '2024-01-15T10:00:00',
      candidateEmail: 'john.doe@email.com',
      candidateRole: 'Senior Frontend Developer'
    },
    {
      id: 2,
      interviewId: 'INT-2024-002',
      candidateName: 'Jane Smith',
      panelMember: 'Prof. Michael Johnson',
      interviewDate: '2024-01-16T14:30:00',
      candidateEmail: 'jane.smith@email.com',
      candidateRole: 'Project Manager'
    },
    {
      id: 3,
      interviewId: 'INT-2024-003',
      candidateName: 'Robert Johnson',
      panelMember: 'Dr. Sarah Smith',
      interviewDate: '2024-01-17T11:15:00',
      candidateEmail: 'robert.j@email.com',
      candidateRole: 'UX Designer'
    },
    {
      id: 4,
      interviewId: 'INT-2024-004',
      candidateName: 'Alice Williams',
      panelMember: 'Mr. David Brown',
      interviewDate: '2024-01-18T09:45:00',
      candidateEmail: 'alice.w@email.com',
      candidateRole: 'DevOps Engineer'
    },
    {
      id: 5,
      interviewId: 'INT-2024-005',
      candidateName: 'Michael Chen',
      panelMember: 'Ms. Emily Wilson',
      interviewDate: '2024-01-19T15:20:00',
      candidateEmail: 'michael.chen@email.com',
      candidateRole: 'Data Scientist'
    }
  ]);

  const [filteredData, setFilteredData] = useState(data);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Simulate API call
  useEffect(() => {
    setLoading(true);
    // Simulate API delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter data
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(data);
      return;
    }

    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = data.filter(item =>
      item.candidateName.toLowerCase().includes(lowercasedTerm) ||
      item.panelMember.toLowerCase().includes(lowercasedTerm) ||
      item.interviewId.toLowerCase().includes(lowercasedTerm) ||
      formatDate(item.interviewDate).toLowerCase().includes(lowercasedTerm)
    );

    setFilteredData(filtered);
  }, [searchTerm, data]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle view details - Navigates to /candidate/feedback
  const handleViewDetails = (interview) => {
    // Navigate to /candidate/feedback with interview data
    navigate('/candidate/feedback', { 
      state: { 
        interviewData: interview,
        // You can also pass specific parameters if needed
        interviewId: interview.interviewId,
        candidateName: interview.candidateName,
        panelMember: interview.panelMember,
        interviewDate: interview.interviewDate
      }
    });
  };

  // Alternative: If you want to pass data via URL params
  const handleViewDetailsWithParams = (interview) => {
    navigate(`/candidate/feedback/${interview.interviewId}`, {
      state: { interviewData: interview }
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedInterview(null);
  };

  
  

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Interview Panel Feedback
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage all interview records with panel member details
          </Typography>
        </Box>
        <Chip 
          label={`${filteredData.length} Interviews`}
          color="primary"
          variant="outlined"
        />
      </Stack>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Search by candidate, panel member, or interview ID..."
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    ×
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
        </Stack>
      </Paper>

      {/* Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'background.default' }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <BadgeIcon fontSize="small" />
                    <span>Interview ID</span>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'background.default' }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PersonIcon fontSize="small" />
                    <span>Candidate Name</span>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'background.default' }}>
                  Panel Member
                </TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'background.default' }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CalendarIcon fontSize="small" />
                    <span>Interview Date & Time</span>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'background.default' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Loading interview data...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <TableRow 
                    key={row.id}
                    hover
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'action.hover',
                        cursor: 'pointer'
                      }
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={row.interviewId}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getInitials(row.candidateName)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            {row.candidateName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.candidateRole}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {row.panelMember}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Interview Panel
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {formatDate(row.interviewDate)}
                        </Typography>
                        <Chip
                          label={formatTime(row.interviewDate)}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Feedback">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewDetails(row)}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <SearchIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No interviews found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting your search terms
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

     

      {/* Details Dialog - Optional: You can remove this if not needed */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {selectedInterview && (
          <>
            <DialogTitle>
              Interview Details - {selectedInterview.interviewId}
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    CANDIDATE INFORMATION
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                      {getInitials(selectedInterview.candidateName)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {selectedInterview.candidateName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedInterview.candidateRole}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedInterview.candidateEmail}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    PANEL MEMBER
                  </Typography>
                  <Typography variant="body1">
                    {selectedInterview.panelMember}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    INTERVIEW SCHEDULE
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        Date
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(selectedInterview.interviewDate).split(',')[0]}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        Time
                      </Typography>
                      <Typography variant="body2">
                        {formatTime(selectedInterview.interviewDate)}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  handleCloseDialog();
                  handleViewDetails(selectedInterview);
                }}
              >
                Go to Feedback
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default PanelFeedbackTable;