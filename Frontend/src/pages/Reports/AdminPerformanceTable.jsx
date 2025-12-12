// AdminPerformanceTable.jsx
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableContainer,
  Paper,
  Button,
  Chip,
  Box,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { fetchAllPerformanceReviewsApi } from "../../api/authApi";
import AdminPerformanceReview from "./AdminPerformanceReview";

export default function AdminPerformanceTable() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const loadReviews = async () => {
    try {
      const res = await fetchAllPerformanceReviewsApi();
      setEmployees(res.data || []);
    } catch (err) {
      console.error("Failed to load reviews:", err);
      setSnackbar({
        open: true,
        message: "Failed to load performance reviews.",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleBack = () => {
    setSelectedEmployee(null);
    loadReviews(); // refresh list after approval/rejection
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 4 }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {!selectedEmployee ? (
        <>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
            Employee Performance Review – Admin Panel
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Employee ID</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Designation</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Action</strong>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No performance reviews found.
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((emp) => (
                    <TableRow key={emp.review_id}>
                      <TableCell>{emp.employee_name}</TableCell>
                      <TableCell>{emp.employee_code}</TableCell>
                      <TableCell>{emp.designation}</TableCell>
                      <TableCell>
                        <Chip
                          label={emp.status}
                          color={
                            emp.status === "Approved"
                              ? "success"
                              : emp.status === "Rejected"
                              ? "error"
                              : "warning"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => setSelectedEmployee(emp)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <AdminPerformanceReview employee={selectedEmployee} onStatusChange={handleBack} />
      )}
    </Box>
  );
}