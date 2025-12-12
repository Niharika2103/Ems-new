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
  Switch,
  FormControlLabel,
  IconButton,
  Tabs,
  Tab,
  Checkbox,
  Alert,
  Snackbar,
  Tooltip,
  CircularProgress,
  InputAdornment,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Badge,
  TablePagination,
  Collapse,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  Visibility as ViewIcon,
  ContentCopy as CopyIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Link as LinkIcon,
  NotificationsActive as NotificationIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  Security as SecurityIcon,
  Http as HttpIcon,
  Send as SendIcon,
  Save as SaveIcon,
  Bolt as BoltIcon,
  CloudUpload as CloudUploadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  RestartAlt as RetryIcon,
} from '@mui/icons-material';

// Step 1: Choose WHAT events to notify about
const EVENT_TYPES = [
  { id: 'employee_onboarding', label: '👤 Employee Onboarding', color: '#4CAF50' },
  { id: 'leave_approval', label: '📅 Leave Approval', color: '#2196F3' },
  { id: 'payroll_release', label: '💰 Payroll Release', color: '#FF9800' },
  { id: 'performance_review', label: '📊 Performance Review', color: '#9C27B0' },
  { id: 'attendance_alert', label: '⏰ Attendance Alert', color: '#F44336' },
  { id: 'training_completed', label: '🎓 Training Completed', color: '#00BCD4' },
];

// Step 2: Choose WHERE to send notifications
const DESTINATIONS = [
  { id: 'slack', label: 'Slack', icon: '💬', color: '#4A154B' },
  { id: 'teams', label: 'Microsoft Teams', icon: '👥', color: '#505AC9' },
  { id: 'discord', label: 'Discord', icon: '🎮', color: '#5865F2' },
  { id: 'webhook', label: 'Custom URL', icon: '🔗', color: '#757575' },
  { id: 'zapier', label: 'Zapier', icon: '⚡', color: '#FF4A00' },
];

