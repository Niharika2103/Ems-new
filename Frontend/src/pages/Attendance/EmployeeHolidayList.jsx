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
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import { AttendanceClient } from "../../api/axiosClient";

const EmployeeHolidayList = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await AttendanceClient.get(`/holidays/${currentYear}`);
        setHolidays(response.data || []);
      } catch (error) {
        console.error("Failed to load holidays:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHolidays();
  }, [currentYear]);

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }

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
            height: "80vh", // ✅ overall card height (adjust as needed)
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
            }}
          >
            <CalendarMonthIcon color="primary" sx={{ fontSize: 36, mr: 1 }} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "#1e293b",
              }}
            >
              {currentYear} Company Holiday Calendar
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* ===== Scrollable Holiday List ===== */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto", // ✅ scroll inside card
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
            {holidays.length === 0 ? (
              <Typography
                variant="body1"
                color="textSecondary"
                align="center"
                sx={{ mt: 2 }}
              >
                No holidays found for {currentYear}.
              </Typography>
            ) : (
              <List disablePadding>
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
                        sx={{
                          borderRadius: "12px",
                          mb: 1,
                          px: 2,
                          py: 1.5,
                          backgroundColor:
                            index % 2 === 0 ? "#f9fafb" : "#f3f4f6",
                          "&:hover": {
                            backgroundColor: "#e0f2fe",
                            transform: "scale(1.01)",
                            transition: "0.2s ease",
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: "40px" }}>
                          <EventAvailableIcon
                            sx={{ color: "#16a34a", fontSize: 28 }}
                          />
                        </ListItemIcon>

                        <ListItemText
                          primary={
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 600,
                                color: "#1e293b",
                                fontSize: "1rem",
                              }}
                            >
                              {holiday.name}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#475569",
                              }}
                            >
                              {day} • {formattedDate}
                            </Typography>
                          }
                        />
                      </ListItem>

                      {index < holidays.length - 1 && (
                        <Divider sx={{ opacity: 0.4 }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </List>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployeeHolidayList;
