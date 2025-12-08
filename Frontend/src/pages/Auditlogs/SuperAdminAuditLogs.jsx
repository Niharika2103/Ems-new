import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";

// ------------------ DUMMY AUDIT LOG DATA -------------------
const dummyAuditLogs = [
  {
    audit_id: 1,
    user_id: 501,
    user_name: "Super Admin",
    user_email: "superadmin@matrix.com",
    login_time: "2025-01-06T09:30:00",
    logout_time: "2025-01-06T11:20:00",
  },
  {
    audit_id: 2,
    user_id: 502,
    user_name: "System Admin",
    user_email: "sysadmin@matrix.com",
    login_time: "2025-01-06T10:00:00",
    logout_time: "2025-01-06T12:00:00",
  },
  {
    audit_id: 3,
    user_id: 503,
    user_name: "Niharika",
    user_email: "niharika@matrix.com",
    login_time: "2025-01-05T14:10:00",
    logout_time: null,
  },
  {
    audit_id: 4,
    user_id: 504,
    user_name: "HR Manager",
    user_email: "hrmanager@matrix.com",
    login_time: "2025-01-05T08:00:00",
    logout_time: "2025-01-05T15:30:00",
  },
];

// ------------------ HELPER FUNCTION -------------------
const calculateDuration = (loginTime, logoutTime) => {
  if (!logoutTime) return "In Progress";

  const start = new Date(loginTime);
  const end = new Date(logoutTime);

  const diffMs = end - start;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${mins}m`;
};

// ------------------ MAIN COMPONENT -------------------
const SuperAdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openModal, setOpenModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Format dummy logs
  useEffect(() => {
    const formatted = dummyAuditLogs.map((log) => {
      const login = log.login_time ? new Date(log.login_time) : null;
      const logout = log.logout_time ? new Date(log.logout_time) : null;

      return {
        id: log.audit_id,
        user: log.user_id,
        name: log.user_name,
        email: log.user_email,
        login: login ? login.toLocaleString() : "N/A",
        logout: logout ? logout.toLocaleString() : "—",
        loginRaw: log.login_time,
        logoutRaw: log.logout_time,
        level: "INFO",
        timestamp: login ? login.toLocaleString() : "N/A",
        ipAddress: "192.168.1.10",
        device: "Chrome (Windows)",
        sessionDuration: calculateDuration(log.login_time, log.logout_time),
        details: "User session recorded successfully",
      };
    });

    setLogs(formatted);
    setFilteredLogs(formatted);
  }, []);

  // ------------------ FILTER LOGIC -------------------
  useEffect(() => {
    let filtered = logs;

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.name.toLowerCase().includes(s) ||
          log.email.toLowerCase().includes(s) ||
          log.user.toString().includes(s)
      );
    }

    if (dateFrom) {
      filtered = filtered.filter(
        (log) => new Date(log.loginRaw) >= new Date(dateFrom)
      );
    }

    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);

      filtered = filtered.filter(
        (log) => new Date(log.loginRaw) <= end
      );
    }

    setFilteredLogs(filtered);
    setPage(0);
  }, [search, dateFrom, dateTo, logs]);

  const handleView = (log) => {
    setSelectedLog(log);
    setOpenModal(true);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "INFO":
        return "success";
      case "WARNING":
        return "warning";
      case "ERROR":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        SuperAdmin — Audit Logs
      </Typography>

      {/* ------------------ FILTERS CARD ------------------ */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                label="Search User"
                placeholder="Search by name, email, ID"
                fullWidth
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                label="From Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                label="To Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ------------------ TABLE ------------------ */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ background: "#f4f4f4" }}>
            <TableRow>
              <TableCell>User ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Login Time</TableCell>
              <TableCell>Logout Time</TableCell>
              <TableCell align="center">View</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredLogs
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell><b>{log.user}</b></TableCell>
                  <TableCell>{log.name}</TableCell>
                  <TableCell>{log.email}</TableCell>
                  <TableCell>{log.login}</TableCell>
                  <TableCell>{log.logout}</TableCell>

                  {/* View Button */}
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => handleView(log)}>
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

            {filteredLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography>No logs found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filteredLogs.length}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 20]}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* ------------------ MODAL ------------------ */}
      {selectedLog && (
        <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="md">
          <DialogTitle><b>Audit Log Details</b></DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary">User Info</Typography>
              </Grid>

              <Grid item xs={4}><b>User ID</b><div>{selectedLog.user}</div></Grid>
              <Grid item xs={4}><b>Name</b><div>{selectedLog.name}</div></Grid>
              <Grid item xs={4}><b>Email</b><div>{selectedLog.email}</div></Grid>

              <Grid item xs={12} mt={2}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary">Session</Typography>
              </Grid>

              <Grid item xs={4}><b>Login</b><div>{selectedLog.login}</div></Grid>
              <Grid item xs={4}><b>Logout</b><div>{selectedLog.logout}</div></Grid>
              <Grid item xs={4}><b>Duration</b><div>{selectedLog.sessionDuration}</div></Grid>

              <Grid item xs={12} mt={2}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary">Activity</Typography>
              </Grid>

              <Grid item xs={4}><b>Level</b><Chip label={selectedLog.level} color={getLevelColor(selectedLog.level)} size="small"/></Grid>
              <Grid item xs={4}><b>Timestamp</b><div>{selectedLog.timestamp}</div></Grid>
              <Grid item xs={4}><b>IP</b><div>{selectedLog.ipAddress}</div></Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpenModal(false)} variant="contained">Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default SuperAdminAuditLogs;
