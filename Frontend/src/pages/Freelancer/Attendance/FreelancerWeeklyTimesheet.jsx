// FreelancerweeklyTimesheet.jsx
import React, { useState } from "react";
import {
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

export default function FreelancerWeeklyTimesheet() {
  const [leaveType, setLeaveType] = useState("EL");
  const [hours, setHours] = useState(Array(7).fill(0));
  const [usedLeaveTypes, setUsedLeaveTypes] = useState(["EL"]);
  const [leaveRows, setLeaveRows] = useState({ EL: Array(7).fill(0) });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRow, setMenuRow] = useState(null);
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [calendarAnchor, setCalendarAnchor] = useState(null);

  const leaveTypes = ["EL", "SL", "WFH", "Extra Milar", "Optional Holidays"];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  function getMonday(d) {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  function formatDateRange() {
    const monday = getMonday(weekStart);
    const endDate = new Date(monday);
    endDate.setDate(monday.getDate() + 6);

    const fmt = (d) =>
      `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
        .toString().padStart(2, "0")}/${d.getFullYear()}`;

    return `${fmt(monday)} - ${fmt(endDate)}`;
  }

  const isWeekendDay = (dayIndex) => {
    return dayIndex >= 5;
  };

  const handleMenuOpen = (e, row) => {
    setMenuAnchor(e.currentTarget);
    setMenuRow(row);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuRow(null);
  };

  const handleAddActivity = () => {
    if (!leaveType) return;

    if (!usedLeaveTypes.includes(leaveType)) {
      setUsedLeaveTypes([...usedLeaveTypes, leaveType]);
      setLeaveRows((prev) => ({ ...prev, [leaveType]: Array(7).fill(0) }));
    }
  };

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

  const handleCalendarChange = (date) => {
    setWeekStart(getMonday(date));
    setCalendarAnchor(null);
  };

  const changeWeek = (offset) => {
    const newWeekStart = getMonday(new Date(weekStart.getTime() + offset * 7 * 24 * 60 * 60 * 1000));
    setWeekStart(newWeekStart);
  };

  const workedTotal = hours.reduce((s, v) => s + (Number(v) || 0), 0);
  const rowTotals = usedLeaveTypes.reduce(
    (acc, lt) => ({ ...acc, [lt]: leaveRows[lt].reduce((s, v) => s + (Number(v) || 0), 0) }),
    {}
  );
  const grandTotal = workedTotal + Object.values(rowTotals).reduce((s, v) => s + v, 0);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* TOP LINE */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconButton onClick={() => changeWeek(-1)}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="subtitle2">{formatDateRange()}</Typography>
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
            <div className="p-2">
              <Calendar onChange={handleCalendarChange} value={weekStart} />
            </div>
          </Popover>
        </div>

        <Typography variant="h6" className="font-bold text-center flex-1">
          Weekly Timesheet
        </Typography>

        <div className="w-32">
          <div className="flex items-center gap-2 bg-white shadow-sm rounded-2xl px-2 py-1">
            <span className="font-small text-[#51b4f2]">Freelancer</span>
          </div>
        </div>
      </div>

      {/* TABLE HEADER */}
      <div className="flex justify-between font-semibold border-b pb-2 text-sm">
        <div className="flex-1">Project Name</div>
        <div className="flex gap-2 justify-end flex-1">
          {days.map((day, i) => {
            const currentDate = new Date(getMonday(weekStart));
            currentDate.setDate(weekStart.getDate() + i);
            const formattedDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(
              currentDate.getMonth() + 1
            ).toString().padStart(2, "0")}`;
            return (
              <div key={i} className="text-center w-19">
                {day} {formattedDate}
              </div>
            );
          })}
          <div className="text-center w-16">Total</div>
          <div className="text-center w-16">Action</div>
        </div>
      </div>

      {/* WORKED HOURS */}
      <div className="flex justify-between items-center py-1 text-sm">
        <div className="flex-1 font-semibold">Worked Hours</div>
        <div className="flex gap-5 justify-end flex-1">
          {hours.map((h, i) => {
            const isWeekend = isWeekendDay(i);
            return (
              <input
                key={i}
                type="number"
                value={h}
                min="0"
                max="9"
                className={`w-17 h-8 text-center border rounded-md ${
                  isWeekend ? "text-gray-400 bg-gray-100" : "bg-white"
                }`}
                onChange={(e) => {
                  const newHours = [...hours];
                  newHours[i] = e.target.value;
                  setHours(newHours);
                }}
              />
            );
          })}
          <div className="text-center w-12">{workedTotal}/45</div>
          <IconButton onClick={(e) => handleMenuOpen(e, "Worked Hours")}>
            <MoreVert />
          </IconButton>
        </div>
      </div>

      {/* LEAVES */}
      {usedLeaveTypes.map((lt) => (
        <div key={lt} className="flex justify-between items-center py-1 text-sm">
          <div className="flex-1 font-semibold">{lt}</div>
          <div className="flex gap-5 justify-end flex-1">
            {leaveRows[lt].map((v, i) => {
              const isWeekend = isWeekendDay(i);
              return (
                <input
                  key={i}
                  type="text"
                  value={v}
                  className={`w-17 h-8 text-center border rounded-md ${
                    isWeekend ? "text-gray-400 bg-gray-100" : "bg-white"
                  }`}
                  onChange={(e) => {
                    const updated = [...leaveRows[lt]];
                    updated[i] = e.target.value;
                    setLeaveRows((prev) => ({ ...prev, [lt]: updated }));
                  }}
                />
              );
            })}
            <div className="text-center w-12">{rowTotals[lt]}</div>
            <IconButton onClick={(e) => handleMenuOpen(e, lt)}>
              <MoreVert />
            </IconButton>
          </div>
        </div>
      ))}

      {/* TARGET */}
      <div className="flex justify-between items-center py-1 font-bold border-t pt-2 text-sm">
        <div className="flex-1">Target</div>
        <div className="flex justify-end flex-1">
          {days.map((_, i) => {
            const dayTotal =
              (Number(hours[i]) || 0) +
              usedLeaveTypes.reduce((sum, lt) => {
                const val = leaveRows[lt][i];
                return sum + (Number(val) || 0);
              }, 0);
            return <div key={i} className="w-21">{dayTotal}</div>;
          })}
          <div className="text-center w-3">{grandTotal}/45</div>
          <div className="text-center w-20"></div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-between items-center mt-4 mx-auto w-full gap-4">
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

        <div className="flex gap-2 justify-between">
          <Button variant="contained" color="success">
            Save All
          </Button>
          <Button variant="contained" color="secondary">
            Release Week
          </Button>
          <Button variant="contained" color="primary">
            Monthly Timesheet
          </Button>
        </div>
      </div>

      {/* MENU */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleResetRow(menuRow)}>Reset</MenuItem>
        {menuRow !== "Worked Hours" && (
          <MenuItem onClick={() => handleDeleteRow(menuRow)}>Delete</MenuItem>
        )}
      </Menu>
    </div>
  );
}