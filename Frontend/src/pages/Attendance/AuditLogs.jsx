// import React, { useState } from 'react';
// import {
//   Box,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TablePagination,
//   TextField,
//   Chip,
//   Typography,
//   InputAdornment,
//   Button,
// } from '@mui/material';
// import {
//   Search,
//   FilterList,
//   Download,
// } from '@mui/icons-material';

// const AuditLogsTable = () => {
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(5);
//   const [searchTerm, setSearchTerm] = useState('');

//   // Mock data - 3 dummy datas
//   const auditLogs = [
//     {
//       id: 1,
//       name: 'Employee Profile Update',
//       createdBy: 'John Doe',
//       updatedBy: 'John Doe',
//       createdDate: '2024-01-15T10:30:00Z',
//       updatedDate: '2024-01-15T10:35:00Z',
//       status: 'pending',
//     },
//     {
//       id: 2,
//       name: 'Resume Upload',
//       createdBy: 'Sarah Wilson',
//       updatedBy: 'Sarah Wilson',
//       createdDate: '2024-01-15T09:15:00Z',
//       updatedDate: '2024-01-15T09:15:00Z',
//       status: 'completed',
//     },
//     {
//       id: 3,
//       name: 'System Login',
//       createdBy: 'Mike Johnson',
//       updatedBy: 'System',
//       createdDate: '2024-01-14T14:20:00Z',
//       updatedDate: '2024-01-14T14:20:00Z',
//       status: 'success',
//     },
//   ];

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'completed':
//       case 'success':
//         return 'success';
//       case 'failed':
//         return 'error';
//       case 'pending':
//         return 'warning';
//       case 'accessed':
//         return 'info';
//       default:
//         return 'default';
//     }
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-GB', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

//   const filteredLogs = auditLogs.filter(log =>
//     log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     log.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     log.updatedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     log.status.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const paginatedLogs = filteredLogs.slice(
//     page * rowsPerPage,
//     page * rowsPerPage + rowsPerPage
//   );

//   return (
//     <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
//       {/* Header */}
//       <Box>
//         <Typography variant="h5" fontWeight="bold" gutterBottom>
//           Audit Logs
//         </Typography>
//       </Box>

//       {/* Table with integrated pagination */}
//       <Paper 
//         elevation={3} 
//         sx={{ 
//           borderRadius: 2,
//           overflow: 'hidden',
//           border: '1px solid',
//           borderColor: 'divider',
//           mt: 2,
//         }}
//       >
//         <TableContainer>
//           <Table sx={{ minWidth: 650 }}>
//             <TableHead sx={{ backgroundColor: 'primary.main' }}>
//               <TableRow>
//                 <TableCell sx={{ fontWeight: 'bold', py: 2, color: 'white' }}>
//                   Name
//                 </TableCell>
//                 <TableCell sx={{ fontWeight: 'bold', py: 2, color: 'white' }}>
//                   Created By
//                 </TableCell>
//                 <TableCell sx={{ fontWeight: 'bold', py: 2, color: 'white' }}>
//                   Updated By
//                 </TableCell>
//                 <TableCell sx={{ fontWeight: 'bold', py: 2, color: 'white' }}>
//                   Created At
//                 </TableCell>
//                 <TableCell sx={{ fontWeight: 'bold', py: 2, color: 'white' }}>
//                   Updated At
//                 </TableCell>
//                 <TableCell sx={{ fontWeight: 'bold', py: 2, color: 'white' }}>
//                   Status
//                 </TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {paginatedLogs.map((log, index) => (
//                 <TableRow 
//                   key={log.id} 
//                   hover
//                   sx={{ 
//                     '&:last-child td, &:last-child th': { border: 0 },
//                     backgroundColor: index % 2 === 0 ? 'white' : 'grey.50',
//                     '&:hover': {
//                       backgroundColor: 'action.hover',
//                     },
//                   }}
//                 >
//                   <TableCell sx={{ py: 2 }}>
//                     <Typography variant="body2" fontWeight="500" color="text.primary">
//                       {log.name}
//                     </Typography>
//                   </TableCell>
                  
//                   <TableCell sx={{ py: 2 }}>
//                     <Typography variant="body2" color="text.primary">
//                       {log.createdBy}
//                     </Typography>
//                   </TableCell>
                  
//                   <TableCell sx={{ py: 2 }}>
//                     <Typography variant="body2" color="text.primary">
//                       {log.updatedBy}
//                     </Typography>
//                   </TableCell>
                  
//                   <TableCell sx={{ py: 2 }}>
//                     <Typography variant="body2" color="text.secondary">
//                       {formatDate(log.createdDate)}
//                     </Typography>
//                   </TableCell>
                  
//                   <TableCell sx={{ py: 2 }}>
//                     <Typography variant="body2" color="text.secondary">
//                       {formatDate(log.updatedDate)}
//                     </Typography>
//                   </TableCell>
                  
//                   <TableCell sx={{ py: 2 }}>
//                     <Chip
//                       label={log.status.toUpperCase()}
//                       color={getStatusColor(log.status)}
//                       size="small"
//                       variant="filled"
//                       sx={{ 
//                         minWidth: 80,
//                         fontWeight: 'bold',
//                         fontSize: '0.75rem',
//                       }}
//                     />
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>

//         {/* Pagination inside the table */}
//         <TablePagination
//           rowsPerPageOptions={[5, 10, 25]}
//           component="div"
//           count={filteredLogs.length}
//           rowsPerPage={rowsPerPage}
//           page={page}
//           onPageChange={handleChangePage}
//           onRowsPerPageChange={handleChangeRowsPerPage}
//           sx={{
//             borderTop: '1px solid',
//             borderColor: 'divider',
//             '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
//               color: 'text.primary',
//             },
//           }}
//         />
//       </Paper>
//     </Box>
//   );
// };

// export default AuditLogsTable;

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

  // ✅ Get state from Redux
  const { auditLogs, auditLoading, auditError } = useSelector(
    (state) => state.attendance
  );

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // ✅ Fetch all audit logs on mount (no employeeId)
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
          ⚠️ {auditError}
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
                      {/* ✅ Show both weekly & monthly status */}
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
