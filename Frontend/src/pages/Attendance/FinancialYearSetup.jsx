import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Divider,
  Fade,
  TextField,
} from "@mui/material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { motion } from "framer-motion";

const FinancialYearSetup = () => {
  const [fyType, setFyType] = useState("");
  const [customStart, setCustomStart] = useState(null);
  const [customEnd, setCustomEnd] = useState(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [leaves, setLeaves] = useState([]);

  // Load previous FY setup if any
  useEffect(() => {
    const prevSetup = JSON.parse(localStorage.getItem("fySetup"));
    if (prevSetup && prevSetup.endDate) {
      const prevEnd = new Date(prevSetup.endDate);
      const today = new Date();
      if (today > prevEnd) {
        const nextStart = new Date(prevEnd);
        nextStart.setDate(nextStart.getDate() + 1);
        const nextEnd = new Date(nextStart);
        nextEnd.setFullYear(nextStart.getFullYear() + 1);
        nextEnd.setDate(nextEnd.getDate() - 1);
        setCustomStart(nextStart);
        setCustomEnd(nextEnd);
      }
    }
  }, []);

  // Handle FY type selection
  const handleFyTypeChange = (e) => {
    const value = e.target.value;
    setFyType(value);
    const currentYear = new Date().getFullYear();

    if (value === "APRIL_MARCH") {
      setCustomStart(new Date(currentYear, 3, 1));
      setCustomEnd(new Date(currentYear + 1, 2, 31));
      setCalendarVisible(false);
    } else if (value === "JAN_DEC") {
      setCustomStart(new Date(currentYear, 0, 1));
      setCustomEnd(new Date(currentYear, 11, 31));
      setCalendarVisible(false);
    } else if (value === "CUSTOM") {
      setCustomStart(null);
      setCustomEnd(null);
      setCalendarVisible(true); // Show calendar for custom
    } else {
      setCustomStart(null);
      setCustomEnd(null);
      setCalendarVisible(false);
    }
  };

  // Handle custom start date selection
  const handleCustomStartChange = (date) => {
    setCustomStart(date);
    const nextYear = new Date(date);
    nextYear.setFullYear(date.getFullYear() + 1);
    nextYear.setDate(nextYear.getDate() - 1);
    setCustomEnd(nextYear);
    setCalendarVisible(false); // hide calendar after selecting
  };

  const handleViewDetails = () => {
    const mockHolidays = [
      { date: "2025-01-26", name: "Republic Day" },
      { date: "2025-08-15", name: "Independence Day" },
    ];
    const mockLeaves = [
      { type: "Casual Leave", days: 12 },
      { type: "Sick Leave", days: 10 },
      { type: "Earned Leave", days: 15 },
    ];
    setHolidays(mockHolidays);
    setLeaves(mockLeaves);
  };

  const handleSubmit = () => {
    const setupData = {
      fyType,
      startDate: customStart,
      endDate: customEnd,
    };
    localStorage.setItem("fySetup", JSON.stringify(setupData));
    window.location.href = "#/attendance/emptimesheet";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 30%, #90caf9 60%, #64b5f6 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Card
          sx={{
            width: 640,
            borderRadius: "18px",
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,248,255,0.95))",
            boxShadow:
              "0 8px 25px rgba(33,150,243,0.2), 0 12px 40px rgba(33,150,243,0.15)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: "linear-gradient(90deg,#1976d2,#64b5f6)",
              color: "white",
              textAlign: "center",
              py: 2,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Financial Year Setup
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Set your organization’s financial year preferences
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Select Financial Year Type</InputLabel>
              <Select
                value={fyType}
                label="Financial Year Type"
                onChange={handleFyTypeChange}
                sx={{
                  borderRadius: 2,
                  backgroundColor: "white",
                  "& .MuiSelect-select": { fontWeight: 500 },
                }}
              >
                <MenuItem value="APRIL_MARCH">April – March</MenuItem>
                <MenuItem value="JAN_DEC">January – December</MenuItem>
                <MenuItem value="CUSTOM">Custom</MenuItem>
              </Select>
            </FormControl>

            {/* Custom flow */}
            {fyType === "CUSTOM" && (
              <>
                {/* Calendar visible only when editing */}
                {calendarVisible && (
                  <Box mt={3} textAlign="center">
                    <Typography fontWeight={500} mb={1}>
                      Select Start Date
                    </Typography>
                    <Calendar
                      onChange={handleCustomStartChange}
                      value={customStart}
                      className="rounded-xl border shadow-md bg-white mx-auto"
                    />
                  </Box>
                )}

                {/* After date selected */}
                {customStart && customEnd && (
                  <>
                    <Grid container spacing={2} mt={3}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Start Date"
                          value={customStart.toISOString().split("T")[0]}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="End Date"
                          value={customEnd.toISOString().split("T")[0]}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                    </Grid>

                    <Box mt={2} textAlign="right">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setCalendarVisible(true)}
                        sx={{
                          borderColor: "#1976d2",
                          color: "#1976d2",
                          fontWeight: 500,
                          "&:hover": {
                            borderColor: "#1565c0",
                            backgroundColor: "#e3f2fd",
                          },
                        }}
                      >
                        Edit Date
                      </Button>
                    </Box>
                  </>
                )}
              </>
            )}

            {customStart && customEnd && (
              <Box mt={3} textAlign="center">
                <Typography
                  sx={{
                    mb: 2,
                    color: "#1976d2",
                    fontWeight: 600,
                    letterSpacing: "0.3px",
                  }}
                >
                  Selected Period:{" "}
                  {customStart.toDateString()} → {customEnd.toDateString()}
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    background: "linear-gradient(90deg,#1976d2,#64b5f6)",
                    borderRadius: 2,
                    px: 4,
                    py: 1,
                    fontWeight: "bold",
                  }}
                  onClick={handleViewDetails}
                >
                  View Holidays & Leaves
                </Button>
              </Box>
            )}

            {/* Holidays & Leaves */}
            {holidays.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography
                  variant="h6"
                  sx={{ color: "#1976d2", fontWeight: 600 }}
                >
                  Holiday List
                </Typography>
                {holidays.map((h, i) => (
                  <Typography key={i} variant="body2" sx={{ mt: 0.5 }}>
                    📅 {h.date} — {h.name}
                  </Typography>
                ))}
              </>
            )}

            {leaves.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography
                  variant="h6"
                  sx={{ color: "#1976d2", fontWeight: 600 }}
                >
                  Leave Policy
                </Typography>
                {leaves.map((l, i) => (
                  <Typography key={i} variant="body2" sx={{ mt: 0.5 }}>
                    🗓 {l.type}: {l.days} days
                  </Typography>
                ))}
              </>
            )}

            {holidays.length > 0 && (
              <Box textAlign="center" mt={4}>
                <Button
                  variant="contained"
                  sx={{
                    background: "linear-gradient(90deg,#1565c0,#42a5f5)",
                    borderRadius: 3,
                    px: 5,
                    py: 1.2,
                    fontWeight: "bold",
                    "&:hover": {
                      background: "linear-gradient(90deg,#42a5f5,#1565c0)",
                    },
                  }}
                  onClick={handleSubmit}
                >
                  Confirm & Go to Timesheet
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default FinancialYearSetup;