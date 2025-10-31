import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Popover,
} from "@mui/material";
import { ChevronLeft, ChevronRight, MoreVert, CalendarToday } from "@mui/icons-material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useDispatch, useSelector } from "react-redux";
import {
  AdminAttendancFetchWeeklyDataById, Admin_Approve_Weekly_Attendance,
  AdminAttendancFetchMonthlyDataById,
  Admin_Approve_monthly_Attendance
} from "../../features/attendance/attendanceSlice";
import { useLocation } from "react-router-dom";


// --- Utility: get Monday of a week ---
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// --- Utility: month cycle (10th → 9th next month) ---
const getMonthDays = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 10);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 9);
  const days = [];
  let current = new Date(start);

  while (current <= end) {
    const dayName = current.toLocaleDateString("en-US", { weekday: "short" });
    days.push({
      date: new Date(current),
      label: `${dayName} / ${current.getDate().toString().padStart(2, "0")}`,
      dayIndex: current.getDay(),
      isWeekend: dayName === "Sat" || dayName === "Sun",
    });
    current.setDate(current.getDate() + 1);
  }

  return days;
};

export default function Timesheet() {
  const [viewMode, setViewMode] = useState("weekly");
  const [leaveType, setLeaveType] = useState("CL");
  const [usedLeaveTypes, setUsedLeaveTypes] = useState(["CL"]);
  const [leaveRows, setLeaveRows] = useState({ CL: Array(7).fill(0) });
  const [workedHours, setWorkedHours] = useState(Array(7).fill(0));
  const [monthlyWorkedHours, setMonthlyWorkedHours] = useState([]);
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  console.log(weekStart, "weekstart")
  const [monthStart, setMonthStart] = useState(new Date());
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRow, setMenuRow] = useState(null);
  const [calendarAnchor, setCalendarAnchor] = useState(null);
  const [usedLeaves, setUsedLeaves] = useState(0);
  const [remainingLeaves, setRemainingLeaves] = useState(0);
  const [usedLeavesDetails, setUsedLeavesDetails] = useState({});

  const dispatch = useDispatch();
  const { attendanceData = [], loading } = useSelector((state) => state.attendance || {});
  const location = useLocation();
  const { employeeId, from, to } = location.state || {};
  const gender = localStorage.getItem("gender");

  console.log(attendanceData, "attendanceData")
  const leaveTypes = ["CL", "SL", "PL", "WFH", "Extra Milar", "Paternity Leave", "Maternity Leave"];

  const parseHour = (v) => {
    const n = Number(v);
    if (Number.isNaN(n)) return 0;
    if (n < 0) return 0;
    if (n > 9) return 9;
    return Math.round(n * 2) / 2;
  };

  // --- Initialize Table ---
  const initializeTable = () => {
    if (viewMode === "weekly") {
      setWorkedHours(Array(7).fill(0));
    } else {
      const days = getMonthDays(monthStart);
      setMonthlyWorkedHours(Array(days.length).fill(0));
      const newLeaveRows = {};
      usedLeaveTypes.forEach((lt) => {
        newLeaveRows[lt] = Array(days.length).fill(0);
      });
      setLeaveRows(newLeaveRows);
    }
  };

  useEffect(() => {
    initializeTable();
  }, [viewMode, monthStart]);

  // --- Safe attendance data handling ---
 // --- Safe attendance data handling (Weekly) ---
