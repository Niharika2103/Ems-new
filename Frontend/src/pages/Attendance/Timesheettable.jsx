import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  TablePagination,
} from "@mui/material";
import { ChevronLeft, ChevronRight, CalendarToday } from "@mui/icons-material";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
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

  const [localTimesheets, setLocalTimesheets] = useState([]);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Date range: default 1 month ago → today
  const [dateRange, setDateRange] = useState([dayjs().subtract(1, "month"), dayjs()]);

  // Fetch attendance data
  useEffect(() => {
    dispatch(AttendanceFetchAll());
  }, [dispatch]);

  useEffect(() => {
    if (attendance && Array.isArray(attendance)) {
      const mapped = attendance.map((item) => ({
        id: item.id,
        employeeId: item.employeeId,
        projectId: item.projectId,
        employee: item.employee?.name || item.employeeName || item.name || "N/A",
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

  // Shift range forward/backward by 1 day
  const shiftRange = (direction) => {
    if (direction === "prev") {
      setDateRange([dateRange[0].subtract(1, "day"), dateRange[1].subtract(1, "day")]);
    } else {
      setDateRange([dateRange[0].add(1, "day"), dateRange[1].add(1, "day")]);
    }
  };

  // Filter timesheets by range
  const filteredTimesheets = localTimesheets.filter((t) => {
    const d = dayjs(t.date);
    return d.isAfter(dateRange[0].startOf("day")) && d.isBefore(dateRange[1].endOf("day"));
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {JSON.stringify(error)}</p>;

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" fontWeight={400}>
          Timesheet Approval
        </Typography>

        {/* Date range + navigation + calendar */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={() => shiftRange("prev")}>
            <ChevronLeft />
          </IconButton>

          <Typography variant="subtitle1" sx={{ minWidth: 220, textAlign: "center" }}>
            {`${dateRange[0].format("DD MMM YYYY")} → ${dateRange[1].format("DD MMM YYYY")}`}
          </Typography>

          <IconButton onClick={() => shiftRange("next")}>
            <ChevronRight />
          </IconButton>

          {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateRangePicker
              value={dateRange}
              onChange={(newValue) => {
                if (newValue && newValue[0] && newValue[1]) setDateRange(newValue);
              }}
              calendars={1} // only one calendar visible
              openTo="day" // default open at today
              slotProps={{
                textField: {
                  size: "small",
                  sx: { width: 250 },
                  InputProps: { endAdornment: <CalendarToday /> },
                },
              }}
            />
          </LocalizationProvider> */}
        </Box>
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
            {filteredTimesheets
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

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredTimesheets.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>
    </Box>
  );
};

export default TimesheetTable;
