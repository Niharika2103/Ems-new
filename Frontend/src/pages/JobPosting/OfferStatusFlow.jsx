import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Chip,
  Grid,
  Avatar,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  SendOutlined,
  VisibilityOutlined,
  CheckCircleOutlined,
  CancelOutlined,
  AttachMoneyOutlined,
  ScheduleOutlined,
  TrendingUpRounded,
  NotificationsNone,
  PersonOutline,
  BusinessCenterOutlined
} from '@mui/icons-material';

const OfferStatusFlow = () => {
  const [currentStatus, setCurrentStatus] = useState('Sent');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const statusFlow = [
    { 
      value: 'Sent', 
      label: 'Offer Sent', 
      icon: <SendOutlined />,
      description: 'Offer documentation has been delivered to candidate',
      timeframe: 'Within 24 hours'
    },
    { 
      value: 'Under Review', 
      label: 'Under Review', 
      icon: <VisibilityOutlined />,
      description: 'Candidate is evaluating the offer terms',
      timeframe: '2-5 business days'
    },
    { 
      value: 'Negotiation', 
      label: 'Negotiation', 
      icon: <AttachMoneyOutlined />,
      description: 'Discussing terms and compensation details',
      timeframe: '3-7 business days'
    },
    { 
      value: 'Accepted', 
      label: 'Offer Accepted', 
      icon: <CheckCircleOutlined />,
      description: 'Candidate has formally accepted the position',
      timeframe: 'Final stage'
    },
    { 
      value: 'Rejected', 
      label: 'Offer rejected', 
      icon: <CancelOutlined />,
      description: 'Candidate has rejected the offer',
      timeframe: 'Closed'
    }
  ];

  const getStatusIndex = (status) => {
    return statusFlow.findIndex(step => step.value === status);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Sent': 'primary',
      'Under Review': 'info',
      'Accepted': 'success',
      'Rejected': 'error',
      'Negotiation': 'warning'
    };
    return colors[status] || 'default';
  };

  const getStatusVariant = (stepStatus) => {
    const currentIndex = getStatusIndex(currentStatus);
    const stepIndex = getStatusIndex(stepStatus);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const StatusStepIcon = ({ status, active, completed }) => {
    const step = statusFlow.find(s => s.value === status);
    const variant = getStatusVariant(status);
    
    const getBackgroundColor = () => {
      if (completed) return theme.palette.success.main;
      if (active) return theme.palette.primary.main;
      return theme.palette.grey[300];
    };

    const getBorderColor = () => {
      if (completed) return theme.palette.success.main;
      if (active) return theme.palette.primary.main;
      return theme.palette.grey[400];
    };

    return (
      <Avatar
        sx={{
          width: 40,
          height: 40,
          bgcolor: getBackgroundColor(),
          border: `2px solid ${getBorderColor()}`,
          color: active || completed ? 'white' : theme.palette.grey[600],
          transition: 'all 0.3s ease',
          fontSize: '1.2rem'
        }}
      >
        {step?.icon}
      </Avatar>
    );
  };

  const StatusMetrics = () => (
    <Card sx={{ mb: 3, background: 'transparent', border: `1px solid ${theme.palette.divider}` }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="text.primary" fontWeight={600}>
          Offer Metrics
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), width: 48, height: 48 }}>
                <ScheduleOutlined color="primary" />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Time in Current Stage
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {currentStatus === 'Sent' ? '1 day' : 
                   currentStatus === 'Under Review' ? '3 days' : 
                   currentStatus === 'Negotiation' ? '2 days' : '0 days'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), width: 48, height: 48 }}>
                <TrendingUpRounded color="info" />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Expected Completion
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {currentStatus === 'Sent' ? '5 days' : 
                   currentStatus === 'Under Review' ? '3 days' : 
                   currentStatus === 'Negotiation' ? '7 days' : 'Complete'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const StatusActions = () => (
    <Card sx={{ border: `1px solid ${theme.palette.divider}` }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="text.primary" fontWeight={600}>
          Next Actions
        </Typography>
        <Grid container spacing={2}>
          {statusFlow.map((step) => (
            <Grid item xs={12} key={step.value}>
              <Button
                fullWidth
                variant={currentStatus === step.value ? "contained" : "outlined"}
                color={getStatusColor(step.value)}
                startIcon={step.icon}
                onClick={() => setCurrentStatus(step.value)}
                disabled={getStatusIndex(step.value) < getStatusIndex(currentStatus)}
                sx={{
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  height: '56px',
                  textTransform: 'none',
                  fontWeight: currentStatus === step.value ? 600 : 400,
                  borderWidth: '1.5px',
                  '&:hover': {
                    borderWidth: '1.5px'
                  }
                }}
              >
                <Box textAlign="left">
                  <Typography variant="subtitle1" fontWeight={600}>
                    {step.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {step.timeframe}
                  </Typography>
                </Box>
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  const StatusHistory = () => (
    <Card sx={{ border: `1px solid ${theme.palette.divider}` }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="text.primary" fontWeight={600}>
          Status History
        </Typography>
        <List dense>
          {statusFlow.slice(0, getStatusIndex(currentStatus) + 1).map((step, index) => (
            <ListItem key={step.value} sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: step.value === currentStatus ? 
                      theme.palette.primary.main : theme.palette.success.main
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1" fontWeight={500}>
                      {step.label}
                    </Typography>
                    <Chip 
                      label={step.value === currentStatus ? 'Current' : 'Completed'} 
                      size="small" 
                      color={step.value === currentStatus ? getStatusColor(step.value) : 'success'}
                      variant={step.value === currentStatus ? 'filled' : 'outlined'}
                    />
                  </Box>
                }
                secondary={
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {index === 0 ? 'Today, 10:30 AM' : 
                       index === 1 ? '2 days ago' : 
                       index === 2 ? '5 days ago' : 'Previously'}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ maxWidth: 1400, margin: '0 auto', p: 4 }}>
      {/* Header Section */}
      <Card 
        elevation={0}
        sx={{ 
          mb: 4,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom fontWeight={700} color="text.primary">
                Offer Status Tracking
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Senior Frontend Developer Position • Candidate: Sarah Johnson
              </Typography>
              <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                <Chip 
                  label={currentStatus} 
                  color={getStatusColor(currentStatus)} 
                  variant="filled"
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    height: 32
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  Last updated: Today, 14:30 PM
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  background: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  borderRadius: 2
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <BusinessCenterOutlined color="primary" />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Offer Reference
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      #OFF-2024-789
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Progress Section */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={600} color="text.primary">
            Recruitment Progress
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Stage {getStatusIndex(currentStatus) + 1} of {statusFlow.length}
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={(getStatusIndex(currentStatus) / (statusFlow.length - 1)) * 100} 
          color={getStatusColor(currentStatus)}
          sx={{ 
            height: 6, 
            borderRadius: 3,
            backgroundColor: theme.palette.grey[100],
            '& .MuiLinearProgress-bar': {
              borderRadius: 3
            }
          }}
        />
      </Box>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          <StatusMetrics />
          
          {/* Status Stepper */}
          <Card sx={{ border: `1px solid ${theme.palette.divider}`, mb: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom color="text.primary" fontWeight={600}>
                Offer Status Timeline
              </Typography>
              <Stepper 
                activeStep={getStatusIndex(currentStatus)} 
                orientation={isMobile ? "vertical" : "horizontal"}
                sx={{ mt: 4 }}
              >
                {statusFlow.map((step) => (
                  <Step key={step.value}>
                    <StepLabel
                      StepIconComponent={(props) => (
                        <StatusStepIcon {...props} status={step.value} />
                      )}
                      sx={{
                        '& .MuiStepLabel-label': {
                          mt: 1,
                          color: getStatusVariant(step.value) === 'current' ? 
                            theme.palette.primary.main : 
                            getStatusVariant(step.value) === 'completed' ? 
                            theme.palette.text.primary : 
                            theme.palette.text.secondary,
                          fontWeight: getStatusVariant(step.value) === 'current' ? 600 : 400
                        }
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight={getStatusVariant(step.value) === 'current' ? 600 : 500}>
                          {step.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {step.description}
                        </Typography>
                        <Chip 
                          label={step.timeframe} 
                          size="small" 
                          variant="outlined"
                          sx={{ mt: 1, fontSize: '0.75rem' }}
                        />
                      </Box>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

          <StatusActions />
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <StatusHistory />
          
          {/* Additional Info */}
          <Card sx={{ border: `1px solid ${theme.palette.divider}`, mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="text.primary" fontWeight={600}>
                Recruitment Details
              </Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <PersonOutline color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Hiring Manager" 
                    secondary="Michael Chen" 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <NotificationsNone color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Next Review" 
                    secondary="Tomorrow, 09:00 AM" 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OfferStatusFlow;