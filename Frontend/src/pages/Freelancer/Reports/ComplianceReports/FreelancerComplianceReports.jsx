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
  LinearProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

const FreelancerComplianceReports = () => {
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

  return (
    <Box>
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

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main">
                3
              </Typography>
              <Typography color="text.secondary">
                Compliant Regulations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <WarningIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                1
              </Typography>
              <Typography color="text.secondary">
                Pending Review
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ErrorIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" color="error.main">
                1
              </Typography>
              <Typography color="text.secondary">
                Action Required
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                85%
              </Typography>
              <Typography color="text.secondary">
                Overall Compliance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
                {complianceData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.regulation}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(row.status)}
                        <Chip
                          label={row.status}
                          color={getStatusColor(row.status)}
                          size="small"
                        />
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FreelancerComplianceReports;