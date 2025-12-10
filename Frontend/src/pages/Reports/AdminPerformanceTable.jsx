import React, { useState } from "react";
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
} from "@mui/material";
import AdminPerformanceReview from "./AdminPerformanceReview"; // Form Component

export default function AdminPerformanceTable() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Dummy employee list (replace with API response)
  const [employees, setEmployees] = useState([
    {
      id: 1,
      employeeName: "Rohit",
      employeeId: "EMP101",
      designation: "Developer",
      status: "Pending",
      selfData: {},
      tlData: {},
    },
    {
      id: 2,
      employeeName: "Priya",
      employeeId: "EMP102",
      designation: "Designer",
      status: "Self Reviewed",
      selfData: {},
      tlData: {},
    },
    {
      id: 3,
      employeeName: "Kumar",
      employeeId: "EMP103",
      designation: "QA Engineer",
      status: "Approved",
      selfData: {},
      tlData: {},
    }
  ]);

  const handleView = (emp) => {
    setSelectedEmployee(emp);
  };

  const updateStatusFromForm = (id, newStatus) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id ? { ...emp, status: newStatus } : emp
      )
    );
    setSelectedEmployee(null); // close form
  };

  return (
    <Box sx={{ p: 4 }}>
      {!selectedEmployee && (
        <>
          {/* 🔥 Updated Title with MUI Typography (H4) */}
          <Typography 
            variant="h4" 
            fontWeight={700} 
            sx={{ mb: 3 }}
          >
            Employee Performance Review – Admin Panel
          </Typography>

          <TableContainer component={Paper} sx={{ boxShadow: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Employee ID</strong></TableCell>
                  <TableCell><strong>Designation</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>{emp.employeeName}</TableCell>
                    <TableCell>{emp.employeeId}</TableCell>
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
                        onClick={() => handleView(emp)}
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
      )}

      {/* ========================== VIEW PERFORMANCE FORM =========================== */}
      {selectedEmployee && (
        <AdminPerformanceReview
          employee={selectedEmployee}
          onStatusChange={updateStatusFromForm}
        />
      )}
    </Box>
  );
}
