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
import { ChevronLeft, ChevronRight, MoreVert, CalendarToday, Edit, Save } from "@mui/icons-material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useDispatch, useSelector } from "react-redux";
import {
  AdminAttendancFetchWeeklyDataById,
  Admin_Approve_Weekly_Attendance,
  AdminAttendancFetchMonthlyDataById,
  Admin_Approve_monthly_Attendance,
  Admin_Reject_Weekly_Attendance,
  Admin_Reject_Monthly_Attendance,
} from "../../features/attendance/attendanceSlice";
import { useLocation } from "react-router-dom";

//  get Monday of a week 
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

//  month cycle (1st → end of the month)
const getMonthDays = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const days = [];
  let current = new Date(start);
  while (current <= end) {
    const dayName = current.toLocaleDateString("en-US", { weekday: "short" });
    days.push({
      date: new Date(current),
      label: `${current.getDate().toString().padStart(2, "0")}/${(current.getMonth() + 1).toString().padStart(2, "0")} (${dayName})`,
      dayIndex: current.getDay(),
      isWeekend: dayName === "Sat" || dayName === "Sun",
    });
    current.setDate(current.getDate() + 1);
  }
  return days;
};

// --- Leave Allocation Helper (for UI display only) ---
const getLeaveAllocation = (leaveType) => {
  const allocations = {
    "EL": 12,
    "SL": 6,
    "WFH": 0,
    "Extra Milar": 0,
    "Paternity Leave": 15,
    "Maternity Leave": 180,
  };
  return allocations[leaveType] || 0;
};

