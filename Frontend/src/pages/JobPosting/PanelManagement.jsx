import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Avatar,
  AvatarGroup,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Group as GroupIcon,
} from '@mui/icons-material';

// Import your API functions — adjust path as needed
import { employeeFetchApi } from "../../api/authApi";
import { assignPanelMembersApi, getAllPanelsApi } from "../../api/authApi";

const PanelManagement = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState(null);

  const [panels, setPanels] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [panelName, setPanelName] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);

  // 👇 Helper: Safely get initials from name
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '?';
    return name
      .trim()
      .split(/\s+/)
      .map((n) => n[0]?.toUpperCase() || '')
      .join('')
      .substring(0, 3) || '?';
  };

  // Fetch panels and employees on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [panelsRes, employeesRes] = await Promise.all([
          getAllPanelsApi(),
          employeeFetchApi(),
        ]);

        // Normalize panels
        const normalizedPanels = (panelsRes.data || []).map((p) => ({
          panel_name: p.panel_name,
          members: (p.members || []).map((m) => ({
            employee_id: m.employee_id,
            fullname: m.fullname || 'Unknown',
            designation: m.designation || '—',
          })),
        }));
        setPanels(normalizedPanels);

        // Normalize employees — ensure name is never null
        const employees = (employeesRes.data || []).map((emp) => ({
          id: emp.id,
          name: emp.name || `Employee ${emp.id}`,
          role: emp.designation || '—',
          department: emp.department || '—',
        }));
        setAvailableMembers(employees);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load panels or employees.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreatePanel = () => {
    setSelectedPanel(null);
    setPanelName('');
    setSelectedMemberIds([]);
    setOpenDialog(true);
  };

  const handleEditPanel = (panel) => {
    setSelectedPanel(panel);
    setPanelName(panel.panel_name);
    setSelectedMemberIds(panel.members.map((m) => m.employee_id));
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPanel(null);
  };

  const handleMemberToggle = (memberId) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSavePanel = async () => {
    if (!panelName.trim()) {
      alert('Panel name is required.');
      return;
    }
    if (selectedMemberIds.length === 0) {
      alert('Please select at least one panel member.');
      return;
    }

    try {
      await assignPanelMembersApi({
        panel_name: panelName,
        member_ids: selectedMemberIds,
      });

      // Refetch panels
      const res = await getAllPanelsApi();
      const normalizedPanels = (res.data || []).map((p) => ({
        panel_name: p.panel_name,
        members: (p.members || []).map((m) => ({
          employee_id: m.employee_id,
          fullname: m.fullname || 'Unknown',
          designation: m.designation || '—',
        })),
      }));
      setPanels(normalizedPanels);

      handleCloseDialog();
    } catch (err) {
      console.error('Save panel error:', err);
      alert('Failed to save panel. Please try again.');
    }
  };

  const renderPanelDialog = () => (
    <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
      <DialogTitle>
        {selectedPanel ? 'Edit Interview Panel' : 'Create New Interview Panel'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Panel Name"
              value={panelName}
              onChange={(e) => setPanelName(e.target.value)}
              placeholder="e.g., Technical Interview Panel"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Select Panel Members
            </Typography>
            <Box
              sx={{
                maxHeight: 250,
                overflow: 'auto',
                border: '1px solid #ddd',
                borderRadius: 1,
                p: 1,
              }}
            >
              {availableMembers.length > 0 ? (
                availableMembers.map((member) => (
                  <FormControlLabel
                    key={member.id}
                    control={
                      <Switch
                        checked={selectedMemberIds.includes(member.id)}
                        onChange={() => handleMemberToggle(member.id)}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24 }}>
                          {getInitials(member.name)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">{member.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.role} • {member.department}
                          </Typography>
                        </Box>
                      </Box>
                    }
                    sx={{ width: '100%', ml: 0, mb: 1 }}
                  />
                ))
              ) : (
                <Typography color="text.secondary">No employees available.</Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>Cancel</Button>
        <Button variant="contained" onClick={handleSavePanel}>
          {selectedPanel ? 'Update Panel' : 'Create Panel'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading panels and employees...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={() => window.location.reload()} sx={{ mt: 1 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Interview Panel Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage interview panels and assign members
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<GroupIcon />} onClick={handleCreatePanel}>
          Create Panel
        </Button>
      </Box>

      {/* Panels List */}
      {panels.length === 0 ? (
        <Typography>No panels created yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {panels.map((panel) => (
            <Grid item xs={12} md={6} lg={4} key={panel.panel_name}>
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
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      {panel.panel_name}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Panel Members ({panel.members.length})
                    </Typography>
                    <AvatarGroup max={4} sx={{ justifyContent: 'flex-start', mb: 1 }}>
                      {panel.members.map((member) => (
                        <Tooltip
                          key={member.employee_id}
                          title={`${member.fullname} - ${member.designation}`}
                        >
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {getInitials(member.fullname)}
                          </Avatar>
                        </Tooltip>
                      ))}
                    </AvatarGroup>
                    <Box sx={{ mt: 1 }}>
                      {panel.members.map((member) => (
                        <Typography
                          key={member.employee_id}
                          variant="body2"
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <PersonIcon fontSize="small" color="action" />
                          {member.fullname} - {member.designation}
                        </Typography>
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
                    <Button size="small" color="error" startIcon={<DeleteIcon />} sx={{ ml: 'auto' }}>
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog */}
      {renderPanelDialog()}
    </Box>
  );
};

export default PanelManagement;