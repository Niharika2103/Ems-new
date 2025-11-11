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
  
  // Initialize dates from navigation or use defaults
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
  const [usedLeaves, setUsedLeaves] = useState(0);
  const [remainingLeaves, setRemainingLeaves] = useState(0);
  const [usedLeavesDetails, setUsedLeavesDetails] = useState({});
  const [approvalStatus, setApprovalStatus] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [statusColor, setStatusColor] = useState("#fff");

  const { attendanceData = [], loading } = useSelector((state) => state.attendance || {});
  const gender = localStorage.getItem("gender");

  console.log(attendanceData, "attendanceData")
  const leaveTypes = ["EL", "SL", "PL", "WFH", "Extra Milar", "Paternity Leave", "Maternity Leave"];

  // 🔥 ADD BELOW OTHER useState HOOKS
  const [holidays, setHolidays] = useState([]);
  const holidaysCache = {};

  // 🔥 Fetch holidays for both weekly & monthly views
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const year =
          viewMode === "weekly"
            ? weekStart.getFullYear()
            : monthStart.getFullYear();

        // ✅ Cache check
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

  // 🔥 Helper functions
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

  useEffect(() => {
    initializeTable();
  }, [viewMode, monthStart]);

  // --- Safe attendance data handling (Weekly) ---
  useEffect(() => {
    if (!attendanceData || !attendanceData.data) return;

    // 1️⃣ Build week dates (Mon–Sun)
    const start = new Date(weekStart);
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
    });

    const list = Array.isArray(attendanceData.data) ? attendanceData.data : [];

    // 2️⃣ Make quick lookup map (key = date)
    const dataMap = {};
    list.forEach((item) => {
      const dateKey = item.date?.slice(0, 10);
      dataMap[dateKey] = item;
    });

    // 3️⃣ Build structured data for 7 days
    const weeklyData = weekDays.map((date) => {
      const record = dataMap[date] || {}; // fallback if not found
      const worked_hours = record.worked_hours || 0;
      const leaveType = record.leave_type || "";

      const leaveValues = {
        EL: 0, SL: 0, PL: 0, WFH: 0,
        "Extra Milar": 0, "Paternity Leave": 0, "Maternity Leave": 0,
      };
      if (leaveType && leaveValues.hasOwnProperty(leaveType)) {
        leaveValues[leaveType] = 9;
      }

      return {
        date,
        worked_hours: leaveType ? 0 : worked_hours,
        weekly_status: record.weekly_status || "draft", // 👈 include status
        ...leaveValues,
      };
    });

    // Debug
    console.log("🗓️ Final Weekly Data (mapped to 7 days):", weeklyData);

    // 4️⃣ Update worked hours + leaves
    setWorkedHours(weeklyData.map((d) => Number(d.worked_hours) || 0));

    const newLeaveRows = {};
    const newApprovalStatus = { ...approvalStatus };
    const allLeaveTypes = [
      "EL", "SL", "PL", "WFH", "Extra Milar", "Paternity Leave", "Maternity Leave",
    ];

    allLeaveTypes.forEach((lt) => {
      newLeaveRows[lt] = weeklyData.map((d) => Number(d[lt]) || 0);
      if (!newApprovalStatus[lt]) {
        newApprovalStatus[lt] = Array(7).fill("pending");
      }
    });

    setLeaveRows(newLeaveRows);
    setApprovalStatus(newApprovalStatus);
    setUsedLeaveTypes(allLeaveTypes.filter((lt) => newLeaveRows[lt].some((v) => v > 0)));
    // ✅ Initialize Worked Hours approval status (Pending by default)
    newApprovalStatus["Worked Hours"] = Array(7).fill("pending");


    // 5️⃣ Save per-day status color array
    const colorArray = weeklyData.map((item) => getStatusBackgroundColor(item, "weekly"));
    setStatusColor(colorArray);
  }, [attendanceData, weekStart, viewMode]);

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

    // 🔹 Build month days (1st → end of the month)
    const monthDays = getMonthDays(monthStart);

    // 🔹 Create structured data for all days
    const monthlyData = monthDays.map((d) => {
      const dateKey = d.date.toISOString().slice(0, 10);
      const record = dataMap[dateKey] || {};

      const worked_hours = record.worked_hours || 0;
      const leaveType = record.leave_type || "";

      const leaveValues = {
        EL: 0,
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

    console.log("🗓️ Final Monthly Data (mapped to 1st→end of the month):", monthlyData);

    // 🔹 Set worked hours & leave arrays
    const workedArray = monthlyData.map((d) => Number(d.worked_hours) || 0);
    setMonthlyWorkedHours(workedArray);

    const newLeaveRows = {};
    const newApprovalStatus = { ...approvalStatus };
    const allLeaveTypes = [
      "EL",
      "SL",
      "PL",
      "WFH",
      "Extra Milar",
      "Paternity Leave",
      "Maternity Leave",
    ];

    allLeaveTypes.forEach((lt) => {
      newLeaveRows[lt] = monthlyData.map((d) => Number(d[lt]) || 0);
      if (!newApprovalStatus[lt]) {
        newApprovalStatus[lt] = Array(monthDays.length).fill("pending");
      }
    });

    setLeaveRows(newLeaveRows);
    setApprovalStatus(newApprovalStatus);
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

  // Enhanced approval functions
  const handleSaveAll = () => {
    setIsEditMode(false);
    alert("Timesheet saved!");
  };

 
  const handleApproveAll = () => {
    const newApprovalStatus = { ...approvalStatus };

    // ✅ Include Worked Hours
    newApprovalStatus["Worked Hours"] = (viewMode === "weekly"
      ? workedHours
      : monthlyWorkedHours
    ).map(() => "approved");

    Object.keys(leaveRows).forEach((leaveType) => {
      newApprovalStatus[leaveType] = leaveRows[leaveType].map((value, index) =>
        value > 0 ? "approved" : newApprovalStatus[leaveType][index] || "pending"
      );
    });

    setApprovalStatus(newApprovalStatus);
    alert("All approved!");
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
  

  const handleEditAll = () => {
    setIsEditMode(true);
  };

  // ✅ Approve Weekly button logic
  const handleApprovedWeek = () => {
    const newStatus = { ...approvalStatus };

    days.forEach((day, i) => {
      if (day.dayIndex !== 0 && day.dayIndex !== 6) { // skip weekends
        // ✅ Worked Hours
        if (!newStatus["Worked Hours"]) newStatus["Worked Hours"] = [];
        newStatus["Worked Hours"][i] = "approved";

        // ✅ Leave Rows
        usedLeaveTypes.forEach((lt) => {
          if (!newStatus[lt]) newStatus[lt] = [];
          if (leaveRows[lt]?.[i] > 0) {
            newStatus[lt][i] = "approved";
          }
        });
      }
    });

    setApprovalStatus(newStatus);
    alert("✅ Weekly timesheet approved successfully!");
  };

  // ❌ Reject Weekly button logic
  const handleRejectWeek = () => {
    const newStatus = { ...approvalStatus };

    days.forEach((day, i) => {
      if (day.dayIndex !== 0 && day.dayIndex !== 6) { // skip weekends
        if (!newStatus["Worked Hours"]) newStatus["Worked Hours"] = [];
        newStatus["Worked Hours"][i] = "rejected";

        usedLeaveTypes.forEach((lt) => {
          if (!newStatus[lt]) newStatus[lt] = [];
          if (leaveRows[lt]?.[i] > 0) {
            newStatus[lt][i] = "rejected";
          }
        });
      }
    });

    setApprovalStatus(newStatus);
    alert("❌ Weekly timesheet rejected!");
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

 
  // ✅ Updated version — keeps Sat/Sun as gray with no status color
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

    console.log("📅 Weekly Fetch Range:", weeklyFrom, "→", weeklyTo);

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

    console.log("📆 Monthly Fetch Range:", monthlyFrom, "→", monthlyTo);

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
                        // backgroundColor: isWeekend ? "#f0f0f0" : "#fff",
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

                        const newApprovalStatus = { ...approvalStatus };
                        if (newApprovalStatus[lt]) {
                          newApprovalStatus[lt][i] = "pending";
                          setApprovalStatus(newApprovalStatus);
                        }
                      }}
                    />
                    {/* ✅ Hide status text for Saturday and Sunday */}
                    {/* ✅ Show status only for cells with data (v > 0) and weekdays */}
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
        
            <>
              <Button 
                variant="contained" 
                color="success" 
                onClick={handleApproveAll}
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
          
          </>

        </Box>
      </Box>

      {/* Leave Summary */}
      <Box
        mt={3}
        p={2}
        display="flex"
        justifyContent="space-evenly"
        alignItems="center"
        sx={{
          backgroundColor: "#f5f5f5",
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Box>
          <Typography variant="body1" fontWeight="bold" color="primary">
            Used Leaves: {usedLeaves}
          </Typography>
          {Object.entries(usedLeavesDetails).map(([lt, val]) => (
            <Typography key={lt} variant="body2">
              {lt}: {val}
            </Typography>
          ))}
        </Box>
        <Typography variant="body1" fontWeight="bold" color="success.main">
          Remaining Leaves: {remainingLeaves}
        </Typography>
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