useEffect(() => {
  if (!attendanceData) return;

  // Get week start & end (Monday → Sunday)
  const start = new Date(weekStart);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  });

  const list = Array.isArray(attendanceData.data)
    ? attendanceData.data
    : [];

  // Build map for faster lookup (key = date)
  const dataMap = {};
  list.forEach((item) => {
    const dateKey = item.date?.slice(0, 10);
    dataMap[dateKey] = item;
  });

  // 🟩 Build 7-day structured data (even if API empty)
  const weeklyData = weekDays.map((date) => {
    const record = dataMap[date] || {}; // if no record, fallback {}
    const worked_hours = record.worked_hours || 0;
    const leaveType = record.leave_type || "";

    const leaveValues = {
      CL: 0,
      SL: 0,
      PL: 0,
      WFH: 0,
      "Extra Milar": 0,
      "Paternity Leave": 0,
      "Maternity Leave": 0,
    };

    if (leaveType && leaveValues.hasOwnProperty(leaveType)) {
      leaveValues[leaveType] = 9;
    }

    return {
      date,
      worked_hours: leaveType ? 0 : worked_hours,
      ...leaveValues,
    };
  });

  console.log("🗓️ Final Weekly Data (mapped to 7 days):", weeklyData);

  // 🟩 Map to UI arrays
  const workedArray = weeklyData.map((d) => Number(d.worked_hours) || 0);
  setWorkedHours(workedArray);

  const newLeaveRows = {};
  const allLeaveTypes = [
    "CL",
    "SL",
    "PL",
    "WFH",
    "Extra Milar",
    "Paternity Leave",
    "Maternity Leave",
  ];

  allLeaveTypes.forEach((lt) => {
    newLeaveRows[lt] = weeklyData.map((d) => Number(d[lt]) || 0);
  });

  setLeaveRows(newLeaveRows);
  setUsedLeaveTypes(allLeaveTypes.filter((lt) => newLeaveRows[lt].some((v) => v > 0)));

  // 🟨 Update background color for weekly status
  if (attendanceData && viewMode === "weekly") {
    const firstItem = attendanceData.data?.[0];
    if (firstItem) {
      const bgColor = getStatusBackgroundColor(firstItem, "weekly");
      setStatusColor(bgColor);
    } else {
      setStatusColor("#fff");
    }
  }
}, [attendanceData, weekStart, viewMode]);


  // --- Monthly data mapping ---
 // --- Monthly data mapping ---
