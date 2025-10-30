import React, { useState, useEffect } from "react";
import {
  Box,
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
  FormControl,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Tooltip,
  Button, // ✅ Added Button import
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  AttendanceFetchAll,
  AttendanceFetchByEmployeeProject,
} from "../../features/attendance/attendanceSlice";

dayjs.extend(isoWeek);

// Limits (defaults applied)
const MAX_PAST_WEEKS = 4; // current week + previous 3 weeks
const MAX_PAST_MONTHS = 3; // current month + previous 2 months

const TimesheetTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { attendance, loading, error } = useSelector((state) => state.attendance);
  const { employeeId, projectId } = location.state || {};

  const [localTimesheets, setLocalTimesheets] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [viewType, setViewType] = useState("weekly");
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("week"),
    dayjs().endOf("week"),
  ]);

  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");

  useEffect(() => {
    dispatch(AttendanceFetchAll());
  }, [dispatch]);

  useEffect(() => {
    if (attendance && Array.isArray(attendance)) {
      const mapped = attendance.map((item) => {
        const normalizedStatus = item.status ? item.status.toLowerCase() : "pending";
        const displayStatus =
          normalizedStatus === "draft" || normalizedStatus === "pending"
            ? "Pending"
            : capitalize(normalizedStatus);

        return {
          id: item.id,
          employeeId: item.employeeId,
          projectId: item.projectId,
          employee: item.employee?.name || item.employeeName || item.name || "N/A",
          ProjectName:
            item.projectName || item.ProjectName || item.project?.name || "N/A",
          date: item.date,
          hours: item.workedHours,
          status: displayStatus,
        };
      });
      setLocalTimesheets(mapped);
    }
  }, [attendance]);

  useEffect(() => {
    if (employeeId && projectId) {
      dispatch(AttendanceFetchByEmployeeProject({ employeeId, projectId }));
    }
  }, [dispatch, employeeId, projectId]);

  const capitalize = (str) =>
    str?.charAt(0)?.toUpperCase() + str?.slice(1) || "";

  const handleView = (employeeId, projectId) => {
    navigate("/attendance/timesheet", { state: { employeeId, projectId } });
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

  const now = dayjs();
  const currentWeekStart = now.startOf("week");
  const currentWeekEnd = now.endOf("week");
  const currentMonthStart = now.startOf("month");
  const currentMonthEnd = now.endOf("month");

  const allowedWeekStart = currentWeekStart.subtract(MAX_PAST_WEEKS - 1, "week");
  const allowedMonthStart = currentMonthStart.subtract(MAX_PAST_MONTHS - 1, "month");

  const handleViewTypeChange = (type) => {
    setViewType(type);
    if (type === "weekly") {
      setDateRange([currentWeekStart, currentWeekEnd]);
    } else {
      setDateRange([currentMonthStart, currentMonthEnd]);
    }
  };

  const shiftRange = (direction) => {
    const amount = direction === "prev" ? -1 : 1;
    let newStart, newEnd;

    if (viewType === "weekly") {
      newStart = dateRange[0].add(amount, "week").startOf("week");
      newEnd = dateRange[1].add(amount, "week").endOf("week");

      if (newEnd.isAfter(currentWeekEnd, "day")) {
        setSnackMsg("Cannot navigate to future weeks.");
        setSnackOpen(true);
        return;
      }
      if (newStart.isBefore(allowedWeekStart, "day")) {
        setSnackMsg(`Only last ${MAX_PAST_WEEKS} weeks are available.`);
        setSnackOpen(true);
        return;
      }
    } else {
      newStart = dateRange[0].add(amount, "month").startOf("month");
      newEnd = dateRange[1].add(amount, "month").endOf("month");

      if (newEnd.isAfter(currentMonthEnd, "day")) {
        setSnackMsg("Cannot navigate to future months.");
        setSnackOpen(true);
        return;
      }
      if (newStart.isBefore(allowedMonthStart, "day")) {
        setSnackMsg(`Only last ${MAX_PAST_MONTHS} months are available.`);
        setSnackOpen(true);
        return;
      }
    }

    setDateRange([newStart, newEnd]);
  };

  const nextDisabled = () => {
    if (viewType === "weekly") {
      const nextEnd = dateRange[1].add(1, "week").endOf("week");
      return nextEnd.isAfter(currentWeekEnd, "day");
    } else {
      const nextEnd = dateRange[1].add(1, "month").endOf("month");
      return nextEnd.isAfter(currentMonthEnd, "day");
    }
  };

  const prevDisabled = () => {
    if (viewType === "weekly") {
      const prevStart = dateRange[0].add(-1, "week").startOf("week");
      return prevStart.isBefore(allowedWeekStart, "day");
    } else {
      const prevStart = dateRange[0].add(-1, "month").startOf("month");
      return prevStart.isBefore(allowedMonthStart, "day");
    }
  };

  const filteredTimesheets = localTimesheets.filter((t) => {
    const d = dayjs(t.date);
    return (
      d.isAfter(dateRange[0].startOf("day")) && d.isBefore(dateRange[1].endOf("day"))
    );
  });

  const handleSnackClose = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackOpen(false);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {JSON.stringify(error)}</p>;

  const rangeLabel = `${dateRange[0].format("DD MMM YYYY")} → ${dateRange[1].format(
    "DD MMM YYYY"
  )}`;

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6" fontWeight={400}>
          Timesheet Approval
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={viewType}
              onChange={(e) => handleViewTypeChange(e.target.value)}
              MenuProps={{ PaperProps: { sx: { minWidth: 140 } } }}
            >
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title={prevDisabled() ? "No more history" : "Previous"}>
            <span>
              <IconButton
                onClick={() => {
                  if (prevDisabled()) {
                    setSnackMsg(
                      viewType === "weekly"
                        ? `Only last ${MAX_PAST_WEEKS} weeks are available.`
                        : `Only last ${MAX_PAST_MONTHS} months are available.`
                    );
                    setSnackOpen(true);
                    return;
                  }
                  shiftRange("prev");
                }}
                disabled={prevDisabled()}
              >
                <ChevronLeft />
              </IconButton>
            </span>
          </Tooltip>

          <Typography variant="subtitle1" sx={{ minWidth: 260, textAlign: "center" }}>
            {rangeLabel}
          </Typography>

          <Tooltip title={nextDisabled() ? "Future disabled" : "Next"}>
            <span>
              <IconButton
                onClick={() => {
                  if (nextDisabled()) {
                    setSnackMsg("Cannot navigate to future dates.");
                    setSnackOpen(true);
                    return;
                  }
                  shiftRange("next");
                }}
                disabled={nextDisabled()}
              >
                <ChevronRight />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ bgcolor: "primary.main" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Employee</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Project</TableCell>
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
                  <TableCell>{t.ProjectName}</TableCell>
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
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

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

      <Snackbar
        open={snackOpen}
        autoHideDuration={2800}
        onClose={handleSnackClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleSnackClose} severity="info" sx={{ width: "100%" }}>
          {snackMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TimesheetTable;
