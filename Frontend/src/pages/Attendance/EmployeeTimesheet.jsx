import React, { useState } from "react";
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
import "./timesheet.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { AttendanceSaveall, AttendanceReleaseWeek } from "../../features/attendance/attendanceSlice";
import LeaveApplicationModal from "../../components/LeaveApplicationModal";
import { useNavigate } from "react-router-dom";

export default function EmpTimesheet() {
  const { projects } = useSelector((state) => state.project);
  const dispatch = useDispatch();
   const navigate = useNavigate();
  const projectName = projects[0]?.project?.name;

  // --- State ---
  const [leaveType, setLeaveType] = useState("CL");
  const [hours, setHours] = useState(Array(7).fill(0));
  const [usedLeaveTypes, setUsedLeaveTypes] = useState(["CL"]);
  const [leaveRows, setLeaveRows] = useState({ CL: Array(7).fill(0) });
  const [lockedRows, setLockedRows] = useState({ CL: false });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRow, setMenuRow] = useState(null);
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [calendarAnchor, setCalendarAnchor] = useState(null);

  // --- Modal State ---
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [modalLeaveType, setModalLeaveType] = useState("");

  const leaveTypes = ["CL", "SL", "PL", "WFH", "Extra Milar", "Paternity Leave", "Maternity Leave"];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // --- UTILITY FUNCTIONS ---
  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  function formatDateRange() {
    const monday = getMonday(weekStart);
    const endDate = new Date(monday);
    endDate.setDate(monday.getDate() + 6);
    const fmt = (d) =>
      `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
    return `${fmt(monday)} - ${fmt(endDate)}`;
  }

  // --- MENU ---
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
      setUsedLeaveTypes([...usedLeaveTypes, leaveType]);
      setLeaveRows((prev) => ({ ...prev, [leaveType]: Array(7).fill(0) }));
      setLockedRows((prev) => ({ ...prev, [leaveType]: false }));
    }
  };

  const handleModalSubmit = (data) => {
    console.log(`${modalLeaveType} submitted:`, data);

    if (!usedLeaveTypes.includes(modalLeaveType)) {
      setUsedLeaveTypes([...usedLeaveTypes, modalLeaveType]);
      const leaveHours = Array(7).fill(9); // mark all days with 9 hours
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
    setLeaveRows((prev) => ({ ...prev, [row]: Array(7).fill(0) }));
    handleMenuClose();
  };

  const handleEditRow = (row) => {
    setLockedRows((prev) => ({ ...prev, [row]: false }));
    handleMenuClose();
  };

  // --- SAVE FUNCTIONS ---
  const handleSaveAll = async () => {
    const employeeId = projects[0]?.employeeId;
    const projectId = projects[0]?.project?.id;
    const monday = getMonday(weekStart);

    const dataToSend = days.map((_, i) => {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);

      let appliedLeaveType = "";
      for (const lt of usedLeaveTypes) {
        if (leaveRows[lt][i] > 0) {
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
      const resultAction = await dispatch(
        AttendanceSaveall({ employeeId, projectId, formData: dataToSend })
      );
      if (AttendanceSaveall.fulfilled.match(resultAction)) {
        toast.success("Saved successfully");
      } else {
        throw new Error("Save failed");
      }
    } catch (err) {
      toast.error("Error saving attendance!");
    }
  };

const handleSaveWeek = async () => {
  const employeeId = projects[0]?.employeeId;
  const projectId = projects[0]?.project?.id;
  const monday = getMonday(weekStart);

  // Build the list of dates for the current week
  // const dataToSend = days.map(() => ({
  //   status: "pending_approval",
  //   monthlyStatus: null // backend expects this
  // }));

  try {
    // Dispatch release week action with minimal payload
    const resultAction = await dispatch(
      AttendanceReleaseWeek({ employeeId, projectId})
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


  // --- CALENDAR CHANGE ---
  const handleCalendarChange = (date) => {
    setWeekStart(getMonday(date));
    setCalendarAnchor(null);
  };

  // --- TOTALS ---
  const workedTotal = hours.reduce((s, v) => s + (Number(v) || 0), 0);
  const rowTotals = usedLeaveTypes.reduce(
    (acc, lt) => ({ ...acc, [lt]: leaveRows[lt].reduce((s, v) => s + (Number(v) || 0), 0) }),
    {}
  );
  const grandTotal = workedTotal + Object.values(rowTotals).reduce((s, v) => s + v, 0);

  // --- WEEK NAVIGATION ---
  const changeWeek = (offset) =>
    setWeekStart(getMonday(new Date(weekStart.setDate(weekStart.getDate() + offset * 7))));

  // -------------------- RENDER --------------------
  return (
    <div className="flex flex-col gap-4 p-4">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* TOP LINE */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconButton onClick={() => changeWeek(-1)}><ChevronLeft /></IconButton>
          <Typography variant="subtitle2">{formatDateRange()}</Typography>
          <IconButton onClick={() => changeWeek(1)}><ChevronRight /></IconButton>
          <IconButton onClick={(e) => setCalendarAnchor(e.currentTarget)}><CalendarToday /></IconButton>
          <Popover
            open={Boolean(calendarAnchor)}
            anchorEl={calendarAnchor}
            onClose={() => setCalendarAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <div className="p-2">
              <Calendar onChange={handleCalendarChange} value={weekStart} className="custom-calendar" />
            </div>
          </Popover>
        </div>

        <Typography variant="h6" className="font-bold text-center flex-1">
          Weekly Attendance (Timesheet)
        </Typography>

        <div className="w-32">
          <div className="flex items-center gap-2 bg-white shadow-sm rounded-2xl px-2 py-1">
            <span className="font-small text-[#51b4f2]">Employee</span>
            <img
              src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/..."
              alt="User"
              className="rounded-full w-8 h-8 border border-white"
            />
          </div>
        </div>
      </div>

      {/* TABLE HEADER */}
      <div className="flex justify-between font-semibold border-b pb-2 text-sm">
        <div className="flex-1">{projectName}</div>
        <div className="flex gap-2 justify-end flex-1">
          {days.map((day, i) => {
            const currentDate = new Date(getMonday(weekStart));
            currentDate.setDate(currentDate.getDate() + i);
            const formattedDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}`;
            return <div key={i} className="text-center w-19">{day} {formattedDate}</div>;
          })}
          <div className="text-center w-16">Total</div>
          <div className="text-center w-16">Action</div>
        </div>
      </div>

      {/* WORKED HOURS ROW */}
      <div className="flex justify-between items-center py-1 text-sm">
        <div className="flex-1 font-semibold">Worked Hours</div>
        <div className="flex gap-5 justify-end flex-1">
          {hours.map((h, i) => {
            const isWeekend = i >= hours.length - 2;
            return (
              <input
                key={i}
                type="number"
                value={h}
                min="0"
                max="9"
                disabled={isWeekend}
                className={`w-17 h-8 text-center border rounded-md ${isWeekend ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'}`}
                onChange={(e) => {
                  const newHours = [...hours];
                  newHours[i] = e.target.value;
                  setHours(newHours);
                }}
              />
            );
          })}
          <div className="text-center w-12">{workedTotal}/45</div>
          <IconButton onClick={(e) => handleMenuOpen(e, "Worked Hours")}><MoreVert /></IconButton>
        </div>
      </div>

      {/* LEAVE ROWS */}
      {usedLeaveTypes.map((lt) => (
        <div key={lt} className="flex justify-between items-center py-1 text-sm">
          <div className="flex-1 font-semibold">{lt}</div>
          <div className="flex gap-5 justify-end flex-1">
            {leaveRows[lt].map((v, i) => {
              const isWeekend = i >= leaveRows[lt].length - 2;
              return (
                <input
                  key={i}
                  type="number"
                  value={v}
                  min="0"
                  max="9"
                  disabled={lockedRows[lt] || isWeekend}
                  className={`w-17 h-8 text-center border rounded-md ${isWeekend ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'}`}
                  onChange={(e) => {
                    const updated = [...leaveRows[lt]];
                    updated[i] = e.target.value;
                    setLeaveRows((prev) => ({ ...prev, [lt]: updated }));
                  }}
                />
              );
            })}
            <div className="text-center w-12">{rowTotals[lt]}</div>
            <IconButton onClick={(e) => handleMenuOpen(e, lt)}><MoreVert /></IconButton>
          </div>
        </div>
      ))}

      {/* TARGET ROW */}
      <div className="flex justify-between items-center py-1 font-bold border-t pt-2 text-sm">
        <div className="flex-1">Target</div>
        <div className="flex justify-end flex-1">
          {days.map((_, i) => {
            const dayTotal = (Number(hours[i]) || 0) + usedLeaveTypes.reduce((sum, lt) => sum + (Number(leaveRows[lt][i]) || 0), 0);
            return <div key={i} className=" w-21">{dayTotal}</div>;
          })}
          <div className="text-center w-3">{grandTotal}/45</div>
          <div className="text-center w-20"></div>
        </div>
      </div>

      {/* BOTTOM ACTIONS */}
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
              {leaveTypes.map((lt) => <MenuItem key={lt} value={lt}>{lt}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" onClick={handleAddActivity}>Add Activity</Button>
        </div>

        <div className="flex gap-2 justify-between">
          <Button variant="contained" color="success" onClick={handleSaveAll}>Save All</Button>
          <Button variant="contained" color="secondary" onClick={handleSaveWeek}>Release Week</Button>
          <Button variant="contained"  color ="primary" onClick={()=>{navigate("/dashboard/timesheet/monthly")}} >View Monthly Attendance</Button>
        </div>
      </div>

      {/* ROW MENU */}
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
