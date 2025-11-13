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
  AdminAttendancFetchWeeklyDataById, Admin_Approve_Weekly_Attendance,
  AdminAttendancFetchMonthlyDataById,
  Admin_Approve_monthly_Attendance,
  Admin_Reject_Weekly_Attendance,
  Admin_Reject_Monthly_Attendance,
} from "../../features/attendance/attendanceSlice";
import { useLocation } from "react-router-dom";

// --- Utility: get Monday of a week ---
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// --- Utility: month cycle (1st → end of the month) ---
const getMonthDays = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const days = [];
  let current = new Date(start);

  while (current <= end) {
    const dayName = current.toLocaleDateString("en-US", { weekday: "short" });
    days.push({
      date: new Date(current),
      label: `${current.getDate().toString().padStart(2, "0")}/${(current.getMonth() + 1)
        .toString()
        .padStart(2, "0")} (${dayName})`,
      dayIndex: current.getDay(),
      isWeekend: dayName === "Sat" || dayName === "Sun",
    });
    current.setDate(current.getDate() + 1);
  }

  return days;
};

// --- Leave Allocation Helper ---
const getLeaveAllocation = (leaveType) => {
  const allocations = {
    "EL": 12,       // Earned Leave
    "SL": 6,        // Sick Leave
    "WFH": 0,       // Work From Home (usually not counted against leave balance)
    "Extra Milar": 0,
    "Paternity Leave": 15,
    "Maternity Leave": 180
  };
  return allocations[leaveType] || 0;
};

