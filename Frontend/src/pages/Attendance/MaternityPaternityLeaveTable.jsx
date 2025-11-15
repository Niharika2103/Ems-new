import React, { useState, useEffect } from "react";
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
  Typography,
  Chip,
  TablePagination,
  Modal,
  CircularProgress,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import {
  fetchPendingParentalLeaves,
  approveParentalLeave,
} from "../../features/attendance/attendanceSlice";

const MaternityPaternityLeaveTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { pendingLeaves, loading, error } = useSelector((state) => state.attendance);
  const [localLeaves, setLocalLeaves] = useState([]);
  const [openView, setOpenView] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch on mount
  useEffect(() => {
    dispatch(fetchPendingParentalLeaves());
  }, [dispatch]);

  // Map to local state (like TimesheetTable)
  useEffect(() => {
    if (pendingLeaves && Array.isArray(pendingLeaves)) {
      setLocalLeaves(pendingLeaves);
    }
  }, [pendingLeaves]);

  const calculateEndDate = (start, type) => {
    if (type === "Paternity") return dayjs(start).add(6, "day").format("YYYY-MM-DD");
    if (type === "Maternity") return dayjs(start).add(179, "day").format("YYYY-MM-DD");
    return start;
  };

  const handleView = (emp) => {
    const endDate = calculateEndDate(emp.startDate, emp.leaveType);
    setSelectedEmployee({ ...emp, endDate });
    setOpenView(true);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedEmployee) return;

    const action = newStatus === "Approved" ? "approve" : "reject";

    try {
      const resultAction = await dispatch(
        approveParentalLeave({
          attendance_id: selectedEmployee.id,
          action,
        })
      );

      if (approveParentalLeave.fulfilled.match(resultAction)) {
        toast.success(`${selectedEmployee.leaveType} leave ${action}d!`);
        // Refresh list
        dispatch(fetchPendingParentalLeaves());
        setOpenView(false);

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
          }, 800);
        }
      } else {
        toast.error("Failed to update leave status");
      }
    } catch (err) {
      toast.error("Error updating leave");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Rejected":
        return "error";
      default:
        return "warning";
    }
  };

  const paginatedLeaves = localLeaves.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading && localLeaves.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">Error: {JSON.stringify(error)}</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, p: 3 }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
        Maternity and Paternity Leave Requests
      </Typography>

      {localLeaves.length === 0 ? (
        <Typography>No pending parental leave requests.</Typography>
      ) : (
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
              {paginatedLeaves.map((emp) => (
                <TableRow key={emp.id} hover>
                  <TableCell>{emp.employeeId}</TableCell>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>{emp.role}</TableCell>
                  <TableCell>{emp.leaveType}</TableCell>
                  <TableCell>
                    <Chip label="Pending" color="warning" size="small" />
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

          <TablePagination
            component="div"
            count={localLeaves.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </TableContainer>
      )}

      {/* View Modal */}
      <Modal open={openView} onClose={() => setOpenView(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          {selectedEmployee && (
            <>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Leave Details
              </Typography>
              <Typography sx={{ mb: 1 }}><b>ID:</b> {selectedEmployee.employeeId}</Typography>
              <Typography sx={{ mb: 1 }}><b>Name:</b> {selectedEmployee.name}</Typography>
              <Typography sx={{ mb: 1 }}><b>Role:</b> {selectedEmployee.role}</Typography>
              <Typography sx={{ mb: 1 }}><b>Type:</b> {selectedEmployee.leaveType}</Typography>
              <Typography sx={{ mb: 1 }}><b>Start:</b> {selectedEmployee.startDate}</Typography>
              <Typography sx={{ mb: 2 }}><b>End:</b> {selectedEmployee.endDate}</Typography>

              <Box display="flex" gap={2} mt={3}>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  onClick={() => handleStatusChange("Approved")}
                >
                  Approve
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  onClick={() => handleStatusChange("Rejected")}
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