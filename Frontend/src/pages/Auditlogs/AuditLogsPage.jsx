import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Grid,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

// Updated dummy logs with new columns
const dummyLogs = [
  {
    id: 1,
    user: "admin001",
    name: "John Smith",
    email: "john.smith@company.com",
    login: "2025-01-05 10:20 PM",
    logout: "2025-01-05 06:45 PM",
    // action: "Login Success",
    // module: "Authentication",
    level: "INFO",
    timestamp: "2025-01-05 10:20 PM",
    details: "User logged in via MFA",
    ipAddress: "192.168.1.100",
    device: "Windows Chrome",
    sessionDuration: "8 hours 25 minutes",
  },
  {
    id: 2,
    user: "emp023",
    name: "Sarah Johnson",
    email: "sarah.j@company.com",
    login: "2025-01-04 09:15 AM",
    logout: "2025-01-04 05:30 PM",
    // action: "Record Updated",
    // module: "Employee",
    level: "WARNING",
    timestamp: "2025-01-04 02:15 PM",
    details: "Employee salary updated",
    ipAddress: "10.0.0.45",
    device: "MacOS Safari",
    sessionDuration: "8 hours 15 minutes",
  },
  
];

const logLevels = ["INFO", "WARNING", "ERROR"];

const AuditLogsPage = () => {
  const [logs, setLogs] = useState(dummyLogs);
  const [filteredLogs, setFilteredLogs] = useState(dummyLogs);

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openModal, setOpenModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

   const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Filter Logic
  useEffect(() => {
    let filtered = logs;

    if (search) {
      filtered = filtered.filter(
        (log) =>
          log.user.toLowerCase().includes(search.toLowerCase()) ||
          log.name.toLowerCase().includes(search.toLowerCase()) ||
          log.email.toLowerCase().includes(search.toLowerCase()) ||
          log.action.toLowerCase().includes(search.toLowerCase()) ||
          log.module.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (level) {
      filtered = filtered.filter((log) => log.level === level);
    }

    if (dateFrom) {
      filtered = filtered.filter(
        (log) => new Date(log.timestamp) >= new Date(dateFrom)
      );
    }

    if (dateTo) {
      filtered = filtered.filter(
        (log) => new Date(log.timestamp) <= new Date(dateTo)
      );
    }

    setFilteredLogs(filtered);
    setPage(0); // Reset to first page when filtering
  }, [search, level, dateFrom, dateTo, logs]);

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
        Audit & Activity Logs
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

            {/* <Grid item xs={12} md={2}>
              <TextField
                select
                label="Log Level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                fullWidth
              >
                <MenuItem value="">All Levels</MenuItem>
                {logLevels.map((lvl) => (
                  <MenuItem key={lvl} value={lvl}>
                    {lvl}
                  </MenuItem>
                ))}
              </TextField>
            </Grid> */}

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

            <Grid item xs={12} md={3} sx={{ display: "flex", alignItems: "center" }}>
              {/* <Button
                variant="outlined"
                onClick={() => {
                  setSearch("");
                  setLevel("");
                  setDateFrom("");
                  setDateTo("");
                }}
                sx={{ height: 56 }}
                fullWidth
              >
                Clear Filters
              </Button> */}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ background: "#f4f4f4" }}>
            <TableRow>
              <TableCell>User ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Login Time</TableCell>
              <TableCell>Logout Time</TableCell>
              {/* <TableCell>Action</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Level</TableCell> */}
              <TableCell align="center">View</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredLogs
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {log.user}
                    </Typography>
                  </TableCell>
                  <TableCell>{log.name}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {log.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{log.login}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{log.logout}</Typography>
                  </TableCell>
                  {/* <TableCell>{log.action}</TableCell>
                  <TableCell>{log.module}</TableCell> */}
                  <TableCell>
                    <Chip
                      label={log.level}
                      color={getLevelColor(log.level)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
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
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">
                    No logs found. Try adjusting your filters.
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
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* View Details Modal */}
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
        <DialogContent dividers>
          {selectedLog && (
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
                <Typography variant="body1">{selectedLog.logout}</Typography>
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
              
              {/* <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">Action</Typography>
                <Typography variant="body1">{selectedLog.action}</Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="textSecondary">Module</Typography>
                <Typography variant="body1">{selectedLog.module}</Typography>
              </Grid> */}
              
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
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenModal(false)} 
            variant="contained"
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditLogsPage;