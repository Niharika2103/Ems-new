import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  Chip,
  Avatar,
  TablePagination
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllEmployees } from "../../features/employeesDetails/employeesSlice";
import {
  Visibility,
  Engineering,
  People,
  BusinessCenter,
  DesignServices,
  LocalAtm
} from "@mui/icons-material";

const EmployeeDocumentUpload = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const list = useSelector((state) => state.employeeDetails.list);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    if (list.length === 0) {
      dispatch(fetchAllEmployees());
    }
  }, [dispatch, list.length]);

  const getDepartmentIcon = (department) => {
    const icons = {
      Engineering: <Engineering />,
      HR: <People />,
      Marketing: <BusinessCenter />,
      Sales: <BusinessCenter />,
      Finance: <LocalAtm />,
      Design: <DesignServices />
    };
    return icons[department] || <BusinessCenter />;
  };

  const getDepartmentColor = (department) => {
    const colors = {
      Engineering: "#1976d2",
      HR: "#9c27b0",
      Marketing: "#2e7d32",
      Sales: "#ed6c02",
      Finance: "#d32f2f",
      Design: "#0288d1"
    };
    return colors[department] || "#666666";
  };

  const handleUploadDocuments = (employee) => {
    navigate("/documents/letters", {
      state: {
         employeeId: employee,
      },
    });
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          mb: 3,
          fontWeight: "bold",
          color: "primary.main",
          textAlign: "center",
        }}
      >
        Employee Documents
      </Typography>

      {/* RESPONSIVE TABLE WRAPPER */}
      <TableContainer
        component={Paper}
        elevation={3}
        sx={{
          borderRadius: 3,
          overflowX: "auto", // 👈 makes table responsive
          width: "100%",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.main" }}>
              <TableCell sx={{ color: "black", fontWeight: "bold", py: 2 }}>
                Employee Name
              </TableCell>
              <TableCell sx={{ color: "black", fontWeight: "bold", py: 2 }}>
                Department
              </TableCell>
              <TableCell
                sx={{
                  color: "black",
                  fontWeight: "bold",
                  py: 2,
                  textAlign: "center",
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {list.length > 0 ? (
              list
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((employee) => {
                  const name = employee.name || employee.fullName || "Unknown";
                  const departmentName = employee.department || "General";

                  return (
                    <TableRow
                      key={employee.id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "action.hover",
                          transform: "scale(1.01)",
                          transition: "all 0.2s ease-in-out",
                        },
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            sx={{
                              bgcolor: "primary.main",
                              mr: 2,
                              width: 40,
                              height: 40,
                            }}
                          >
                            {name.charAt(0)}
                          </Avatar>

                          <Typography variant="subtitle1" fontWeight="600">
                            {name}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          icon={getDepartmentIcon(departmentName)}
                          label={departmentName}
                          sx={{
                            backgroundColor: getDepartmentColor(departmentName),
                            color: "white",
                            fontWeight: "600",
                            px: 1,
                            "& .MuiChip-icon": { color: "white" },
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ py: 2, textAlign: "center" }}>
                        <Button
                          variant="contained"
                          startIcon={<Visibility />}
                           onClick={() => handleUploadDocuments(employee.id)}
                          sx={{
                            backgroundColor: "primary.main",
                            color: "white",
                            fontWeight: "bold",
                            px: 3,
                            borderRadius: 2,
                            "&:hover": {
                              backgroundColor: "primary.dark",
                              transform: "translateY(-3px)",
                              boxShadow: 3,
                            },
                          }}
                        >
                          Upload Documents
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
            ) : (
              <TableRow>
                <TableCell colSpan={3} sx={{ py: 3 }} align="center">
                  No Employees Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* PAGINATION */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={list.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default EmployeeDocumentUpload;
