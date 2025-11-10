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
  setAttendanceData,
  AttendanceFetchExistingWeek,
  checkLeaveEligibility,
} from "../../features/attendance/attendanceSlice";
import LeaveApplicationModal from "../../components/LeaveApplicationModal";
import { useNavigate } from "react-router-dom";
import { AUTH_API } from "../../utils/constants";
import { applyParentalLeave } from "../../features/attendance/attendanceSlice";

export default function EmpTimesheet() {
  const { projects } = useSelector((state) => state.project);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { attendanceData, loading } = useSelector((state) => state.attendance);
  const [projectDetails, setProjectDetails] = useState(null);

  const projectName = projectDetails?.projectName;
  const ProjectID = projectDetails?.projectID;
  const employeeId = projectDetails?.employeeId;

  const [leaveType, setLeaveType] = useState("EL");
  const [hours, setHours] = useState(Array(7).fill(0));
  const [usedLeaveTypes, setUsedLeaveTypes] = useState(["EL"]);
  const [leaveRows, setLeaveRows] = useState({ EL: Array(7).fill(0) });
  const [lockedRows, setLockedRows] = useState({ EL: false });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRow, setMenuRow] = useState(null);
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [calendarAnchor, setCalendarAnchor] = useState(null);
  const [selectDate, setSelectDate] = useState(new Date());
  const [isSaveAllEnabled, setIsSaveAllEnabled] = useState(true);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [modalLeaveType, setModalLeaveType] = useState("");
  const [holidays, setHolidays] = useState([]);
  const [holidaysCache, setHolidaysCache] = useState({});
  // NEW: store leave periods for multi-week leaves
  const [leavePeriods, setLeavePeriods] = useState([]);
  const [approvalStatus, setApprovalStatus] = useState({}); // Track approval status for each day
  const leaveTypes = ["EL", "SL", "WFH", "Extra Milar", "Paternity Leave", "Maternity Leave", "Optional Holidays", "Holidays"];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

  //disbale removed
  useEffect(() => {
    const filled = [0, 1, 2, 3, 4].every(
      (i) => Number(hours[i]) > 0 || usedLeaveTypes.some((lt) => {
        const val = leaveRows[lt][i];
        return val !== 0 && val !== ""; // text leave codes count as filled
      })
    );
  }, [hours, leaveRows, usedLeaveTypes]);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const year = weekStart.getFullYear();
        const res = await fetch(`http://localhost:9091/api/holidays/${year}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          // ✅ Extract only the dates in YYYY-MM-DD format
          const holidayDates = data.map(h => h.date);
          setHolidays(holidayDates);
        } else {
          console.error("Unexpected holiday response:", data);
        }
      } catch (err) {
        console.error("Failed to fetch holidays", err);
      }
    };

    fetchHolidays();
  }, [weekStart]);
  // Re-run on weekStart change


  const getDateStringForIndex = (index) => {
    const currentDate = new Date(weekStart);
    currentDate.setDate(weekStart.getDate() + index);
    return currentDate.toISOString().split('T')[0]; // Return date in YYYY-MM-DD format
  };

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
      `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")
      }/${d.getFullYear()}`;

    return `${fmt(monday)} - ${fmt(endDate)}`;
  }

  // Check if day is weekend (Saturday or Sunday)
  const isWeekendDay = (dayIndex) => {
    return dayIndex >= 5; // 5 = Saturday, 6 = Sunday
  };



  // Check if field is read-only based on status
  const isFieldReadOnly = (dayIndex, leaveType = null) => {
    if (isWeekendDay(dayIndex)) {
      return true; // Always read-only for weekends
    }
    const statusKey = leaveType ? `${leaveType}_${dayIndex}` : `worked_${dayIndex}`;
    return approvalStatus[statusKey] === 'approved'; // Read-only only when approved
  };

  // Check if field is editable (not weekend and not approved)
  const isFieldEditable = (dayIndex, leaveType = null) => {
    if (isWeekendDay(dayIndex)) {
      return false; // Never editable for weekends
    }
    const statusKey = leaveType ? `${leaveType}_${dayIndex}` : `worked_${dayIndex}`;
    return approvalStatus[statusKey] !== 'approved'; // Editable if not approved
  };

  //while changing date get all datas 
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
        .then((res) => {
          console.log("Existing week data:", res.payload);
          // Initialize approval status based on fetched data
          if (res.payload && res.payload.length > 0) {
            const newApprovalStatus = {};
            res.payload.forEach((entry) => {
              const entryDate = new Date(entry.date);
              const dayDiff = (entryDate, weekStart) => {
                const date1 = new Date(entryDate.toDateString());
                const date2 = new Date(weekStart.toDateString());
                return Math.floor((date1 - date2) / (1000 * 60 * 60 * 24));
              };
              const dayIndex = dayDiff(entryDate, weekStart);

              if (dayIndex >= 0 && dayIndex < 7) {
                const statusKey = entry.leaveType ? `${entry.leaveType}_${dayIndex}` : `worked_${dayIndex}`;
                // Assuming you have an approval status field in your data
                newApprovalStatus[statusKey] = entry.approvalStatus || 'not_submitted';
              }
            });
            setApprovalStatus(newApprovalStatus);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [employeeId, ProjectID, weekStart, dispatch]);

  useEffect(() => {
    if (attendanceData?.length > 0) {
      const newHours = Array(7).fill(0);
      const newLeaveRows = {}; // dynamic object to store leave rows
      const newApprovalStatus = {};

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

          // Set approval status
          const statusKey = entry.leaveType ? `${entry.leaveType}_${dayIndex}` : `worked_${dayIndex}`;
          newApprovalStatus[statusKey] = entry.approvalStatus || 'not_submitted';

          // Leave hours
          if (entry.leaveType && entry.leaveType !== "") {
            if (!newLeaveRows[entry.leaveType]) {
              newLeaveRows[entry.leaveType] = Array(7).fill(0);
            }
            // Set the leave value for that day
            newLeaveRows[entry.leaveType][dayIndex] = entry.workedHours || 9;
          }
        }
      });

      setHours(newHours);
      setLeaveRows(newLeaveRows);
      setUsedLeaveTypes(Object.keys(newLeaveRows));
      setApprovalStatus(newApprovalStatus);
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

  // const handleAddActivity = () => {
  //   if (leaveType === "Maternity Leave" || leaveType === "Paternity Leave") {
  //     setModalLeaveType(leaveType);
  //     setLeaveModalOpen(true);
  //     return;
  //   }

  //   if (leaveType && !usedLeaveTypes.includes(leaveType)) {
  //     setUsedLeaveTypes([...usedLeaveTypes, leaveType]);
  //     setLeaveRows((prev) => ({ ...prev, [leaveType]: Array(7).fill(0) }));
  //     setLockedRows((prev) => ({ ...prev, [leaveType]: false }));
  //   }
  // };

  const handleAddActivity = async () => {
    if (!leaveType) {
      toast.error("Please select a leave type");
      return;
    }

    if (!employeeId) {
      toast.error("Employee ID missing!");
      return;
    }

    // ✅ Step 1: Check eligibility first
    try {
      const resultAction = await dispatch(
        checkLeaveEligibility({ employeeId, leaveType, requestedDays: 1 })
      );

      if (checkLeaveEligibility.fulfilled.match(resultAction)) {
        const { canApply, message } = resultAction.payload;
        if (canApply) {
          toast.success(message);

          // ✅ Step 2: Proceed with your existing leave add logic
          if (leaveType === "Maternity Leave" || leaveType === "Paternity Leave") {
            setModalLeaveType(leaveType);
            setLeaveModalOpen(true);
            return;
          }

          if (!usedLeaveTypes.includes(leaveType)) {
            setUsedLeaveTypes([...usedLeaveTypes, leaveType]);
            setLeaveRows((prev) => ({ ...prev, [leaveType]: Array(7).fill(0) }));
            setLockedRows((prev) => ({ ...prev, [leaveType]: false }));
          }
        } else {
          toast.warn(message);
        }
      } else {
        toast.error(resultAction.payload?.message || "Failed to check leave eligibility");
      }
    } catch (err) {
      console.error("Eligibility check error:", err);
      toast.error("Error checking leave eligibility");
    }
  };

  const handleModalSubmit = async ({ startDate }) => {
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
        // Optional: add to leavePeriods for UI
        const duration = leave_type === "maternity" ? 180 : 5;
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + duration - 1);
        setLeavePeriods(prev => [...prev, { type: modalLeaveType, startDate: start, endDate: end }]);
        if (!usedLeaveTypes.includes(modalLeaveType)) {
          setUsedLeaveTypes([...usedLeaveTypes, modalLeaveType]);
          setLeaveRows(prev => ({ ...prev, [modalLeaveType]: Array(7).fill("") }));
          setLockedRows(prev => ({ ...prev, [modalLeaveType]: true }));
        }
      } else {
        toast.error(resultAction.payload?.error || "Failed to apply leave");
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
    setLeaveRows((prev) => ({ ...prev, [row]: Array(7).fill(0) }));
    handleMenuClose();
  };

  const handleEditRow = (row) => {
    setLockedRows((prev) => ({ ...prev, [row]: false }));
    handleMenuClose();
  };

  const handleSaveAll = async () => {
    const employeename = projectDetails?.username;
    const employeeId = projectDetails?.employeeId;
    console.log(employeeId, "employeeId")
    const projectId = projectDetails?.projectID;
    const monday = getMonday(weekStart);
    console.log(monday, "monday")
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
        date: new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000)
          .toISOString()
          .split("T")[0],

        // ✅ Worked hours should always be a number (0 for holiday)
        workedHours: holidays.includes(
          new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000)
            .toISOString()
            .split("T")[0]
        )
          ? 0 // 👈 backend accepts only numbers
          : Number(hours[i]) || 0,

        // ✅ Leave type is 'holiday' if that date is a holiday
        leaveType: holidays.includes(
          new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000)
            .toISOString()
            .split("T")[0]
        )
          ? "holiday"
          : appliedLeaveType || "",

        approvalStatus: "submitted",
      };


    });

    try {
      const resultAction = await dispatch(
        AttendanceSaveall({ employeename, employeeId, projectId, formData: dataToSend }) // ✅ use projectId
      );

      // Update approval status for all fields (only weekdays)
      const newApprovalStatus = { ...approvalStatus };
      days.forEach((_, i) => {
        if (!isWeekendDay(i)) { // Only update status for weekdays
          const statusKey = `worked_${i}`;
          // Only update to 'submitted' if not already 'approved'
          if (newApprovalStatus[statusKey] !== 'approved') {
            newApprovalStatus[statusKey] = 'submitted';
          }

          usedLeaveTypes.forEach(lt => {
            const leaveStatusKey = `${lt}_${i}`;
            if (leaveRows[lt][i] && leaveRows[lt][i] !== 0 && leaveRows[lt][i] !== "") {
              // Only update to 'submitted' if not already 'approved'
              if (newApprovalStatus[leaveStatusKey] !== 'approved') {
                newApprovalStatus[leaveStatusKey] = 'submitted';
              }
            }
          });
        }
      });
      setApprovalStatus(newApprovalStatus);

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
    const employeeId = projectDetails?.employeeId;
    const weekStartDate = getMonday(weekStart);
    const weekEnd = new Date(weekStartDate);
    weekEnd.setDate(weekStartDate.getDate() + 6); // Sunday

    // Format in local time yyyy-MM-dd
    const formattedWeekEnd = `${weekEnd.getFullYear()}-${(weekEnd.getMonth() + 1)
      .toString().padStart(2, '0')}-${weekEnd.getDate().toString().padStart(2, '0')}`;
    const formattedStartEnd = `${weekStartDate.getFullYear()}-${(weekStartDate.getMonth() + 1)
      .toString().padStart(2, '0')}-${weekStartDate.getDate().toString().padStart(2, '0')}`;

    try {
      const resultAction = await dispatch(AttendanceReleaseWeek({
        employeeId: employeeId,
        weekStart: formattedStartEnd,
        weekEnd: formattedWeekEnd
      }));

      // if (AttendanceReleaseWeek.fulfilled.match(resultAction)) {
      //   toast.success("Week released successfully!");

      //   // Update approval status to 'submitted' after releasing week
      //   const newApprovalStatus = { ...approvalStatus };
      //   days.forEach((_, i) => {
      //     if (!isWeekendDay(i)) { // Only update status for weekdays
      //       const statusKey = `worked_${i}`;
      //       // Only update to 'submitted' if not already 'approved'
      //       if (newApprovalStatus[statusKey] !== 'approved') {
      //         newApprovalStatus[statusKey] = 'submitted';
      //       }

      //       usedLeaveTypes.forEach(lt => {
      //         const leaveStatusKey = `${lt}_${i}`;
      //         if (leaveRows[lt][i] && leaveRows[lt][i] !== 0 && leaveRows[lt][i] !== "") {
      //           // Only update to 'submitted' if not already 'approved'
      //           if (newApprovalStatus[leaveStatusKey] !== 'approved') {
      //             newApprovalStatus[leaveStatusKey] = 'submitted';
      //           }
      //         }
      //       });
      //     }
      //   });
      //   setApprovalStatus(newApprovalStatus);
      if (AttendanceReleaseWeek.fulfilled.match(resultAction)) {
        toast.success("Week released successfully!");

        // ✅ Lock ALL worked hours and leave fields (make non-editable)
        const newApprovalStatus = { ...approvalStatus };

        days.forEach((_, i) => {
          if (!isWeekendDay(i)) {
            // Lock worked hours
            newApprovalStatus[`worked_${i}`] = "approved";

            // Lock all leaves
            usedLeaveTypes.forEach((lt) => {
              newApprovalStatus[`${lt}_${i}`] = "approved";
            });
          }
        });

        setApprovalStatus(newApprovalStatus);

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
    const currentWeekStart = getMonday(new Date());

    if (
      getMonday(date).toDateString() === currentWeekStart.toDateString()
    ) {
      setIsSaveAllEnabled(true); // enable only for current week
    } else {
      setIsSaveAllEnabled(false); // disable for other weeks
    }
  };
  const getStatusColor = (dayIndex) => {
    // Check if this index is a weekend (e.g., Saturday = 5, Sunday = 6)
    const isWeekend = dayIndex === 5 || dayIndex === 6; // adjust if your week starts on Monday

    if (isWeekend) {
      return "#E0E0E0"; // always gray for weekends
    }
    //  const isHoliday = holidays.includes(getDateStringForIndex(dayIndex)); // Use your existing function to get the date string
    //   if (isHoliday) {
    //     return "#FFCDD2"; // Light red/pink for holidays (adjust color as needed)
    //   }
    const record = attendanceData?.[dayIndex];
    if (!record) return "white";

    switch (record.status) {
      case "Pending_approval":
        return "#FFF59D"; // light yellow
      case "approved":
        return "#A5D6A7"; // light green
      default:
        return "white";
    }
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
              <Calendar onChange={handleCalendarChange} value={weekStart} className="custom-calendar" />
            </div>
          </Popover>
        </div>

        <Typography variant="h6" className="font-bold text-center flex-1">
          Weekly Attendance (Timesheet)
        </Typography>

        <div className="w-32">
          <div className="flex items-center gap-2 bg-white shadow-sm rounded-2xl px-2 py-1">
            <span className="font-small text-[#51b4f2]">{projectDetails?.username}</span>
            <img
              src="data:image/jpeg;base64,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"
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
            const isWeekend = isWeekendDay(i);
            const backgroundColor = getStatusColor(i);
            const isReadOnly = isFieldReadOnly(i);
            const isEditable = isFieldEditable(i);

            // Check if the current day (i) is a holiday
            const isHoliday = holidays.includes(getDateStringForIndex(i)); // Assume you have a way to map index to date string

            // If it's a holiday, don't show the input field
            if (isHoliday) {
              return (
                <div
                  key={i}
                  className={`min-w-[60px] h-8 flex items-center justify-center 
                    border rounded-md mx-1 text-[#FFCDD2] text-red-600 font-semibold`}
                >
                  H
                </div>
              );
            }

            return (
              <input
                key={i}
                type="number"
                value={h}
                min="0"
                max="9"
                disabled={!isEditable}
                style={{ backgroundColor }}
                className={`w-17 h-8 text-center border rounded-md ${!isEditable ? "cursor-not-allowed" : "bg-white"
                  } ${isWeekend ? "text-gray-400" : ""}`}
                onChange={(e) => {
                  if (isEditable) {
                    const newHours = [...hours];
                    newHours[i] = e.target.value;
                    setHours(newHours);
                  }
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
              const isWeekend = isWeekendDay(i);
              const currentDate = new Date(weekStart);
              currentDate.setDate(currentDate.getDate() + i);

              const period = leavePeriods.find(p => p.type === lt);
              const isInLeave = period && currentDate >= period.startDate && currentDate <= period.endDate;
              const displayValue = isInLeave ? (lt === "Maternity Leave" ? "ML" : lt === "Paternity Leave" ? "PL" : v) : v;
              const isSpecialLeave = displayValue === "ML" || displayValue === "PL";
              const backgroundColor = getStatusColor(i, lt);
              const isEditable = isFieldEditable(i, lt) && !isSpecialLeave && !lockedRows[lt];

              return (
                <input
                  key={i}
                  type="text"
                  value={displayValue}
                  disabled={!isEditable}
                  style={{ backgroundColor }}
                  className={`w-17 h-8 text-center border rounded-md ${!isEditable ? "cursor-not-allowed" : "bg-white"
                    } ${isWeekend ? "text-gray-400" : ""}`}
                  onChange={(e) => {
                    if (isEditable) {
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
          <Button variant="contained" color="success" onClick={handleSaveAll} disable={!isSaveAllEnabled}>
            Save All
          </Button>

          <Button
            variant="contained"
            color="secondary"
            onClick={handleSaveWeek}

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