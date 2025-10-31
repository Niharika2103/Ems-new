import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  TablePagination,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import dayjs from "dayjs";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  AttendanceFetchAllbasedonMonth,
  AttendanceFetchByEmployeeProject,
} from "../../features/attendance/attendanceSlice";

const TimesheetTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { attendance, loading, error } = useSelector((state) => state.attendance);
  const { employeeId, projectId } = location.state || {};

  const [localTimesheets, setLocalTimesheets] = useState([]);

  // pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // 🧮 Helper function: get start(10) → end(9) of pay cycle
  const getPayCycle = (date) => {
    const start = dayjs(date).date() >= 10
      ? dayjs(date).date(10)
      : dayjs(date).subtract(1, "month").date(10);

    const end = start.add(1, "month").date(9);

    return { start, end };
  };

  // 🗓️ Default to current pay cycle (10 → 9)
  const { start: defaultStart, end: defaultEnd } = getPayCycle(dayjs());
  const [dateRange, setDateRange] = useState([defaultStart, defaultEnd]);

  // 🧩 Fetch data when component mounts or date range changes
  useEffect(() => {
    const from = dateRange[0].format("YYYY-MM-DD");
    const to = dateRange[1].format("YYYY-MM-DD");
    dispatch(AttendanceFetchAllbasedonMonth({ from, to }));
  }, [dispatch, dateRange]);

  // 🧩 If employee/project view
  // useEffect(() => {
  //   if (employeeId && projectId) {
  //     dispatch(AttendanceFetchByEmployeeProject({ employeeId, projectId }));
  //   }
  // }, [dispatch, employeeId, projectId]);

  // 🔤 Normalize API data
  useEffect(() => {
    if (attendance && Array.isArray(attendance)) {
      const mapped = attendance.map((item) => {
        const normalizedStatus = item.status ? item.status.toLowerCase() : "pending";
        const displayStatus =
          normalizedStatus === "draft" || normalizedStatus === "pending"
            ? "Pending"
            : normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);

        return {
          id: item.id,
          employeeId: item.employeeId,
          projectId: item.projectId,
          employee: item.employee?.name || item.employeeName || item.name || "N/A",
          ProjectName: item.projectName || item.ProjectName || item.project?.name,
          date: item.date,
          hours: item.workedHours,
          status: displayStatus,
        };
      });
      setLocalTimesheets(mapped);
    }
  }, [attendance]);

  // ⏪ Shift to previous month’s pay cycle
  const handlePrevMonth = () => {
    const newStart = dateRange[0].subtract(1, "month");
    const { start, end } = getPayCycle(newStart);
    setDateRange([start, end]);
  };

  // ⏩ Shift to next month’s pay cycle
  const handleNextMonth = () => {
    const newStart = dateRange[0].add(1, "month");
    const { start, end } = getPayCycle(newStart);
    setDateRange([start, end]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Rejected":
        return "error";
      default:
        return "warning";
    }
  };

  // if (loading) return <p>Loading...</p>;
  // if (error) return <p>Error: {JSON.stringify(error)}</p>;

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" fontWeight={400}>
          Timesheet Approval
        </Typography>

        {/* Pay cycle navigation */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={handlePrevMonth}>
            <ChevronLeft />
          </IconButton>

          <Typography variant="subtitle1" sx={{ minWidth: 260, textAlign: "center" }}>
            {`${dateRange[0].format("DD MMM YYYY")} → ${dateRange[1].format("DD MMM YYYY")}`}
          </Typography>

          <IconButton onClick={handleNextMonth}>
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ bgcolor: "primary.main" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Employee</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Project</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {localTimesheets
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell>{t.employee}</TableCell>
                  <TableCell>{t.ProjectName}</TableCell>
                  <TableCell>
                    <Chip label={t.status} color={getStatusColor(t.status)} />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => {
                        // 🧠 Store gender in localStorage
                        if (t.employeeGender) {
                          localStorage.setItem("gender", t.employeeGender);
                        }

                        // 🗓️ Prepare date range
                        const from = dateRange[0].format("YYYY-MM-DD");
                        const to = dateRange[1].format("YYYY-MM-DD");

                        // 🧭 Navigate with required data
                        navigate("/attendance/timesheet", {
                          state: {
                            employeeId: t.employeeId,
                            projectId: t.projectId,
                            from: from,
                            to: to,
                          },
                        });
                      }}
                    >
                      View
                    </Button>

                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={localTimesheets.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>
    </Box>
  );
};

export default TimesheetTable;