// Sample log data for each webhook
const generateSampleLogs = (webhookId) => {
  const logs = [];
  const events = ['employee_onboarding', 'leave_approval', 'payroll_release', 'training_completed'];
  const statuses = ['success', 'failed', 'pending'];
  
  for (let i = 0; i < 15; i++) {
    const event = events[Math.floor(Math.random() * events.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toLocaleString();
    
    logs.push({
      id: `${webhookId}-${i}`,
      webhookId: webhookId,
      event: event,
      status: status,
      responseCode: status === 'success' ? 200 : status === 'failed' ? 500 : null,
      responseTime: status === 'success' ? Math.floor(Math.random() * 500) + 100 : null,
      payload: {
        event: event,
        timestamp: timestamp,
        data: { 
          employee_id: `EMP${Math.floor(Math.random() * 1000)}`,
          action: event.replace('_', ' '),
          status: 'completed'
        }
      },
      timestamp: timestamp,
      attempts: status === 'failed' ? Math.floor(Math.random() * 3) + 1 : 1,
      errorMessage: status === 'failed' ? 'Connection timeout or endpoint unreachable' : null,
    });
  }
  
  return logs;
};

const EventWebhooks = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Webhook configuration state
  const [step, setStep] = useState(1);
  const [webhookName, setWebhookName] = useState('');
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [destination, setDestination] = useState('slack');
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.slack.com/services/...');
  const [isActive, setIsActive] = useState(true);

  // Logs viewing state
  const [selectedWebhookForLogs, setSelectedWebhookForLogs] = useState(null);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterStatus, setFilterStatus] = useState('all');
  const [logs, setLogs] = useState([]);

  // Sample webhooks data
  const [webhooks, setWebhooks] = useState([
    {
      id: 1,
      name: 'Slack HR Alerts',
      events: ['employee_onboarding', 'leave_approval'],
      destination: 'slack',
      url: 'https://hooks.slack.com/services/T000/B000/XXXX',
      status: 'active',
      lastTriggered: '2 hours ago',
      successRate: 98,
    },
    {
      id: 2,
      name: 'Finance Webhook',
      events: ['payroll_release'],
      destination: 'webhook',
      url: 'https://finance-system.com/webhook',
      status: 'active',
      lastTriggered: '1 day ago',
      successRate: 100,
    },
    {
      id: 3,
      name: 'Training Updates',
      events: ['training_completed'],
      destination: 'teams',
      url: 'https://teams.microsoft.com/webhook/...',
      status: 'inactive',
      lastTriggered: '1 week ago',
      successRate: 95,
    },
  ]);

  // Initialize logs for each webhook
  React.useEffect(() => {
    const allLogs = [];
    webhooks.forEach(webhook => {
      allLogs.push(...generateSampleLogs(webhook.id));
    });
    setLogs(allLogs);
  }, [webhooks]);

  const handleCreateWebhook = () => {
    setStep(1);
    setWebhookName('');
    setSelectedEvents([]);
    setDestination('slack');
    setWebhookUrl('');
    setCreateDialogOpen(true);
  };

  const handleSaveWebhook = () => {
    setLoading(true);
    
    setTimeout(() => {
      const newWebhook = {
        id: webhooks.length + 1,
        name: webhookName || 'New Webhook',
        events: selectedEvents,
        destination: destination,
        url: webhookUrl || `https://example.com/webhook/${Date.now()}`,
        status: isActive ? 'active' : 'inactive',
        lastTriggered: 'Just now',
        successRate: 100,
      };

      setWebhooks([newWebhook, ...webhooks]);
      
      // Generate logs for the new webhook
      const newLogs = generateSampleLogs(newWebhook.id);
      setLogs(prev => [...newLogs, ...prev]);
      
      setLoading(false);
      setCreateDialogOpen(false);
      showNotification('Webhook created successfully!', 'success');
    }, 1000);
  };

  const handleTestWebhook = (id) => {
    const webhook = webhooks.find(w => w.id === id);
    if (!webhook) return;
    
    setLoading(true);
    
    setTimeout(() => {
      // Add a test log entry
      const newLog = {
        id: `test-${Date.now()}`,
        webhookId: id,
        event: 'test_webhook',
        status: 'success',
        responseCode: 200,
        responseTime: 150,
        payload: {
          event: 'test_webhook',
          timestamp: new Date().toISOString(),
          data: {
            test: true,
            message: 'This is a test webhook payload',
            webhook_name: webhook.name
          }
        },
        timestamp: new Date().toLocaleString(),
        attempts: 1,
        errorMessage: null,
      };
      
      setLogs(prev => [newLog, ...prev]);
      setLoading(false);
      showNotification('Test webhook sent successfully! Check logs for details.', 'success');
    }, 1000);
  };

  const handleToggleStatus = (id) => {
    setWebhooks(webhooks.map(w => 
      w.id === id ? { ...w, status: w.status === 'active' ? 'inactive' : 'active' } : w
    ));
    showNotification('Webhook status updated', 'success');
  };

  const handleDeleteWebhook = (id) => {
    if (window.confirm('Delete this webhook?')) {
      setWebhooks(webhooks.filter(w => w.id !== id));
      // Also remove logs for this webhook
      setLogs(prev => prev.filter(log => log.webhookId !== id));
      showNotification('Webhook deleted', 'success');
    }
  };

  const handleViewLogs = (webhookId) => {
    const webhook = webhooks.find(w => w.id === webhookId);
    setSelectedWebhookForLogs(webhook);
    setLogsDialogOpen(true);
  };

  const handleCloseLogsDialog = () => {
    setLogsDialogOpen(false);
    setSelectedWebhookForLogs(null);
    setFilterStatus('all');
    setPage(0);
  };

  const showNotification = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleEventToggle = (eventId) => {
    setSelectedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'default';
  };

  const getLogStatusColor = (status) => {
    switch(status) {
      case 'success': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getDestinationIcon = (dest) => {
    return DESTINATIONS.find(d => d.id === dest)?.icon || '🔗';
  };

  const getEventLabel = (eventId) => {
    return EVENT_TYPES.find(e => e.id === eventId)?.label || eventId;
  };

  // Filter logs based on selected webhook and status filter
  const filteredLogs = logs.filter(log => {
    if (selectedWebhookForLogs && log.webhookId !== selectedWebhookForLogs.id) {
      return false;
    }
    if (filterStatus !== 'all' && log.status !== filterStatus) {
      return false;
    }
    return true;
  });

  const paginatedLogs = filteredLogs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRetryFailedWebhook = (logId) => {
    const log = logs.find(l => l.id === logId);
    if (!log) return;
    
    showNotification(`Retrying webhook delivery for ${log.event}...`, 'info');
    
    setTimeout(() => {
      // Simulate retry
      const updatedLogs = logs.map(l => 
        l.id === logId 
          ? { 
              ...l, 
              status: 'success',
              responseCode: 200,
              responseTime: 250,
              attempts: l.attempts + 1,
              errorMessage: null,
              timestamp: new Date().toLocaleString()
            }
          : l
      );
      setLogs(updatedLogs);
      showNotification('Webhook retry successful!', 'success');
    }, 1000);
  };

  const handleExportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Event', 'Status', 'Response Code', 'Response Time', 'Attempts', 'Webhook'],
      ...filteredLogs.map(log => [
        log.timestamp,
        log.event,
        log.status,
        log.responseCode || 'N/A',
        log.responseTime ? `${log.responseTime}ms` : 'N/A',
        log.attempts,
        webhooks.find(w => w.id === log.webhookId)?.name || 'Unknown'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webhook-logs-${selectedWebhookForLogs?.name || 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    showNotification('Logs exported successfully!', 'success');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <BoltIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight={600}>Event Webhooks</Typography>
            <Typography variant="body1" color="text.secondary">
              Send automatic notifications when important events happen in your system
            </Typography>
          </Box>
        </Box>
        
        <Card sx={{ bgcolor: 'primary.light', color: 'white', mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotificationIcon />
                  <Box>
                    <Typography variant="subtitle2">1. Event Happens</Typography>
                    <Typography variant="body2">Employee joins, leave approved, payroll processed</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CloudUploadIcon />
                  <Box>
                    <Typography variant="subtitle2">2. Webhook Triggers</Typography>
                    <Typography variant="body2">System sends data to configured destinations</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SendIcon />
                  <Box>
                    <Typography variant="subtitle2">3. Notification Sent</Typography>
                    <Typography variant="body2">Slack/Teams/Discord receives the update</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Active Webhooks */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight={600}>Active Webhooks</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {webhooks.length} webhooks configured
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateWebhook}
                  sx={{ borderRadius: 2 }}
                >
                  New Webhook
                </Button>
              </Box>

              <Grid container spacing={2}>
                {webhooks.map((webhook) => (
                  <Grid item xs={12} key={webhook.id}>
                    <Card variant="outlined" sx={{ '&:hover': { boxShadow: 3 } }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                              <Typography variant="h6">{webhook.name}</Typography>
                              <Chip
                                label={webhook.status}
                                color={getStatusColor(webhook.status)}
                                size="small"
                              />
                              <Chip
                                label={`${webhook.successRate}% success`}
                                variant="outlined"
                                size="small"
                                color={webhook.successRate > 95 ? 'success' : 'warning'}
                              />
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                <LinkIcon fontSize="small" sx={{ mr: 0.5 }} />
                                Sends to: {getDestinationIcon(webhook.destination)} {DESTINATIONS.find(d => d.id === webhook.destination)?.label}
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                              {webhook.events.map(eventId => (
                                <Chip
                                  key={eventId}
                                  label={getEventLabel(eventId)}
                                  size="small"
                                  variant="outlined"
                                  sx={{ bgcolor: EVENT_TYPES.find(e => e.id === eventId)?.color + '10' }}
                                />
                              ))}
                            </Box>

                            <Typography variant="caption" color="text.secondary">
                              Last triggered: {webhook.lastTriggered}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Tooltip title="Test Webhook">
                              <IconButton
                                size="small"
                                onClick={() => handleTestWebhook(webhook.id)}
                                color="primary"
                              >
                                <PlayArrowIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={webhook.status === 'active' ? 'Disable' : 'Enable'}>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleStatus(webhook.id)}
                                color={webhook.status === 'active' ? 'warning' : 'success'}
                              >
                                {webhook.status === 'active' ? <PendingIcon /> : <NotificationIcon />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View Logs">
                              <IconButton 
                                size="small" 
                                color="info"
                                onClick={() => handleViewLogs(webhook.id)}
                              >
                                <HistoryIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteWebhook(webhook.id)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}

                {webhooks.length === 0 && (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <BoltIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6" gutterBottom>No Webhooks Yet</Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Create your first webhook to start receiving automatic notifications
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreateWebhook}
                        sx={{ mt: 2 }}
                      >
                        Create Webhook
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Quick Stats & Guide */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Quick Stats</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
                    <Typography variant="h4" color="white">{webhooks.length}</Typography>
                    <Typography variant="body2" color="white">Total Webhooks</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                    <Typography variant="h4" color="white">
                      {webhooks.filter(w => w.status === 'active').length}
                    </Typography>
                    <Typography variant="body2" color="white">Active</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
                    <Typography variant="h4" color="white">
                      {Math.round(webhooks.reduce((sum, w) => sum + w.successRate, 0) / webhooks.length) || 0}%
                    </Typography>
                    <Typography variant="body2" color="white">Success Rate</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                    <Typography variant="h4" color="white">
                      {webhooks.reduce((sum, w) => sum + w.events.length, 0)}
                    </Typography>
                    <Typography variant="body2" color="white">Events Monitored</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>How It Works</Typography>
              <List dense>
                {[
                  { number: '1', title: 'Select Events', desc: 'Choose what activities to monitor' },
                  { number: '2', title: 'Pick Destination', desc: 'Where to send notifications' },
                  { number: '3', title: 'Configure URL', desc: 'Set up the webhook endpoint' },
                  { number: '4', title: 'Test & Activate', desc: 'Verify and enable the webhook' },
                ].map((item) => (
                  <ListItem key={item.number} sx={{ py: 1 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        {item.number}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      secondary={item.desc}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create Webhook Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Create New Webhook
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Step {step} of 3
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          {step === 1 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Step 1: Name Your Webhook
              </Typography>
              <TextField
                fullWidth
                label="Webhook Name"
                value={webhookName}
                onChange={(e) => setWebhookName(e.target.value)}
                placeholder="e.g., HR Slack Notifications"
                sx={{ mb: 3 }}
              />
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Choose a descriptive name that helps you identify this webhook
              </Typography>
            </Box>
          )}

          {step === 2 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Step 2: Select Events to Monitor
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Choose which events should trigger notifications
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {EVENT_TYPES.map((event) => (
                  <Grid item xs={12} sm={6} key={event.id}>
                    <Card
                      variant={selectedEvents.includes(event.id) ? "elevation" : "outlined"}
                      sx={{
                        cursor: 'pointer',
                        borderColor: selectedEvents.includes(event.id) ? event.color : 'divider',
                        bgcolor: selectedEvents.includes(event.id) ? event.color + '10' : 'transparent',
                        '&:hover': { borderColor: event.color },
                      }}
                      onClick={() => handleEventToggle(event.id)}
                    >
                      <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Checkbox
                            checked={selectedEvents.includes(event.id)}
                            sx={{ color: event.color, '&.Mui-checked': { color: event.color } }}
                          />
                          <Typography variant="body2">{event.label}</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {step === 3 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Step 3: Configure Destination
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Destination</InputLabel>
                <Select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  label="Destination"
                >
                  {DESTINATIONS.map((dest) => (
                    <MenuItem key={dest.id} value={dest.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h5">{dest.icon}</Typography>
                        <Box>
                          <Typography variant="body1">{dest.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {dest.id === 'slack' && 'Send to Slack channels'}
                            {dest.id === 'teams' && 'Send to Microsoft Teams'}
                            {dest.id === 'discord' && 'Send to Discord channels'}
                            {dest.id === 'webhook' && 'Custom webhook URL'}
                            {dest.id === 'zapier' && 'Connect via Zapier'}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Webhook URL"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder={
                  destination === 'slack' ? 'https://hooks.slack.com/services/...' :
                  destination === 'teams' ? 'https://outlook.office.com/webhook/...' :
                  'https://example.com/webhook'
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HttpIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    color="success"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">Activate immediately</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Webhook will start sending notifications right away
                    </Typography>
                  </Box>
                }
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          {step > 1 && (
            <Button onClick={prevStep} variant="outlined">
              Back
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          <Button onClick={() => setCreateDialogOpen(false)} variant="text">
            Cancel
          </Button>
          {step < 3 ? (
            <Button onClick={nextStep} variant="contained" disabled={step === 1 && !webhookName}>
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSaveWebhook}
              variant="contained"
              disabled={loading || selectedEvents.length === 0}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {loading ? 'Creating...' : 'Create Webhook'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* View Logs Dialog */}
      <Dialog 
        open={logsDialogOpen} 
        onClose={handleCloseLogsDialog} 
        maxWidth="lg" 
        fullWidth
        maxHeight="80vh"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {selectedWebhookForLogs ? `${selectedWebhookForLogs.name} - Event Logs` : 'Webhook Logs'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedWebhookForLogs 
                  ? `Viewing logs for: ${selectedWebhookForLogs.name}`
                  : 'View all webhook logs'
                }
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<DownloadIcon />}
                onClick={handleExportLogs}
                variant="outlined"
                size="small"
              >
                Export
              </Button>
              <IconButton onClick={handleCloseLogsDialog} size="small">
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {/* Filters */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Filter by Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
            
            <Chip
              label={`Total: ${filteredLogs.length} logs`}
              size="small"
              color="primary"
              variant="outlined"
            />
            
            {filteredLogs.filter(log => log.status === 'failed').length > 0 && (
              <Chip
                label={`Failed: ${filteredLogs.filter(log => log.status === 'failed').length}`}
                size="small"
                color="error"
                variant="outlined"
              />
            )}
          </Box>

          {/* Logs Table */}
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell width="60px"></TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Response Code</TableCell>
                  <TableCell>Response Time</TableCell>
                  <TableCell>Attempts</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                      <Typography variant="body1" color="text.secondary">
                        No logs found for the selected filters
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLogs.map((log) => (
                    <React.Fragment key={log.id}>
                      <TableRow hover>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                          >
                            {expandedLogId === log.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{log.timestamp}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getEventLabel(log.event)}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              bgcolor: EVENT_TYPES.find(e => e.id === log.event)?.color + '10',
                              borderColor: EVENT_TYPES.find(e => e.id === log.event)?.color
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={log.status === 'success' ? <SuccessIcon /> : log.status === 'failed' ? <ErrorIcon /> : <PendingIcon />}
                            label={log.status}
                            color={getLogStatusColor(log.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            color={log.responseCode >= 400 ? 'error.main' : 'success.main'}
                            fontWeight={log.responseCode ? 600 : 400}
                          >
                            {log.responseCode || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {log.responseTime ? `${log.responseTime}ms` : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            badgeContent={log.attempts} 
                            color={log.attempts > 1 ? 'warning' : 'default'}
                            sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16 } }}
                          >
                            <Typography variant="body2">{log.attempts}</Typography>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.status === 'failed' && (
                            <Tooltip title="Retry this webhook">
                              <IconButton
                                size="small"
                                onClick={() => handleRetryFailedWebhook(log.id)}
                                color="warning"
                              >
                                <RetryIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                      
                      {/* Expanded Row with Details */}
                      <TableRow>
                        <TableCell colSpan={8} sx={{ py: 0, border: 0 }}>
                          <Collapse in={expandedLogId === log.id} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: 1, borderColor: 'divider' }}>
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Payload Details
                                  </Typography>
                                  <Box sx={{ 
                                    p: 1, 
                                    bgcolor: 'white', 
                                    borderRadius: 1, 
                                    border: 1, 
                                    borderColor: 'divider',
                                    fontFamily: 'monospace',
                                    fontSize: '0.75rem',
                                    maxHeight: 200,
                                    overflow: 'auto'
                                  }}>
                                    <pre>{JSON.stringify(log.payload, null, 2)}</pre>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Delivery Information
                                  </Typography>
                                  <List dense>
                                    <ListItem>
                                      <ListItemText
                                        primary="Webhook"
                                        secondary={webhooks.find(w => w.id === log.webhookId)?.name || 'Unknown'}
                                      />
                                    </ListItem>
                                    {log.errorMessage && (
                                      <ListItem>
                                        <ListItemText
                                          primary="Error Message"
                                          secondary={
                                            <Typography color="error" variant="body2">
                                              {log.errorMessage}
                                            </Typography>
                                          }
                                        />
                                      </ListItem>
                                    )}
                                    <ListItem>
                                      <ListItemText
                                        primary="Event Type"
                                        secondary={log.event}
                                      />
                                    </ListItem>
                                    <ListItem>
                                      <ListItemText
                                        primary="Delivery Time"
                                        secondary={log.timestamp}
                                      />
                                    </ListItem>
                                  </List>
                                </Grid>
                              </Grid>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={filteredLogs.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseLogsDialog} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EventWebhooks;