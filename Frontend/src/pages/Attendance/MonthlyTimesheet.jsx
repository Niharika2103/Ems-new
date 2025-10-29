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
import { AttendanceFetchExistingMonth, AttendanceReleaseWeek, AttendanceReleaseMonth } from "../../features/attendance/attendanceSlice";
import LeaveApplicationModal from "../../components/LeaveApplicationModal";
import { applyParentalLeave } from "../../features/attendance/attendanceSlice";
export default function MonthlyTimesheet({ onBack }) {
  const { projects } = useSelector((state) => state.project);
  const dispatch = useDispatch();
  const [leaveType, setLeaveType] = useState("CL");
  const [hours, setHours] = useState([]);
  const [usedLeaveTypes, setUsedLeaveTypes] = useState(["CL"]);
  const [leaveRows, setLeaveRows] = useState({ CL: [] });
  const [lockedRows, setLockedRows] = useState({ CL: false });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRow, setMenuRow] = useState(null);
  // const [monthStart, setMonthStart] = useState(new Date(new Date().getFullYear(), 
  // new Date().getMonth(), 1));
  const [monthStart, setMonthStart] = useState(() => {
    const today = new Date();
    return today.getDate() >= 10
      ? new Date(today.getFullYear(), today.getMonth(), 10)
      : new Date(today.getFullYear(), today.getMonth() - 1, 10);
  });

  const [calendarAnchor, setCalendarAnchor] = useState(null);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [modalLeaveType, setModalLeaveType] = useState("");
  const [monthDays, setMonthDays] = useState([]);

  const leaveTypes = ["CL", "SL", "PL", "WFH", "Extra Milar", "Paternity Leave", "Maternity Leave"];
  const formatDate = (date) =>
    `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

  // const getMonthDays = (date) => {
  //   const year = date.getFullYear();
  //   const month = date.getMonth();
  //   const numDays = new Date(year, month + 1, 0).getDate();
  //   const days = [];
  //   for (let i = 1; i <= numDays; i++) {
  //     const d = new Date(year, month, i);
  //     const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
  //     days.push({
  //       date: d, // store the actual date
  //       day: i,
  //       label: `${i}/${month + 1}/${dayName}`,
  //       isWeekend: dayName === "Sat" || dayName === "Sun",
  //     });
  //   }
  //   return days;
  // };

  const getMonthDays = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 10);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 9);
  const days = [];
  let current = new Date(start);

  while (current <= end) {
    const dayName = current.toLocaleDateString("en-US", { weekday: "short" });
    days.push({
      date: new Date(current),
      label: `${current.getDate()}/${current.getMonth() + 1}/${dayName}`,
      isWeekend: dayName === "Sat" || dayName === "Sun",
    });
    current.setDate(current.getDate() + 1);
  }

  return days;
};

const formatMonthRange = () => {
  const start = new Date(monthStart.getFullYear(), monthStart.getMonth(), 10);
  const end = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 9);

  const startMonth = start.toLocaleString("default", { month: "short" });
  const endMonth = end.toLocaleString("default", { month: "short" });
  const year =
    end.getMonth() === 0 && start.getMonth() === 11
      ? `${start.getFullYear()}–${end.getFullYear()}`
      : start.getFullYear();

  return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${year}`;
};
// const getCycleInfo = (year) => {
//   for (let m = 0; m < 12; m++) {
//     const start = new Date(year, m, 10);
//     const end = new Date(year, m + 1, 9);
//     const diff =
//       Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1; // number of days
//     console.log(
//       `${start.toLocaleString("default", { month: "long" })}:\t${start.toDateString()} → ${end.toDateString()} = ${diff} days`
//     );
//   }
// };

  // Sync monthDays, hours, leaveRows whenever monthStart changes
  useEffect(() => {
    // getCycleInfo(2026); 
    const days = getMonthDays(monthStart);
    setMonthDays(days);
    setHours(Array(days.length).fill(0));

    setLeaveRows((prev) => {
      const updated = {};
      Object.keys(prev).forEach((lt) => {
        updated[lt] = Array(days.length).fill(prev[lt][0] || 0);
      });
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
  const { attendanceData, loading } = useSelector((state) => state.attendance);
  const [projectDetails, setProjectDetails] = useState(null);

  const projectName = projectDetails?.projectName;
  const ProjectID = projectDetails?.projectID;
  const employeeId = projectDetails?.employeeId;


  // Fetch from localStorage when page loads
  useEffect(() => {
    const storedData = localStorage.getItem("ProjectDetails");
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setProjectDetails(parsed);
    } else {
      console.log("No ProjectDetails found");
    }
  }, []);
  useEffect(() => {
    if (employeeId) {
      // const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 9)
      dispatch(
        AttendanceFetchExistingMonth({
          employeeId,
          startDate: formatDate(monthStart),
          endDate: formatDate(monthEnd),
        })
      )
        .then((res) => console.log("Existing Month data:", res.payload))
        .catch((err) => console.error(err));
    }
  }, [employeeId, monthStart, dispatch]);

  // include monthStart here
  useEffect(() => {
    if (attendanceData && monthDays.length > 0) {
      // Worked hours row
      const newHours = monthDays.map((day) => {
        const record = attendanceData.find((a) => a.date === formatDate(day.date));
        return record?.workedHours || 0;
      });
      setHours(newHours);

      // Leave rows
      const newLeaveRows = {};
      const newUsedLeaveTypes = [];

      leaveTypes.forEach((lt) => {
        const row = monthDays.map((day) => {
          // Find a record for this date and leaveType
          const record = attendanceData.find(
            (a) => a.date === formatDate(day.date) && a.leaveType === lt
          );
          return record ? record.hours || 9 : 0; // if leave exists, show hours, else 0
        });

        // Include leaveType if it exists in any record
        if (row.some((v) => v > 0)) {
          newLeaveRows[lt] = row;
          newUsedLeaveTypes.push(lt);
        }
      });

      setLeaveRows(newLeaveRows);
      setUsedLeaveTypes(newUsedLeaveTypes);
    }
  }, [attendanceData, monthDays]);




  const handleSaveMonth = async () => {
    const ProjectID = projectDetails?.projectID;
    const employeeId = projectDetails?.employeeId;
    const today = new Date();
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 9);
    const formatDate = (date) =>
      `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

    try {
      const resultAction = await dispatch(AttendanceReleaseMonth({
        employeeId: employeeId,
        projectId: ProjectID,
        monthStart: formatDate(monthStart),
        monthEnd: formatDate(monthEnd)
      }));

      if (AttendanceReleaseWeek.fulfilled.match(resultAction)) {
        toast.success("Month released successfully!");
      } else {
        throw new Error("Failed to release month");
      }
    } catch (err) {
      console.log(err); // log the actual error
      toast.error("Error releasing month!");
    }
  };

  
  const handleAddActivity = () => {
    if (leaveType === "Maternity Leave" || leaveType === "Paternity Leave") {
      setModalLeaveType(leaveType);
      setLeaveModalOpen(true);
      return;
    }
    if (leaveType && !usedLeaveTypes.includes(leaveType)) {
      setUsedLeaveTypes([...usedLeaveTypes, leaveType]);
      setLeaveRows((prev) => ({ ...prev, [leaveType]: Array(monthDays.length).fill(0) }));
      setLockedRows((prev) => ({ ...prev, [leaveType]: false }));
    }
  };

  // const handleModalSubmit = () => {
  //   if (!usedLeaveTypes.includes(modalLeaveType)) {
  //     setUsedLeaveTypes([...usedLeaveTypes, modalLeaveType]);
  //     setLeaveRows((prev) => ({ ...prev, [modalLeaveType]: Array(monthDays.length).fill(0) }));
  //     setLockedRows((prev) => ({ ...prev, [modalLeaveType]: true }));
  //   }
  //   setLeaveModalOpen(false);
  // };

  const handleModalSubmit = async ({ startDate }) => {
    const employeeId = projects[0]?.employeeId;
    if (!employeeId) {
      toast.error("Employee ID missing!");
      return;
    }

    const leave_type = modalLeaveType === "Maternity Leave" ? "maternity" : "paternity";

    try {
      const resultAction = await dispatch(
        applyParentalLeave({ employee_id: employeeId, leave_type, start_date: startDate })
      );

      if (applyParentalLeave.fulfilled.match(resultAction)) {
        toast.success(`${modalLeaveType} applied successfully!`);
      } else {
        toast.error("Failed to apply leave");
      }
    } catch (err) {
      toast.error("Error applying leave");
    }
    setLeaveModalOpen(false);
  };

  const handleDeleteRow = (row) => {
    setUsedLeaveTypes(usedLeaveTypes.filter((lt) => lt !== row));
    const updated = { ...leaveRows };
    delete updated[row];
    setLeaveRows(updated);
    handleMenuClose();
  };

  const handleResetRow = (row) => {
    setLeaveRows((prev) => ({ ...prev, [row]: Array(monthDays.length).fill(0) }));
    handleMenuClose();
  };

  const handleEditRow = (row) => {
    setLockedRows((prev) => ({ ...prev, [row]: false }));
    handleMenuClose();
  };

  const changeMonth = (offset) => {
    const newDate = new Date(monthStart);
    newDate.setMonth(newDate.getMonth() + offset);
    setMonthStart(newDate);
  };


  const handleCalendarChange = (date) => {
    setMonthStart(new Date(date.getFullYear(), date.getMonth(), 1));
    setCalendarAnchor(null);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconButton onClick={() => changeMonth(-1)}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="subtitle2">{formatMonthRange()}</Typography>
          <IconButton onClick={() => changeMonth(1)}>
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
              className={`min-w-[70px] text-center mx-1 ${d.isWeekend ? "text-gray-400" : "text-black"}`}
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
              className={`min-w-[70px] h-8 text-center border rounded-md mx-1 ${monthDays[i].isWeekend ? "bg-gray-200 cursor-not-allowed" : "bg-white"
                }`}
              onChange={(e) => {
                const newHours = [...hours];
                newHours[i] = e.target.value;
                setHours(newHours);
              }}
            />
          ))}
          <IconButton onClick={(e) => handleMenuOpen(e, "Worked Hours")}>
            <MoreVert />
          </IconButton>
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
                className={`min-w-[70px] h-8 text-center border rounded-md mx-1 ${monthDays[i].isWeekend ? "bg-gray-200 cursor-not-allowed" : "bg-white"
                  }`}
                onChange={(e) => {
                  const updated = [...leaveRows[lt]];
                  updated[i] = e.target.value;
                  setLeaveRows((prev) => ({ ...prev, [lt]: updated }));
                }}
              />
            ))}
            <IconButton onClick={(e) => handleMenuOpen(e, lt)}>
              <MoreVert />
            </IconButton>
          </div>
        ))}

        {/* TARGET ROW */}
        <div className="flex items-center py-2 border-t font-bold text-sm">
          <div className="min-w-[150px]">Target</div>
          {monthDays.map((d, i) => (
            <div key={i} className={`min-w-[70px] text-center mx-1 ${d.isWeekend ? "text-gray-400" : "text-black"}`}>
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

        <div className="flex gap-2">
          <Button variant="contained" color="secondary" onClick={handleSaveMonth}>
            Release Month
          </Button>
        </div>
      </div>

      {/* MENU */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleEditRow(menuRow)} disabled={!lockedRows[menuRow]}>
          Edit
        </MenuItem>
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
