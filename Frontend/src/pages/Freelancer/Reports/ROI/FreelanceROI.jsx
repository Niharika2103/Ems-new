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
  TextField,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

const FreelanceROI = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const freelancerData = [
    { project: 'Website Redesign', freelancer: 'Sarah Chen', cost: '$25,000', value: '$42,000', roi: '68%', duration: '3 months' },
    { project: 'Mobile App Development', freelancer: 'Mike Rodriguez', cost: '$38,000', value: '$55,000', roi: '45%', duration: '5 months' },
    { project: 'Marketing Campaign', freelancer: 'Emily Watson', cost: '$15,000', value: '$28,000', roi: '87%', duration: '2 months' },
    { project: 'Data Analysis', freelancer: 'David Kim', cost: '$12,000', value: '$18,000', roi: '50%', duration: '1 month' },
    { project: 'UI/UX Design', freelancer: 'Lisa Thompson', cost: '$20,000', value: '$30,000', roi: '50%', duration: '2 months' },
  ];

  // 🔍 Filter data based on search
  const filteredData = freelancerData.filter((item) =>
    item.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.freelancer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.roi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.duration.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getROIColor = (roi) => {
    const roiValue = parseInt(roi);
    if (roiValue >= 80) return 'success';
    if (roiValue >= 50) return 'warning';
    return 'error';
  };

  return (
    <Box>

      {/* Header with Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Freelancer ROI Analysis</Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Export Report
          </Button>
        </Box>
      </Box>

      {/* 🔍 Search Bar */}
      <Box sx={{ mb: 3, width: '300px' }}>
        <TextField
          fullWidth
          size="small"
          label="Search Projects, Freelancer or ROI"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      {/* ROI Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Freelancer Project ROI Analysis
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Project</TableCell>
                  <TableCell>Freelancer</TableCell>
                  <TableCell align="right">Cost</TableCell>
                  <TableCell align="right">Value</TableCell>
                  <TableCell align="right">ROI</TableCell>
                  <TableCell align="right">Duration</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.project}</TableCell>
                      <TableCell>{row.freelancer}</TableCell>
                      <TableCell align="right">{row.cost}</TableCell>
                      <TableCell align="right">{row.value}</TableCell>
                      <TableCell align="right">
                        <Chip label={row.roi} color={getROIColor(row.roi)} size="small" />
                      </TableCell>
                      <TableCell align="right">{row.duration}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No matching records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Recommendations Section */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recommendations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Increase budget for high-ROI marketing projects  
            <br />
            • Extend contracts with top-performing freelancers  
            <br />
            • Review low-ROI development projects  
          </Typography>
        </CardContent>
      </Card>

    </Box>
  );
};

export default FreelanceROI;
