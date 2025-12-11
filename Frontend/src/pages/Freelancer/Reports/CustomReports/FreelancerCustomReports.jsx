import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
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
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  TablePagination,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const FreelancerCustomReports = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // ⭐ Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Sample data
  const customReports = [
    { name: 'Monthly Performance', createdBy: 'John Doe', lastRun: '2023-07-01', schedule: 'Monthly', status: 'Active' },
    { name: 'Quarterly Budget', createdBy: 'Jane Smith', lastRun: '2023-06-15', schedule: 'Quarterly', status: 'Active' },
    { name: 'Employee Survey', createdBy: 'Mike Johnson', lastRun: '2023-05-20', schedule: 'One-time', status: 'Inactive' },
    { name: 'Project Timeline', createdBy: 'Sarah Williams', lastRun: '2023-07-05', schedule: 'Weekly', status: 'Active' },
    { name: 'Team Metrics', createdBy: 'David Wilson', lastRun: '2023-07-10', schedule: 'Monthly', status: 'Inactive' },
    { name: 'Hiring Report', createdBy: 'Emma Brown', lastRun: '2023-07-03', schedule: 'Weekly', status: 'Active' },
  ];

  const handleCreateReport = () => {
    setSelectedReport(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReport(null);
  };

  return (
    <Box sx={{ width: "100%", px: 0 }}>
      
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Custom Reports</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateReport}>
          Create Report
        </Button>
      </Box>

      {/* ⭐ FULL WIDTH GRID */}
      <Grid container spacing={3} sx={{ mx: 0, width: "100%" }}>

        {/* FULL WIDTH TABLE */}
        <Grid item xs={12}>
          <Card sx={{ mb: 3, width: "100%" }}>
            <CardContent>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">My Custom Reports</Typography>
                <Button variant="outlined" startIcon={<RefreshIcon />} size="small">
                  Refresh
                </Button>
              </Box>

              <TableContainer component={Paper} sx={{ width: "100%" }}>
                <Table sx={{ width: "100%" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Report Name</TableCell>
                      <TableCell>Created By</TableCell>
                      <TableCell>Last Run</TableCell>
                      <TableCell>Schedule</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {customReports
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((report, index) => (
                        <TableRow key={index}>
                          <TableCell>{report.name}</TableCell>
                          <TableCell>{report.createdBy}</TableCell>
                          <TableCell>{report.lastRun}</TableCell>
                          <TableCell>{report.schedule}</TableCell>
                          <TableCell>
                            <Chip
                              label={report.status}
                              color={report.status === 'Active' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>

                {/* ⭐ PAGINATION */}
                <TablePagination
                  component="div"
                  count={customReports.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25]}
                />
              </TableContainer>

            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create/Edit Report Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedReport ? 'Edit Custom Report' : 'Create Custom Report'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Report Name" defaultValue={selectedReport?.name || ''} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Data Source</InputLabel>
                <Select label="Data Source" defaultValue="hr">
                  <MenuItem value="hr">HR Database</MenuItem>
                  <MenuItem value="payroll">Payroll System</MenuItem>
                  <MenuItem value="projects">Project Management</MenuItem>
                  <MenuItem value="compliance">Compliance Database</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select label="Report Type" defaultValue="analytical">
                  <MenuItem value="analytical">Analytical</MenuItem>
                  <MenuItem value="summary">Summary</MenuItem>
                  <MenuItem value="detailed">Detailed</MenuItem>
                  <MenuItem value="comparative">Comparative</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel control={<Switch defaultChecked />} label="Include visualizations" />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel control={<Switch defaultChecked />} label="Schedule this report" />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Schedule Frequency</InputLabel>
                <Select label="Schedule Frequency" defaultValue="monthly">
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email Recipients" placeholder="email@example.com" />
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

    </Box>
  );
};

export default FreelancerCustomReports;
