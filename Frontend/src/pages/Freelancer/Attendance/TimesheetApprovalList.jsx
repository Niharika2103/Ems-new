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
  FormControl,
  Select,
  MenuItem,
  Typography,
  Chip,
  Tooltip,
  TablePagination,
} from "@mui/material";

import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

import { AttendanceFetchFreelancerApprovalSummaryApi } from "../../../api/authApi";

const TimesheetApprovalList = () => {
  const navigate = useNavigate();

  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(false);

  // pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [viewType, setViewType] = useState("weekly");

  // ================= DATE RANGE LOGIC (SAME AS YOUR PAGE) =================

  const getCurrentWeek = () => {
    const today = dayjs();
    const dayOfWeek = today.day();

    const start = today.subtract(dayOfWeek === 0 ? 6 : dayOfWeek - 1, "day");
    const end = start.add(6, "day");

    return { start, end };
  };

  const getDefaultDateRange = (type) => {
    if (type === "weekly") {
      return getCurrentWeek();
    } else {
      const today = dayjs();
      return {
        start: today.startOf("month"),
        end: today.endOf("month"),
      };
    }
  };

  const defaultRange = getDefaultDateRange(viewType);

  const [dateRange, setDateRange] = useState([
    defaultRange.start,
    defaultRange.end,
  ]);

  const MAX_PAST_WEEKS = 4;
  const MAX_PAST_MONTHS = 3;

  // ================= FETCH DATA =================

  const fetchData = async () => {
    try {
      setLoading(true);

      const startDate = dateRange[0].format("YYYY-MM-DD");
      const endDate = dateRange[1].format("YYYY-MM-DD");

      const response = await AttendanceFetchFreelancerApprovalSummaryApi(
        viewType,
        startDate,
        endDate
      );

      const formatted = response.data.map((item, index) => ({
        id: index + 1,
        employeeId: item.employeeId,
        projectId: item.projectId,
        employeeName: item.employeeName,
        projectName: item.projectName,
        totalHours: item.totalWorkedHours,
        status: "Pending",
      }));

      setTimesheets(formatted);
    } catch (err) {
      console.error("Error fetching freelancer timesheets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange, viewType]);

  // ================= NAVIGATION LOGIC =================

  const handlePrevPeriod = () => {
    if (viewType === "weekly") {
      setDateRange([
        dateRange[0].subtract(1, "week"),
        dateRange[1].subtract(1, "week"),
      ]);
    } else {
      setDateRange([
        dateRange[0].subtract(1, "month").startOf("month"),
        dateRange[0].subtract(1, "month").endOf("month"),
      ]);
    }
  };

  const handleNextPeriod = () => {
    if (viewType === "weekly") {
      setDateRange([
        dateRange[0].add(1, "week"),
        dateRange[1].add(1, "week"),
      ]);
    } else {
      setDateRange([
        dateRange[0].add(1, "month").startOf("month"),
        dateRange[0].add(1, "month").endOf("month"),
      ]);
    }
  };

  const handleViewTypeChange = (type) => {
    setViewType(type);

    const newRange = getDefaultDateRange(type);
    setDateRange([newRange.start, newRange.end]);

    setPage(0);
  };

  const getStatusColor = () => "warning";

  const now = dayjs();
  const currentWeek = getCurrentWeek();

  const nextDisabled = () => {
    if (viewType === "weekly") {
      return dateRange[0]
        .add(1, "week")
        .isAfter(currentWeek.start, "day");
    } else {
      return dateRange[0]
        .add(1, "month")
        .startOf("month")
        .isAfter(now.startOf("month"), "day");
    }
  };

  const prevDisabled = () => {
    if (viewType === "weekly") {
      const allowed = currentWeek.start.subtract(
        MAX_PAST_WEEKS - 1,
        "week"
      );
      return dateRange[0].isBefore(allowed, "day");
    } else {
      const allowed = now
        .startOf("month")
        .subtract(MAX_PAST_MONTHS - 1, "month");
      return dateRange[0].isBefore(allowed, "day");
    }
  };

  const handleViewTimesheet = (t) => {
    navigate("/attendance/timesheet", {
      state: {
        employeeId: t.employeeId,
        projectId: t.projectId,
        from: dateRange[0].format("YYYY-MM-DD"),
        to: dateRange[1].format("YYYY-MM-DD"),
        viewType: viewType,
      },
    });
  };

  // ================= UI =================

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6">
          Freelancer Timesheet Approval
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={viewType}
              onChange={(e) =>
                handleViewTypeChange(e.target.value)
              }
            >
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title="Previous">
            <span>
              <IconButton
                onClick={handlePrevPeriod}
                disabled={prevDisabled()}
              >
                <ChevronLeft />
              </IconButton>
            </span>
          </Tooltip>

          <Typography>
            {`${dateRange[0].format(
              "DD MMM YYYY"
            )} → ${dateRange[1].format("DD MMM YYYY")}`}
          </Typography>

          <Tooltip title="Next">
            <span>
              <IconButton
                onClick={handleNextPeriod}
                disabled={nextDisabled()}
              >
                <ChevronRight />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "primary.main" }}>
            <TableRow>
              <TableCell sx={{ color: "white" }}>
                Employee
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                Project
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                Total Hours
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                Status
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {timesheets
              .slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
              )
              .map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.employeeName}</TableCell>
                  <TableCell>{t.projectName}</TableCell>
                  <TableCell>
                    {t.totalHours} hrs
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t.status}
                      color={getStatusColor()}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      onClick={() =>
                        handleViewTimesheet(t)
                      }
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
          count={timesheets.length}
          page={page}
          onPageChange={(e, newPage) =>
            setPage(newPage)
          }
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(
              parseInt(e.target.value, 10)
            );
            setPage(0);
          }}
        />
      </TableContainer>
    </Box>
  );
};

export default TimesheetApprovalList;
