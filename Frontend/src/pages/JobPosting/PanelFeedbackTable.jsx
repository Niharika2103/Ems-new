import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import {
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  Visibility as ViewIcon,
  Category as CategoryIcon, // Optional: for round icon
} from '@mui/icons-material';

//  Update this import path as needed
import { getAllInterviewsWithDetailsApi } from "../../api/authApi";

const PanelFeedbackTable = () => {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const response = await getAllInterviewsWithDetailsApi();
        const interviews = response.data?.data || [];

        const transformed = interviews.map((row) => {
          const panelMembers = row.panel_members || [];
          return {
            id: row.interview_id,
            interviewId: row.interview_id ?? '—',
            roundName: row.round_name || '—', // ✅ ADD ROUND NAME
            candidateName: row.candidate_name || '—',
            candidateEmail: row.candidate_email || '—',
            candidateRole: row.position || '—',
            interviewDate: row.interview_date,
            panelMember: panelMembers.map(p => p.name).join(', ') || '—',
            panelMemberCount: panelMembers.length,
            fullInterviewData: row,
          };
        });

        setData(transformed);
        setFilteredData(transformed);
      } catch (error) {
        console.error('Failed to fetch interviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(data);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = data.filter(
      (item) =>
        item.candidateName.toLowerCase().includes(term) ||
        item.panelMember.toLowerCase().includes(term) ||
        String(item.interviewId).includes(term) ||
        item.roundName.toLowerCase().includes(term) || // ✅ Include round in search
        (item.interviewDate &&
          formatDate(item.interviewDate).toLowerCase().includes(term))
    );

    setFilteredData(filtered);
  }, [searchTerm, data]);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleViewDetails = (row) => {
    navigate('/candidate/feedback', {
      state: { interviewData: row.fullInterviewData },
    });
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
            Track and manage all interview records with round, panel, and candidate details
          </Typography>
        </Box>
        <Chip
          label={`${filteredData.length} Interviews`}
          color="primary"
          variant="outlined"
        />
      </Stack>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          placeholder="Search by candidate, panel, round, or interview ID..."
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
            ),
          }}
        />
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
                    <CategoryIcon fontSize="small" />
                    <span>Round</span>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'background.default' }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PersonIcon fontSize="small" />
                    <span>Candidate Name</span>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'background.default' }}>
                  Panel Member(s)
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
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
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
                        cursor: 'pointer',
                      },
                    }}
                    onClick={() => handleViewDetails(row)}
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
                      <Chip
                        label={row.roundName}
                        size="small"
                        color={
                          row.roundName.toLowerCase().includes('final')
                            ? 'success'
                            : row.roundName.toLowerCase().includes('technical')
                            ? 'info'
                            : row.roundName.toLowerCase().includes('hr')
                            ? 'warning'
                            : 'default'
                        }
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
                      <Typography variant="body2" noWrap>
                        {row.panelMember}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.panelMemberCount > 1
                          ? `${row.panelMemberCount} panel members`
                          : 'Interview Panel'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(row.interviewDate)}
                      </Typography>
                      <Chip
                        label={formatTime(row.interviewDate)}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Feedback">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(row);
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
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
    </Box>
  );
};

export default PanelFeedbackTable;