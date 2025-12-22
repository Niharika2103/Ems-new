// src/pages/Templates/Webhook/EventWebhooks.jsx
import React, { useState, useEffect } from "react";
import {
  Box, Tabs, Tab, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField,
  FormControl, InputLabel, Select, MenuItem,
  Button, Switch, FormControlLabel, Chip,
  Alert, IconButton, Typography, Tooltip, CircularProgress
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ReplayIcon from "@mui/icons-material/Replay";

const API_BASE = "http://localhost:5002/admin/webhooks";

/* ============================================================
   WEBHOOK FORM
============================================================ */
const WebhookForm = ({ mode, webhook, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    event_type: "",
    target_url: "",
    auth_token: "",
    is_active: true
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === "edit" && webhook) {
      setFormData(webhook);
    } else {
      setFormData({
        event_type: "",
        target_url: "",
        auth_token: "",
        is_active: true
      });
    }
    setError("");
  }, [mode, webhook]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = () => {
    if (!formData.event_type || !formData.target_url) {
      setError("Event type and Target URL are required");
      return;
    }
    onSave(formData);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6">
        {mode === "edit" ? "Edit Webhook" : "Add Webhook"}
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <FormControl fullWidth margin="normal">
        <InputLabel>Event Type</InputLabel>
        <Select
          name="event_type"
          value={formData.event_type}
          onChange={handleChange}
          label="Event Type"
        >
          <MenuItem value="Employee Onboarding">Employee Onboarding</MenuItem>
          <MenuItem value="Leave Approval">Leave Approval</MenuItem>
          <MenuItem value="Payroll Release">Payroll Release</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Target URL"
        name="target_url"
        value={formData.target_url}
        onChange={handleChange}
        margin="normal"
      />

      <TextField
        fullWidth
        label="Auth Token"
        name="auth_token"
        value={formData.auth_token}
        onChange={handleChange}
        margin="normal"
      />

      <FormControlLabel
        control={
          <Switch
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
          />
        }
        label="Active"
      />

      <Box mt={2}>
        <Button variant="contained" onClick={handleSubmit}>
          {mode === "edit" ? "Update" : "Create"}
        </Button>
        <Button sx={{ ml: 1 }} onClick={onCancel}>Cancel</Button>
      </Box>
    </Paper>
  );
};

/* ============================================================
   MAIN COMPONENT
============================================================ */
const EventWebhooks = () => {
  const [webhooks, setWebhooks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState(0);
  const [mode, setMode] = useState("list");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH WEBHOOKS ================= */
  const fetchWebhooks = async () => {
    const res = await fetch(API_BASE);
    const data = await res.json();
    setWebhooks(data);
  };

  const fetchLogs = async () => {
    const res = await fetch(`${API_BASE}/logs/all`);
    const data = await res.json();
    setLogs(data);
  };

  useEffect(() => {
    fetchWebhooks();
    fetchLogs();
  }, []);

  /* ================= SAVE ================= */
  const handleSave = async (data) => {
    if (mode === "edit") {
      await fetch(`${API_BASE}/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    } else {
      await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    }
    setMode("list");
    fetchWebhooks();
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this webhook?")) return;
    await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    fetchWebhooks();
  };

  /* ================= TEST ================= */
  const handleTest = async (id) => {
    setLoading(id);
    await fetch(`${API_BASE}/test/${id}`, { method: "POST" });
    setLoading(false);
    fetchLogs();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5">Event Webhooks Manager</Typography>

      <Tabs value={tab} onChange={(e, v) => setTab(v)}>
        <Tab label="Webhooks" />
        <Tab label="Logs" />
      </Tabs>

      {tab === 0 && mode === "list" && (
        <>
          <Button sx={{ mb: 2 }} variant="contained" onClick={() => setMode("add")}>
            + Add Webhook
          </Button>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Event</TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {webhooks.map(w => (
                  <TableRow key={w.id}>
                    <TableCell>{w.event_type}</TableCell>
                    <TableCell>{w.target_url}</TableCell>
                    <TableCell>
                      <Chip label={w.is_active ? "Active" : "Inactive"} />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => { setSelected(w); setMode("edit"); }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(w.id)}>
                        <DeleteIcon />
                      </IconButton>
                      <Button
                        size="small"
                        onClick={() => handleTest(w.id)}
                        disabled={loading === w.id}
                        startIcon={loading === w.id ? <CircularProgress size={14}/> : <PlayArrowIcon />}
                      >
                        Test
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {(mode === "add" || mode === "edit") && (
        <WebhookForm
          mode={mode}
          webhook={selected}
          onSave={handleSave}
          onCancel={() => setMode("list")}
        />
      )}

      {tab === 1 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Event</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Retries</TableCell>
                <TableCell>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map(l => (
                <TableRow key={l.id}>
                  <TableCell>{l.event_type}</TableCell>
                  <TableCell>{l.status}</TableCell>
                  <TableCell>{l.retry_count}</TableCell>
                  <TableCell>{new Date(l.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default EventWebhooks;
