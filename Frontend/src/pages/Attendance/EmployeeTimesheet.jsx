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
} from "@mui/material";
import { ChevronLeft, ChevronRight, MoreVert, CalendarToday } from "@mui/icons-material";
import Calendar from "react-calendar";
import "./timesheet.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import {
  AttendanceSaveall,
  AttendanceReleaseWeek,
  AttendanceFetchByEmployeeProject,
  setAttendanceData,
  // AttendancCurrentWeek,
  AttendanceFetchExistingWeek,
} from "../../features/attendance/attendanceSlice";
import LeaveApplicationModal from "../../components/LeaveApplicationModal";
import { useNavigate } from "react-router-dom";

export default function EmpTimesheet() {
  const { projects } = useSelector((state) => state.project);
  const dispatch = useDispatch();
  const navigate = useNavigate();
   const { attendanceData, loading } = useSelector((state) => state.attendance);
   console.log(attendanceData,"attendanceData") // 👈 fetched data
  const projectName = projects[0]?.project?.name;
  const ProjectID = projects[0]?.project?.id;
  const employeeId = projects[0]?.employeeId;

  const [leaveType, setLeaveType] = useState("CL");
  const [hours, setHours] = useState(Array(7).fill(0));
  const [usedLeaveTypes, setUsedLeaveTypes] = useState(["CL"]);
  const [leaveRows, setLeaveRows] = useState({ CL: Array(7).fill(0) });
  const [lockedRows, setLockedRows] = useState({ CL: false });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRow, setMenuRow] = useState(null);
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [calendarAnchor, setCalendarAnchor] = useState(null);
  const [isWeekComplete, setIsWeekComplete] = useState(false);
 const[selectDate,setSelectDate]=useState(new Date());
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [modalLeaveType, setModalLeaveType] = useState("");

  // NEW: store leave periods for multi-week leaves
  const [leavePeriods, setLeavePeriods] = useState([]);
  const leaveTypes = ["CL", "SL", "PL", "WFH", "Extra Milar", "Paternity Leave", "Maternity Leave"];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // useEffect(() => {
  // if (employeeId && ProjectID) {
  //   // dispatch(AttendanceFetchByEmployeeProject({ employeeId, projectId: ProjectID }));
  //   dispatch(AttendancCurrentWeek({ employeeId, projectId: ProjectID }))
  // .then((res) => {
  //   console.log("✅ Success:", res);
  // })
  // .catch((err) => {
  //   console.error("❌ Error:", err);
  // });


//   }
// }, [dispatch, employeeId, ProjectID]);

// Populate hours + leaveRows when attendanceData arrives




  useEffect(() => {
    const filled = [0, 1, 2, 3, 4].every(
      (i) => Number(hours[i]) > 0 || usedLeaveTypes.some((lt) => {
        const val = leaveRows[lt][i];
        return val !== 0 && val !== ""; // text leave codes count as filled
      })
    );
    setIsWeekComplete(filled);
  }, [hours, leaveRows, usedLeaveTypes]);

  function getMonday(d) {
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  return new Date(d.setDate(diff));
}

function formatDateRange() {
  const monday = getMonday(weekStart);
  const endDate = new Date(monday);
  endDate.setDate(monday.getDate() + 6); // add 6 days to monday

  const fmt = (d) =>
    `${d.getDate().toString().padStart(2, "0")}/${
      (d.getMonth() + 1).toString().padStart(2, "0")
    }/${d.getFullYear()}`;

  return `${fmt(monday)} - ${fmt(endDate)}`;
}

 

//while chnaging date get all datas 
useEffect(() => {
  if (employeeId && ProjectID && weekStart) {
    const mondayDate = selectDate.getFullYear() + '-' +
                   String(selectDate.getMonth() + 1).padStart(2, '0') + '-' +
                   String(selectDate.getDate()).padStart(2, '0');
    dispatch(
      AttendanceFetchExistingWeek({ 
        employeeId, 
        projectId: ProjectID, 
        startDate: mondayDate 
      })
    )
      .then((res) => console.log("Existing week data:", res.payload))
      .catch((err) => console.error(err));
  }
}, [employeeId, ProjectID, weekStart, dispatch]); // 🔹 depends on weekStart

