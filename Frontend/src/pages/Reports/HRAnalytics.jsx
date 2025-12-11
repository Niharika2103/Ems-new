// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Typography,
//   Grid,
//   Card,
//   CardContent,
//   Button,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Chip,
// } from "@mui/material";

// import {
//   Refresh as RefreshIcon,
//   Download as DownloadIcon,
//   FilterAlt as FilterIcon,
// } from "@mui/icons-material";

// import { fetchFullTimeEmployeesApi } from "../../api/authApi";

// const HRAnalytics = () => {
//   const [employees, setEmployees] = useState([]);

//   useEffect(() => {
//     loadEmployees();
//   }, []);

//   const loadEmployees = async () => {
//     try {
//       const response = await fetchFullTimeEmployeesApi();
//       const backendEmployees = response.data;

//       // Inject dummy placeholder analytics
//       const updatedEmployees = backendEmployees.map((emp) => ({
//         ...emp,
//         performance: "4.0",         // dummy rating
//         turnoverRisk: "Low",         // dummy risk
//         tenure: "1.5 years",         // dummy tenure
//       }));

//       setEmployees(updatedEmployees);
//     } catch (error) {
//       console.error("Error loading employees:", error);
//     }
//   };

//   return (
//     <Box>
//       {/* Header */}
//       <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
//         <Typography variant="h4">HR Analytics</Typography>

//         <Box sx={{ display: "flex", gap: 1 }}>
//           <Button variant="outlined" startIcon={<FilterIcon />}>
//             Filter
//           </Button>
//           <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadEmployees}>
//             Refresh
//           </Button>
//           <Button variant="contained" startIcon={<DownloadIcon />}>
//             Export
//           </Button>
//         </Box>
//       </Box>

//       {/* Optional Filters */}
//       <Box sx={{ mb: 3 }}>
//         <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
//           <FormControl sx={{ minWidth: 120 }} size="small">
//             <InputLabel>Department</InputLabel>
//             <Select label="Department" defaultValue="all">
//               <MenuItem value="all">All Departments</MenuItem>
//               <MenuItem value="Engineering">Engineering</MenuItem>
//               <MenuItem value="Marketing">Marketing</MenuItem>
//               <MenuItem value="Sales">Sales</MenuItem>
//               <MenuItem value="HR">HR</MenuItem>
//             </Select>
//           </FormControl>

//           <FormControl sx={{ minWidth: 120 }} size="small">
//             <InputLabel>Risk Level</InputLabel>
//             <Select label="Risk Level" defaultValue="all">
//               <MenuItem value="all">All Levels</MenuItem>
//               <MenuItem value="low">Low</MenuItem>
//               <MenuItem value="medium">Medium</MenuItem>
//               <MenuItem value="high">High</MenuItem>
//             </Select>
//           </FormControl>
//         </Box>
//       </Box>

//       {/* Employee Table */}
//       <Card>
//         <CardContent>
//           <Typography variant="h6" gutterBottom>
//             Full-Time Employees 
//           </Typography>

//           <TableContainer component={Paper}>
//             <Table>
//               <TableHead>
//                 <TableRow>
//                   <TableCell>Employee Name</TableCell>
//                   <TableCell>Department</TableCell>
//                   <TableCell>Performance Rating</TableCell>
//                   <TableCell>Turnover Risk</TableCell>
//                   <TableCell>Tenure</TableCell>
//                 </TableRow>
//               </TableHead>

//               <TableBody>
//                 {employees.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={5} align="center">
//                       No employees found
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   employees.map((emp) => (
//                     <TableRow key={emp.id}>
//                       <TableCell>{emp.name}</TableCell>
//                       <TableCell>{emp.department}</TableCell>

//                       {/* Dummy values for now */}
//                       <TableCell>{emp.performance}/5</TableCell>

//                       <TableCell>
//                         <Chip
//                           label={emp.turnoverRisk}
//                           color={
//                             emp.turnoverRisk === "Low"
//                               ? "success"
//                               : emp.turnoverRisk === "Medium"
//                               ? "warning"
//                               : "error"
//                           }
//                           size="small"
//                         />
//                       </TableCell>

//                       <TableCell>{emp.tenure}</TableCell>
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         </CardContent>
//       </Card>
//     </Box>
//   );
// };

// export default HRAnalytics;
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
  TablePagination
} from "@mui/material";

import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterAlt as FilterIcon,
} from "@mui/icons-material";

import { fetchFullTimeEmployeesApi } from "../../api/authApi";

const HRAnalytics = () => {
  const [employees, setEmployees] = useState([]);

  // ➤ Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await fetchFullTimeEmployeesApi();
      const backendEmployees = response.data;

      const updatedEmployees = backendEmployees.map((emp) => ({
        ...emp,
        performance: "4.0",
        turnoverRisk: "Low",
        tenure: "1.5 years",
      }));

      setEmployees(updatedEmployees);
    } catch (error) {
      console.error("Error loading employees:", error);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">HR Analytics</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" startIcon={<FilterIcon />}>
            Filter
          </Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadEmployees}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Export
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Department</InputLabel>
            <Select label="Department" defaultValue="all">
              <MenuItem value="all">All Departments</MenuItem>
              <MenuItem value="Engineering">Engineering</MenuItem>
              <MenuItem value="Marketing">Marketing</MenuItem>
              <MenuItem value="Sales">Sales</MenuItem>
              <MenuItem value="HR">HR</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Risk Level</InputLabel>
            <Select label="Risk Level" defaultValue="all">
              <MenuItem value="all">All Levels</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Employee Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Full-Time Employees
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Performance Rating</TableCell>
                  <TableCell>Turnover Risk</TableCell>
                  <TableCell>Tenure</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No employees found
                    </TableCell>
                  </TableRow>
                ) : (
                  employees
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((emp) => (
                      <TableRow key={emp.id}>
                        <TableCell>{emp.name}</TableCell>
                        <TableCell>{emp.department}</TableCell>
                        <TableCell>{emp.performance}/5</TableCell>

                        <TableCell>
                          <Chip
                            label={emp.turnoverRisk}
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

                        <TableCell>{emp.tenure}</TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={employees.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HRAnalytics;

