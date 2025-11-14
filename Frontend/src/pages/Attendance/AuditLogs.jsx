import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchAuditLogs } from "../../features/attendance/attendanceSlice";

const AuditLogsTable = () => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Get state from Redux
  const { auditLogs, auditLoading, auditError } = useSelector(
    (state) => state.attendance
  );


  // Fetch all audit logs on mount (no employeeId)
  useEffect(() => {
    dispatch(fetchAuditLogs());
  }, [dispatch]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "approved":
      case "completed":
      case "success":
        return "success";
      case "rejected":
      case "failed":
        return "error";
      case "pending":
      case "pending_approval":
        return "warning";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const paginatedLogs = (auditLogs || []).slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3, backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Audit Logs
      </Typography>

      {/* Loading state */}
      {auditLoading && (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      )}

      {/* Error state */}
      {auditError && (
        <Typography color="error" align="center" mt={3}>
          {auditError}
        </Typography>
      )}

      {/* No data */}
      {!auditLoading && !auditError && auditLogs?.length === 0 && (
        <Typography align="center" color="text.secondary" mt={3}>
          No audit logs found.
        </Typography>
      )}

      {/* Table */}
      {!auditLoading && auditLogs?.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            mt: 2,
          }}
        >
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: "primary.main" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                    Employee
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                    Created By
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                    Updated By
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                    Created At
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                    Updated At
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedLogs.map((log, index) => (
                  <TableRow
                    key={log.id || index}
                    hover
                    sx={{
                      backgroundColor: index % 2 === 0 ? "white" : "grey.50",
                    }}
                  >
                    <TableCell>{log.employee_name || "-"}</TableCell>
                    <TableCell>{log.created_by || "-"}</TableCell>
                    <TableCell>{log.updated_by || "-"}</TableCell>
                    <TableCell>{formatDate(log.created_at)}</TableCell>
                    <TableCell>{formatDate(log.updated_at)}</TableCell>
                    <TableCell>
                      {/* Show both weekly & monthly status */}
                      {log.weekly_status && (
                        <Chip
                          label={`Weekly: ${log.weekly_status}`}
                          color={getStatusColor(log.weekly_status)}
                          size="small"
                          sx={{ mr: 1, fontWeight: "bold" }}
                        />
                      )}
                      {log.monthly_status && (
                        <Chip
                          label={`Monthly: ${log.monthly_status}`}
                          color={getStatusColor(log.monthly_status)}
                          size="small"
                          sx={{ fontWeight: "bold" }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={auditLogs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
    </Box>
  );
};

export default AuditLogsTable;
