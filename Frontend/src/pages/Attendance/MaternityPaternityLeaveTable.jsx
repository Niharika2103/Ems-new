import React, { useState } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Modal,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const MaternityPaternityLeaveTable = () => {
  const navigate = useNavigate();

  const [openView, setOpenView] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // --- Hardcoded leave data ---
  const [leaveData, setLeaveData] = useState([
    {
      id: 1,
      employeeId: "EMP001",
      name: "Alice",
      role: "Developer",
      leaveType: "Maternity",
      status: "Pending",
      startDate: "2025-01-05",
    },
    {
      id: 2,
      employeeId: "EMP002",
      name: "Bob",
      role: "Designer",
      leaveType: "Paternity",
      status: "Approved",
      startDate: "2025-03-10",
    },
    {
      id: 3,
      employeeId: "EMP003",
      name: "Charlie",
      role: "Tester",
      leaveType: "Maternity",
      status: "Pending",
      startDate: "2025-05-15",
    },
    {
      id: 4,
      employeeId: "EMP004",
      name: "David",
      role: "Manager",
      leaveType: "Paternity",
      status: "Pending",
      startDate: "2025-06-20",
    },
  ]);

  // --- Get Chip color ---
  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Rejected":
        return "error";
      case "Pending":
        return "warning";
      default:
        return "default";
    }
  };

  // --- Auto calculate end date ---
  const calculateEndDate = (start, type) => {
    if (type === "Paternity") return dayjs(start).add(6, "day").format("YYYY-MM-DD");
    if (type === "Maternity") return dayjs(start).add(179, "day").format("YYYY-MM-DD");
    return start;
  };

  // --- Open popup for selected employee ---
  const handleView = (employee) => {
    const endDate = calculateEndDate(employee.startDate, employee.leaveType);
    setSelectedEmployee({ ...employee, endDate });
    setOpenView(true);
  };

  // --- Approve or Reject handler ---
  const handleStatusChange = (newStatus) => {
    if (!selectedEmployee) return;

    // update status locally
    setLeaveData((prev) =>
      prev.map((emp) =>
        emp.id === selectedEmployee.id ? { ...emp, status: newStatus } : emp
      )
    );

    setOpenView(false);

    // redirect only when approved
    if (newStatus === "Approved") {
      setTimeout(() => {
        navigate("/attendance/timesheet", {
          state: {
            employeeId: selectedEmployee.employeeId,
            name: selectedEmployee.name,
            leaveType: selectedEmployee.leaveType,
            startDate: selectedEmployee.startDate,
            endDate: selectedEmployee.endDate,
          },
        });
      }, 800); // smooth 0.8 sec delay before redirect
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Maternity and Paternity Employee List
      </Typography>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ bgcolor: "primary.main" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Employee ID</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Role</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Leave Type</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaveData.map((emp) => (
              <TableRow key={emp.id} hover>
                <TableCell>{emp.employeeId}</TableCell>
                <TableCell>{emp.name}</TableCell>
                <TableCell>{emp.role}</TableCell>
                <TableCell>{emp.leaveType}</TableCell>
                <TableCell>
                  <Chip label={emp.status} color={getStatusColor(emp.status)} size="small" />
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
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

      {/* --- View Popup --- */}
      <Modal open={openView} onClose={() => setOpenView(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            width: 400,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Employee Leave Details
          </Typography>

          {selectedEmployee && (
            <>
              <Typography sx={{ mb: 1 }}>
                <b>Employee ID:</b> {selectedEmployee.employeeId}
              </Typography>
              <Typography sx={{ mb: 1 }}>
                <b>Name:</b> {selectedEmployee.name}
              </Typography>
              <Typography sx={{ mb: 1 }}>
                <b>Role:</b> {selectedEmployee.role}
              </Typography>
              <Typography sx={{ mb: 1 }}>
                <b>Leave Type:</b> {selectedEmployee.leaveType}
              </Typography>
              <Typography sx={{ mb: 1 }}>
                <b>Status:</b> {selectedEmployee.status}
              </Typography>
              <Typography sx={{ mb: 1 }}>
                <b>Start Date:</b> {selectedEmployee.startDate}
              </Typography>
              <Typography sx={{ mb: 2 }}>
                <b>End Date:</b> {selectedEmployee.endDate}
              </Typography>

              <Box display="flex" justifyContent="space-between" mt={3}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleStatusChange("Approved")}
                  sx={{ width: "48%" }}
                >
                  Approve
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleStatusChange("Rejected")}
                  sx={{ width: "48%" }}
                >
                  Reject
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default MaternityPaternityLeaveTable;