useEffect(() => {
  if (!attendanceData || viewMode !== "monthly") return;

  const list = Array.isArray(attendanceData)
    ? attendanceData
    : attendanceData.data || [];

  console.log("✅ Monthly data from API:", list);

  // 🔹 Build map by date (key = yyyy-mm-dd)
  const dataMap = {};
  list.forEach((item) => {
    const dateKey = item.date?.slice(0, 10);
    dataMap[dateKey] = item;
  });

  // 🔹 Build month days (10th → 9th next month)
  const monthDays = getMonthDays(monthStart);

  // 🔹 Create structured data for all days
  const monthlyData = monthDays.map((d) => {
    const dateKey = d.date.toISOString().slice(0, 10);
    const record = dataMap[dateKey] || {};

    const worked_hours = record.worked_hours || 0;
    const leaveType = record.leave_type || "";

    const leaveValues = {
      CL: 0,
      SL: 0,
      PL: 0,
      WFH: 0,
      "Extra Milar": 0,
      "Paternity Leave": 0,
      "Maternity Leave": 0,
    };

    if (leaveType && leaveValues.hasOwnProperty(leaveType)) {
      leaveValues[leaveType] = 9;
    }

    return {
      date: dateKey,
      worked_hours: leaveType ? 0 : worked_hours,
      ...leaveValues,
    };
  });

  console.log("🗓️ Final Monthly Data (mapped to 10th→9th):", monthlyData);

  // 🔹 Set worked hours & leave arrays
  const workedArray = monthlyData.map((d) => Number(d.worked_hours) || 0);
  setMonthlyWorkedHours(workedArray);

  const newLeaveRows = {};
  const allLeaveTypes = [
    "CL",
    "SL",
    "PL",
    "WFH",
    "Extra Milar",
    "Paternity Leave",
    "Maternity Leave",
  ];

  allLeaveTypes.forEach((lt) => {
    newLeaveRows[lt] = monthlyData.map((d) => Number(d[lt]) || 0);
  });

  setLeaveRows(newLeaveRows);
  setUsedLeaveTypes(allLeaveTypes.filter((lt) => newLeaveRows[lt].some((v) => v > 0)));

  // 🟩 Update background color for monthly status
  if (attendanceData && viewMode === "monthly") {
    const firstItem =
      Array.isArray(attendanceData) ? attendanceData[0] : attendanceData.data?.[0];
    if (firstItem) {
      const bgColor = getStatusBackgroundColor(firstItem, "monthly");
      setStatusColor(bgColor);
    } else {
      setStatusColor("#fff");
    }
  }
}, [attendanceData, monthStart, viewMode]);


  // --- Calculate leave summary ---
  useEffect(() => {
    let used = 0;
    const details = {};
    Object.entries(leaveRows).forEach(([lt, row]) => {
      const total = (row || []).reduce((a, b) => a + Number(b || 0), 0);
      used += total;
      if (total > 0) details[lt] = total;
    });
    const totalLeaves = 12;
    const remaining = totalLeaves - used;
    setUsedLeaves(used);
    setRemainingLeaves(remaining >= 0 ? remaining : 0);
    setUsedLeavesDetails(details);
  }, [leaveRows]);

  // --- Format header range ---
  const formatDateRange = () => {
    if (viewMode === "weekly") {
      const endDate = new Date(weekStart);
      endDate.setDate(weekStart.getDate() + 6);
      const fmt = (d) =>
        `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${d.getFullYear()}`;
      return `${fmt(weekStart)} - ${fmt(endDate)}`;
    } else {
      const start = new Date(monthStart.getFullYear(), monthStart.getMonth(), 10);
      const end = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 9);

      const startMonth = start.toLocaleString("default", { month: "short" });
      const endMonth = end.toLocaleString("default", { month: "short" });
      const year =
        end.getMonth() === 0 && start.getMonth() === 11
          ? `${start.getFullYear()}–${end.getFullYear()}`
          : start.getFullYear();

      return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${year}`;
    }
  };

  // --- Change week/month ---
  const changeWeek = (delta) => {
    const newWeek = new Date(weekStart);
    newWeek.setDate(weekStart.getDate() + delta * 7);
    setWeekStart(getMonday(newWeek));
  };

  const changeMonth = (delta) => {
    const newMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + delta, 10);
    setMonthStart(newMonth);
  };

  // --- Add activity ---
  const addActivity = () => {
    if (!usedLeaveTypes.includes(leaveType)) {
      const len =
        viewMode === "weekly" ? 7 : getMonthDays(monthStart).length;
      setUsedLeaveTypes((prev) => [...prev, leaveType]);
      setLeaveRows((prev) => ({ ...prev, [leaveType]: Array(len).fill(0) }));
    }
  };

  const handleMenuOpen = (e, row) => {
    setMenuAnchor(e.currentTarget);
    setMenuRow(row);
  };
  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuRow(null);
  };

  const handleResetRow = (row) => {
    const len = viewMode === "weekly" ? 7 : getMonthDays(monthStart).length;
    if (row === "Worked Hours") {
      viewMode === "weekly" ? setWorkedHours(Array(len).fill(0)) : setMonthlyWorkedHours(Array(len).fill(0));
    } else {
      setLeaveRows((prev) => ({ ...prev, [row]: Array(len).fill(0) }));
    }
    handleMenuClose();
  };

  const handleDeleteRow = (row) => {
    setUsedLeaveTypes((prev) => prev.filter((lt) => lt !== row));
    setLeaveRows((prev) => {
      const updated = { ...prev };
      delete updated[row];
      return updated;
    });
    handleMenuClose();
  };


  // ...

  const handleApproved = () => {
    let fromDate = "";
    let toDate = "";

    if (viewMode === "weekly") {
      // 🗓️ Compute from/to based on current weekStart
      const from = new Date(weekStart);
      const to = new Date(weekStart);
      to.setDate(weekStart.getDate() + 6);
      fromDate = from.toISOString().slice(0, 10);
      toDate = to.toISOString().slice(0, 10);

      console.log("📅 Weekly Range:", fromDate, "→", toDate);

      dispatch(Admin_Approve_Weekly_Attendance({ employeeId:employeeId, from: fromDate, to: toDate }))
        .unwrap()
        .then((res) => {
          console.log("✅ Weekly Approved:", res);
          alert(`✅ Weekly Timesheet Approved!\nRange: ${fromDate} → ${toDate}`);
        })
        .catch((err) => console.error("❌ Weekly Approve Error:", err));
    }
    else if (viewMode === "monthly") {
      //  Monthly uses from & to from location.state
      console.log("Monthly Range (from navigation):", from, "→", to);

      dispatch(Admin_Approve_monthly_Attendance({ employeeId:employeeId, from, to }))
        .unwrap()
        .then((res) => {
          console.log(" Monthly Approved:", res);
          alert(` Monthly Timesheet Approved!\nRange: ${from} → ${to}`);
        })
        .catch((err) => console.error(" Monthly Approve Error:", err));
    }
  };
const [statusColor, setStatusColor] = useState("#fff");

 
 
const getStatusBackgroundColor = (item, viewMode) => {
  if (viewMode === "weekly") {
    if (item.weekly_status === "Approved" || item.weekly_status === "approve") {
      return "#b7f5b0"; // 🟩 Green
    } else if (item.weekly_status === "Pending_approval") {
      return "#fff3b0"; // 🟨 Yellow
    }
  } else if (viewMode === "monthly") {
    if (item.monthly_status === "Approved" || item.monthly_status === "approve") {
      return "#b7f5b0"; // 🟩 Green
    } else if (item.monthly_status === "Pending_approval") {
      return "#fff3b0"; // 🟨 Yellow
    }
  }

  return "#fff"; // default white
};






  // --- Days list ---
  const days =
    viewMode === "weekly"
      ? Array.from({ length: 7 }, (_, i) => {
        const date = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i);
        const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
        return { dayIndex: date.getDay(), label: `${dayName} / ${date.getDate().toString().padStart(2, "0")}`, date };
      })
      : getMonthDays(monthStart);

  const currentWorkedHours = viewMode === "weekly" ? workedHours : monthlyWorkedHours;
  const workedTotal = (currentWorkedHours || []).reduce((a, b) => a + Number(b || 0), 0);

  const rowTotals = {};
  usedLeaveTypes.forEach((lt) => {
    rowTotals[lt] = (leaveRows[lt] || Array(days.length).fill(0)).reduce((a, b) => a + Number(b || 0), 0);
  });

  const grandTotal = workedTotal + Object.values(rowTotals).reduce((a, b) => a + b, 0);

  // --- API Range (10 → 9)
  // const employeeId = "cadeb784-9272-421c-8394-0af6e2923e8d";
  const computeRange = () => {
    if (viewMode === "weekly") {
      const from = new Date(weekStart);
      const to = new Date(weekStart);
      to.setDate(weekStart.getDate() + 6);
      return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
    }

    const from = new Date(monthStart.getFullYear(), monthStart.getMonth(), 10);
    const to = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 9);
    return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
  };



  useEffect(() => {
    if (!employeeId) return;

    if (viewMode === "weekly") {
      // 🔹 Compute weekly range (Monday → Sunday)
      const fromDate = new Date(weekStart);
      const toDate = new Date(weekStart);
      toDate.setDate(weekStart.getDate() + 6);

      const from = fromDate.toISOString().slice(0, 10);
      const to = toDate.toISOString().slice(0, 10);

      console.log("📅 Weekly Fetch Range:", from, "→", to);

      dispatch(AdminAttendancFetchWeeklyDataById({ employeeId, from, to }))
        .unwrap()
        .then((res) => console.log("✅ Weekly Data:", res))
        .catch((err) => console.error("❌ Weekly Error:", err));
    }
    else if (viewMode === "monthly") {
      // 🔹 Use from/to from location.state (passed from previous page)
      console.log("📆 Monthly Fetch Range:", from, "→", to);

      dispatch(AdminAttendancFetchMonthlyDataById({ employeeId, from, to }))
        .unwrap()
    .then((res) => {
  console.log("✅ Monthly Data:", res);
  // 🟩 Set monthly status from API if available
  if (Array.isArray(res) && res.length > 0 && res[0].monthly_status) {
    setMonthlyStatus(res[0].monthly_status);
  }
})

        .catch((err) => console.error("❌ Monthly Error:", err));
    }
  }, [dispatch, weekStart, monthStart, viewMode, employeeId]);



  return (
    <Box p={2}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={() => (viewMode === "weekly" ? changeWeek(-1) : changeMonth(-1))}>
            <ChevronLeft />
          </IconButton>
          <Typography fontWeight="bold">{formatDateRange()}</Typography>
          <IconButton onClick={() => (viewMode === "weekly" ? changeWeek(1) : changeMonth(1))}>
            <ChevronRight />
          </IconButton>
          <IconButton onClick={(e) => setCalendarAnchor(e.currentTarget)}>
            <CalendarToday />
          </IconButton>
          <Popover
            open={Boolean(calendarAnchor)}
            anchorEl={calendarAnchor}
            onClose={() => setCalendarAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Box p={2}>
              <Calendar
                onChange={(date) => {
                  if (viewMode === "weekly") {
                    setWeekStart(getMonday(date));
                  } else {
                    setMonthStart(new Date(date.getFullYear(), date.getMonth(), 10));
                  }
                  setCalendarAnchor(null);
                }}
                value={viewMode === "weekly" ? weekStart : monthStart}
              />

            </Box>
          </Popover>
        </Box>
        <Typography variant="h6" fontWeight="bold">
          {viewMode === "weekly" ? "Weekly Timesheet" : "Monthly Timesheet"}
        </Typography>
        <Button variant="contained" onClick={() => setViewMode(viewMode === "weekly" ? "monthly" : "weekly")}>
          {viewMode === "weekly" ? "View Monthly" : "View Weekly"}
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 120 }}>Project/Category</TableCell>
              {days.map((d, i) => (
                <TableCell
                  key={i}
                  align="center"
                  sx={{
                    fontWeight: "bold",
                  }}
                >
                  {d.label}
                </TableCell>
              ))}
              <TableCell align="center">Total</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Worked Hours */}
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Worked Hours</TableCell>
              {(currentWorkedHours || Array(days.length).fill(0)).map((h, i) => (
                <TableCell key={i} align="center">
                  <input
                    type="number"
                    value={h}
                    min="0"
                    max="9"
                    step="0.5"
                    style={{
                      width: 50,
                      textAlign: "center",
                     backgroundColor: statusColor,
                      // backgroundColor: days[i].dayIndex === 0 || days[i].dayIndex === 6 ? "#f0f0f0" : "#fff", border: "1px solid #ccc",
                      borderRadius: 4,
                    }}
                    disabled={days[i].isWeekend}
                    onChange={(e) => {
                      const val = parseHour(e.target.value);
                      if (viewMode === "weekly") {
                        setWorkedHours((prev) => {
                          const arr = [...prev];
                          arr[i] = val;
                          return arr;
                        });
                      } else {
                        setMonthlyWorkedHours((prev) => {
                          const arr = [...prev];
                          arr[i] = val;
                          return arr;
                        });
                      }
                    }}
                  />
                </TableCell>
              ))}
              <TableCell align="center">{`${workedTotal}/45`}</TableCell>
              <TableCell align="center">
                <IconButton onClick={(e) => handleMenuOpen(e, "Worked Hours")}>
                  <MoreVert />
                </IconButton>
              </TableCell>
            </TableRow>

            {/* Leave Rows */}
            {usedLeaveTypes.map((lt) => (
              <TableRow key={lt}>
                <TableCell sx={{ fontWeight: "bold" }}>{lt}</TableCell>
                {(leaveRows[lt] || Array(days.length).fill(0)).map((v, i) => (
                  <TableCell key={i} align="center">
                    <input
                      type="number"
                      value={v}
                      min="0"
                      max="9"
                      step="0.5"
                      style={{
                        width: 50,
                        textAlign: "center",
                        backgroundColor: statusColor,
                        border: "1px solid #ccc",
                        borderRadius: 4,
                      }}
                      disabled={days[i].isWeekend}
                      onChange={(e) => {
                        const val = parseHour(e.target.value);
                        setLeaveRows((prev) => {
                          const arr = [...(prev[lt] || Array(days.length).fill(0))];
                          arr[i] = val;
                          return { ...prev, [lt]: arr };
                        });
                      }}
                    />
                  </TableCell>
                ))}
                <TableCell align="center">{rowTotals[lt]}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={(e) => handleMenuOpen(e, lt)}>
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {/* Target Row */}
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Target</TableCell>
              {days.map((_, i) => {
                const total =
                  (Number((currentWorkedHours || [])[i]) || 0) +
                  usedLeaveTypes.reduce((sum, lt) => sum + (Number((leaveRows[lt] || [])[i]) || 0), 0);
                return (
                  <TableCell key={i} align="center">
                    {total}
                  </TableCell>
                );
              })}
              <TableCell align="center">{`${grandTotal}/45`}</TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Activity & Buttons */}
      <Box display="flex" justifyContent="space-between" mt={2}>
        <Box display="flex" gap={1}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Leave Type</InputLabel>
            <Select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} label="Leave Type">
              {leaveTypes.map((lt) => (
                <MenuItem key={lt} value={lt}>
                  {lt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={addActivity}>
            Add Activity
          </Button>
        </Box>
        <Box display="flex" gap={1}>
          <Button variant="contained" color="success" onClick={handleApproved}>
            {viewMode === "weekly" ? "Approve Weekly" : "Approve Monthly"}
          </Button>

        </Box>
      </Box>

      {/* Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleResetRow(menuRow)}>Reset</MenuItem>
        {menuRow !== "Worked Hours" && (
          <MenuItem onClick={() => handleDeleteRow(menuRow)}>Delete</MenuItem>
        )}
      </Menu>
    </Box>
  );
}