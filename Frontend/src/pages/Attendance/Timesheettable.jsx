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
  FormControl,
  Select,
  MenuItem,
  Typography,
  Chip,
  Tooltip,
  TablePagination,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import dayjs from "dayjs";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  AttendanceFetchAllbasedonMonth,
  // AttendanceFetchByEmployeeProject,
} from "../../features/attendance/attendanceSlice";

const TimesheetTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { attendance, loading, error } = useSelector((state) => state.attendance);
  const { employeeId, projectId } = location.state || {};

  const [localTimesheets, setLocalTimesheets] = useState([]);

  // pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [viewType, setViewType] = useState("weekly");
  const [holidays, setHolidays] = useState([]);

// Function to fetch holidays
const fetchHolidays = async (year) => {
  try {
    const response = await axios.get(`http://localhost:9090/holidays/${year}`);
    setHolidays(response.data.response.holidays); // Adjust if the API response structure differs
  } catch (error) {
    console.error("Error fetching holidays:", error);
  }
};

// Fetch holidays on mount or when year changes
useEffect(() => {
  const currentYear = dayjs().year(); // Get current year
  fetchHolidays(currentYear);
}, []);
  // 🗓️ Get current week (Monday to Sunday)
  const getCurrentWeek = () => {
    const today = dayjs();
    const start = today.startOf('week'); // Monday
    const end = today.endOf('week');     // Sunday
    return { start, end };
  };

  // 🗓️ Get pay cycle (10th to 9th of next month)
  const getPayCycle = (date) => {
    const currentDate = dayjs(date);
    const currentDay = currentDate.date();
    
    if (currentDay >= 10) {
      // Current month 10th to next month 9th
      const start = currentDate.date(10);
      const end = currentDate.add(1, 'month').date(9);
      return { start, end };
    } else {
      // Previous month 10th to current month 9th
      const start = currentDate.subtract(1, 'month').date(10);
      const end = currentDate.date(9);
      return { start, end };
    }
  };

  // Default date range based on view type
  const getDefaultDateRange = (type) => {
    if (type === "weekly") {
      return getCurrentWeek();
    } else {
      return getPayCycle(dayjs());
    }
  };

  const defaultRange = getDefaultDateRange(viewType);
  const [dateRange, setDateRange] = useState([defaultRange.start, defaultRange.end]);
  
  // Limits
  const MAX_PAST_WEEKS = 4;
  const MAX_PAST_MONTHS = 3;

  // 🧩 Fetch data when component mounts or date range changes
  useEffect(() => {
    const periodType = viewType === "weekly" ? "weekly" : "monthly";
    const startDate = dateRange[0].format("YYYY-MM-DD");
    const endDate = dateRange[1].format("YYYY-MM-DD");
    console.log("Dispatching with params:", { periodType, startDate, endDate });
    dispatch(AttendanceFetchAllbasedonMonth({ periodType, startDate, endDate }));
  }, [dispatch, dateRange, viewType]);

  // 🔤 Normalize API data
 useEffect(() => {
  if (attendance && Array.isArray(attendance)) {
    const mapped = attendance.map((item) => {
      const normalizedStatus = item.status ? item.status.toLowerCase() : "pending";
      const displayStatus =
        normalizedStatus === "draft" || normalizedStatus === "pending"
          ? "Pending"
          : normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);

      // Check if the date is a holiday
      const isHoliday = holidays.some(
        (holiday) => dayjs(holiday.date).isSame(item.date, "day")
      );

      return {
        id: item.id,
        employeeId: item.employeeId,
        projectId: item.projectId,
        employee: item.employee?.name || item.employeeName || item.name || "N/A",
        projectName: item.projectName || item.projectName || item.project?.projectName,
        date: item.date,
        hours: item.workedHours,
        status: displayStatus,
        isHoliday, // New field to indicate if the day is a holiday
      };
    });
    setLocalTimesheets(mapped);
  }
}, [attendance, holidays]); // Make sure to update when holidays are fetched


  // ⏪ Previous period
  const handlePrevPeriod = () => {
    if (viewType === "weekly") {
      const newStart = dateRange[0].subtract(1, "week").startOf('week');
      const newEnd = dateRange[0].subtract(1, "week").endOf('week');
      setDateRange([newStart, newEnd]);
    } else {
      const newStart = dateRange[0].subtract(1, "month");
      const { start, end } = getPayCycle(newStart);
      setDateRange([start, end]);
    }
  };

  // ⏩ Next period
  const handleNextPeriod = () => {
    if (viewType === "weekly") {
      const newStart = dateRange[0].add(1, "week").startOf('week');
      const newEnd = dateRange[0].add(1, "week").endOf('week');
      setDateRange([newStart, newEnd]);
    } else {
      const newStart = dateRange[0].add(1, "month");
      const { start, end } = getPayCycle(newStart);
      setDateRange([start, end]);
    }
  };

  const handleViewTypeChange = (type) => {
    setViewType(type);
    const newRange = getDefaultDateRange(type);
    setDateRange([newRange.start, newRange.end]);
    setPage(0); // Reset to first page when view changes
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

  // Disable logic for navigation buttons
  const now = dayjs();
  const currentWeek = getCurrentWeek();
  const currentPayCycle = getPayCycle(now);
  
  const nextDisabled = () => {
    if (viewType === "weekly") {
      const nextWeekStart = dateRange[0].add(1, "week");
      return nextWeekStart.isAfter(currentWeek.start, "day");
    } else {
      const nextCycleStart = dateRange[0].add(1, "month");
      const nextCycle = getPayCycle(nextCycleStart);
      return nextCycle.start.isAfter(currentPayCycle.start, "day");
    }
  };

  const prevDisabled = () => {
    if (viewType === "weekly") {
      const allowedStart = currentWeek.start.subtract(MAX_PAST_WEEKS - 1, "week");
      return dateRange[0].isBefore(allowedStart, "day");
    } else {
      const allowedStart = currentPayCycle.start.subtract(MAX_PAST_MONTHS - 1, "month");
      const allowedCycle = getPayCycle(allowedStart);
      return dateRange[0].isBefore(allowedCycle.start, "day");
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" fontWeight={400}>
          Timesheet Approval
        </Typography>

        {/* Period navigation */}
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
                onClick={handlePrevPeriod} 
                disabled={prevDisabled()}
              >
                <ChevronLeft />
              </IconButton>
            </span>
          </Tooltip>

          <Typography variant="subtitle1" sx={{ minWidth: 260, textAlign: "center" }}>
            {`${dateRange[0].format("DD MMM YYYY")} → ${dateRange[1].format("DD MMM YYYY")}`}
          </Typography>

          <Tooltip title={nextDisabled() ? "No future data" : "Next"}>
            <span>
              <IconButton 
                onClick={handleNextPeriod} 
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
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Project</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
  {localTimesheets
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    .map((t) => (
      <TableRow 
        key={t.id} 
        hover 
        sx={{
          backgroundColor: t.isHoliday ? "#f0f8ff" : "inherit",  // Light blue for holidays
        }}
      >
        <TableCell>{t.employee}</TableCell>
        <TableCell>{t.projectName}</TableCell>
        <TableCell>
          <Chip label={t.status} color={getStatusColor(t.status)} />
        </TableCell>
        <TableCell>
          <Button
            variant="contained"
            color="primary"
            size="small"
            sx={{ mr: 1 }}
            onClick={() => {
              // 🧠 Store gender in localStorage
              if (t.employeeGender) {
                localStorage.setItem("gender", t.employeeGender);
              }

              // 🗓️ Prepare date range
              const from = dateRange[0].format("YYYY-MM-DD");
              const to = dateRange[1].format("YYYY-MM-DD");

              // 🧭 Navigate with required data
              navigate("/attendance/timesheet", {
                state: {
                  employeeId: t.employeeId,
                  projectId: t.projectId,
                  from: from,
                  to: to,
                },
              });
            }}
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
          count={localTimesheets.length}
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