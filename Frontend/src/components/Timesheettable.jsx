import React, { useState } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const TimesheetTable = () => {
  const [timesheets, setTimesheets] = useState([
    { id: 1, employee: "John Doe", date: "2025-10-11", hours: 8, status: "Pending" },
    { id: 2, employee: "Jane Smith", date: "2025-10-10", hours: 7, status: "Approved" },
    { id: 3, employee: "Alice Johnson", date: "2025-10-09", hours: 9, status: "Pending" },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [newTimesheet, setNewTimesheet] = useState({ employee: "", date: "", hours: "" });
const navigate = useNavigate();
  const handleApprove = (id) => {
    setTimesheets(timesheets.map(t => t.id === id ? { ...t, status: "Approved" } : t));
  };

  const handleReject = (id) => {
    setTimesheets(timesheets.map(t => t.id === id ? { ...t, status: "Rejected" } : t));
  };

  const handleDialogOpen = () => setOpenDialog(true);
  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewTimesheet({ employee: "", date: "", hours: "" });
  };

  const handleInputChange = (e) => {
    setNewTimesheet({ ...newTimesheet, [e.target.name]: e.target.value });
  };

  const handleAddTimesheet = () => {
    if (!newTimesheet.employee || !newTimesheet.date || !newTimesheet.hours) return;

    const newEntry = {
      id: timesheets.length + 1,
      employee: newTimesheet.employee,
      date: newTimesheet.date,
      hours: parseInt(newTimesheet.hours),
      status: "Pending"
    };
    setTimesheets([...timesheets, newEntry]);
    handleDialogClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved": return "success";
      case "Rejected": return "error";
      default: return "warning";
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: "center" }}>
        <Typography variant="h6" fontWeight={400}>Timesheet Approval</Typography>
        <Button variant="contained" color="primary" onClick={handleDialogOpen}>New Timesheet</Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ bgcolor: "primary.main" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Employee</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Hours</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {timesheets.map((t) => (
              <TableRow key={t.id} hover>
                <TableCell>{t.employee}</TableCell>
                <TableCell>{t.date}</TableCell>
                <TableCell>{t.hours}</TableCell>
                <TableCell>
                  <Chip label={t.status} color={getStatusColor(t.status)} />
                </TableCell>
                <TableCell>
                  <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                        // onClick={() => handleClick(t.id)}
                        onClick={()=>navigate("/attendance/timesheet")}
                      >
                        View
                      </Button>
                  {t.status === "Pending" && (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => handleApprove(t.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleReject(t.id)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

     
    </Box>
  );
};

export default TimesheetTable;
