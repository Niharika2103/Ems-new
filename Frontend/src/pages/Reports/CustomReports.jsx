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
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  PlayArrow as RunIcon,
} from '@mui/icons-material';

const CustomReports = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const customReports = [
    { name: 'Monthly Performance', createdBy: 'John Doe', lastRun: '2023-07-01', schedule: 'Monthly', status: 'Active' },
    { name: 'Quarterly Budget', createdBy: 'Jane Smith', lastRun: '2023-06-15', schedule: 'Quarterly', status: 'Active' },
    { name: 'Employee Survey', createdBy: 'Mike Johnson', lastRun: '2023-05-20', schedule: 'One-time', status: 'Inactive' },
    { name: 'Project Timeline', createdBy: 'Sarah Williams', lastRun: '2023-07-05', schedule: 'Weekly', status: 'Active' },
  ];

  const reportTemplates = [
    { name: 'HR Metrics', category: 'HR', fields: 12 },
    { name: 'Financial Summary', category: 'Finance', fields: 8 },
    { name: 'Project Status', category: 'Projects', fields: 15 },
    { name: 'Compliance Check', category: 'Legal', fields: 10 },
  ];

  const handleCreateReport = () => {
    setSelectedReport(null);
    setOpenDialog(true);
  };

  const handleEditReport = (report) => {
    setSelectedReport(report);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReport(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Custom Reports</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateReport}>
          Create Report
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">My Custom Reports</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" startIcon={<RefreshIcon />} size="small">
                    Refresh
                  </Button>
                </Box>
              </Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Report Name</TableCell>
                      <TableCell>Created By</TableCell>
                      <TableCell>Last Run</TableCell>
                      <TableCell>Schedule</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customReports.map((report, index) => (
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
                        <TableCell>
                          <IconButton size="small" onClick={() => handleEditReport(report)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small">
                            <RunIcon />
                          </IconButton>
                          <IconButton size="small">
                            <DownloadIcon />
                          </IconButton>
                          <IconButton size="small">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Report Templates
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {reportTemplates.map((template, index) => (
                  <Card key={index} variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {template.name}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip label={template.category} size="small" />
                        <Typography variant="body2" color="text.secondary">
                          {template.fields} fields
                        </Typography>
                      </Box>
                      <Button size="small" sx={{ mt: 1 }} fullWidth>
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedReport ? 'Edit Custom Report' : 'Create Custom Report'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Report Name"
                defaultValue={selectedReport?.name || ''}
              />
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
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Include visualizations"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Schedule this report"
              />
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
              <TextField
                fullWidth
                label="Email Recipients"
                placeholder="email@example.com"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            {selectedReport ? 'Update Report' : 'Create Report'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomReports;