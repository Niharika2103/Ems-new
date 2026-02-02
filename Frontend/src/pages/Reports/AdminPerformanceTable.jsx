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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showMessage = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const loadReviews = async () => {
    try {
      const res = await fetchAllPerformanceReviewsApi();
      setEmployees(res.data || []);
    } catch (err) {
      showMessage(
        err.response?.data?.error ||
          err.message ||
          "Failed to load performance reviews",
        "error"
      );
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleBack = () => {
    setSelectedEmployee(null);
    loadReviews();
  };

  return (
    <Box sx={{ p: 4 }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity}>
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
                  <TableCell>Name</TableCell>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Designation</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {employees.map((emp) => (
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <AdminPerformanceReview
          employee={selectedEmployee}
          onStatusChange={handleBack}
          showMessage={showMessage}
        />
      )}
    </Box>
  );
}
