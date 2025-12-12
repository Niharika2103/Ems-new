import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  TextField,
  TablePagination,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

const FreelancerComplianceReports = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // ⭐ Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const complianceData = [
    { regulation: 'GDPR', status: 'Compliant', lastAudit: '2023-05-15', nextAudit: '2023-11-15', progress: 100 },
    { regulation: 'HIPAA', status: 'Compliant', lastAudit: '2023-04-22', nextAudit: '2023-10-22', progress: 100 },
    { regulation: 'SOX', status: 'Pending Review', lastAudit: '2023-03-10', nextAudit: '2023-09-10', progress: 75 },
    { regulation: 'ISO 27001', status: 'Compliant', lastAudit: '2023-06-05', nextAudit: '2023-12-05', progress: 100 },
    { regulation: 'PCI DSS', status: 'Action Required', lastAudit: '2023-02-28', nextAudit: '2023-08-28', progress: 60 },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Compliant':
        return <CheckIcon sx={{ color: 'success.main' }} />;
      case 'Pending Review':
        return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'Action Required':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      default:
        return <WarningIcon sx={{ color: 'warning.main' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Compliant':
        return 'success';
      case 'Pending Review':
        return 'warning';
      case 'Action Required':
        return 'error';
      default:
        return 'default';
    }
  };

  // 🔍 Filter table results
  const filteredData = complianceData.filter((item) =>
    item.regulation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.lastAudit.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nextAudit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>

      {/* Header + Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Compliance Reports</Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Export Compliance Report
          </Button>
        </Box>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3, width: '300px' }}>
        <TextField
          fullWidth
          size="small"
          label="Search Compliance"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      {/* Compliance Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Regulatory Compliance Status
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Regulation</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Audit</TableCell>
                  <TableCell>Next Audit</TableCell>
                  <TableCell>Progress</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.regulation}</TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getStatusIcon(row.status)}
                            <Chip label={row.status} color={getStatusColor(row.status)} size="small" />
                          </Box>
                        </TableCell>

                        <TableCell>{row.lastAudit}</TableCell>
                        <TableCell>{row.nextAudit}</TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={row.progress}
                              sx={{ flexGrow: 1 }}
                              color={
                                row.progress === 100
                                  ? 'success'
                                  : row.progress >= 75
                                  ? 'warning'
                                  : 'error'
                              }
                            />
                            <Typography variant="body2">{row.progress}%</Typography>
                          </Box>
                        </TableCell>

                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No matching records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* ⭐ Table Pagination */}
            <TablePagination
              component="div"
              count={filteredData.length}
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

export default FreelancerComplianceReports;
