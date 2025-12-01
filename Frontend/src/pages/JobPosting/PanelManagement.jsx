import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tab,
  Tabs,
  Switch,
  FormControlLabel,
  Avatar,
  AvatarGroup,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  VideoCall as VideoIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';

const PanelManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'panel' or 'interview'
  const [selectedPanel, setSelectedPanel] = useState(null);

  // Sample data
  const panels = [
    {
      id: 1,
      name: 'Technical Interview Panel',
      members: [
        { id: 1, name: 'John Smith', role: 'Tech Lead', department: 'Engineering' },
        { id: 2, name: 'Sarah Chen', role: 'Senior Developer', department: 'Engineering' },
        { id: 3, name: 'Mike Johnson', role: 'Architect', department: 'Engineering' },
      ],
      skills: ['JavaScript', 'React', 'Node.js'],
      status: 'Active',
    },
    {
      id: 2,
      name: 'HR Interview Panel',
      members: [
        { id: 4, name: 'Emily Davis', role: 'HR Manager', department: 'Human Resources' },
        { id: 5, name: 'David Wilson', role: 'Recruiter', department: 'Human Resources' },
      ],
      skills: ['Communication', 'Culture Fit', 'Behavioral'],
      status: 'Active',
    },
    {
      id: 3,
      name: 'Management Interview Panel',
      members: [
        { id: 6, name: 'Lisa Brown', role: 'Director', department: 'Management' },
        { id: 7, name: 'Robert Taylor', role: 'VP Engineering', department: 'Management' },
      ],
      skills: ['Leadership', 'Strategy', 'Management'],
      status: 'Inactive',
    },
  ];

  const interviews = [
    {
      id: 1,
      candidate: 'Alice Johnson',
      position: 'Senior React Developer',
      panel: 'Technical Interview Panel',
      date: '2024-01-15',
      time: '10:00 AM',
      duration: '60 mins',
      type: 'Technical',
      status: 'Scheduled',
      members: ['John Smith', 'Sarah Chen'],
    },
    {
      id: 2,
      candidate: 'Bob Miller',
      position: 'HR Manager',
      panel: 'HR Interview Panel',
      date: '2024-01-16',
      time: '2:00 PM',
      duration: '45 mins',
      type: 'HR',
      status: 'Completed',
      members: ['Emily Davis', 'David Wilson'],
    },
    {
      id: 3,
      candidate: 'Carol White',
      position: 'Project Manager',
      panel: 'Management Interview Panel',
      date: '2024-01-17',
      time: '11:00 AM',
      duration: '90 mins',
      type: 'Management',
      status: 'Scheduled',
      members: ['Lisa Brown', 'Robert Taylor'],
    },
  ];

  const availableMembers = [
    { id: 1, name: 'John Smith', role: 'Tech Lead', department: 'Engineering', available: true },
    { id: 2, name: 'Sarah Chen', role: 'Senior Developer', department: 'Engineering', available: true },
    { id: 3, name: 'Mike Johnson', role: 'Architect', department: 'Engineering', available: false },
    { id: 4, name: 'Emily Davis', role: 'HR Manager', department: 'Human Resources', available: true },
    { id: 5, name: 'David Wilson', role: 'Recruiter', department: 'Human Resources', available: true },
    { id: 6, name: 'Lisa Brown', role: 'Director', department: 'Management', available: true },
    { id: 7, name: 'Robert Taylor', role: 'VP Engineering', department: 'Management', available: true },
  ];

  const handleCreatePanel = () => {
    setDialogType('panel');
    setSelectedPanel(null);
    setOpenDialog(true);
  };

  const handleEditPanel = (panel) => {
    setDialogType('panel');
    setSelectedPanel(panel);
    setOpenDialog(true);
  };

  const handleScheduleInterview = () => {
    setDialogType('interview');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPanel(null);
    setDialogType('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'default';
      case 'Scheduled': return 'warning';
      case 'Completed': return 'success';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Technical': return 'primary';
      case 'HR': return 'secondary';
      case 'Management': return 'success';
      default: return 'default';
    }
  };

  const renderPanelDialog = () => (
    <Dialog open={openDialog && dialogType === 'panel'} onClose={handleCloseDialog} maxWidth="md" fullWidth>
      <DialogTitle>
        {selectedPanel ? 'Edit Interview Panel' : 'Create New Interview Panel'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Panel Name"
              defaultValue={selectedPanel?.name || ''}
              placeholder="e.g., Technical Interview Panel"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Panel Type</InputLabel>
              <Select label="Panel Type" defaultValue={selectedPanel?.type || 'technical'}>
                <MenuItem value="technical">Technical</MenuItem>
                <MenuItem value="hr">HR</MenuItem>
                <MenuItem value="management">Management</MenuItem>
                <MenuItem value="cultural">Cultural Fit</MenuItem>
                <MenuItem value="final">Final Round</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Select Panel Members
            </Typography>
            <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', borderRadius: 1, p: 1 }}>
              {availableMembers.map((member) => (
                <FormControlLabel
                  key={member.id}
                  control={
                    <Switch
                      defaultChecked={selectedPanel?.members?.some(m => m.id === member.id)}
                      disabled={!member.available}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24 }}>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{member.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {member.role} • {member.department}
                        </Typography>
                      </Box>
                      {!member.available && (
                        <Chip label="Unavailable" size="small" color="warning" />
                      )}
                    </Box>
                  }
                  sx={{ width: '100%', ml: 0, mb: 1 }}
                />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Required Skills"
              placeholder="e.g., JavaScript, React, Node.js"
              defaultValue={selectedPanel?.skills?.join(', ') || ''}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Switch defaultChecked={selectedPanel?.status === 'Active'} />}
              label="Active Panel"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>Cancel</Button>
        <Button variant="contained" onClick={handleCloseDialog}>
          {selectedPanel ? 'Update Panel' : 'Create Panel'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderInterviewDialog = () => (
    <Dialog open={openDialog && dialogType === 'interview'} onClose={handleCloseDialog} maxWidth="md" fullWidth>
      <DialogTitle>Schedule New Interview</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Candidate Name" placeholder="Enter candidate name" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Position" placeholder="Enter position" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Interview Panel</InputLabel>
              <Select label="Interview Panel">
                {panels.filter(p => p.status === 'Active').map(panel => (
                  <MenuItem key={panel.id} value={panel.id}>
                    {panel.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Interview Type</InputLabel>
              <Select label="Interview Type">
                <MenuItem value="technical">Technical</MenuItem>
                <MenuItem value="hr">HR</MenuItem>
                <MenuItem value="management">Management</MenuItem>
                <MenuItem value="cultural">Cultural Fit</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Time"
              type="time"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Duration</InputLabel>
              <Select label="Duration" defaultValue="60">
                <MenuItem value="30">30 minutes</MenuItem>
                <MenuItem value="45">45 minutes</MenuItem>
                <MenuItem value="60">60 minutes</MenuItem>
                <MenuItem value="90">90 minutes</MenuItem>
                <MenuItem value="120">120 minutes</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Interview Mode</InputLabel>
              <Select label="Interview Mode" defaultValue="virtual">
                <MenuItem value="virtual">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VideoIcon fontSize="small" />
                    Virtual
                  </Box>
                </MenuItem>
                <MenuItem value="in-person">In-Person</MenuItem>
                <MenuItem value="hybrid">Hybrid</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Meeting Link / Location"
              placeholder="Enter meeting link or physical location"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Additional Notes"
              multiline
              rows={3}
              placeholder="Any special instructions or notes for the panel"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>Cancel</Button>
        <Button variant="contained" onClick={handleCloseDialog}>
          Schedule Interview
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Interview Panel Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage interview panels and schedule candidate interviews
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<GroupIcon />} onClick={handleCreatePanel}>
            Create Panel
          </Button>
         
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab icon={<GroupIcon />} label="Interview Panels" />
          {/* <Tab icon={<CalendarIcon />} label="Scheduled Interviews" /> */}
        </Tabs>
      </Box>

      {/* Panels Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {panels.map((panel) => (
            <Grid item xs={12} md={6} lg={4} key={panel.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {panel.name}
                    </Typography>
                    <Chip 
                      label={panel.status} 
                      color={getStatusColor(panel.status)} 
                      size="small" 
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Panel Members ({panel.members.length})
                    </Typography>
                    <AvatarGroup max={4} sx={{ justifyContent: 'flex-start', mb: 1 }}>
                      {panel.members.map((member) => (
                        <Tooltip key={member.id} title={`${member.name} - ${member.role}`}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                        </Tooltip>
                      ))}
                    </AvatarGroup>
                    <Box sx={{ mt: 1 }}>
                      {panel.members.map((member) => (
                        <Typography key={member.id} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon fontSize="small" color="action" />
                          {member.name} - {member.role}
                        </Typography>
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Required Skills
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {panel.skills.map((skill, index) => (
                        <Chip key={index} label={skill} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditPanel(panel)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      startIcon={<ScheduleIcon />}
                      onClick={handleScheduleInterview}
                    >
                      Schedule
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      sx={{ ml: 'auto' }}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Interviews Tab */}
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Candidate</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Panel</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Members</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {interviews.map((interview) => (
                    <TableRow key={interview.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{interview.candidate}</Typography>
                      </TableCell>
                      <TableCell>{interview.position}</TableCell>
                      <TableCell>{interview.panel}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography variant="body2">{interview.date}</Typography>
                          <TimeIcon fontSize="small" color="action" />
                          <Typography variant="body2">{interview.time}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {interview.duration}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={interview.type} color={getTypeColor(interview.type)} size="small" />
                      </TableCell>
                      <TableCell>
                        <AvatarGroup max={2} sx={{ '& .MuiAvatar-root': { width: 24, height: 24 } }}>
                          {interview.members.map((member, index) => (
                            <Tooltip key={index} title={member}>
                              <Avatar sx={{ width: 24, height: 24 }}>
                                {member.split(' ').map(n => n[0]).join('')}
                              </Avatar>
                            </Tooltip>
                          ))}
                        </AvatarGroup>
                      </TableCell>
                      <TableCell>
                        <Chip label={interview.status} color={getStatusColor(interview.status)} size="small" />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small">
                          <VideoIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      {renderPanelDialog()}
      {renderInterviewDialog()}
    </Box>
  );
};

export default PanelManagement;