useEffect(() => {
  if (attendanceData?.length > 0) {
    const newHours = Array(7).fill(0);
    const newLeaveRows = {}; // dynamic object to store leave rows
    // const monday = getMonday(weekStart);

    const dayDiff = (d1, d2) => {
      const date1 = new Date(d1.toDateString());
      const date2 = new Date(d2.toDateString());
      return Math.floor((date1 - date2) / (1000 * 60 * 60 * 24));
    };

    attendanceData.forEach((entry) => {
      const entryDate = new Date(entry.date);
      const dayIndex = dayDiff(entryDate, weekStart);

      if (dayIndex >= 0 && dayIndex < 7) {
        // Worked hours
        newHours[dayIndex] = entry.workedHours || 0;

        // Leave hours
        if (entry.leaveType && entry.leaveType !== "") {
          if (!newLeaveRows[entry.leaveType]) {
            newLeaveRows[entry.leaveType] = Array(7).fill(0);
          }
          // Set the leave value for that day
          newLeaveRows[entry.leaveType][dayIndex] = entry.totalWorkedHours || 9;
        }
      }
    });

    setHours(newHours);
    setLeaveRows(newLeaveRows);
    setUsedLeaveTypes(Object.keys(newLeaveRows));
    console.log("✅ Week hours and leaveRows dynamically updated:", newHours, newLeaveRows);
  }
}, [attendanceData, weekStart]);

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

  // Handle modal submit for ML/PL
  const handleModalSubmit = ({ startDate }) => {
    const start = new Date(startDate);
    let duration = 0;
    let leaveCode = "";

    if (modalLeaveType === "Maternity Leave") {
      duration = 180;
      leaveCode = "ML";
    } else if (modalLeaveType === "Paternity Leave") {
      duration = 7;
      leaveCode = "PL";
    }

    const end = new Date(start);
    end.setDate(start.getDate() + duration - 1);

    setLeavePeriods((prev) => [...prev, { type: modalLeaveType, startDate: start, endDate: end }]);

    if (!usedLeaveTypes.includes(modalLeaveType)) {
      setUsedLeaveTypes([...usedLeaveTypes, modalLeaveType]);
      setLockedRows((prev) => ({ ...prev, [modalLeaveType]: true }));
      setLeaveRows((prev) => ({ ...prev, [modalLeaveType]: Array(7).fill("") }));
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
    setLeaveRows((prev) => ({ ...prev, [row]: Array(7).fill(0) }));
    handleMenuClose();
  };

  const handleEditRow = (row) => {
    setLockedRows((prev) => ({ ...prev, [row]: false }));
    handleMenuClose();
  };

       
  const handleSaveAll = async () => {
  const employeeId = projects[0]?.employeeId;
  const projectId = projects[0]?.project?.id;
  const monday = getMonday(weekStart);

  const dataToSend = days.map((_, i) => {
    const currentDate = new Date(monday);
    currentDate.setDate(monday.getDate() + i);

    let appliedLeaveType = "";
    for (const lt of usedLeaveTypes) {
      const period = leavePeriods.find(p => p.type === lt);
      if (period && currentDate >= period.startDate && currentDate <= period.endDate) {
        appliedLeaveType = lt;
        break;
      } else if (leaveRows[lt][i] && leaveRows[lt][i] !== 0 && leaveRows[lt][i] !== "") {
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
      AttendanceSaveall({ employeeId, projectId, formData: dataToSend }) // ✅ use projectId
    );

    // Check for error in payload
    if (resultAction.error) {
      console.error("Save error:", resultAction.error);
      toast.error("Error saving attendance!");
    } else {
      toast.success("Saved successfully");
      dispatch(setAttendanceData(dataToSend));
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    toast.error("Error saving attendance!");
  }
};


  const handleSaveWeek = async () => {
  const employeeId = projects[0]?.employeeId;
  const weekStartDate = getMonday(weekStart);
  const weekEnd = new Date(weekStartDate);
  weekEnd.setDate(weekStartDate.getDate() + 6); // Sunday

  // Format in local time yyyy-MM-dd
  const formattedWeekEnd = `${weekEnd.getFullYear()}-${(weekEnd.getMonth()+1)
    .toString().padStart(2,'0')}-${weekEnd.getDate().toString().padStart(2,'0')}`;
  const formattedStartEnd = `${weekStartDate.getFullYear()}-${(weekStartDate.getMonth()+1)
    .toString().padStart(2,'0')}-${weekStartDate.getDate().toString().padStart(2,'0')}`;

  try {
    const resultAction = await dispatch(AttendanceReleaseWeek({
      employeeId,
      weekStart: formattedStartEnd,
      weekEnd: formattedWeekEnd
    }));

    if (AttendanceReleaseWeek.fulfilled.match(resultAction)) {
      toast.success("Week released successfully!");
    } else {
      throw new Error("Failed to release week");
    }
  } catch (err) {
    console.log(err); // log the actual error
    toast.error("Error releasing week!");
  }
};


  const handleCalendarChange = (date) => {
    setSelectDate(date);
    setWeekStart(getMonday(date));
    setCalendarAnchor(null);
  };

  const workedTotal = hours.reduce((s, v) => s + (Number(v) || 0), 0);
  const rowTotals = usedLeaveTypes.reduce(
    (acc, lt) => ({ ...acc, [lt]: leaveRows[lt].reduce((s, v) => s + (Number(v) || 0), 0) }),
    {}
  );
  const grandTotal = workedTotal + Object.values(rowTotals).reduce((s, v) => s + v, 0);
  const changeWeek = (offset) =>
    setWeekStart(getMonday(new Date(weekStart.setDate(weekStart.getDate() + offset * 7))));

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
              <Calendar onChange={handleCalendarChange} value={weekStart} className="custom-calendar"  tileDisabled={({ date, view }) => {
    if (view === 'month') {
      const selectedWeekMonday = getMonday(date);
      const currentWeekMonday = getMonday(new Date());
      // Disable if the week is in future
      return selectedWeekMonday > currentWeekMonday;
    }
    return false;
  }}/>
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
            const isWeekend = i >= 5;
            return (
              <input
                key={i}
                type="number"
                value={h}
                min="0"
                max="9"
                disabled={isWeekend}
                className={`w-17 h-8 text-center border rounded-md ${
                  isWeekend ? "bg-gray-200 cursor-not-allowed" : "bg-white"
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
          <IconButton onClick={(e) => handleMenuOpen(e, "Worked Hours")}><MoreVert /></IconButton>
        </div>
      </div>

      {/* LEAVES */}
      {usedLeaveTypes.map((lt) => (
        <div key={lt} className="flex justify-between items-center py-1 text-sm">
          <div className="flex-1 font-semibold">{lt}</div>
          <div className="flex gap-5 justify-end flex-1">
            {leaveRows[lt].map((v, i) => {
              const isWeekend = i >= 5;
              const currentDate = new Date(weekStart);
              currentDate.setDate(currentDate.getDate() + i);

              const period = leavePeriods.find(p => p.type === lt);
              const isInLeave = period && currentDate >= period.startDate && currentDate <= period.endDate;
              const displayValue = isInLeave ? (lt === "Maternity Leave" ? "ML" : lt === "Paternity Leave" ? "PL" : v) : v;
              const isSpecialLeave = displayValue === "ML" || displayValue === "PL";

              return (
                <input
                  key={i}
                  type="text"
                  value={displayValue}
                  disabled={lockedRows[lt] || isWeekend || isSpecialLeave}
                  className={`w-17 h-8 text-center border rounded-md ${
                    isWeekend || isSpecialLeave ? "bg-gray-200 cursor-not-allowed" : "bg-white"
                  }`}
                  onChange={(e) => {
                    if (!isSpecialLeave) {
                      const updated = [...leaveRows[lt]];
                      updated[i] = e.target.value;
                      setLeaveRows((prev) => ({ ...prev, [lt]: updated }));
                    }
                  }}
                />
              );
            })}
            <div className="text-center w-12">{rowTotals[lt]}</div>
            <IconButton onClick={(e) => handleMenuOpen(e, lt)}><MoreVert /></IconButton>
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
          <Button variant="contained" color="success" onClick={handleSaveAll}>
            Save All
          </Button>

          <Button
            variant="contained"
            color="secondary"
            onClick={handleSaveWeek}
            disabled={!isWeekComplete}
          >
            Release Week
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/dashboard/timesheet/monthly")}
          >
            View Monthly Attendance
          </Button>
        </div>
      </div>

      {/* MENU */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleEditRow(menuRow)} disabled={!lockedRows[menuRow]}>
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleResetRow(menuRow)}>Reset</MenuItem>
        {menuRow !== "Worked Hours" && (
          <MenuItem onClick={() => handleDeleteRow(menuRow)}>Delete</MenuItem>
        )}
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
