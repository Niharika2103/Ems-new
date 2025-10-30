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

export default function Timesheet() {
  const [viewMode, setViewMode] = useState("weekly");
  const [leaveType, setLeaveType] = useState("CL");
  const [usedLeaveTypes, setUsedLeaveTypes] = useState(["CL"]);
  const [leaveRows, setLeaveRows] = useState({ CL: [] });
  const [workedHours, setWorkedHours] = useState([]);
  const [monthlyWorkedHours, setMonthlyWorkedHours] = useState([]);
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [monthStart, setMonthStart] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRow, setMenuRow] = useState(null);
  const [calendarAnchor, setCalendarAnchor] = useState(null);
  const [usedLeaves, setUsedLeaves] = useState(0);
  const [remainingLeaves, setRemainingLeaves] = useState(0);
  const [usedLeavesDetails, setUsedLeavesDetails] = useState({});
  const [approvalStatus, setApprovalStatus] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);

  const leaveTypes = ["CL", "SL", "PL", "WFH", "Extra Milar", "Paternity Leave", "Maternity Leave"];

  // --- Initialize table rows ---
  useEffect(() => {
    initializeTable();
  }, [viewMode, weekStart, monthStart]);

  useEffect(() => {
    calculateLeaves();
  }, [leaveRows]);

  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  const initializeTable = () => {
    let len;
    if (viewMode === "weekly") {
      len = 7;
      setWorkedHours(Array(len).fill(0));
    } else {
      const lastDay = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
      len = lastDay;
      setMonthlyWorkedHours(Array(len).fill(0));
    }

    const newLeaveRows = {};
    const newApprovalStatus = { ...approvalStatus };
    
    usedLeaveTypes.forEach((lt) => {
      if (!leaveRows[lt] || leaveRows[lt].length !== len) {
        newLeaveRows[lt] = Array(len).fill(0);
        if (!newApprovalStatus[lt]) {
          newApprovalStatus[lt] = Array(len).fill("pending");
        }
      } else {
        newLeaveRows[lt] = leaveRows[lt].slice(0, len);
        if (newApprovalStatus[lt] && newApprovalStatus[lt].length !== len) {
          newApprovalStatus[lt] = [...newApprovalStatus[lt].slice(0, len), ...Array(Math.max(0, len - newApprovalStatus[lt].length)).fill("pending")];
        }
      }
    });
    
    setLeaveRows(newLeaveRows);
    setApprovalStatus(newApprovalStatus);
  };

  const calculateLeaves = () => {
    let used = 0;
    const details = {};
    Object.entries(leaveRows).forEach(([lt, row]) => {
      const total = row.reduce((a, b) => a + Number(b || 0), 0);
      used += total;
      if (total > 0) details[lt] = total;
    });
    const totalLeaves = 12;
    const remaining = totalLeaves - used;
    setUsedLeaves(used);
    setRemainingLeaves(remaining >= 0 ? remaining : 0);
    setUsedLeavesDetails(details);
  };

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
      return `${monthStart.toLocaleString("default", { month: "long" })} ${monthStart.getFullYear()}`;
    }
  };

  const changeWeek = (delta) => {
    const newWeek = new Date(weekStart);
    newWeek.setDate(weekStart.getDate() + delta * 7);
    setWeekStart(newWeek);
  };

  const changeMonth = (delta) => {
    const newMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + delta, 1);
    setMonthStart(newMonth);

    const daysInMonth = new Date(newMonth.getFullYear(), newMonth.getMonth() + 1, 0).getDate();

    const newLeaveRows = {};
    const newApprovalStatus = { ...approvalStatus };
    
    usedLeaveTypes.forEach((lt) => {
      newLeaveRows[lt] = Array(daysInMonth).fill(0);
      if (!newApprovalStatus[lt] || newApprovalStatus[lt].length !== daysInMonth) {
        newApprovalStatus[lt] = Array(daysInMonth).fill("pending");
      }
    });
    
    setLeaveRows(newLeaveRows);
    setApprovalStatus(newApprovalStatus);
    setMonthlyWorkedHours(Array(daysInMonth).fill(0));
  };

  // Handle view mode change with proper date synchronization
  const handleViewModeChange = () => {
    if (viewMode === "weekly") {
      // Switching from weekly to monthly
      // Set month start to the month of the current week
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

  const addActivity = () => {
    if (!usedLeaveTypes.includes(leaveType)) {
      const len = viewMode === "weekly" ? 7 : new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
      setUsedLeaveTypes([...usedLeaveTypes, leaveType]);
      setLeaveRows({ ...leaveRows, [leaveType]: Array(len).fill(0) });
      setApprovalStatus({ 
        ...approvalStatus, 
        [leaveType]: Array(len).fill("pending") 
      });
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
    const len = viewMode === "weekly" ? 7 : new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
    if (row === "Worked Hours") {
      viewMode === "weekly"
        ? setWorkedHours(Array(len).fill(0))
        : setMonthlyWorkedHours(Array(len).fill(0));
    } else {
      setLeaveRows({ ...leaveRows, [row]: Array(len).fill(0) });
      setApprovalStatus({ 
        ...approvalStatus, 
        [row]: Array(len).fill("pending") 
      });
    }
    handleMenuClose();
  };

  const handleDeleteRow = (row) => {
    const filtered = usedLeaveTypes.filter((lt) => lt !== row);
    setUsedLeaveTypes(filtered);
    const updated = { ...leaveRows };
    const updatedStatus = { ...approvalStatus };
    delete updated[row];
    delete updatedStatus[row];
    setLeaveRows(updated);
    setApprovalStatus(updatedStatus);
    handleMenuClose();
  };

  const handleSaveAll = () => {
    setIsEditMode(false);
    alert("Timesheet saved!");
  };

  const handleApproveAll = () => {
    const newApprovalStatus = { ...approvalStatus };
    
    Object.keys(leaveRows).forEach(leaveType => {
      newApprovalStatus[leaveType] = leaveRows[leaveType].map((value, index) => 
        value > 0 ? "approved" : newApprovalStatus[leaveType][index] || "pending"
      );
    });
    
    setApprovalStatus(newApprovalStatus);
    alert("All leaves approved!");
  };

  const handleRejectAll = () => {
    const newApprovalStatus = { ...approvalStatus };
    
    Object.keys(newApprovalStatus).forEach(leaveType => {
      newApprovalStatus[leaveType] = newApprovalStatus[leaveType].map(() => "pending");
    });
    
    setApprovalStatus(newApprovalStatus);
    alert("All leaves rejected!");
  };

  const handleEditAll = () => {
    setIsEditMode(true);
  };

  // Enhanced color coding function
  const getInputBackgroundColor = (leaveType, dayIndex, value) => {
    // For weekends - light gray background
    if (days[dayIndex].dayIndex === 0 || days[dayIndex].dayIndex === 6) {
      return "#f0f0f0";
    }
    
    // For leave cells with values
    if (value > 0) {
      const status = approvalStatus[leaveType]?.[dayIndex] || "pending";
      
      switch (status) {
        case "approved":
          return "#217034ff"; // Light green for approved
        case "rejected":
          return "#d15a64ff"; // Light red for rejected
        case "pending":
        default:
          return "#b39d54ff"; // Light yellow for pending approval
      }
    }
    
    // Default white background for weekdays with no leave
    return "#fff";
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

  const len = viewMode === "weekly" ? 7 : new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: len }, (_, i) => {
    const date =
      viewMode === "weekly"
        ? new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i)
        : new Date(monthStart.getFullYear(), monthStart.getMonth(), i + 1);
    const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
    return { 
      dayIndex: date.getDay(), 
      label: `${dayName} / ${date.getDate().toString().padStart(2, "0")}`,
      date: date
    };
  });

  const currentWorkedHours = viewMode === "weekly" ? workedHours : monthlyWorkedHours;
  const workedTotal = currentWorkedHours.reduce((a, b) => a + Number(b || 0), 0);
  const rowTotals = {};
  usedLeaveTypes.forEach((lt) => {
    rowTotals[lt] = leaveRows[lt].reduce((a, b) => a + Number(b || 0), 0);
  });
  const grandTotal = workedTotal + Object.values(rowTotals).reduce((a, b) => a + b, 0);

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
              />
            </Box>
          </Popover>
        </Box>
        <Typography variant="h6" fontWeight="bold">
          {viewMode === "weekly" ? "Weekly Timesheet" : "Monthly Timesheet"}
        </Typography>
        <Button
          variant="contained"
          onClick={handleViewModeChange}
        >
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
          <Box width={20} height={20} bgcolor="#f8d7da" border="1px solid #ccc" />
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
              {currentWorkedHours.map((h, i) => (
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
                      backgroundColor: days[i].dayIndex === 0 || days[i].dayIndex === 6 ? "#f0f0f0" : "#fff",
                      border: "1px solid #ccc",
                      borderRadius: 4,
                    }}
                    disabled={!isEditMode || days[i].dayIndex === 0 || days[i].dayIndex === 6}
                    onChange={(e) => {
                      const arr = viewMode === "weekly" ? [...workedHours] : [...monthlyWorkedHours];
                      arr[i] = e.target.value;
                      viewMode === "weekly" ? setWorkedHours(arr) : setMonthlyWorkedHours(arr);
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
                {leaveRows[lt].map((v, i) => (
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
                        const arr = [...leaveRows[lt]];
                        arr[i] = e.target.value;
                        setLeaveRows({ ...leaveRows, [lt]: arr });
                        
                        const newApprovalStatus = { ...approvalStatus };
                        if (newApprovalStatus[lt]) {
                          newApprovalStatus[lt][i] = "pending";
                          setApprovalStatus(newApprovalStatus);
                        }
                      }}
                    />
                    {!isEditMode && v > 0 && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {approvalStatus[lt]?.[i] === "approved" ? "✓ Approved" : 
                         approvalStatus[lt]?.[i] === "rejected" ? "✗ Rejected" : "Pending"}
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
                  (Number(currentWorkedHours[i]) || 0) +
                  usedLeaveTypes.reduce((sum, lt) => sum + (Number(leaveRows[lt][i]) || 0), 0);
                return <TableCell key={i} align="center">{total}</TableCell>;
              })}
              <TableCell align="center">{`${grandTotal}/45`}</TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Activity + Action Buttons */}
      <Box display="flex" justifyContent="space-between" mt={2}>
        <Box display="flex" gap={1}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
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
          {isEditMode ? (
            <Button 
              variant="contained" 
              color="success" 
              startIcon={<Save />}
              onClick={handleSaveAll}
            >
              Save
            </Button>
          ) : (
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
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<Edit />}
                onClick={handleEditAll}
              >
                Edit
              </Button>
            </>
          )}
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

      {/* Row Menu */}
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