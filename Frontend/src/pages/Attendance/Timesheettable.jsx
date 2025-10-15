import React, { useState, useEffect } from "react";
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
  TablePagination, // 🔹 Added
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  AttendanceFetchAll,
  AttendanceFetchByEmployeeProject,
} from "../../features/attendance/attendanceSlice";

const TimesheetTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { attendance, loading, error } = useSelector((state) => state.attendance);
  const { employeeId, projectId } = location.state || {};

  const [newTimesheet, setNewTimesheet] = useState({ employee: "", date: "", hours: "" });
  const [localTimesheets, setLocalTimesheets] = useState([]);

  // 🔹 Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    dispatch(AttendanceFetchAll());
  }, [dispatch]);

  useEffect(() => {
    if (attendance && Array.isArray(attendance)) {
      const mapped = attendance.map((item) => ({
        id: item.id,
        employee: item.employee?.employeeCode || "Unknown",
        date: item.date,
        hours: item.workedHours,
        status: item.status === "draft" ? "Pending" : capitalize(item.status),
      }));
      setLocalTimesheets(mapped);
    }
  }, [attendance]);

  useEffect(() => {
    if (employeeId && projectId) {
      dispatch(AttendanceFetchByEmployeeProject({ employeeId, projectId }));
    }
  }, [dispatch, employeeId, projectId]);

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const handleView = (employeeId, projectId) => {
    navigate("/attendance/timesheet", { state: { employeeId, projectId } });
  };

  const handleApprove = (id) => {
    setLocalTimesheets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "Approved" } : t))
    );
  };

  const handleReject = (id) => {
    setLocalTimesheets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "Rejected" } : t))
    );
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
      id: localTimesheets.length + 1,
      employee: newTimesheet.employee,
      date: newTimesheet.date,
      hours: parseInt(newTimesheet.hours),
      status: "Pending",
    };
    setLocalTimesheets([...localTimesheets, newEntry]);
    handleDialogClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Rejected":
        return "error";
      default:
        return "warning";
    }
  };

  // 🔹 Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {JSON.stringify(error)}</p>;

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: "center" }}>
        <Typography variant="h6" fontWeight={400}>
          Timesheet Approval
        </Typography>
        <Button variant="contained" color="primary" onClick={handleDialogOpen}>
          New Timesheet
        </Button>
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
            {localTimesheets
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((t) => (
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
                      onClick={() => handleView(t.employeeId, t.projectId)}
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

        {/* 🔹 Pagination Component */}
        <TablePagination
          component="div"
          count={localTimesheets.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>
    </Box>
  );
};

export default TimesheetTable;
