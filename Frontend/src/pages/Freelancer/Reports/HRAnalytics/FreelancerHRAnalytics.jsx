import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
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
  TextField,
  Chip,
  TablePagination,
} from "@mui/material";
import { Refresh as RefreshIcon, Download as DownloadIcon } from "@mui/icons-material";
import { getFreelancerHRAnalyticsApi } from "../../../../api/authApi";

const FreelancerHRAnalytics = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [contractStatusFilter, setContractStatusFilter] = useState("all");
  const [data, setData] = useState([]);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch backend data
  const fetchData = async () => {
    try {
      const res = await getFreelancerHRAnalyticsApi();
      setData(res.data);
    } catch (err) {
      console.error("Error fetching freelancer analytics:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtering logic
  const filteredData = data.filter((row) => {
    const searchMatch =
      row.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.contract_title?.toLowerCase().includes(searchTerm.toLowerCase());

    const statusMatch =
      statusFilter === "all" ||
      (row.status && row.status.toLowerCase() === statusFilter);

    const contractStatusMatch =
      contractStatusFilter === "all" ||
      (row.contract_status &&
        row.contract_status.toLowerCase() === contractStatusFilter);

    return searchMatch && statusMatch && contractStatusMatch;
  });

  return (
    <Box>
      {/* HEADER */}
      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}
      >
        <Typography variant="h4">Freelancer HR Analytics</Typography>

        
      </Box>

      {/* SEARCH */}
      <Box sx={{ mb: 3, width: "300px" }}>
        <TextField
          fullWidth
          size="small"
          label="Search freelancers"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      {/* FILTERS */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        {/* Freelancer Status */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>

        {/* Contract Status */}
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Contract Status</InputLabel>
          <Select
            label="Contract Status"
            value={contractStatusFilter}
            onChange={(e) => setContractStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* TABLE + PAGINATION */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Freelancer Overview
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>Name</b></TableCell>
                  <TableCell><b>Email</b></TableCell>
                  <TableCell><b>Department</b></TableCell>
                  <TableCell><b>Contract Title</b></TableCell>
                  <TableCell><b>Start Date</b></TableCell>
                  <TableCell><b>End Date</b></TableCell>
                  <TableCell><b>Version</b></TableCell>
                  <TableCell><b>Contract Status</b></TableCell>
                  <TableCell><b>Project Cost</b></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.email}</TableCell>
                        <TableCell>{row.department || "—"}</TableCell>
                        <TableCell>{row.contract_title || "—"}</TableCell>
                        <TableCell>{row.contract_start_date || "—"}</TableCell>
                        <TableCell>{row.contract_end_date || "—"}</TableCell>
                        <TableCell>{row.version || "—"}</TableCell>

                        <TableCell>
                          <Chip
                            label={row.contract_status || "—"}
                            size="small"
                            color={
                              row.contract_status === "active"
                                ? "success"
                                : row.contract_status === "expired"
                                ? "error"
                                : "warning"
                            }
                          />
                        </TableCell>

                        <TableCell>{row.project_cost || "—"}</TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No matching freelancers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

            </Table>
          </TableContainer>

          {/* PAGINATION */}
          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 20]}
          />

        </CardContent>
      </Card>
    </Box>
  );
};

export default FreelancerHRAnalytics;