export default function Timesheet() {
  const dispatch = useDispatch();
  const location = useLocation();
  const {
    employeeId,
    from,
    to,
    viewType,  // This comes from the table navigation
    currentStartDate,
    currentEndDate
  } = location.state || {};

  // Initialize viewMode from navigation or default to weekly
  const [viewMode, setViewMode] = useState(viewType || "weekly");
  const [leaveType, setLeaveType] = useState("EL");
  const [usedLeaveTypes, setUsedLeaveTypes] = useState(["EL"]);
  const [leaveRows, setLeaveRows] = useState({ EL: Array(7).fill(0) });
  const [workedHours, setWorkedHours] = useState(Array(7).fill(0));
  const [monthlyWorkedHours, setMonthlyWorkedHours] = useState([]);

  // Date states
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

  // Annual leave tracking states
  const [annualLeavesUsed, setAnnualLeavesUsed] = useState({});
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRow, setMenuRow] = useState(null);
  const [calendarAnchor, setCalendarAnchor] = useState(null);
  const [usedLeaves, setUsedLeaves] = useState(0);
  const [remainingLeaves, setRemainingLeaves] = useState(0);
  const [usedLeavesDetails, setUsedLeavesDetails] = useState({});
  const [approvalStatus, setApprovalStatus] = useState({});
  console.log("approvalStatus",approvalStatus)
  const [isEditMode, setIsEditMode] = useState(false);
  const [statusColor, setStatusColor] = useState("#fff");

  const { attendanceData = [], loading } = useSelector((state) => state.attendance || {});
  const gender = localStorage.getItem("gender");

  console.log(attendanceData, "attendanceData")
  const leaveTypes = ["EL", "SL",  "WFH", "Extra Milar","Paternity Leave", "Maternity Leave"];

  const [holidays, setHolidays] = useState([]);
  const holidaysCache = {};

  // Initialize annual leaves from localStorage
  useEffect(() => {
    const storedLeaves = localStorage.getItem(`annualLeaves_${currentYear}`);
    if (storedLeaves) {
      setAnnualLeavesUsed(JSON.parse(storedLeaves));
    } else {
      // Initialize with zeros for all leave types
      const initialLeaves = {};
      leaveTypes.forEach(lt => {
        initialLeaves[lt] = 0;
      });
      setAnnualLeavesUsed(initialLeaves);
      localStorage.setItem(`annualLeaves_${currentYear}`, JSON.stringify(initialLeaves));
    }
  }, [currentYear]);

  // Update annual leaves when leaveRows change
  useEffect(() => {
    if (Object.keys(annualLeavesUsed).length === 0) return;

    const newAnnualLeavesUsed = { ...annualLeavesUsed };
    let hasChanges = false;

    // Calculate total leaves used across all leave types
    Object.entries(leaveRows).forEach(([leaveType, daysArray]) => {
      const totalInView = daysArray.reduce((sum, hours) => {
        // Convert hours to days (9 hours = 1 day)
        return sum + (hours >= 9 ? 1 : hours / 9);
      }, 0);

      // Only add if we have positive hours and it increases the annual count
      if (totalInView > 0) {
        const currentAnnual = newAnnualLeavesUsed[leaveType] || 0;
        if (totalInView > currentAnnual) {
          newAnnualLeavesUsed[leaveType] = totalInView;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setAnnualLeavesUsed(newAnnualLeavesUsed);
      localStorage.setItem(`annualLeaves_${currentYear}`, JSON.stringify(newAnnualLeavesUsed));
    }
  }, [leaveRows, currentYear]);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const year =
          viewMode === "weekly"
            ? weekStart.getFullYear()
            : monthStart.getFullYear();

        //  Cache check
        if (holidaysCache[year]) {
          setHolidays(holidaysCache[year]);
          return;
        }

        const res = await fetch(`http://localhost:9091/api/holidays/${year}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setHolidays(data);
          holidaysCache[year] = data;
        } else {
          console.error("Unexpected holiday response:", data);
        }
      } catch (err) {
        console.error("Failed to fetch holidays", err);
      }
    };

    fetchHolidays();
  }, [weekStart, monthStart, viewMode]);

  // Sync view mode with navigation parameters when component mounts
  useEffect(() => {
    if (viewType) {
      setViewMode(viewType);

      // Also set the appropriate date range based on navigation
      if (viewType === "weekly" && currentStartDate) {
        setWeekStart(getMonday(new Date(currentStartDate)));
      } else if (viewType === "monthly" && currentStartDate) {
        const date = new Date(currentStartDate);
        setMonthStart(new Date(date.getFullYear(), date.getMonth(), 1));
      }
    }
  }, [viewType, currentStartDate]);

  //  Helper functions
  const isHolidayDate = (dateStr) =>
    holidays.some((h) => h.date === dateStr);

  const getHolidayName = (dateStr) => {
    const h = holidays.find((h) => h.date === dateStr);
    return h ? h.name : null;
  };

  // Highlight holiday tiles in the calendar
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateStr = date.toISOString().slice(0, 10);
      if (isHolidayDate(dateStr)) {
        return "holiday-tile"; // custom CSS class
      }
    }
    return null;
  };

  //  Add a small dot or emoji for holidays
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dateStr = date.toISOString().slice(0, 10);
      const holiday = holidays.find((h) => h.date === dateStr);

      if (holiday) {
        return (
          <div
            title={holiday.name}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "4px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: holiday.isOptional ? "#2196F3" : "#e53935", // 🔵 optional / 🔴 public
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

  // --- Initialize Table ---
  const initializeTable = () => {
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
          newLeaveRows[lt] = leaveRows[lt].slice(0, days.length);
          if (newApprovalStatus[lt] && newApprovalStatus[lt].length !== days.length) {
            newApprovalStatus[lt] = [...newApprovalStatus[lt].slice(0, days.length), ...Array(Math.max(0, days.length - newApprovalStatus[lt].length)).fill("pending")];
          }
        }
      });
      setLeaveRows(newLeaveRows);
      setApprovalStatus(newApprovalStatus);
    }
  };

//weekly data
  useEffect(() => {
    initializeTable();
  }, [viewMode, monthStart]);

// monthly data
useEffect(() => {
  if (!attendanceData?.data) return;

  const start = new Date(weekStart);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  const list = Array.isArray(attendanceData.data) ? attendanceData.data : [];
  const dataMap = Object.fromEntries(list.map(i => [i.date?.slice(0, 10), i]));

  const weeklyData = weekDays.map(date => {
    const r = dataMap[date] || {};
    const leaveType = r.leave_type || "";
    const leaveValues = {
      EL: 0, SL: 0,  WFH: 0,
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
  const types = ["EL", "SL",  "WFH", "Extra Milar", "Paternity Leave", "Maternity Leave"];

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


// --- MONTHLY DATA ---
useEffect(() => {
  if (!attendanceData || viewMode !== "monthly") return;

  const list = Array.isArray(attendanceData)
    ? attendanceData : attendanceData.data || [];
  const dataMap = Object.fromEntries(list.map(i => [i.date?.slice(0, 10), i]));
  const monthDays = getMonthDays(monthStart);

  const monthlyData = monthDays.map(d => {
    const date = d.date.toISOString().slice(0, 10);
    const r = dataMap[date] || {};
    const leaveType = r.leave_type || "";
    const leaveValues = {
      EL: 0, SL: 0,  WFH: 0,
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
  const types = ["EL", "SL",  "WFH", "Extra Milar", "Paternity Leave", "Maternity Leave"];

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

  // Calculate leave summary using annual data
  useEffect(() => {
    let totalUsed = 0;
    const details = {};

    // Use annual leaves data instead of current view data
    Object.entries(annualLeavesUsed).forEach(([lt, days]) => {
      totalUsed += days;
      if (days > 0) details[lt] = days;
    });

    const totalLeaves = 12; // Default annual allocation for EL
    const remaining = Math.max(0, totalLeaves - totalUsed);
    
    setUsedLeaves(totalUsed);
    setRemainingLeaves(remaining);
    setUsedLeavesDetails(details);
  }, [annualLeavesUsed]);

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
      // FIX: Always use 1st as start date and last day as end date
      const start = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
      const end = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

      const fmt = (d) =>
        `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getFullYear()}`;

      return `${fmt(start)} - ${fmt(end)}`;
    }
  };
  // --- Change week/month ---
  const changeWeek = (delta) => {
    const newWeek = new Date(weekStart);
    newWeek.setDate(weekStart.getDate() + delta * 7);
    setWeekStart(getMonday(newWeek));
  };

  const changeMonth = (delta) => {
    const newMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + delta, 1);
    setMonthStart(newMonth);
  };

  // Handle view mode change with proper date synchronization
  const handleViewModeChange = () => {
    if (viewMode === "weekly") {
      // Switching from weekly to monthly
      // Always use 1st of current week's month
      const newMonthStart = new Date(weekStart.getFullYear(), weekStart.getMonth(), 1);
      setMonthStart(newMonthStart);
      setViewMode("monthly");
    } else {
      // Switching from monthly to weekly
      // Set week start to the first Monday of the current month
      const firstDayOfMonth = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
      const newWeekStart = getMonday(firstDayOfMonth);
      setWeekStart(newWeekStart);
      setViewMode("weekly");
    }
    // Reset edit mode when changing views
    setIsEditMode(false);
  };

  // --- Add activity ---
  const addActivity = () => {
    if (!usedLeaveTypes.includes(leaveType)) {
      const len = viewMode === "weekly" ? 7 : getMonthDays(monthStart).length;
      setUsedLeaveTypes((prev) => [...prev, leaveType]);
      setLeaveRows((prev) => ({ ...prev, [leaveType]: Array(len).fill(0) }));
      setApprovalStatus(prev => ({
        ...prev,
        [leaveType]: Array(len).fill("pending")
      }));
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
      setApprovalStatus(prev => ({
        ...prev,
        [row]: Array(len).fill("pending")
      }));
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

    let fromDate, toDate;

    if (viewMode === "weekly") {
      const from = new Date(weekStart);
      const to = new Date(weekStart);
      to.setDate(weekStart.getDate() + 6);
      fromDate = from.toISOString().slice(0, 10);
      toDate = to.toISOString().slice(0, 10);

      dispatch(Admin_Reject_Weekly_Attendance({ employeeId, from: fromDate, to: toDate }))
        .unwrap()
        .then((res) => {
          const message = res?.message || `❌ Weekly Timesheet Rejected!\nRange: ${fromDate} → ${toDate}`;
          alert(message);
        })
        .catch((err) => console.error("❌ Weekly Reject Error:", err));

    }
    else if (viewMode === "monthly") {
      // Always use 1st to last day of the current month view
      const fromDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1).toISOString().slice(0, 10);
      const toDate = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).toISOString().slice(0, 10);

      dispatch(Admin_Reject_Monthly_Attendance({ employeeId, from: fromDate, to: toDate }))
        .unwrap()
        .then((res) => {
          const message = res?.message || `❌ Monthly Timesheet Rejected!\nRange: ${fromDate} → ${toDate}`;
          alert(message);
        })
        .catch((err) => console.error("❌ Monthly Reject Error:", err));
    }

    // Update UI
    const newApprovalStatus = { ...approvalStatus };
    Object.keys(newApprovalStatus).forEach(leaveType => {
      newApprovalStatus[leaveType] = newApprovalStatus[leaveType].map(() => "rejected");
    });
    setApprovalStatus(newApprovalStatus);
  };

  // Handle individual cell approval
  const handleCellApproval = (leaveType, dayIndex) => {
    if (!isEditMode) {
      const newApprovalStatus = { ...approvalStatus };
      const currentStatus = newApprovalStatus[leaveType]?.[dayIndex] || "pending";

      // Toggle between pending and approved
      newApprovalStatus[leaveType][dayIndex] = currentStatus === "approved" ? "pending" : "approved";
      setApprovalStatus(newApprovalStatus);
    }
  };

  // Updated version — keeps Sat/Sun as gray with no status color
  const getInputBackgroundColor = (leaveType, dayIndex, value) => {
    // For Saturday (6) and Sunday (0): always gray, no status logic
    if (days[dayIndex].dayIndex === 0 || days[dayIndex].dayIndex === 6) {
      return "#f0f0f0"; // weekend color
    }

    // For weekdays — apply approval status color
    const status =
      approvalStatus[leaveType]?.[dayIndex] ||
      approvalStatus["Worked Hours"]?.[dayIndex] ||
      "pending";

    if (value > 0 || leaveType === "Worked Hours") {
      switch (status) {
        case "approved":
          return "#d4edda"; // green
        case "rejected":
          return "#d3323fff"; // red
        default:
          return "#FFF59D"; // yellow pending
      }
    }

    return "#fff"; // normal weekdays
  };

  // Handle calendar date selection
  const handleCalendarDateSelect = (date) => {
    if (viewMode === "weekly") {
      setWeekStart(getMonday(date));
    } else {
      setMonthStart(new Date(date.getFullYear(), date.getMonth(), 1));
    }
    setCalendarAnchor(null);
  };

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

      dispatch(Admin_Approve_Weekly_Attendance({ employeeId: employeeId, from: fromDate, to: toDate }))
        .unwrap()
        .then((res) => {
          console.log("✅ Weekly Approved:", res);
          alert(`✅ Weekly Timesheet Approved!\nRange: ${fromDate} → ${toDate}`);
           setApprovalStatus((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((key) => {
            updated[key] = updated[key].map(() => "approved");
          });
          return updated;
        });
        })
        .catch((err) => console.error("❌ Weekly Approve Error:", err));
    }


    else if (viewMode === "monthly") {
      // Always calculate from 1st to last day of the month
      const fromDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1).toISOString().slice(0, 10);
      const toDate = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).toISOString().slice(0, 10);

      console.log("📆 Monthly Fetch Range:", fromDate, "→", toDate);

      dispatch(Admin_Approve_monthly_Attendance({ employeeId: employeeId, from: fromDate, to: toDate }))
        .unwrap()
        .then((res) => {
          console.log(" Monthly Approved:", res);
          alert(` Monthly Timesheet Approved!\nRange: ${fromDate} → ${toDate}`);
          setApprovalStatus((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((key) => {
            updated[key] = updated[key].map(() => "approved");
          });
          return updated;
        });
        })
        .catch((err) => console.error(" Monthly Approve Error:", err));
    }
  };

  const getStatusBackgroundColor = (item, viewMode) => {
    if (viewMode === "weekly") {
      if (item.weekly_status?.toLowerCase() === "approved") return "#b7f5b0"; // green
      if (item.weekly_status?.toLowerCase() === "pending_approval") return "#fff3b0"; // yellow
    }
    if (viewMode === "monthly") {
      if (item.monthly_status?.toLowerCase() === "approved") return "#b7f5b0";
      if (item.monthly_status?.toLowerCase() === "pending_approval") return "#fff3b0";
    }
    return "#fff"; // default white
  };

  // --- Days list ---
  const days =
    viewMode === "weekly"
      ? Array.from({ length: 7 }, (_, i) => {
        const date = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i);
        const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        return {
          dayIndex: date.getDay(),
          label: `${dayName} / ${date.getDate().toString().padStart(2, "0")}/${month}`,
          date
        };
      })
      : getMonthDays(monthStart);

  const currentWorkedHours = viewMode === "weekly" ? workedHours : monthlyWorkedHours;
  const workedTotal = (currentWorkedHours || []).reduce((a, b) => a + Number(b || 0), 0);
  const rowTotals = {};
  usedLeaveTypes.forEach((lt) => {
    rowTotals[lt] = (leaveRows[lt] || Array(days.length).fill(0)).reduce((a, b) => a + Number(b || 0), 0);
  });
  const grandTotal = workedTotal + Object.values(rowTotals).reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (!employeeId) return;

    if (viewMode === "weekly") {
      // 🔹 Compute weekly range (Monday → Sunday)
      const fromDate = new Date(weekStart);
      const toDate = new Date(weekStart);
      toDate.setDate(weekStart.getDate() + 6);

      const weeklyFrom = fromDate.toISOString().slice(0, 10);
      const weeklyTo = toDate.toISOString().slice(0, 10);

      dispatch(AdminAttendancFetchWeeklyDataById({ employeeId, from: weeklyFrom, to: weeklyTo }))
        .unwrap()
        .then((res) => console.log("✅ Weekly Data:", res))
        .catch((err) => console.error("❌ Weekly Error:", err));
    }
    else if (viewMode === "monthly") {
      // 🔹 ALWAYS use 1st to last day of the current month view
      const fromDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
      const toDate = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

      const monthlyFrom = fromDate.toISOString().slice(0, 10);
      const monthlyTo = toDate.toISOString().slice(0, 10);

      dispatch(AdminAttendancFetchMonthlyDataById({ employeeId, from: monthlyFrom, to: monthlyTo }))
        .unwrap()
        .then((res) => {
          console.log("✅ Monthly Data:", res);
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
                onChange={handleCalendarDateSelect}
                value={viewMode === "weekly" ? weekStart : monthStart}
                tileClassName={tileClassName}     // 🔥 Added
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

      {/* Color Legend */}
      <Box display="flex" gap={2} mb={2} justifyContent="center">
        <Box display="flex" alignItems="center" gap={1}>
          <Box width={20} height={20} bgcolor="#fff3cd" border="1px solid #ccc" />
          <Typography variant="body2">Pending Approval</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box width={20} height={20} bgcolor="#d4edda" border="1px solid #ccc" />
          <Typography variant="body2">Approved</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box width={20} height={20} bgcolor="#d3323fff" border="1px solid #ccc" />
          <Typography variant="body2">Rejected</Typography>
        </Box>
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
                const dateObj = days[i].date;
                const dateStr = dateObj.toISOString().slice(0, 10);
                const isWeekend = days[i].dayIndex === 0 || days[i].dayIndex === 6;
                const isHoliday = isHolidayDate(dateStr);
                const holidayName = getHolidayName(dateStr);

                // Highlight holiday cell
                if (isHoliday) {
                  return (
                    <TableCell key={i} align="center" sx={{ p: 0.5 }}>
                      <input
                        type="text"
                        value="H"
                        title={holidayName}
                        disabled
                        style={{
                          width: 50,
                          height: 22,
                          textAlign: "center",
                          backgroundColor: "#ffeaea", // holiday background
                          color: "#d32f2f", // red text
                          border: "1px solid #ccc",
                          borderRadius: 4,
                          boxSizing: "border-box",
                          verticalAlign: "middle",
                          margin: 0,
                          padding: 0,
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
                        boxSizing: "border-box",
                        verticalAlign: "middle",
                        margin: 0,
                        padding: 0,
                        outline: "none",
                      }}
                      disabled={!isEditMode || isWeekend}
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
                    sx={{ cursor: !isEditMode ? 'pointer' : 'default' }}
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
                        transition: "background-color 0.3s ease",
                        cursor: "text"
                      }}
                      disabled={!isEditMode || days[i].dayIndex === 0 || days[i].dayIndex === 6}
                      onChange={(e) => {
                        const val = parseHour(e.target.value);
                        setLeaveRows((prev) => {
                          const arr = [...(prev[lt] || Array(days.length).fill(0))];
                          arr[i] = val;
                          return { ...prev, [lt]: arr };
                        });

                        // Update annual leaves
                        setTimeout(() => {
                          const newAnnualLeavesUsed = { ...annualLeavesUsed };
                          let totalForThisType = 0;
                          
                          // Recalculate total for this leave type including the new value
                          const currentRow = [...(leaveRows[lt] || Array(days.length).fill(0))];
                          currentRow[i] = val; // Include the new value
                          
                          totalForThisType = currentRow.reduce((sum, hours) => {
                            // Convert hours to days (9 hours = 1 day)
                            return sum + (hours >= 9 ? 1 : hours / 9);
                          }, 0);

                          // Update annual count if this is higher than current
                          if (totalForThisType > (newAnnualLeavesUsed[lt] || 0)) {
                            newAnnualLeavesUsed[lt] = totalForThisType;
                            setAnnualLeavesUsed(newAnnualLeavesUsed);
                            localStorage.setItem(`annualLeaves_${currentYear}`, JSON.stringify(newAnnualLeavesUsed));
                          }
                        }, 0);

                        const newApprovalStatus = { ...approvalStatus };
                        if (newApprovalStatus[lt]) {
                          newApprovalStatus[lt][i] = "pending";
                          setApprovalStatus(newApprovalStatus);
                        }
                      }}
                    />
                    {/* Hide status text for Saturday and Sunday */}
                    {/* Show status only for cells with data (v > 0) and weekdays */}
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
            <Select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              label="Leave Type"
              disabled={!isEditMode}
            >
              {leaveTypes.map((lt) => (
                <MenuItem key={lt} value={lt}>
                  {lt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={addActivity}
            disabled={!isEditMode}
          >
            Add Activity
          </Button>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            color="success"
            onClick={handleApproved}
          >
            Approved
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRejectAll}
          >
            Rejected
          </Button>
        </Box>
      </Box>

     
      {/* Enhanced Annual Leave Summary */}
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
    📊 Annual Leave Summary ({currentYear})
  </Typography>
  
  {/* Main Content Grid */}
  <Box display="flex" flexWrap="wrap" gap={3} alignItems="flex-start">
    {/* Overall Progress - Compact */}
    <Box flex={1} minWidth={200}>
      <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="#2c3e50" sx={{ fontSize: '0.9rem' }}>
        📈 Overall Progress
      </Typography>
      
      {/* Compact Progress Bar */}
      <Box sx={{ position: 'relative', height: 20, backgroundColor: '#ecf0f1', borderRadius: 10, overflow: 'hidden', mb: 1.5 }}>
        <Box 
          sx={{ 
            height: '100%', 
            backgroundColor: usedLeaves >= 12 ? '#e74c3c' : '#2ecc71',
            width: `${Math.min(100, (usedLeaves / 12) * 100)}%`,
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
            color: usedLeaves >= 6 ? '#fff' : '#2c3e50',
          }}
        >
          {usedLeaves.toFixed(1)} / 12 days
        </Typography>
      </Box>
      
      {/* Compact Stats */}
      <Box display="flex" justifyContent="space-between" gap={1}>
        <Box textAlign="center" p={0.8} sx={{ backgroundColor: '#2ecc71', borderRadius: 1.5, flex: 1 }}>
          <Typography variant="caption" fontWeight="bold" color="white" sx={{ fontSize: '0.7rem' }}>
            Remaining
          </Typography>
          <Typography variant="body2" fontWeight="bold" color="white" sx={{ fontSize: '0.9rem' }}>
            {remainingLeaves.toFixed(1)}
          </Typography>
        </Box>
        <Box textAlign="center" p={0.8} sx={{ backgroundColor: usedLeaves >= 12 ? '#e74c3c' : '#f39c12', borderRadius: 1.5, flex: 1 }}>
          <Typography variant="caption" fontWeight="bold" color="white" sx={{ fontSize: '0.7rem' }}>
            Used
          </Typography>
          <Typography variant="body2" fontWeight="bold" color="white" sx={{ fontSize: '0.9rem' }}>
            {usedLeaves.toFixed(1)}
          </Typography>
        </Box>
      </Box>
    </Box>

    {/* Leave Type Breakdown - Compact Grid */}
    <Box flex={2} minWidth={300}>
      <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="#2c3e50" sx={{ fontSize: '0.9rem' }}>
        🎯 Leave Types
      </Typography>
      <Box 
        display="grid" 
        gridTemplateColumns="repeat(auto-fit, minmax(180px, 1fr))" 
        gap={1.5}
        sx={{ maxHeight: 200, overflowY: 'auto', pr: 0.5,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: 2 },
          '&::-webkit-scrollbar-thumb': { background: '#c1c1c1', borderRadius: 2 },
        }}
      >
        {leaveTypes.map((leaveType) => {
          const usedDays = annualLeavesUsed[leaveType] || 0;
          const allocation = getLeaveAllocation(leaveType);
          const remaining = Math.max(0, allocation - usedDays);
          const usagePercentage = allocation > 0 ? (usedDays / allocation) * 100 : 0;
          
          const getUsageColor = (percentage) => {
            if (percentage >= 100) return '#e74c3c';
            if (percentage >= 80) return '#e67e22';
            if (percentage >= 50) return '#f1c40f';
            return '#2ecc71';
          };

          return (
            <Box 
              key={leaveType} 
              sx={{ 
                p: 1.2, 
                backgroundColor: '#fff', 
                borderRadius: 1.5, 
                border: '1px solid #e0e0e0',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }
              }}
            >
              {/* Leave Type Header */}
              <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.8rem', mb: 0.5 }}>
                {leaveType}
              </Typography>
              
              {/* Compact Progress Bar */}
              {allocation > 0 && (
                <Box sx={{ position: 'relative', height: 6, backgroundColor: '#ecf0f1', borderRadius: 3, overflow: 'hidden', mb: 0.5 }}>
                  <Box 
                    sx={{ 
                      height: '100%', 
                      backgroundColor: getUsageColor(usagePercentage),
                      width: `${Math.min(100, usagePercentage)}%`,
                      borderRadius: 3,
                    }} 
                  />
                </Box>
              )}
              
              {/* Compact Stats */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  Used:
                </Typography>
                <Typography 
                  variant="caption" 
                  fontWeight="bold"
                  sx={{ 
                    color: getUsageColor(usagePercentage),
                    fontSize: '0.7rem'
                  }}
                >
                  {usedDays.toFixed(1)}d
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  Left:
                </Typography>
                <Typography 
                  variant="caption" 
                  fontWeight="bold"
                  sx={{ 
                    color: remaining <= 0 ? '#e74c3c' : '#27ae60',
                    fontSize: '0.7rem'
                  }}
                >
                  {remaining.toFixed(1)}d
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>

    {/* Current Period Usage - Compact */}
    <Box flex={1} minWidth={150}>
      <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="#2c3e50" sx={{ fontSize: '0.9rem' }}>
        {viewMode === 'weekly' ? '📅 This Week' : '📅 This Month'}
      </Typography>
      <Box display="flex" flexDirection="column" gap={1}>
        {usedLeaveTypes.map((leaveType) => {
          const currentUsage = (leaveRows[leaveType] || []).reduce((sum, hours) => 
            sum + (hours >= 9 ? 1 : hours / 9), 0
          );
          
          if (currentUsage > 0) {
            return (
              <Box 
                key={leaveType} 
                sx={{ 
                  p: 0.8, 
                  backgroundColor: '#e8f4fd', 
                  borderRadius: 1.5, 
                  border: '1px solid #3498db',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Typography variant="caption" fontWeight="bold" color="#2980b9" sx={{ fontSize: '0.7rem' }}>
                  {leaveType}
                </Typography>
                <Typography variant="caption" fontWeight="bold" color="#2c3e50" sx={{ fontSize: '0.7rem' }}>
                  {currentUsage.toFixed(1)}d
                </Typography>
              </Box>
            );
          }
          return null;
        }).filter(Boolean)}
        
        {usedLeaveTypes.filter(lt => (leaveRows[lt] || []).some(h => h > 0)).length === 0 && (
          <Box 
            sx={{ 
              p: 1.5, 
              backgroundColor: '#f8f9fa', 
              borderRadius: 1.5, 
              border: '1px dashed #bdc3c7',
              textAlign: 'center'
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              No leaves this period
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  </Box>

  {/* Compact Quick Stats */}
  <Box 
    mt={2} 
    p={1.5} 
    sx={{ 
      backgroundColor: '#fff', 
      borderRadius: 1.5, 
      border: '1px solid #e0e0e0',
      display: 'flex',
      justifyContent: 'space-around',
      flexWrap: 'wrap',
      gap: 1
    }}
  >
    <Box textAlign="center">
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
        Most Used
      </Typography>
      <Typography variant="caption" fontWeight="bold" color="#e74c3c" sx={{ fontSize: '0.7rem' }}>
        {Object.entries(annualLeavesUsed).reduce((max, [type, days]) => 
          days > (max.days || 0) ? { type, days } : max, { type: 'None', days: 0 }
        ).type}
      </Typography>
    </Box>
    <Box textAlign="center">
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
        Balance
      </Typography>
      <Typography variant="caption" fontWeight="bold" color="#27ae60" sx={{ fontSize: '0.7rem' }}>
        {remainingLeaves.toFixed(1)} days
      </Typography>
    </Box>
    <Box textAlign="center">
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
        Utilization
      </Typography>
      <Typography variant="caption" fontWeight="bold" color="#f39c12" sx={{ fontSize: '0.7rem' }}>
        {((usedLeaves / 12) * 100).toFixed(1)}%
      </Typography>
    </Box>
    <Box textAlign="center">
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
        Period
      </Typography>
      <Typography variant="caption" fontWeight="bold" color="#9b59b6" sx={{ fontSize: '0.7rem' }}>
        {viewMode === 'weekly' ? 'Weekly' : 'Monthly'}
      </Typography>
    </Box>
  </Box>
</Box>

      {/* Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => handleResetRow(menuRow)}
          disabled={!isEditMode}
        >
          Reset
        </MenuItem>
        {menuRow !== "Worked Hours" && (
          <MenuItem
            onClick={() => handleDeleteRow(menuRow)}
            disabled={!isEditMode}
          >
            Delete
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}