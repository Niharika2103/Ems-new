import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";

import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterAlt as FilterIcon,
} from "@mui/icons-material";

import { fetchFinalRatingsApi } from "../../api/authApi"; // ✅ Use real API

const HRAnalytics = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);


const loadEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetchFinalRatingsApi();
      const realEmployees = response.data; // ← Real data from backend

      // Map to match your table structure
      const formattedEmployees = realEmployees.map((emp) => ({
        id: emp.employee_uuid,
        name: emp.employee_name,
        department: emp.designation || "General", // You don't have department, so use designation as fallback
        performance: emp.final_rating,
        turnoverRisk: emp.turnover_risk,
        tenure: emp.tenure,
        selfRating: emp.self_rating,
        tlRating: emp.tl_rating,
      }));

      setEmployees(formattedEmployees);
    } catch (error) {
      console.error("Error loading employees:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // Optional: Export logic (you can enhance later)
  const handleExport = () => {
    alert("Export feature can be implemented (e.g., CSV download).");
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">HR Analytics</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" startIcon={<FilterIcon />} disabled>
            Filter
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadEmployees}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExport}>
            Export
          </Button>
        </Box>
      </Box>

      {/* Filters (optional – you can enhance filtering later) */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Department</InputLabel>
            <Select label="Department" defaultValue="all" disabled>
              <MenuItem value="all">All Departments</MenuItem>
              <MenuItem value="Engineering">Engineering</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Risk Level</InputLabel>
            <Select label="Risk Level" defaultValue="all" disabled>
              <MenuItem value="all">All Levels</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Employee Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Full-Time Employees – Performance Analytics
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee Name</TableCell>
                  <TableCell>Designation</TableCell>
                  <TableCell>Self / TL / Final Rating</TableCell>
                  <TableCell>Turnover Risk</TableCell>
                  <TableCell>Tenure</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      {loading ? "Loading..." : "No approved performance reviews found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>{emp.name}</TableCell>
                      <TableCell>{emp.department}</TableCell>

                      <TableCell>
                        {emp.selfRating || "–"} / {emp.tlRating || "–"} /{" "}
                        <strong>{emp.performance || "–"}</strong>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={emp.turnoverRisk || "Unknown"}
                          color={
                            emp.turnoverRisk === "Low"
                              ? "success"
                              : emp.turnoverRisk === "Medium"
                              ? "warning"
                              : "error"
                          }
                          size="small"
                        />
                      </TableCell>

                      <TableCell>{emp.tenure || "–"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HRAnalytics;