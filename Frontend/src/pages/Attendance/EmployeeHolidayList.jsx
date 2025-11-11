import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Popover,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import { AttendanceClient } from "../../api/axiosClient";

// MUI X Date Pickers
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const EmployeeHolidayList = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Calendar popover
  const [anchorEl, setAnchorEl] = useState(null);
  const handleCalendarOpen = (event) => setAnchorEl(event.currentTarget);
  const handleCalendarClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const fetchHolidays = async () => {
      setLoading(true);
      try {
        const response = await AttendanceClient.get(`/holidays/${currentYear}`);
        setHolidays(response.data || []);
      } catch (error) {
        console.error("Failed to load holidays:", error);
        setHolidays([]);
      } finally {
        // Optional short delay for a smoother visual
        setTimeout(() => setLoading(false), 300);
      }
    };
    fetchHolidays();
  }, [currentYear]);

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #f8fafc 0%, #eef4ff 100%)",
        minHeight: "100vh",
        p: { xs: 2, sm: 4 },
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Card
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 700,
          borderRadius: "20px",
          background: "white",
          boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 3, sm: 5 },
            display: "flex",
            flexDirection: "column",
            height: "80vh",
          }}
        >
          {/* ===== Header ===== */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
              flexWrap: "wrap",
              textAlign: "center",
              gap: 1,
              position: "relative",
            }}
          >
            <IconButton onClick={handleCalendarOpen}>
              <CalendarMonthIcon color="primary" sx={{ fontSize: 36 }} />
            </IconButton>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "#1e293b",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {currentYear} Company Holiday Calendar
            
            </Typography>

            {/* Calendar Popover */}
            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleCalendarClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
            >
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateCalendar
                  defaultValue={new Date()}
                  onChange={(date) => {
                    if (date && !isNaN(date.getTime())) {
                      const year = date.getFullYear();
                      setCurrentYear(year);
                      handleCalendarClose();
                    }
                  }}
                />
              </LocalizationProvider>
            </Popover>
          </Box>

          <Divider sx={{ mb: 2 }} />
            {/* loader next to title (optional) */}
              {loading && <CircularProgress size={30} sx={{ ml: 1 }} />}

          {/* ===== Scrollable Holiday List (centered) ===== */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              pr: 1,
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#cbd5e1",
                borderRadius: "8px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "#94a3b8",
              },
            }}
          >
            {/* Keep list visible, but fade slightly during loading */}
            <Box sx={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.25s" }}>
              {holidays.length === 0 && !loading ? (
                <Typography
                  variant="body1"
                  color="textSecondary"
                  align="center"
                  sx={{ mt: 2 }}
                >
                  No holidays found for {currentYear}.
                </Typography>
              ) : (
                // Center the whole list content
                <List
                  disablePadding
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    pt: 1,
                  }}
                >
                  {holidays.map((holiday, index) => {
                    const date = new Date(holiday.date);
                    const day = date.toLocaleDateString("en-IN", {
                      weekday: "long",
                    });
                    const formattedDate = date.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <React.Fragment key={index}>
                        <ListItem
                          // give each item a max width and center it
                          sx={{
                            width: "100%",
                            maxWidth: 620,
                            borderRadius: "12px",
                            mb: 0,
                            px: 2,
                            py: 1.5,
                            backgroundColor:
                              index % 2 === 0 ? "#f9fafb" : "#f3f4f6",
                            "&:hover": {
                              backgroundColor: "#e0f2fe",
                              transform: "scale(1.01)",
                              transition: "0.18s ease",
                            },
                            // center content horizontally
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mx: "auto",
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: "40px" }}>
                            <EventAvailableIcon
                              sx={{ color: "#16a34a", fontSize: 28 }}
                            />
                          </ListItemIcon>

                          <ListItemText
                            primary={holiday.name}
                            secondary={`${day} • ${formattedDate}`}
                            primaryTypographyProps={{
                              variant: "subtitle1",
                              sx: { fontWeight: 600, textAlign: "center" },
                            }}
                            secondaryTypographyProps={{
                              variant: "body2",
                              sx: { color: "#475569", textAlign: "center" },
                            }}
                          />
                        </ListItem>

                        {index < holidays.length - 1 && (
                          <Divider sx={{ opacity: 0.35, width: "90%", mx: "auto" }} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </List>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployeeHolidayList;
