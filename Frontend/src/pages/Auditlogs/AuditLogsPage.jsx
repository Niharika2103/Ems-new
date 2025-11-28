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
} from "@mui/material";

// Dummy logs (replace with API response)
const dummyLogs = [
  {
    id: 1,
    user: "Admin",
    action: "Login Success",
    module: "Authentication",
    level: "INFO",
    timestamp: "2025-01-05 10:20 PM",
    details: "User logged in via MFA",
  },
  {
    id: 2,
    user: "John",
    action: "Record Updated",
    module: "Employee",
    level: "WARNING",
    timestamp: "2025-01-04 02:15 PM",
    details: "Employee salary updated",
  },
  {
    id: 3,
    user: "HR Manager",
    action: "Unauthorized Access",
    module: "Payroll",
    level: "ERROR",
    timestamp: "2025-01-03 09:45 AM",
    details: "Attempted access to restricted payroll data",
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

  // Filter Logic
  useEffect(() => {
    let filtered = logs;

    if (search) {
      filtered = filtered.filter(
        (log) =>
          log.user.toLowerCase().includes(search.toLowerCase()) ||
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
  }, [search, level, dateFrom, dateTo, logs]);

  const handleView = (log) => {
    setSelectedLog(log);
    setOpenModal(true);
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
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                select
                label="Log Level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                fullWidth
              >
                <MenuItem value="">All</MenuItem>
                {logLevels.map((lvl) => (
                  <MenuItem key={lvl} value={lvl}>
                    {lvl}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="From Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={dateFrom}
                fullWidth
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={3}>
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
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredLogs
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.module}</TableCell>
                  <TableCell>{log.level}</TableCell>
                  <TableCell>{log.timestamp}</TableCell>
                  <TableCell align="right">
                    <Button variant="outlined" onClick={() => handleView(log)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

            {filteredLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No logs found
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

      {/* View Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Audit Log Details</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box>
              <Typography><b>User:</b> {selectedLog.user}</Typography>
              <Typography><b>Action:</b> {selectedLog.action}</Typography>
              <Typography><b>Module:</b> {selectedLog.module}</Typography>
              <Typography><b>Level:</b> {selectedLog.level}</Typography>
              <Typography><b>Timestamp:</b> {selectedLog.timestamp}</Typography>
              <Typography mt={2}><b>Details:</b></Typography>
              <Typography>{selectedLog.details}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditLogsPage;
