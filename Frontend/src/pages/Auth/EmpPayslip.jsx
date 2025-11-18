import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Popover,
  Paper,
} from "@mui/material";
import { CalendarToday } from "@mui/icons-material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import dayjs from "dayjs";

const EmpPayslip = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleCalendarOpen = (event) => setAnchorEl(event.currentTarget);
  const handleCalendarClose = () => setAnchorEl(null);

  const handleMonthSelect = (date) => {
    setSelectedDate(date);
    handleCalendarClose();
  };

  const downloadPayslip = async () => {
    if (!selectedDate) return;

    const month = dayjs(selectedDate).format("YYYY-MM");
    const employeeId = 101;

    try {
      const response = await fetch(
        `http://localhost:8080/api/payslips/${employeeId}?month=${month}`
      );

      if (!response.ok) {
        alert("Payslip not found for this month");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Payslip-${month}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Payslip download failed:", error);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          width: 480,
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {/* LEFT SECTION */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton
            color="primary"
            onClick={handleCalendarOpen}
            sx={{
              border: "1px solid #ccc",
              padding: "6px",
              borderRadius: "10px",
            }}
          >
            <CalendarToday sx={{ fontSize: 22 }} />
          </IconButton>

          <Box>
            <Typography sx={{ fontSize: "14px", color: "#666" }}>
              Select Month
            </Typography>

            <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>
              {selectedDate
                ? dayjs(selectedDate).format("MMMM YYYY")
                : "Not Selected"}
            </Typography>
          </Box>
        </Box>

        {/* RIGHT SECTION BUTTON */}
        <Button
          variant="contained"
          sx={{
            py: 1,
            px: 3,
            fontSize: "14px",
            borderRadius: "10px",
          }}
          disabled={!selectedDate}
          onClick={downloadPayslip}
        >
          Download
        </Button>

        {/* Calendar Popover */}
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleCalendarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Calendar
            onClickMonth={handleMonthSelect}
            view="year"
            value={selectedDate}
          />
        </Popover>
      </Paper>
    </Box>
  );
};

export default EmpPayslip;
