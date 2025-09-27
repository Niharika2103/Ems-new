import React, { useState } from "react";
import {
  Typography,
  IconButton,
  Button,
  Menu,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  MenuItem,
  Select,
  FormControl,
} from "@mui/material";
import {
  BeachAccess,
  Healing,
  EventAvailable,
  Home,
  Work,
} from "@mui/icons-material";
import { ChevronLeft, ChevronRight, Menu as MenuIcon, MoreVert } from "@mui/icons-material";
import Calendar from "react-calendar";
import AttendanceSidebar from "./AttendanceSidebar";

const leaveTypes = [
  { label: "CL", icon: <BeachAccess fontSize="small" /> }, // Casual Leave
  { label: "SL", icon: <Healing fontSize="small" /> }, // Sick Leave
  { label: "PL", icon: <EventAvailable fontSize="small" /> }, // Privilege Leave
  { label: "WFH", icon: <Home fontSize="small" /> }, // Work From Home
  { label: "Comp Off", icon: <Work fontSize="small" /> }, // Comp Off
];

export default function AttendancePage() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Sidebar + leaves
  const allLeaveTypes = ["CL", "SL", "PL"]; // define all leave types
  const [usedLeaveTypes, setUsedLeaveTypes] = useState(["CL"]); // CL shows by default
  const [leaveRows, setLeaveRows] = useState({
    CL: Array(7).fill(""),
    SL: Array(7).fill(""),
    PL: Array(7).fill(""),
  });

  // Worked Hours
  const [hours, setHours] = useState(Array(7).fill(0));

  // Sidebar open
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Week navigation
  const [weekStart, setWeekStart] = useState(new Date());

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRow, setMenuRow] = useState(null);
  const open = Boolean(anchorEl);
 const [selected, setSelected] = useState("");

  const handleSelect = (event) => {
    const value = event.target.value;
    setSelected(value);
   
    
  };
  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setMenuRow(row);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRow(null);
  };

  const handleReset = () => {
    if (menuRow === "Worked Hours") {
      setHours(Array(7).fill(0));
    } else if (usedLeaveTypes.includes(menuRow)) {
      setLeaveRows((prev) => ({ ...prev, [menuRow]: Array(7).fill("") }));
    }
    handleMenuClose();
  };

  const handleAddLeaveType = (type) => {
    if (!usedLeaveTypes.includes(type)) {
      setUsedLeaveTypes([...usedLeaveTypes, type]);
    }
  };

  // Totals
  const workedTotal = hours.reduce((sum, v) => sum + (Number(v) || 0), 0);

  const grandTotal =
    workedTotal +
    usedLeaveTypes.reduce(
      (sum, lt) =>
        sum + leaveRows[lt].reduce((s, v) => s + (Number(v) || 0), 0),
      0
    );

  // Week navigation
  const changeWeek = (direction) => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + direction * 7);
    setWeekStart(newDate);
  };

  const formatDateRange = () => {
    const endDate = new Date(weekStart);
    endDate.setDate(weekStart.getDate() + 6);
    return `${weekStart.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };

  return (
    <div className="flex">
    
      {/* <AttendanceSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={handleAddLeaveType}
        disabledTypes={usedLeaveTypes}
      /> */}

      {/* Main Content */}
      <div className="flex-1 p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Weekly Attendance (Timesheet)</h2>
          <div className="md:hidden">
            <IconButton onClick={() => setSidebarOpen(true)}>
              <MenuIcon />
            </IconButton>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-center gap-4">
          <IconButton onClick={() => changeWeek(-1)}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="subtitle1" className="font-semibold">
            {formatDateRange()}
          </Typography>
          <IconButton onClick={() => changeWeek(1)}>
            <ChevronRight />
          </IconButton>
        </div>

        {/* Calendar */}
        <div className="mt-6 flex flex-col items-center">
          <Typography className="font-semibold text-center mb-2">
            Select Date from Calendar
          </Typography>
          <div className="scale-90">
            <Calendar onChange={setWeekStart} value={weekStart} />
          </div>
        </div>

        {/* Attendance Table */}
        <Table
          sx={{
            borderCollapse: "collapse",
            "& td, & th": { border: "none" },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell className="font-semibold">Project A</TableCell>
              {days.map((d, i) => {
                const date = new Date(weekStart);
                date.setDate(weekStart.getDate() + i);
                return (
                  <TableCell key={i} align="center" className="font-semibold">
                    <div className="flex flex-col items-center">
                      <span>{d}</span>
                      <span>
                        {date.getDate().toString().padStart(2, "0")}/
                        {(date.getMonth() + 1).toString().padStart(2, "0")}
                      </span>
                    </div>
                  </TableCell>
                );
              })}
              <TableCell align="center" className="font-semibold">Total</TableCell>
              <TableCell align="center" />
            </TableRow>
          </TableHead>


          <TableBody>
            {/* Worked Hours Row */}
            <TableRow>
              <TableCell className="font-semibold">Worked Hours</TableCell>
              {days.map((_, i) => (
                <TableCell key={i} align="center">
                  <input
                    type="number"
                    value={hours[i]}
                    min="0"
                    max="9"
                    className="w-12 h-8 text-center border rounded-md"
                    onChange={(e) => {
                      const newHours = [...hours];
                      newHours[i] = e.target.value;
                      setHours(newHours);
                    }}
                  />
                </TableCell>
              ))}
              <TableCell align="center">
                {workedTotal}/{45} hrs
              </TableCell>
              <TableCell align="center">
                <IconButton onClick={(e) => handleMenuOpen(e, "Worked Hours")}>
                  <MoreVert />
                </IconButton>
              </TableCell>
            </TableRow>

            {/* Dynamic Leave Rows */}
            {usedLeaveTypes.map((lt) => (
              <TableRow key={lt}>
                <TableCell className="font-semibold">{lt}</TableCell>
                {days.map((_, i) => (
                  <TableCell key={i} align="center">
                    <input
                      type="number"
                      value={leaveRows[lt][i]}
                      className="w-12 h-8 text-center border rounded-md"
                      onChange={(e) => {
                        const updated = [...leaveRows[lt]];
                        updated[i] = e.target.value;
                        setLeaveRows((prev) => ({ ...prev, [lt]: updated }));
                      }}
                    />
                  </TableCell>
                ))}
                <TableCell align="center">
                  {leaveRows[lt].reduce((s, v) => s + (Number(v) || 0), 0)}
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={(e) => handleMenuOpen(e, lt)}>
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {/* Total Row */}
            <TableRow>
              <TableCell className="font-bold">Target</TableCell>
              {days.map((_, i) => {
                const dayTotal =
                  (Number(hours[i]) || 0) +
                  usedLeaveTypes.reduce(
                    (sum, lt) => sum + (Number(leaveRows[lt][i]) || 0),
                    0
                  );
                return (
                  <TableCell key={i} align="center" className="font-bold">
                    {dayTotal}
                  </TableCell>
                );
              })}
              <TableCell align="center" className="font-bold">
                {grandTotal}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 mt-4">
          <TableRow>
   <TableCell>
  <FormControl fullWidth size="small">

        <Select
          labelId="leave-type-label"
          value={selected}
          onChange={handleSelect}
        >
          {leaveTypes.map((item) => (
            <MenuItem key={item.label} value={item.label}>
              <span className="flex items-center gap-2">
                {item.icon}
                {item.label}
              </span>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
     </TableCell>
</TableRow>
          <Button variant="contained" className="bg-green-500">
            Submit
          </Button>
        </div>

        {/* Menu for Edit / Reset */}
        <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
          <MenuItem
            onClick={() => {
              alert(`Edit clicked for ${menuRow}`);
              handleMenuClose();
            }}
          >
            Edit
          </MenuItem>
          <MenuItem onClick={handleReset}>Reset</MenuItem>
          <MenuItem onClick={handleReset}>Delete</MenuItem>
        </Menu>
      </div>
    </div>
  );
}