export default function Timesheet() {
  //state started here
  const dispatch = useDispatch();
  const location = useLocation();
  const {
    employeeId,
    viewType,
    currentStartDate,
  } = location.state || {};

  const [viewMode, setViewMode] = useState(viewType || "weekly");
  const [leaveType, setLeaveType] = useState("EL");
  const [usedLeaveTypes, setUsedLeaveTypes] = useState(["EL"]);
  const [leaveRows, setLeaveRows] = useState({ EL: Array(7).fill(0) });
  const [workedHours, setWorkedHours] = useState(Array(7).fill(0));
  const [monthlyWorkedHours, setMonthlyWorkedHours] = useState([]);

  const [weekStart, setWeekStart] = useState(() => {
    if (currentStartDate && viewType === "weekly") {
      return getMonday(new Date(currentStartDate));
    }
    return getMonday(new Date());
  });

  const [monthStart, setMonthStart] = useState(() => {
    if (currentStartDate && viewType === "monthly") {
      const date = new Date(currentStartDate);
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRow, setMenuRow] = useState(null);
  const [calendarAnchor, setCalendarAnchor] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [statusColor, setStatusColor] = useState("#fff");

  const { attendanceData = [] } = useSelector((state) => state.attendance || {});

  const leaveTypes = ["EL", "SL", "WFH", "Extra Milar", "Paternity Leave", "Maternity Leave"];
  const [holidays, setHolidays] = useState([]);
  const holidaysCache = {};

  //  Backend balances
  const [backendBalances, setBackendBalances] = useState({
    el: 0,
    sl: 0,
    extra_milar: 0,
    holidays: 0,
    optional_holidays: 0,
    remaining_leaves: 0,
    provided_leaves: 0,
  });

  // --- Extract backend balances from attendanceData ---
  useEffect(() => {
    try {
      const list = attendanceData?.data || [];
      if (!Array.isArray(list) || list.length === 0) {
        setBackendBalances({
          el: 0,
          sl: 0,
          extra_milar: 0,
          holidays: 0,
          optional_holidays: 0,
          remaining_leaves: 0,
          provided_leaves: 0,
        });
        return;
      }
      const sorted = [...list].sort((a, b) => new Date(a.date) - new Date(b.date));
      const last = sorted[sorted.length - 1];
      setBackendBalances({
        el: Number(last.el ?? 0),
        sl: Number(last.sl ?? 0),
        extra_milar: Number(last.extra_milar ?? 0),
        holidays: Number(last.holidays ?? 0),
        optional_holidays: Number(last.optional_holidays ?? 0),
        remaining_leaves: Number(last.remaining_leaves ?? 0),
        provided_leaves: Number(last.provided_leaves ?? 0),
      });
    } catch (err) {
      console.error("Failed to read backend balances", err);
    }
  }, [attendanceData]);

  // --- Initialize table dimensions ---
  useEffect(() => {
    if (viewMode === "weekly") {
      setWorkedHours(Array(7).fill(0));
    } else {
      const days = getMonthDays(monthStart);
      setMonthlyWorkedHours(Array(days.length).fill(0));
      const newLeaveRows = {};
      const newApprovalStatus = { ...approvalStatus };
      usedLeaveTypes.forEach((lt) => {
        if (!leaveRows[lt] || leaveRows[lt].length !== days.length) {
          newLeaveRows[lt] = Array(days.length).fill(0);
          if (!newApprovalStatus[lt]) {
            newApprovalStatus[lt] = Array(days.length).fill("pending");
          }
        } else {
          newLeaveRows[lt] = [...leaveRows[lt]];
          if (newApprovalStatus[lt]?.length !== days.length) {
            newApprovalStatus[lt] = [...newApprovalStatus[lt].slice(0, days.length), ...Array(Math.max(0, days.length - newApprovalStatus[lt].length)).fill("pending")];
          }
        }
      });
      setLeaveRows(newLeaveRows);
      setApprovalStatus(newApprovalStatus);
    }
  }, [viewMode, monthStart]);

  // --- Holidays ---
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const year = viewMode === "weekly" ? weekStart.getFullYear() : monthStart.getFullYear();
        if (holidaysCache[year]) {
          setHolidays(holidaysCache[year]);
          return;
        }
        const res = await fetch(`http://localhost:9091/api/holidays/${year}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setHolidays(data);
          holidaysCache[year] = data;
        }
      } catch (err) {
        console.error("Failed to fetch holidays", err);
      }
    };
    fetchHolidays();
  }, [weekStart, monthStart, viewMode]);

  // --- Sync from route ---
  useEffect(() => {
    if (viewType) {
      setViewMode(viewType);
      if (viewType === "weekly" && currentStartDate) {
        setWeekStart(getMonday(new Date(currentStartDate)));
      } else if (viewType === "monthly" && currentStartDate) {
        const d = new Date(currentStartDate);
        setMonthStart(new Date(d.getFullYear(), d.getMonth(), 1));
      }
    }
  }, [viewType, currentStartDate]);

  // --- Helpers ---
  const isHolidayDate = (dateStr) => holidays.some((h) => h.date === dateStr);
  const getHolidayName = (dateStr) => {
    const h = holidays.find((h) => h.date === dateStr);
    return h ? h.name : null;
  };
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateStr = date.toISOString().slice(0, 10);
      if (isHolidayDate(dateStr)) return "holiday-tile";
    }
    return null;
  };
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dateStr = date.toISOString().slice(0, 10);
      const holiday = holidays.find((h) => h.date === dateStr);
      if (holiday) {
        return (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "4px" }}>
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: holiday.isOptional ? "#2196F3" : "#e53935",
                boxShadow: "0 0 4px rgba(0,0,0,0.15)",
              }}
            />
          </div>
        );
      }
    }
    return null;
  };
  const parseHour = (v) => {
    const n = Number(v);
    if (Number.isNaN(n)) return 0;
    if (n < 0) return 0;
    if (n > 9) return 9;
    return Math.round(n * 2) / 2;
  };

  // --- Sync weekly data from backend ---
  useEffect(() => {
    if (!attendanceData?.data) return;
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
    const list = Array.isArray(attendanceData.data) ? attendanceData.data : [];
    const dataMap = Object.fromEntries(list.map(i => [i.date?.slice(0, 10), i]));
    const weeklyData = weekDays.map(date => {
      const r = dataMap[date] || {};
      const leaveType = r.leave_type || "";
      const leaveValues = {
        EL: 0, SL: 0, WFH: 0,
        "Extra Milar": 0, "Paternity Leave": 0, "Maternity Leave": 0
      };
      if (leaveType && leaveValues[leaveType] !== undefined) leaveValues[leaveType] = 9;
      return {
        date,
        worked_hours: leaveType ? 0 : (r.worked_hours || 0),
        weekly_status: r.weekly_status || "draft",
        ...leaveValues
      };
    });
    setWorkedHours(weeklyData.map(d => +d.worked_hours || 0));
    const newLeaveRows = {}, newApprovalStatus = {};
    const types = leaveTypes;
    const mapStatus = s => {
      s = s?.toLowerCase();
      return s === "approved" ? "approved" :
        s === "pending_approval" ? "pending_approval" :
          s === "rejected" ? "rejected" : "draft";
    };
    types.forEach(t => {
      newLeaveRows[t] = weeklyData.map(d => +d[t] || 0);
      newApprovalStatus[t] = weeklyData.map(d => mapStatus(d.weekly_status));
    });
    newApprovalStatus["Worked Hours"] = weeklyData.map(d => mapStatus(d.weekly_status));
    setLeaveRows(newLeaveRows);
    setApprovalStatus(newApprovalStatus);
    setUsedLeaveTypes(types.filter(t => newLeaveRows[t].some(v => v > 0)));
    setStatusColor(weeklyData.map(i => getStatusBackgroundColor(i, "weekly")));
  }, [attendanceData, weekStart, viewMode]);

  // --- Sync monthly data from backend ---
  useEffect(() => {
    if (!attendanceData || viewMode !== "monthly") return;
    const list = Array.isArray(attendanceData.data) ? attendanceData.data : attendanceData || [];
    const dataMap = Object.fromEntries(list.map(i => [i.date?.slice(0, 10), i]));
    const monthDays = getMonthDays(monthStart);
    const monthlyData = monthDays.map(d => {
      const date = d.date.toISOString().slice(0, 10);
      const r = dataMap[date] || {};
      const leaveType = r.leave_type || "";
      const leaveValues = {
        EL: 0, SL: 0, WFH: 0,
        "Extra Milar": 0, "Paternity Leave": 0, "Maternity Leave": 0
      };
      if (leaveType && leaveValues[leaveType] !== undefined) leaveValues[leaveType] = 9;
      return {
        date,
        worked_hours: leaveType ? 0 : (r.worked_hours || 0),
        monthly_status: r.monthly_status || "draft",
        ...leaveValues
      };
    });
    setMonthlyWorkedHours(monthlyData.map(d => +d.worked_hours || 0));
    const newLeaveRows = {}, newApprovalStatus = {};
    const types = leaveTypes;
    const mapStatus = s => {
      s = s?.toLowerCase();
      return s === "approved" ? "approved" :
        s === "pending_approval" ? "pending_approval" :
          s === "rejected" ? "rejected" : "draft";
    };
    types.forEach(t => {
      newLeaveRows[t] = monthlyData.map(d => +d[t] || 0);
      newApprovalStatus[t] = monthlyData.map(d => mapStatus(d.monthly_status));
    });
    newApprovalStatus["Worked Hours"] = monthlyData.map(d => mapStatus(d.monthly_status));
    setLeaveRows(newLeaveRows);
    setApprovalStatus(newApprovalStatus);
    setUsedLeaveTypes(types.filter(t => newLeaveRows[t].some(v => v > 0)));
    setStatusColor(monthlyData.map(i => getStatusBackgroundColor(i, "monthly")));
  }, [attendanceData, monthStart, viewMode]);

  // --- Other helpers ---
  const formatDateRange = () => {
    if (viewMode === "weekly") {
      const end = new Date(weekStart);
      end.setDate(weekStart.getDate() + 6);
      const fmt = (d) => `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
      return `${fmt(weekStart)} - ${fmt(end)}`;
    } else {
      const start = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
      const end = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      const fmt = (d) => `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getFullYear()}`;
      return `${fmt(start)} - ${fmt(end)}`;
    }
  };

  const changeWeek = (delta) => {
    const newWeek = new Date(weekStart);
    newWeek.setDate(weekStart.getDate() + delta * 7);
    setWeekStart(getMonday(newWeek));
  };

  const changeMonth = (delta) => {
    const newMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + delta, 1);
    setMonthStart(newMonth);
  };

  const handleViewModeChange = () => {
    if (viewMode === "weekly") {
      const newMonthStart = new Date(weekStart.getFullYear(), weekStart.getMonth(), 1);
      setMonthStart(newMonthStart);
      setViewMode("monthly");
    } else {
      const firstDay = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
      setWeekStart(getMonday(firstDay));
      setViewMode("weekly");
    }
    setIsEditMode(false);
  };

  const addActivity = () => {
    if (!usedLeaveTypes.includes(leaveType)) {
      const len = viewMode === "weekly" ? 7 : getMonthDays(monthStart).length;
      setUsedLeaveTypes((prev) => [...prev, leaveType]);
      setLeaveRows((prev) => ({ ...prev, [leaveType]: Array(len).fill(0) }));
      setApprovalStatus(prev => ({ ...prev, [leaveType]: Array(len).fill("pending") }));
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
      setApprovalStatus(prev => ({ ...prev, [row]: Array(len).fill("pending") }));
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
    setApprovalStatus(prev => {
      const updated = { ...prev };
      delete updated[row];
      return updated;
    });
    handleMenuClose();
  };

  const handleRejectAll = () => {
    if (!employeeId) {
      alert("Employee ID is required!");
      return;
    }
    if (viewMode === "weekly") {
      const from = new Date(weekStart);
      const to = new Date(weekStart);
      to.setDate(weekStart.getDate() + 6);
      const fromDate = from.toISOString().slice(0, 10);
      const toDate = to.toISOString().slice(0, 10);
      dispatch(Admin_Reject_Weekly_Attendance({ employeeId, from: fromDate, to: toDate }))
        .unwrap()
        .then((res) => {
          alert(res?.message || `❌ Weekly Timesheet Rejected!\nRange: ${fromDate} → ${toDate}`);
        })
        .catch((err) => console.error("❌ Weekly Reject Error:", err));
    } else {
      const fromDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1).toISOString().slice(0, 10);
      const toDate = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).toISOString().slice(0, 10);
      dispatch(Admin_Reject_Monthly_Attendance({ employeeId, from: fromDate, to: toDate }))
        .unwrap()
        .then((res) => {
          alert(res?.message || `❌ Monthly Timesheet Rejected!\nRange: ${fromDate} → ${toDate}`);
        })
        .catch((err) => console.error("❌ Monthly Reject Error:", err));
    }
    const newApprovalStatus = { ...approvalStatus };
    Object.keys(newApprovalStatus).forEach(leaveType => {
      newApprovalStatus[leaveType] = newApprovalStatus[leaveType].map(() => "rejected");
    });
    setApprovalStatus(newApprovalStatus);
  };

  const handleCellApproval = (leaveType, dayIndex) => {
    if (!isEditMode) {
      const newApprovalStatus = { ...approvalStatus };
      const current = newApprovalStatus[leaveType]?.[dayIndex] || "pending";
      newApprovalStatus[leaveType][dayIndex] = current === "approved" ? "pending" : "approved";
      setApprovalStatus(newApprovalStatus);
    }
  };

  const getInputBackgroundColor = (leaveType, dayIndex, value) => {
    if (days[dayIndex].dayIndex === 0 || days[dayIndex].dayIndex === 6) {
      return "#f0f0f0";
    }
    const status = approvalStatus[leaveType]?.[dayIndex] || approvalStatus["Worked Hours"]?.[dayIndex] || "pending";
    if (value > 0 || leaveType === "Worked Hours") {
      switch (status) {
        case "approved": return "#d4edda";
        case "rejected": return "#d3323f";
        default: return "#FFF59D";
      }
    }
    return "#fff";
  };

  const handleCalendarDateSelect = (date) => {
    if (viewMode === "weekly") {
      setWeekStart(getMonday(date));
    } else {
      setMonthStart(new Date(date.getFullYear(), date.getMonth(), 1));
    }
    setCalendarAnchor(null);
  };

  const handleApproved = () => {
    if (!employeeId) {
      alert("Employee ID is required!");
      return;
    }
    if (viewMode === "weekly") {
      const from = new Date(weekStart);
      const to = new Date(weekStart);
      to.setDate(weekStart.getDate() + 6);
      const fromDate = from.toISOString().slice(0, 10);
      const toDate = to.toISOString().slice(0, 10);
      dispatch(Admin_Approve_Weekly_Attendance({ employeeId, from: fromDate, to: toDate }))
        .unwrap()
        .then((res) => {
          alert(`✅ Weekly Timesheet Approved!\nRange: ${fromDate} → ${toDate}`);
          setApprovalStatus(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(k => updated[k] = updated[k].map(() => "approved"));
            return updated;
          });
        })
        .catch((err) => console.error("❌ Weekly Approve Error:", err));
    } else {
      const fromDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1).toISOString().slice(0, 10);
      const toDate = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).toISOString().slice(0, 10);
      dispatch(Admin_Approve_monthly_Attendance({ employeeId, from: fromDate, to: toDate }))
        .unwrap()
        .then((res) => {
          alert(`✅ Monthly Timesheet Approved!\nRange: ${fromDate} → ${toDate}`);
          setApprovalStatus(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(k => updated[k] = updated[k].map(() => "approved"));
            return updated;
          });
        })
        .catch((err) => console.error("❌ Monthly Approve Error:", err));
    }
  };

  const getStatusBackgroundColor = (item, viewMode) => {
    const status = viewMode === "weekly" ? item.weekly_status : item.monthly_status;
    if (status?.toLowerCase() === "approved") return "#b7f5b0";
    if (status?.toLowerCase() === "pending_approval") return "#fff3b0";
    return "#fff";
  };

  // --- Days list ---
  const days = viewMode === "weekly"
    ? Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i);
      const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      return { dayIndex: date.getDay(), label: `${dayName} / ${date.getDate().toString().padStart(2, "0")}/${month}`, date };
    })
    : getMonthDays(monthStart);

  const currentWorkedHours = viewMode === "weekly" ? workedHours : monthlyWorkedHours;
  const workedTotal = (currentWorkedHours || []).reduce((a, b) => a + Number(b || 0), 0);
  const rowTotals = {};
  usedLeaveTypes.forEach((lt) => {
    rowTotals[lt] = (leaveRows[lt] || Array(days.length).fill(0)).reduce((a, b) => a + Number(b || 0), 0);
  });
  const grandTotal = workedTotal + Object.values(rowTotals).reduce((a, b) => a + b, 0);

  // --- Fetch attendance data ---
  useEffect(() => {
    if (!employeeId) return;
    if (viewMode === "weekly") {
      const from = new Date(weekStart);
      const to = new Date(weekStart);
      to.setDate(weekStart.getDate() + 6);
      dispatch(AdminAttendancFetchWeeklyDataById({ employeeId, from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) }));
    } else {
      const from = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
      const to = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      dispatch(AdminAttendancFetchMonthlyDataById({ employeeId, from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) }));
    }
  }, [dispatch, weekStart, monthStart, viewMode, employeeId]);

  // --- Render UI ---
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
                onChange={handleCalendarDateSelect}
                value={viewMode === "weekly" ? weekStart : monthStart}
                tileClassName={tileClassName}
                tileContent={tileContent}
              />
            </Box>
          </Popover>
        </Box>
        <Typography variant="h6" fontWeight="bold">
          {viewMode === "weekly" ? "Weekly Timesheet" : "Monthly Timesheet"}
        </Typography>
        <Button variant="contained" onClick={handleViewModeChange}>
          {viewMode === "weekly" ? "View Monthly" : "View Weekly"}
        </Button>
      </Box>

      {/* Legend */}
      <Box display="flex" gap={2} mb={2} justifyContent="center">
        {[
          { color: "#fff3cd", label: "Pending Approval" },
          { color: "#d4edda", label: "Approved" },
          { color: "#d3323f", label: "Rejected" },
        ].map((item, i) => (
          <Box key={i} display="flex" alignItems="center" gap={1}>
            <Box width={20} height={20} bgcolor={item.color} border="1px solid #ccc" />
            <Typography variant="body2">{item.label}</Typography>
          </Box>
        ))}
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
                    backgroundColor: d.dayIndex === 0 || d.dayIndex === 6 ? "#f9f9f9" : "#fff",
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
              {(currentWorkedHours || Array(days.length).fill(0)).map((h, i) => {
                const dateStr = days[i].date.toISOString().slice(0, 10);
                const isWeekend = days[i].dayIndex === 0 || days[i].dayIndex === 6;
                const isHoliday = isHolidayDate(dateStr);
                if (isHoliday) {
                  return (
                    <TableCell key={i} align="center" sx={{ p: 0.5 }}>
                      <input
                        type="text"
                        value="H"
                        title={getHolidayName(dateStr)}
                        disabled
                        style={{
                          width: 50,
                          height: 22,
                          textAlign: "center",
                          backgroundColor: "#ffeaea",
                          color: "#d32f2f",
                          border: "1px solid #ccc",
                          borderRadius: 4,
                          fontWeight: "bold",
                          cursor: "not-allowed",
                        }}
                      />
                    </TableCell>
                  );
                }
                return (
                  <TableCell key={i} align="center" sx={{ p: 0.5 }}>
                    <input
                      type="number"
                      value={h}
                      min="0"
                      max="9"
                      step="0.5"
                      style={{
                        width: 50,
                        height: 22,
                        textAlign: "center",
                        backgroundColor: getInputBackgroundColor("Worked Hours", i, h),
                        border: "1px solid #ccc",
                        borderRadius: 4,
                      }}
                      disabled={!isEditMode || isWeekend}
                      onChange={(e) => {
                        const val = parseHour(e.target.value);
                        if (viewMode === "weekly") {
                          setWorkedHours(prev => {
                            const arr = [...prev];
                            arr[i] = val;
                            return arr;
                          });
                        } else {
                          setMonthlyWorkedHours(prev => {
                            const arr = [...prev];
                            arr[i] = val;
                            return arr;
                          });
                        }
                      }}
                    />
                  </TableCell>
                );
              })}
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
                  <TableCell
                    key={i}
                    align="center"
                    onClick={() => handleCellApproval(lt, i)}
                    sx={{ cursor: !isEditMode ? "pointer" : "default" }}
                  >
                    <input
                      type="number"
                      value={v}
                      min="0"
                      max="9"
                      step="0.5"
                      style={{
                        width: 50,
                        textAlign: "center",
                        backgroundColor: getInputBackgroundColor(lt, i, v),
                        border: "1px solid #ccc",
                        borderRadius: 4,
                      }}
                      disabled={!isEditMode || days[i].dayIndex === 0 || days[i].dayIndex === 6}
                      onChange={(e) => {
                        const val = parseHour(e.target.value);
                        setLeaveRows(prev => {
                          const arr = [...(prev[lt] || Array(days.length).fill(0))];
                          arr[i] = val;
                          return { ...prev, [lt]: arr };
                        });
                        const newApprovalStatus = { ...approvalStatus };
                        if (newApprovalStatus[lt]) {
                          newApprovalStatus[lt][i] = "pending";
                          setApprovalStatus(newApprovalStatus);
                        }
                      }}
                    />
                    {!isEditMode && v > 0 && days[i].dayIndex !== 0 && days[i].dayIndex !== 6 && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {approvalStatus[lt]?.[i] === "approved"
                          ? "✓ Approved"
                          : approvalStatus[lt]?.[i] === "rejected"
                            ? "✗ Rejected"
                            : "Pending"}
                      </Typography>
                    )}
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
                const total = (Number((currentWorkedHours || [])[i]) || 0) +
                  usedLeaveTypes.reduce((sum, lt) => sum + (Number((leaveRows[lt] || [])[i]) || 0), 0);
                return <TableCell key={i} align="center">{total}</TableCell>;
              })}
              <TableCell align="center">{`${grandTotal}/45`}</TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Controls */}
      <Box display="flex" justifyContent="space-between" mt={2}>
        <Box display="flex" gap={1}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Leave Type</InputLabel>
            <Select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} label="Leave Type" disabled={!isEditMode}>
              {leaveTypes.map((lt) => (
                <MenuItem key={lt} value={lt}>{lt}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={addActivity} disabled={!isEditMode}>
            Add Activity
          </Button>
        </Box>
        <Box display="flex" gap={1}>
          <Button variant="contained" color="success" onClick={handleApproved}>
            Approved
          </Button>
          <Button variant="contained" color="error" onClick={handleRejectAll}>
            Rejected
          </Button>
        </Box>
      </Box>

      {/* ✅ Enhanced Leave Summary (Backend-Powered) */}
      <Box
        mt={3}
        p={2}
        sx={{
          backgroundColor: "#f8f9fa",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "1px solid #e0e0e0",
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          📊 Annual Leave Summary
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={3} alignItems="flex-start">
          {/* Overall Progress */}
          <Box flex={1} minWidth={200}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="#2c3e50" sx={{ fontSize: '0.9rem' }}>
              📈 EL Utilization
            </Typography>
            <Box sx={{ position: 'relative', height: 20, backgroundColor: '#ecf0f1', borderRadius: 10, overflow: 'hidden', mb: 1.5 }}>
              <Box
                sx={{
                  height: '100%',
                  backgroundColor: backendBalances.el >= 12 ? '#e74c3c' : '#2ecc71',
                  width: `${Math.min(100, (backendBalances.el / 12) * 100)}%`,
                  transition: 'all 0.3s ease',
                  borderRadius: 10,
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontWeight: 'bold',
                  fontSize: '0.7rem',
                  color: backendBalances.el >= 6 ? '#fff' : '#2c3e50',
                }}
              >
                {backendBalances.el.toFixed(1)} / 12 days
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" gap={1}>
              <Box textAlign="center" p={0.8} sx={{ backgroundColor: '#2ecc71', borderRadius: 1.5, flex: 1 }}>
                <Typography variant="caption" fontWeight="bold" color="white" sx={{ fontSize: '0.7rem' }}>
                  Remaining
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="white" sx={{ fontSize: '0.9rem' }}>
                  {backendBalances.remaining_leaves.toFixed(1)}
                </Typography>
              </Box>
              <Box textAlign="center" p={0.8} sx={{ backgroundColor: backendBalances.el >= 12 ? '#e74c3c' : '#f39c12', borderRadius: 1.5, flex: 1 }}>
                <Typography variant="caption" fontWeight="bold" color="white" sx={{ fontSize: '0.7rem' }}>
                  Used
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="white" sx={{ fontSize: '0.9rem' }}>
                  {backendBalances.el.toFixed(1)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Leave Type Breakdown */}
          <Box flex={2} minWidth={300}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="#2c3e50" sx={{ fontSize: '0.9rem' }}>
              🎯 Leave Types
            </Typography>
            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(180px, 1fr))" gap={1.5} sx={{ maxHeight: 200, overflowY: 'auto' }}>
              {[
                { name: "EL", used: backendBalances.el, alloc: 12 },
                { name: "SL", used: backendBalances.sl, alloc: 6 },
                { name: "Extra Milar", used: backendBalances.extra_milar, alloc: 0 },
              ].map(({ name, used, alloc }) => {
                const remaining = Math.max(0, alloc - used);
                const usagePct = alloc > 0 ? (used / alloc) * 100 : 0;
                const getColor = (pct) => {
                  if (pct >= 100) return '#e74c3c';
                  if (pct >= 80) return '#e67e22';
                  if (pct >= 50) return '#f1c40f';
                  return '#2ecc71';
                };
                return (
                  <Box key={name} sx={{ p: 1.2, backgroundColor: '#fff', borderRadius: 1.5, border: '1px solid #e0e0e0' }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.8rem', mb: 0.5 }}>{name}</Typography>
                    {alloc > 0 && (
                      <Box sx={{ position: 'relative', height: 6, backgroundColor: '#ecf0f1', borderRadius: 3, overflow: 'hidden', mb: 0.5 }}>
                        <Box sx={{ height: '100%', backgroundColor: getColor(usagePct), width: `${Math.min(100, usagePct)}%`, borderRadius: 3 }} />
                      </Box>
                    )}
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Used:</Typography>
                      <Typography variant="caption" fontWeight="bold" sx={{ color: getColor(usagePct), fontSize: '0.7rem' }}>{used.toFixed(1)}d</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Left:</Typography>
                      <Typography variant="caption" fontWeight="bold" sx={{ color: remaining <= 0 ? '#e74c3c' : '#27ae60', fontSize: '0.7rem' }}>{remaining.toFixed(1)}d</Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Current Period Usage */}
          <Box flex={1} minWidth={150}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="#2c3e50" sx={{ fontSize: '0.9rem' }}>
              {viewMode === 'weekly' ? '📅 This Week' : '📅 This Month'}
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {usedLeaveTypes.map((lt) => {
                const currentUsage = (leaveRows[lt] || []).reduce((sum, hours) => sum + (hours >= 9 ? 1 : hours / 9), 0);
                if (currentUsage > 0) {
                  return (
                    <Box key={lt} sx={{ p: 0.8, backgroundColor: '#e8f4fd', borderRadius: 1.5, border: '1px solid #3498db', display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" fontWeight="bold" color="#2980b9" sx={{ fontSize: '0.7rem' }}>{lt}</Typography>
                      <Typography variant="caption" fontWeight="bold" color="#2c3e50" sx={{ fontSize: '0.7rem' }}>{currentUsage.toFixed(1)}d</Typography>
                    </Box>
                  );
                }
                return null;
              }).filter(Boolean)}
              {usedLeaveTypes.filter(lt => (leaveRows[lt] || []).some(h => h > 0)).length === 0 && (
                <Box sx={{ p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 1.5, border: '1px dashed #bdc3c7', textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>No leaves this period</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Box mt={2} p={1.5} sx={{ backgroundColor: '#fff', borderRadius: 1.5, border: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 1 }}>
          <Box textAlign="center">
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>Provided Leaves</Typography>
            <Typography variant="caption" fontWeight="bold" color="#27ae60" sx={{ fontSize: '0.7rem' }}>{backendBalances.provided_leaves}</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>Remaining</Typography>
            <Typography variant="caption" fontWeight="bold" color="#27ae60" sx={{ fontSize: '0.7rem' }}>{backendBalances.remaining_leaves.toFixed(1)}</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>Utilization</Typography>
            <Typography variant="caption" fontWeight="bold" color="#f39c12" sx={{ fontSize: '0.7rem' }}>{((backendBalances.el / 12) * 100).toFixed(1)}%</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>Period</Typography>
            <Typography variant="caption" fontWeight="bold" color="#9b59b6" sx={{ fontSize: '0.7rem' }}>{viewMode === 'weekly' ? 'Weekly' : 'Monthly'}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleResetRow(menuRow)} disabled={!isEditMode}>
          Reset
        </MenuItem>
        {menuRow !== "Worked Hours" && (
          <MenuItem onClick={() => handleDeleteRow(menuRow)} disabled={!isEditMode}>
            Delete
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}