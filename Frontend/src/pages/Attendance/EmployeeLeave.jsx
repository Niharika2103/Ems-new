import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchEmployeeProfile } from "../../features/employeesDetails/employeesSlice";
import { fetchEmployeeLeaves } from "../../features/attendance/attendanceSlice";
import { decodeToken } from "../../api/decodeToekn";
import {
  Box,
  Typography,
  Grid,
  Paper,
  LinearProgress,
  Avatar,
  useTheme,
} from "@mui/material";

const EmployeeLeave = () => {
  const dispatch = useDispatch();
  const theme = useTheme();


   // ⬅ Profile comes from employeeDetails slice
  const { profile } = useSelector((state) => state.employeeDetails);

  // ⬅ Leaves come from attendance slice
  const leaves = useSelector((state) => state.attendance.leaves);

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const decoded = await decodeToken();

      // Fetch Profile by Email
      dispatch(fetchEmployeeProfile(decoded?.email));

      // Fetch Leaves by EmployeeID
      dispatch(fetchEmployeeLeaves(decoded?.id))
        .then((res) => {
          console.log("employeeLeave:", res.payload);
        })
        .catch((err) => console.error(err));

    } catch (err) {
      console.error(err);
    }
  };

  fetchProfile();
}, [dispatch]);


  //const leaves = profile?.leaves || {};
  const gender = profile?.gender || "male";
  const name = profile?.name || "Employee Name";
  const department = profile?.department || "Department";
  const avatar = profile?.profile_photo || "";

  const defaultValues = {
    holidays: 10,
    optional_holidays: 2,
    el: 25,
    sl: 10,
    extra_milar: 2,
    maternity_leave: 180,
    paternity_leave: 7,
  };

  // 🎨 Soft pastel colors – MNC look
  const colorPalette = {
    holidays: "#5B8DEF",
    optional_holidays: "#9C6ADE",
    el: "#47C1BF",
    sl: "#FFB545",
    extra_milar: "#64B6AC",
    maternity_leave: "#F472B6",
    paternity_leave: "#7E57C2",
  };

  const leaveTypes = [
    { key: "holidays", label: "Holidays" },
    { key: "optional_holidays", label: "Optional Holidays" },
    { key: "el", label: "Earned Leave (EL)" },
    { key: "sl", label: "Sick Leave (SL)" },
    { key: "extra_milar", label: "Extra Milar" },
  ];

  if (gender === "female")
    leaveTypes.push({ key: "maternity_leave", label: "Maternity Leave" });
  if (gender === "male")
    leaveTypes.push({ key: "paternity_leave", label: "Paternity Leave" });

  const getLeaveData = (key) => {
    const total = leaves?.[key] !== undefined ? leaves[key] : defaultValues[key] || 0;
    const used = leaves?.[`${key}_used`] || 0;
    const remaining = total - used;
    const percent = total > 0 ? (used / total) * 100 : 0;
    return { total, used, remaining, percent };
  };

  return (
    <Box
      sx={{
        p: 4,
        bgcolor: "background.default",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #F9FAFB 0%, #E3F2FD 100%)",
      }}
    >
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          gap: 3,
          backdropFilter: "blur(10px)",
          background:
            "linear-gradient(90deg, rgba(25,118,210,0.9) 0%, rgba(33,150,243,0.7) 100%)",
          color: "#fff",
        }}
      >
        <Avatar
          src={avatar}
          sx={{
            width: 72,
            height: 72,
            border: "3px solid rgba(255,255,255,0.8)",
          }}
        />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {name}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {department} • {gender.charAt(0).toUpperCase() + gender.slice(1)}
          </Typography>
        </Box>
      </Paper>

      {/* Leave Cards */}
      <Grid container spacing={3}>
        {leaveTypes.map((type) => {
          const { total, used, remaining, percent } = getLeaveData(type.key);
          const color = colorPalette[type.key] || theme.palette.primary.main;

          return (
            <Grid item xs={12} sm={6} md={4} key={type.key}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                  background: "#ffffffcc",
                  backdropFilter: "blur(6px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  borderTop: `6px solid ${color}`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "1.05rem",
                    color,
                    mb: 1,
                  }}
                >
                  {type.label}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: "#555", mb: 2, fontSize: "0.9rem" }}
                >
                  Used: <b>{used}</b> / {total} &nbsp; | &nbsp; Remaining:{" "}
                  <b>{remaining}</b>
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={percent}
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "#f0f0f0",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: color,
                      transition: "width 0.6s ease",
                    },
                  }}
                />

                <Typography
                  variant="caption"
                  sx={{
                    mt: 1,
                    color: "#666",
                    textAlign: "right",
                    fontSize: "0.8rem",
                  }}
                >
                  {percent.toFixed(0)}% used
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default EmployeeLeave;





