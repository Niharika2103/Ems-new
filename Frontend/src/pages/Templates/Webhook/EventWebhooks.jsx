// src/pages/Templates/Webhook/EventWebhooks.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  IconButton,
  Typography,
  Tooltip,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';

// ✅ Standalone Form Component — Follows React Rules of Hooks
const WebhookForm = ({ mode, webhook, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    eventType: '',
    url: '',
    authToken: '',
    active: true
  });
  const [error, setError] = useState('');

  // Sync form when mode or webhook changes
  useEffect(() => {
    if (mode === 'edit' && webhook) {
      setFormData({
        id: webhook.id,
        eventType: webhook.eventType,
        url: webhook.url,
        authToken: webhook.authToken || '',
        active: webhook.active
      });
    } else {
      setFormData({
        eventType: '',
        url: '',
        authToken: '',
        active: true
      });
    }
    setError('');
  }, [mode, webhook]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateAndSave = () => {
    if (!formData.eventType || !formData.url) {
      setError('Event type and URL are required.');
      return;
    }
    if (!/^https?:\/\//.test(formData.url)) {
      setError('URL must start with http:// or https://');
      return;
    }
    setError('');
    onSave(formData);
  };

  const eventOptions = ['Employee Onboarding', 'Leave Approval', 'Payroll Release'];

  return (
    <Paper sx={{ p: 3, mb: 3, boxShadow: 2 }}>
      <Typography variant="h6" gutterBottom>
        {mode === 'edit' ? 'Edit Webhook' : 'Add New Webhook'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <FormControl fullWidth margin="normal">
        <InputLabel>Event Type</InputLabel>
        <Select
          name="eventType"
          value={formData.eventType}
          label="Event Type"
          onChange={handleChange}
        >
          {eventOptions.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Target URL (e.g., Slack, ERP)"
        name="url"
        value={formData.url}
        onChange={handleChange}
        margin="normal"
        placeholder="https://hooks.slack.com/services/..."
      />

      <TextField
        fullWidth
        label="Authentication Token (Optional)"
        name="authToken"
        value={formData.authToken}
        onChange={handleChange}
        margin="normal"
        type="password"
        helperText="Sent as Bearer Token in Authorization header"
      />

      <FormControlLabel
        control={
          <Switch
            name="active"
            checked={formData.active}
            onChange={handleChange}
          />
        }
        label="Active"
      />

      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={validateAndSave}
          disabled={!formData.eventType || !formData.url}
        >
          {mode === 'edit' ? 'Update Webhook' : 'Create Webhook'}
        </Button>
        <Button onClick={onCancel} sx={{ ml: 1 }}>
          Cancel
        </Button>
      </Box>
    </Paper>
  );
};

// ✅ Main Component
const EventWebhooks = () => {
  // State
  const [webhooks, setWebhooks] = useState([
    {
      id: 1,
      eventType: 'Employee Onboarding',
      url: 'https://httpbin.org/post',
      authToken: 'wh_sec_abc123',
      active: true
    }
  ]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [formMode, setFormMode] = useState('list'); // 'list', 'add', 'edit'
  const [currentHook, setCurrentHook] = useState(null);
  const [loading, setLoading] = useState(null); // webhook.id or 'test-{id}'
  const MAX_RETRIES = 3;

  // 🔌 Deliver Webhook (Real HTTP POST)
  const deliverWebhook = async (hook, isRetry = false, originalLog = null) => {
    const logId = isRetry ? `retry-${Date.now()}` : `test-${hook.id}`;
    setLoading(logId);

    // Build payload
    const data = { test: !isRetry, retry: isRetry };
    if (isRetry && originalLog?.id) {
      data.originalLogId = originalLog.id;
    }

    const payload = {
      event: hook.eventType.replace(/\s+/g, '_').toLowerCase(),
      timestamp: new Date().toISOString(),
       data
    };

    try {
      const response = await fetch(hook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(hook.authToken && { Authorization: `Bearer ${hook.authToken}` })
        },
        body: JSON.stringify(payload)
      });

      const newLog = {
        id: Date.now(),
        timestamp: new Date(),
        eventType: hook.eventType,
        url: hook.url,
        status: response.ok ? 'success' : 'failed',
        retries: isRetry ? (originalLog?.retries || 0) + 1 : 0
      };

      if (!response.ok) {
        newLog.error = `HTTP ${response.status}: ${response.statusText}`;
      }

      setLogs((prev) => [newLog, ...prev]);
    } catch (err) {
      setLogs((prev) => [
        {
          id: Date.now(),
          timestamp: new Date(),
          eventType: hook.eventType,
          url: hook.url,
          status: 'failed',
          retries: isRetry ? (originalLog?.retries || 0) + 1 : 0,
          error: err.message || 'Network error'
        },
        ...prev
      ]);
    } finally {
      setLoading(null);
    }
  };

  // ✅ Test Webhook
  const handleTest = (hook) => {
    if (!hook.active) {
      alert('Webhook is inactive. Please enable it first.');
      return;
    }
    deliverWebhook(hook, false, null);
  };

  // 🔁 Retry Failed Delivery
  const handleRetry = (log) => {
    if (log.retries >= MAX_RETRIES) {
      alert(`Max retries (${MAX_RETRIES}) reached.`);
      return;
    }
    const hook = webhooks.find(
      (w) => w.url === log.url && w.eventType === log.eventType && w.active
    );
    if (!hook) {
      alert('Active webhook not found for this log.');
      return;
    }
    deliverWebhook(hook, true, log);
  };

  // 💾 Save Webhook (Add or Edit)
  const handleSave = (data) => {
    if (formMode === 'edit') {
      setWebhooks((prev) =>
        prev.map((w) => (w.id === data.id ? data : w))
      );
    } else {
      setWebhooks((prev) => [...prev, { ...data, id: Date.now() }]);
    }
    setFormMode('list');
    setActiveTab(0);
  };

  // 🗑️ Delete Webhook
  const handleDelete = (id) => {
    if (
      window.confirm(
        'Are you sure you want to delete this webhook? This action cannot be undone.'
      )
    ) {
      setWebhooks((prev) => prev.filter((w) => w.id !== id));
    }
  };

  // 📋 Render Webhook List
  const renderList = () => (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setFormMode('add');
          setActiveTab(0);
        }}
        sx={{ mb: 2 }}
      >
        + Add Webhook
      </Button>

      <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Event</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Auth</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {webhooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    No webhooks configured.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              webhooks.map((hook) => (
                <TableRow key={hook.id} hover>
                  <TableCell>{hook.eventType}</TableCell>
                  <TableCell>
                    <Typography
                      noWrap
                      sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {hook.url}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {hook.authToken ? (
                      <Chip label="✅ Token Set" size="small" color="success" />
                    ) : (
                      <Chip label="⚠️ None" size="small" color="warning" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={hook.active ? 'Active' : 'Inactive'}
                      size="small"
                      color={hook.active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setCurrentHook(hook);
                        setFormMode('edit');
                        setActiveTab(0);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(hook.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={
                        loading === `test-${hook.id}` ? (
                          <CircularProgress size={16} />
                        ) : (
                          <PlayArrowIcon fontSize="small" />
                        )
                      }
                      onClick={() => handleTest(hook)}
                      disabled={!hook.active || loading === `test-${hook.id}`}
                      sx={{ ml: 1 }}
                    >
                      {loading === `test-${hook.id}` ? 'Testing...' : 'Test'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  // 📜 Render Delivery Logs
  const renderLogs = () => (
    <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell>Event</TableCell>
            <TableCell>Endpoint</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Retries</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                <Typography color="text.secondary">
                  No delivery attempts yet. Add a webhook and click "Test".
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id} hover>
                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                <TableCell>{log.eventType}</TableCell>
                <TableCell>
                  <Typography
                    noWrap
                    sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {log.url}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={log.status}
                    size="small"
                    color={log.status === 'success' ? 'success' : 'error'}
                  />
                  {log.error && (
                    <Typography variant="caption" color="error" display="block">
                      {log.error}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{log.retries}/{MAX_RETRIES}</TableCell>
                <TableCell>
                  {log.status === 'failed' && log.retries < MAX_RETRIES && (
                    <Tooltip title="Retry delivery">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => handleRetry(log)}
                          disabled={loading?.startsWith('retry')}
                        >
                          {loading?.startsWith('retry') ? (
                            <CircularProgress size={16} />
                          ) : (
                            <ReplayIcon fontSize="small" />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Event Webhooks Manager
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Configure real-time notifications for HR events. Logs include delivery status and retry support.
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(e, v) => setActiveTab(v)}
        sx={{ mb: 3 }}
        indicatorColor="primary"
      >
        <Tab label="Webhooks" />
        <Tab label="Delivery Logs" />
      </Tabs>

      {/* Webhook List */}
      {activeTab === 0 && formMode === 'list' && renderList()}

      {/* Form (Add/Edit) */}
      {activeTab === 0 &&
        (formMode === 'add' || formMode === 'edit') && (
          <WebhookForm
            mode={formMode}
            webhook={currentHook}
            onSave={handleSave}
            onCancel={() => setFormMode('list')}
          />
        )}

      {/* Delivery Logs */}
      {activeTab === 1 && renderLogs()}
    </Box>
  );
};

export default EventWebhooks;