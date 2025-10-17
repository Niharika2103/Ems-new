import React, { useState, useEffect } from "react";
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
  Box,
} from "@mui/material";
import { ChevronLeft, ChevronRight, MoreVert, CalendarToday } from "@mui/icons-material";
import Calendar from "react-calendar";
import "./timesheet.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { AttendanceSaveall, AttendanceReleaseWeek, AttendanceReleaseMonth } from "../../features/attendance/attendanceSlice";
import LeaveApplicationModal from "../../components/LeaveApplicationModal";

export default function MonthlyTimesheet({ onBack }) {
  const { projects } = useSelector((state) => state.project);
  const dispatch = useDispatch();
  const projectName = projects[0]?.project?.name;

  const [leaveType, setLeaveType] = useState("CL");
  const [hours, setHours] = useState([]);
  const [usedLeaveTypes, setUsedLeaveTypes] = useState(["CL"]);
  const [leaveRows, setLeaveRows] = useState({ CL: [] });
  const [lockedRows, setLockedRows] = useState({ CL: false });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRow, setMenuRow] = useState(null);
  const [monthStart, setMonthStart] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [calendarAnchor, setCalendarAnchor] = useState(null);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [modalLeaveType, setModalLeaveType] = useState("");

  const leaveTypes = ["CL", "SL", "PL", "WFH", "Extra Milar", "Paternity Leave", "Maternity Leave"];

  const getMonthDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 1; i <= numDays; i++) {
      const d = new Date(year, month, i);
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      days.push({ day: i, label: `${i}/${month + 1}/${dayName}`, isWeekend: dayName === "Sat" || dayName === "Sun" });
    }
    return days;
  };

  const monthDays = getMonthDays(monthStart);

  const formatMonthRange = () => {
    const monthName = monthStart.toLocaleString("default", { month: "long" });
    return `${monthName} ${monthStart.getFullYear()}`;
  };

  useEffect(() => {
    const daysInMonth = getMonthDays(monthStart).length;
    setHours(Array(daysInMonth).fill(0));
    setLeaveRows((prev) => {
      const updated = {};
      Object.keys(prev).forEach((lt) => (updated[lt] = Array(daysInMonth).fill(0)));
      return updated;
    });
  }, [monthStart]);

  const handleMenuOpen = (e, row) => {
    setMenuAnchor(e.currentTarget);
    setMenuRow(row);
  };
  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuRow(null);
  };

  const handleAddActivity = () => {
    if (leaveType === "Maternity Leave" || leaveType === "Paternity Leave") {
      setModalLeaveType(leaveType);
      setLeaveModalOpen(true);
      return;
    }
    if (leaveType && !usedLeaveTypes.includes(leaveType)) {
      const daysInMonth = getMonthDays(monthStart).length;
      setUsedLeaveTypes([...usedLeaveTypes, leaveType]);
      setLeaveRows((prev) => ({ ...prev, [leaveType]: Array(daysInMonth).fill(0) }));
      setLockedRows((prev) => ({ ...prev, [leaveType]: false }));
    }
  };

  const handleModalSubmit = () => {
    if (!usedLeaveTypes.includes(modalLeaveType)) {
      const daysInMonth = getMonthDays(monthStart).length;
      setUsedLeaveTypes([...usedLeaveTypes, modalLeaveType]);
      const leaveHours = Array(daysInMonth).fill(0);
      setLeaveRows((prev) => ({ ...prev, [modalLeaveType]: leaveHours }));
      setLockedRows((prev) => ({ ...prev, [modalLeaveType]: true }));
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
    const daysInMonth = getMonthDays(monthStart).length;
    setLeaveRows((prev) => ({ ...prev, [row]: Array(daysInMonth).fill(0) }));
    handleMenuClose();
  };

  const handleEditRow = (row) => {
    setLockedRows((prev) => ({ ...prev, [row]: false }));
    handleMenuClose();
  };

  const handleSaveAll = async () => {
    const employeeId = projects[0]?.employeeId;
    const projectId = projects[0]?.project?.id;
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();

    const dataToSend = monthDays.map((d, i) => {
      const currentDate = new Date(year, month, d.day);
      let appliedLeaveType = "";
      for (const lt of usedLeaveTypes) {
        if (leaveRows[lt]?.[i] > 0) {
          appliedLeaveType = lt;
          break;
        }
      }
      return {
        date: currentDate.toISOString().split("T")[0],
        workedHours: Number(hours[i]) || 0,
        leaveType: appliedLeaveType || "",
      };
    });

    try {
      const resultAction = await dispatch(AttendanceSaveall({ employeeId, projectId, formData: dataToSend }));
      if (AttendanceSaveall.fulfilled.match(resultAction)) toast.success("Saved successfully!");
      else throw new Error("Save failed");
    } catch (err) {
      toast.error("Error saving monthly attendance!");
    }
  };

  const handleReleaseMonth = async () => {
    const employeeId = projects[0]?.employeeId;
    const projectId = projects[0]?.project?.id;
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();

    const dataToSend = monthDays.map((d, i) => {
      const currentDate = new Date(year, month, d.day);
      let appliedLeaveType = "";
      for (const lt of usedLeaveTypes) {
        if (leaveRows[lt]?.[i] > 0) {
          appliedLeaveType = lt;
          break;
        }
      }
      return {
        date: currentDate.toISOString().split("T")[0],
        workedHours: Number(hours[i]) || 0,
        leaveType: appliedLeaveType || "",
      };
    });

    try {
      const resultAction = await dispatch(AttendanceReleaseWeek({ employeeId, projectId, formData: dataToSend }));
      if (AttendanceReleaseWeek.fulfilled.match(resultAction)) toast.success("Month released successfully!");
      else throw new Error("Failed to release month");
    } catch (err) {
      toast.error("Error releasing month!");
    }
  };

  const handleCalendarChange = (date) => {
    setMonthStart(new Date(date.getFullYear(), date.getMonth(), 1));
    setCalendarAnchor(null);
  };

  const changeMonth = (offset) => {
    const newDate = new Date(monthStart);
    newDate.setMonth(monthStart.getMonth() + offset);
    setMonthStart(newDate);
  };

  const handleSaveMonth = async () => {
    const employeeId = projects[0]?.employeeId;
    const projectId = projects[0]?.project?.id;
  
   
//  const dataToSend = monthDays.map(() => ({
//     status: "pending_approval",
//     monthlyStatus: "Pending_Approval" // backend expects this
//   }));
  
    try {
      const resultAction = await dispatch(
        AttendanceReleaseMonth({ employeeId, projectId})
      );
  
      if (AttendanceReleaseWeek.fulfilled.match(resultAction)) {
        toast.success("Week released successfully!");
      } else {
        throw new Error("Failed to release week");
      }
    } catch (err) {
      toast.error("Error releasing week!");
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconButton onClick={() => changeMonth(-1)}><ChevronLeft /></IconButton>
          <Typography variant="subtitle2">{formatMonthRange()}</Typography>
          <IconButton onClick={() => changeMonth(1)}><ChevronRight /></IconButton>
          <IconButton onClick={(e) => setCalendarAnchor(e.currentTarget)}><CalendarToday /></IconButton>
          <Popover
            open={Boolean(calendarAnchor)}
            anchorEl={calendarAnchor}
            onClose={() => setCalendarAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <div className="p-2">
              <Calendar onChange={handleCalendarChange} value={monthStart} className="custom-calendar" />
            </div>
          </Popover>
        </div>

        <Typography variant="h6" className="font-bold text-center flex-1">
          Monthly Attendance (Timesheet)
        </Typography>
      </div>

      {/* SCROLLABLE MAIN AREA */}
      <Box sx={{ overflowX: "auto", border: "1px solid #ccc", borderRadius: 2, p: 2 }}>
        {/* DATES HEADER */}
        <div className="flex font-semibold border-b pb-2 text-sm">
          <div className="min-w-[150px]">{projectName}</div>
          {monthDays.map((d) => (
            <div
              key={d.day}
              className={`min-w-[70px] text-center mx-1 ${
                d.isWeekend ? "text-gray-400" : "text-black"
              }`}
            >
              {d.label}
            </div>
          ))}
          <div className="min-w-[70px] text-center">Action</div>
        </div>

        {/* WORKED HOURS */}
        <div className="flex items-center py-1 text-sm">
          <div className="min-w-[150px] font-semibold">Worked Hours</div>
          {hours.map((h, i) => (
            <input
              key={i}
              type="number"
              value={h}
              min="0"
              max="9"
              disabled={monthDays[i].isWeekend}
              className={`min-w-[70px] h-8 text-center border rounded-md mx-1 ${
                monthDays[i].isWeekend ? "bg-gray-200 cursor-not-allowed" : "bg-white"
              }`}
              onChange={(e) => {
                const newHours = [...hours];
                newHours[i] = e.target.value;
                setHours(newHours);
              }}
            />
          ))}
          <IconButton onClick={(e) => handleMenuOpen(e, "Worked Hours")}><MoreVert /></IconButton>
        </div>

        {/* LEAVE ROWS */}
        {usedLeaveTypes.map((lt) => (
          <div key={lt} className="flex items-center py-1 text-sm">
            <div className="min-w-[150px] font-semibold">{lt}</div>
            {leaveRows[lt]?.map((v, i) => (
              <input
                key={i}
                type="number"
                value={v}
                min="0"
                max="9"
                disabled={lockedRows[lt] || monthDays[i].isWeekend}
                className={`min-w-[70px] h-8 text-center border rounded-md mx-1 ${
                  monthDays[i].isWeekend ? "bg-gray-200 cursor-not-allowed" : "bg-white"
                }`}
                onChange={(e) => {
                  const updated = [...leaveRows[lt]];
                  updated[i] = e.target.value;
                  setLeaveRows((prev) => ({ ...prev, [lt]: updated }));
                }}
              />
            ))}
            <IconButton onClick={(e) => handleMenuOpen(e, lt)}><MoreVert /></IconButton>
          </div>
        ))}

        {/* TARGET ROW */}
        <div className="flex items-center py-2 border-t font-bold text-sm">
          <div className="min-w-[150px]">Target</div>
          {monthDays.map((d, i) => (
            <div
              key={i}
              className={`min-w-[70px] text-center mx-1 ${
                d.isWeekend ? "text-gray-400" : "text-black"
              }`}
            >
              0
            </div>
          ))}
        </div>
      </Box>

      {/* BOTTOM BUTTONS */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-2">
          <FormControl size="small">
            <InputLabel>Leave Type</InputLabel>
            <Select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              label="Leave Type"
              className="w-40"
            >
              {leaveTypes.map((lt) => (
                <MenuItem key={lt} value={lt}>{lt}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" onClick={handleAddActivity}>Add Activity</Button>
        </div>

        <div className="flex gap-2">
          <Button variant="contained" color="secondary" onClick={handleSaveMonth}>Release Month</Button>
        </div>
      </div>

      {/* MENU */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleEditRow(menuRow)} disabled={!lockedRows[menuRow]}>Edit</MenuItem>
        <MenuItem onClick={() => handleResetRow(menuRow)}>Reset</MenuItem>
        {menuRow !== "Worked Hours" && <MenuItem onClick={() => handleDeleteRow(menuRow)}>Delete</MenuItem>}
      </Menu>

      {/* LEAVE MODAL */}
      <LeaveApplicationModal
        open={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        leaveType={modalLeaveType}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}