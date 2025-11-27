import React from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterAlt as FilterIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

const FreelancerROI = () => {
  const freelancerData = [
    { project: 'Website Redesign', freelancer: 'Sarah Chen', cost: '$25,000', value: '$42,000', roi: '68%', duration: '3 months' },
    { project: 'Mobile App Development', freelancer: 'Mike Rodriguez', cost: '$38,000', value: '$55,000', roi: '45%', duration: '5 months' },
    { project: 'Marketing Campaign', freelancer: 'Emily Watson', cost: '$15,000', value: '$28,000', roi: '87%', duration: '2 months' },
    { project: 'Data Analysis', freelancer: 'David Kim', cost: '$12,000', value: '$18,000', roi: '50%', duration: '1 month' },
    { project: 'UI/UX Design', freelancer: 'Lisa Thompson', cost: '$20,000', value: '$30,000', roi: '50%', duration: '2 months' },
  ];

  const metrics = [
    { label: 'Total Freelancer Spend', value: '$110,000', trend: 'up', change: '+15%' },
    { label: 'Average ROI', value: '60%', trend: 'up', change: '+8%' },
    { label: 'Active Projects', value: '12', trend: 'stable', change: '+2' },
    { label: 'Cost Savings', value: '$45,000', trend: 'up', change: '+12%' },
  ];

  const getROIColor = (roi) => {
    const roiValue = parseInt(roi);
    if (roiValue >= 80) return 'success';
    if (roiValue >= 50) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Freelancer ROI Analysis</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<FilterIcon />}>
            Filter
          </Button>
          <Button variant="outlined" startIcon={<RefreshIcon />}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Export Report
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  {metric.label}
                </Typography>
                <Typography variant="h5" component="div">
                  {metric.value}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5 }} />
                  <Typography variant="body2" sx={{ color: 'success.main' }}>
                    {metric.change} from last quarter
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>ROI Range</InputLabel>
            <Select label="ROI Range" defaultValue="all">
              <MenuItem value="all">All ROI</MenuItem>
              <MenuItem value="high">High (75%+)</MenuItem>
              <MenuItem value="medium">Medium (50-75%)</MenuItem>
              <MenuItem value="low">Low (Below 50%)</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Project Type</InputLabel>
            <Select label="Project Type" defaultValue="all">
              <MenuItem value="all">All Projects</MenuItem>
              <MenuItem value="development">Development</MenuItem>
              <MenuItem value="design">Design</MenuItem>
              <MenuItem value="marketing">Marketing</MenuItem>
              <MenuItem value="analysis">Analysis</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

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
                {freelancerData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.project}</TableCell>
                    <TableCell>{row.freelancer}</TableCell>
                    <TableCell align="right">{row.cost}</TableCell>
                    <TableCell align="right">{row.value}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={row.roi}
                        color={getROIColor(row.roi)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">{row.duration}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performing Freelancers
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {freelancerData.slice(0, 3).map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>{item.freelancer}</Typography>
                    <Chip label={item.roi} color="success" size="small" />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default FreelancerROI;