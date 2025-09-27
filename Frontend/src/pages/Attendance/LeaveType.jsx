import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Popover,
} from "@mui/material";
import { ChevronLeft, ChevronRight, MoreVert, CalendarToday } from "@mui/icons-material";
import Calendar from "react-calendar";

export default function LeaveType() {
  const [weekStart, setWeekStart] = useState(new Date());
  const [leaveType, setLeaveType] = useState("CL");
  const [hours, setHours] = useState(Array(7).fill(0));
  const [usedLeaveTypes, setUsedLeaveTypes] = useState(["CL"]); // ✅ CL by default
  const [leaveRows, setLeaveRows] = useState({ CL: Array(7).fill(0) }); // ✅ CL row default
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRow, setMenuRow] = useState(null);
  const [lockedRows, setLockedRows] = useState({ CL: true }); // CL locked initially
  const [calendarAnchor, setCalendarAnchor] = useState(null);

  const leaveTypes = ["CL", "SL", "PL", "WFH", "Comp Off"];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Totals
  const workedTotal = hours.reduce((s, v) => s + (Number(v) || 0), 0);
  const rowTotals = usedLeaveTypes.reduce(
    (acc, lt) => ({ ...acc, [lt]: leaveRows[lt].reduce((s, v) => s + (Number(v) || 0), 0) }),
    {}
  );
  const grandTotal = workedTotal + Object.values(rowTotals).reduce((s, v) => s + v, 0);

  // Menu
  const handleMenuOpen = (e, row) => {
    setMenuAnchor(e.currentTarget);
    setMenuRow(row);
  };
  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuRow(null);
  };

  // Week navigation
  const changeWeek = (offset) => {
    const newDate = new Date(weekStart);
    newDate.setDate(weekStart.getDate() + offset * 7);
    setWeekStart(newDate);
  };

  const formatDateRange = () => {
    const endDate = new Date(weekStart);
    endDate.setDate(weekStart.getDate() + 6);
    const fmt = (d) =>
      `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${d.getFullYear()}`;
    return `${fmt(weekStart)} - ${fmt(endDate)}`;
  };

  const handleAddActivity = () => {
    if (leaveType && !usedLeaveTypes.includes(leaveType)) {
      setUsedLeaveTypes([...usedLeaveTypes, leaveType]);
      setLeaveRows((prev) => ({ ...prev, [leaveType]: Array(7).fill(0) }));
      setLockedRows((prev) => ({ ...prev, [leaveType]: false }));
    }
  };

  // ✅ Row Actions
  const handleDeleteRow = (row) => {
    setUsedLeaveTypes(usedLeaveTypes.filter((lt) => lt !== row));
    const updated = { ...leaveRows };
    delete updated[row];
    setLeaveRows(updated);
    handleMenuClose();
  };

  const handleResetRow = (row) => {
    setLeaveRows((prev) => ({ ...prev, [row]: Array(7).fill(0) }));
    handleMenuClose();
  };

  const handleEditRow = (row) => {
    setLockedRows((prev) => ({ ...prev, [row]: false }));
    handleMenuClose();
  };

  // ✅ General Save button outside menu
  const handleSaveAll = () => {
    const updated = {};
    usedLeaveTypes.forEach((lt) => {
      updated[lt] = true; // lock all rows
    });
    setLockedRows(updated);
  };

  return (
   <div className="flex flex-col gap-4 p-4">
  {/* TOP LINE: Calendar + Title */}
  <div className="flex items-center justify-between">
    {/* Calendar */}
    <div className="flex items-center gap-2">
      <IconButton onClick={() => changeWeek(-1)}>
        <ChevronLeft />
      </IconButton>
     <Typography variant="subtitle1" className="font-semibold">
            {formatDateRange()}
          </Typography>
      <IconButton onClick={() => changeWeek(1)}>
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
  <Popover
  open={Boolean(calendarAnchor)}
  anchorEl={calendarAnchor}
  onClose={() => setCalendarAnchor(null)}
  anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
>
  <div className="p-2">
    <Calendar
      onChange={setWeekStart}
      value={weekStart}
      className="custom-calendar"
    />
  </div>
</Popover>

</Popover>

    </div>
    

    {/* Center Typography */}
    <Typography variant="h6" className="font-bold text-center flex-1">
      Weekly Attendance (Timesheet)
    </Typography>

    {/* Placeholder to balance top line */}
    <div className="w-32" />
  </div>

  {/* TABLE-LIKE SECTION */}
  {/* <div className="bg-white shadow rounded-2xl p-4 mx-auto w-full md:w-4/5 flex flex-col gap-2"> */}
    {/* Header Row */}
    <div className="flex justify-between font-semibold border-b pb-2">
      <div className="flex-1">Project A</div>
      <div className="flex gap-4 justify-end flex-1">
        {days.map((d, i) => (
          <div key={i} className="text-center w-12">
            <div>{d}</div>
            <div>
              {(new Date(weekStart).getDate() + i)
                .toString()
                .padStart(2, "0")}/
              {(new Date(weekStart).getMonth() + 1).toString().padStart(2, "0")}
            </div>
          </div>
        ))}
        <div className="text-center w-16">Total</div>
        <div className="text-center w-16">Action</div>

      </div>
    </div>

    {/* Worked Hours Row */}
    <div className="flex justify-between items-center py-1">
      <div className="flex-1 font-semibold">Worked Hours</div>
      <div className="flex gap-5 justify-end flex-1">
        {hours.map((h, i) => (
          <input
            key={i}
            type="number"
            value={h}
            min="0"
            max="9"
            className="w-12 h-8 text-center border rounded-md"
            onChange={(e) => {
              const newHours = [...hours];
              newHours[i] = e.target.value;
              setHours(newHours);
            }}
          />
        ))}
        <div className="text-center w-16">{workedTotal}/45</div>
          <IconButton onClick={(e) => handleMenuOpen(e, lt)}>
            <MoreVert />
          </IconButton>
      </div>
    </div>

    {/* Leave Rows */}
    {usedLeaveTypes.map((lt) => (
      <div key={lt} className="flex justify-between items-center py-1">
        <div className="flex-1 font-semibold">{lt}</div>
        <div className="flex gap-5 justify-end flex-1">
          {leaveRows[lt].map((v, i) => (
            <input
              key={i}
              type="number"
              value={v}
              disabled={lockedRows[lt]}
              className="w-12 h-8 text-center border rounded-md"
              onChange={(e) => {
                const updated = [...leaveRows[lt]];
                updated[i] = e.target.value;
                setLeaveRows((prev) => ({ ...prev, [lt]: updated }));
              }}
            />
          ))}
          <div className="text-center w-16">{rowTotals[lt]}</div>
          <IconButton onClick={(e) => handleMenuOpen(e, lt)}>
            <MoreVert />
          </IconButton>
        </div>
      </div>
    ))}

    {/* Target Row */}
    <div className="flex justify-between items-center py-1 font-bold border-t pt-2">
      <div className="flex-1">Target</div>
      <div className="flex gap-4 justify-end flex-1">
        {days.map((_, i) => {
          const dayTotal =
            (Number(hours[i]) || 0) +
            usedLeaveTypes.reduce(
              (sum, lt) => sum + (Number(leaveRows[lt][i]) || 0),
              0
            );
          return (
            <div key={i} className="text-center w-12">
              {dayTotal}
            </div>
          );
        })}
        <div className="text-center w-16">{grandTotal}/45</div>
        <div className="text-center w-16"></div>

      </div>
    </div>
  {/* </div> */}

  {/* BOTTOM ROW: Left Dropdown + Add Activity, Right Save + Submit */}
  <div className="flex justify-between items-center mt-4 mx-auto w-full md:w-4/5 gap-4">
    {/* Left Side */}
    <div className="flex gap-2 flex-1">
      <FormControl>
        <InputLabel>Leave Type</InputLabel>
        <Select
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value)}
          label="Leave Type"
          className="w-40"
          size="small"
        >
          {leaveTypes.map((lt) => (
            <MenuItem key={lt} value={lt}>
              {lt}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button variant="contained" color="primary" onClick={handleAddActivity}>
        Add Activity
      </Button>
    </div>

    {/* Right Side */}
    <div className="flex gap-2 justify-between">
      <Button variant="contained" color="success" onClick={handleSaveAll}>
        Save All
      </Button>
      <Button variant="contained" color="secondary">
        Release end of the month
      </Button>
      <Button variant="contained" color="secondary">
        Release Week
      </Button>
    </div>
  </div>

  {/* Row Menu */}
  <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
    <MenuItem onClick={() => handleEditRow(menuRow)} disabled={!lockedRows[menuRow]}>
      Edit
    </MenuItem>
    <MenuItem onClick={() => handleResetRow(menuRow)}>Reset</MenuItem>
    {menuRow !== "Worked Hours" && (
      <MenuItem onClick={() => handleDeleteRow(menuRow)}>Delete</MenuItem>
    )}
  </Menu>
</div>


  );
}
