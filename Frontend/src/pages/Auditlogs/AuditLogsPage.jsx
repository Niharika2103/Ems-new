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

import { getAllAdminAuditLogsApi } from "../../api/authApi"; // ✅ Adjust path as needed

const LabelValue = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1" fontWeight={500}>
      {value || "—"}
    </Typography>
  </Box>
);


const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const today = new Date().toISOString().split("T")[0];

const [dateFrom, setDateFrom] = useState(today);
const [dateTo, setDateTo] = useState(today);


  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openModal, setOpenModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Fetch audit logs from backend
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllAdminAuditLogsApi();
        const data = response.data?.audits || [];

        // ✅ Map backend fields + keep raw timestamps for reliable filtering
        const mappedLogs = data.map((log) => {
          const loginTime = log.login_time ? new Date(log.login_time) : null;
          const logoutTime = log.logout_time ? new Date(log.logout_time) : null;

          return {
            id: log.audit_id,
            user: log.user_id,
            name: log.user_name || "N/A",
            email: log.user_email || "N/A",
            login: loginTime ? loginTime.toLocaleString() : "N/A",
            logout: logoutTime ? logoutTime.toLocaleString() : "",
            loginRaw: log.login_time, // raw ISO string for filtering
            logoutRaw: log.logout_time,
            level: "INFO", // default; extend backend if dynamic levels needed
            timestamp: loginTime ? loginTime.toLocaleString() : "N/A",
            details: "User session activity",
            ipAddress: "—", // add to DB if needed
            device: "—",
            sessionDuration: logoutTime && loginTime
              ? calculateDuration(log.login_time, log.logout_time)
              : "In Progress",
          };
        });

        setLogs(mappedLogs);
        setFilteredLogs(mappedLogs);
      } catch (err) {
        console.error("Failed to fetch audit logs:", err);
        setError("Failed to load audit logs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Helper: Calculate session duration
  const calculateDuration = (loginTime, logoutTime) => {
    const start = new Date(loginTime);
    const end = new Date(logoutTime);
    const diffMs = end - start;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  // Filter Logic (using raw timestamps for reliability)
  useEffect(() => {
    let filtered = logs;

    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.user.toString().toLowerCase().includes(lowerSearch) ||
          log.name.toLowerCase().includes(lowerSearch) ||
          log.email.toLowerCase().includes(lowerSearch)
      );
    }

    if (dateFrom) {
      filtered = filtered.filter(
        (log) => log.loginRaw && new Date(log.loginRaw) >= new Date(dateFrom)
      );
    }

    if (dateTo) {
      const toDateEnd = new Date(dateTo);
      toDateEnd.setHours(23, 59, 59, 999); // End of the selected day
      filtered = filtered.filter(
        (log) => log.loginRaw && new Date(log.loginRaw) <= toDateEnd
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
      case "INFO": return "success";
      case "WARNING": return "warning";
      case "ERROR": return "error";
      default: return "default";
    }
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Admin Audit Logs
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
                fullWidth
                placeholder="Search user, name, email..."
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                label="From Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={dateFrom}
                fullWidth
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                label="To Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={dateTo}
                fullWidth
                onChange={(e) => setDateTo(e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ background: "#f4f4f4" }}>
            <TableRow>
              
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
                  
                  <TableCell>{log.name}</TableCell>
                  <TableCell>{log.email}</TableCell>
                  <TableCell>{log.login}</TableCell>
                  <TableCell>{log.logout || "—"} {/* Show dash if empty */}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleView(log)}
                      size="small"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

            {filteredLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">
                    No logs found.
                  </Typography>
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
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* View Details Modal */}
      {selectedLog && (
        <Dialog
          open={openModal}
          onClose={() => setOpenModal(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold">
              Audit Log Details
            </Typography>
          </DialogTitle>
          {/* <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                  User Information
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">User ID</Typography>
                <Typography variant="body1">{selectedLog.user}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">Full Name</Typography>
                <Typography variant="body1">{selectedLog.name}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">Email</Typography>
                <Typography variant="body1">{selectedLog.email}</Typography>
              </Grid>

              <Grid item xs={12}><Box mt={2} /></Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                  Session Details
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">Login Time</Typography>
                <Typography variant="body1">{selectedLog.login}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">Logout Time</Typography>
                <Typography variant="body1">{selectedLog.logout || "—"} </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">Session Duration</Typography>
                <Typography variant="body1">{selectedLog.sessionDuration}</Typography>
              </Grid>

              <Grid item xs={12}><Box mt={2} /></Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                  Activity Details
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">Log Level</Typography>
                <Chip
                  label={selectedLog.level}
                  color={getLevelColor(selectedLog.level)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">Timestamp</Typography>
                <Typography variant="body1">{selectedLog.timestamp}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">IP Address</Typography>
                <Typography variant="body1">{selectedLog.ipAddress}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">Device/Browser</Typography>
                <Typography variant="body1">{selectedLog.device}</Typography>
              </Grid>

              <Grid item xs={12}><Box mt={2} /></Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                  Detailed Information
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body1">{selectedLog.details}</Typography>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent> */}
          <DialogContent dividers sx={{ backgroundColor: "#fafafa" }}>
  <Grid container spacing={3}>

    {/* USER INFORMATION */}
    <Grid item xs={12}>
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          User Information
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <LabelValue label="User ID" value={selectedLog.user} />
          </Grid>
          <Grid item xs={12} md={4}>
            <LabelValue label="Full Name" value={selectedLog.name} />
          </Grid>
          <Grid item xs={12} md={4}>
            <LabelValue label="Email" value={selectedLog.email} />
          </Grid>
        </Grid>
      </Paper>
    </Grid>

    {/* SESSION DETAILS */}
    <Grid item xs={12}>
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Session Details
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <LabelValue label="Login Time" value={selectedLog.login} />
          </Grid>
          <Grid item xs={12} md={4}>
            <LabelValue label="Logout Time" value={selectedLog.logout || "—"} />
          </Grid>
          <Grid item xs={12} md={4}>
            <LabelValue label="Session Duration" value={selectedLog.sessionDuration} />
          </Grid>
        </Grid>
      </Paper>
    </Grid>

    {/* ACTIVITY DETAILS */}
    <Grid item xs={12}>
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Activity Details
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Typography variant="caption" color="text.secondary">
              Log Level
            </Typography>
            <Box mt={0.5}>
              <Chip
                label={selectedLog.level}
                color={getLevelColor(selectedLog.level)}
                size="small"
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <LabelValue label="Timestamp" value={selectedLog.timestamp} />
          </Grid>

          <Grid item xs={12} md={3}>
            <LabelValue label="IP Address" value={selectedLog.ipAddress} />
          </Grid>

          <Grid item xs={12} md={3}>
            <LabelValue label="Device / Browser" value={selectedLog.device} />
          </Grid>
        </Grid>
      </Paper>
    </Grid>

    {/* DETAILS BOX */}
    <Grid item xs={12}>
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 2,
          backgroundColor: "#f5f7fa",
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} mb={1}>
          Detailed Information
        </Typography>
        <Typography variant="body2">
          {selectedLog.details}
        </Typography>
      </Paper>
    </Grid>
  </Grid>
</DialogContent>

          <DialogActions>
            <Button onClick={() => setOpenModal(false)} variant="contained" color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default AuditLogsPage;