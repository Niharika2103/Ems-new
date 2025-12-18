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
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";

import { getAllSuperAdminAuditLogsApi } from "../../api/authApi"; // <-- API for superadmin logs

const SuperAdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openModal, setOpenModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Calculate session duration
  const calculateDuration = (loginTime, logoutTime) => {
    if (!logoutTime) return "In Progress";
    const start = new Date(loginTime);
    const end = new Date(logoutTime);
    const diffMs = end - start;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  // Fetch logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getAllSuperAdminAuditLogsApi();
        const data = response.data?.audits || [];

        const mapped = data.map((log) => {
          const loginDate = log.login_time ? new Date(log.login_time) : null;
          const logoutDate = log.logout_time ? new Date(log.logout_time) : null;

          return {
            id: log.audit_id,
            user: log.user_id,
            name: log.user_name || "N/A",
            email: log.user_email || "N/A",
            login: loginDate ? loginDate.toLocaleString() : "N/A",
            logout: logoutDate ? logoutDate.toLocaleString() : "—",
            loginRaw: log.login_time,
            logoutRaw: log.logout_time,
            level: "INFO",
            timestamp: loginDate ? loginDate.toLocaleString() : "N/A",
            ipAddress: "—",
            device: "—",
            sessionDuration:
              logoutDate && loginDate
                ? calculateDuration(log.login_time, log.logout_time)
                : "In Progress",
            details: "SuperAdmin session activity log",
          };
        });

        setLogs(mapped);
        setFilteredLogs(mapped);
      } catch (err) {
        console.error("SuperAdmin Audit Logs Error:", err);
        setError("Failed to load audit logs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Filtering
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

  const handleView = (log) => {
    setSelectedLog(log);
    setOpenModal(true);
  };

  // Loading UI
  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );

  // Error UI
  if (error)
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        SuperAdmin Audit Logs
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, ID..."
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                label="From Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                label="To Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
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
                  <TableCell>
                    <Typography fontWeight="bold">{log.user}</Typography>
                  </TableCell>
                  <TableCell>{log.name}</TableCell>
                  <TableCell>{log.email}</TableCell>
                  <TableCell>{log.login}</TableCell>
                  <TableCell>{log.logout}</TableCell>

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
                  No logs found.
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

      {/* Modal */}
      {selectedLog && (
        <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold">
              Audit Log Details
            </Typography>
          </DialogTitle>

          <DialogContent dividers>
            <Grid container spacing={2}>
              {/* User Info */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                  User Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <b>User ID</b>
                <div>{selectedLog.user}</div>
              </Grid>

              <Grid item xs={12} md={4}>
                <b>Name</b>
                <div>{selectedLog.name}</div>
              </Grid>

              <Grid item xs={12} md={4}>
                <b>Email</b>
                <div>{selectedLog.email}</div>
              </Grid>

              {/* Session */}
              <Grid item xs={12} mt={2}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                  Session Details
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <b>Login Time</b>
                <div>{selectedLog.login}</div>
              </Grid>

              <Grid item xs={12} md={4}>
                <b>Logout Time</b>
                <div>{selectedLog.logout}</div>
              </Grid>

              <Grid item xs={12} md={4}>
                <b>Duration</b>
                <div>{selectedLog.sessionDuration}</div>
              </Grid>

              {/* Activity */}
              <Grid item xs={12} mt={2}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                  Activity Details
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <b>Level</b>
                <Chip label={selectedLog.level} color={getLevelColor(selectedLog.level)} size="small" />
              </Grid>

              <Grid item xs={12} md={4}>
                <b>Timestamp</b>
                <div>{selectedLog.timestamp}</div>
              </Grid>

              <Grid item xs={12} md={4}>
                <b>IP Address</b>
                <div>{selectedLog.ipAddress}</div>
              </Grid>

              <Grid item xs={12} md={4}>
                <b>Device</b>
                <div>{selectedLog.device}</div>
              </Grid>

              <Grid item xs={12} mt={2}>
                <b>Details</b>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                  {selectedLog.details}
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button variant="contained" onClick={() => setOpenModal(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default SuperAdminAuditLogs;
