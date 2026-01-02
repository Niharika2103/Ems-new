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

const getTodayDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD
};


const SuperAdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState(getTodayDate());
const [dateTo, setDateTo] = useState(getTodayDate());


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
      <TableContainer
  component={Paper}
  sx={{
    borderRadius: 2,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
  }}
>

        <Table>
          <TableHead>
  <TableRow
    sx={{
      backgroundColor: "#f5f7fa",
      "& th": {
        fontWeight: 600,
        fontSize: "0.85rem",
        textTransform: "uppercase",
        color: "#374151",
        borderBottom: "2px solid #e5e7eb",
        whiteSpace: "nowrap"
      }
    }}
  >
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
  <Dialog
    open={openModal}
    onClose={() => setOpenModal(false)}
    maxWidth="md"
    fullWidth
  >
    <DialogTitle sx={{ fontWeight: 600 }}>
      Audit Log Details
    </DialogTitle>

    <DialogContent dividers>
      <Grid container spacing={3}>

        {/* USER INFORMATION */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight={600} color="primary">
            User Information
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="caption">User ID</Typography>
          <Typography fontWeight={500}>{selectedLog.user}</Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="caption">Name</Typography>
          <Typography fontWeight={500}>{selectedLog.name}</Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="caption">Email</Typography>
          <Typography fontWeight={500}>{selectedLog.email}</Typography>
        </Grid>

        {/* SESSION DETAILS */}
        <Grid item xs={12} mt={2}>
          <Typography variant="subtitle1" fontWeight={600} color="primary">
            Session Details
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="caption">Login Time</Typography>
          <Typography fontWeight={500}>{selectedLog.login}</Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="caption">Logout Time</Typography>
          <Typography fontWeight={500}>{selectedLog.logout}</Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="caption">Session Duration</Typography>
          <Chip
            label={selectedLog.sessionDuration}
            color={selectedLog.logout === "—" ? "warning" : "success"}
            size="small"
          />
        </Grid>

        {/* ACTIVITY DETAILS */}
        <Grid item xs={12} mt={2}>
          <Typography variant="subtitle1" fontWeight={600} color="primary">
            Activity Details
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="caption">Level</Typography>
          <Chip
            label={selectedLog.level}
            color={getLevelColor(selectedLog.level)}
            size="small"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="caption">Timestamp</Typography>
          <Typography fontWeight={500}>{selectedLog.timestamp}</Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="caption">IP Address</Typography>
          <Typography fontWeight={500}>{selectedLog.ipAddress}</Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="caption">Device</Typography>
          <Typography fontWeight={500}>{selectedLog.device}</Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="caption">Description</Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mt: 1,
              backgroundColor: "#f9fafb",
              fontSize: "0.95rem"
            }}
          >
            {selectedLog.details}
          </Paper>
        </Grid>
      </Grid>
    </DialogContent>

    <DialogActions>
      <Button variant="outlined" onClick={() => setOpenModal(false)}>
        Close
      </Button>
    </DialogActions>
  </Dialog>
)}

    
    </Box>
  );
};

export default SuperAdminAuditLogs;
