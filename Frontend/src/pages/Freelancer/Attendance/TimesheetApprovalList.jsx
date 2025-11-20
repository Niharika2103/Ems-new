// src/pages/Freelancer/Attendance/timesheetapprovallist.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip
} from '@mui/material';
import { Check, Close, Visibility } from '@mui/icons-material';

const TimesheetApprovalList = () => {
  const [timesheets, setTimesheets] = useState(mockTimesheets);
  const navigate = useNavigate();

  const handleApprove = (timesheetId) => {
    setTimesheets(prev => prev.map(ts => 
      ts.id === timesheetId ? { ...ts, status: 'approved' } : ts
    ));
    console.log(`Approved timesheet: ${timesheetId}`);
  };

  const handleReject = (timesheetId) => {
    setTimesheets(prev => prev.map(ts => 
      ts.id === timesheetId ? { ...ts, status: 'rejected' } : ts
    ));
    console.log(`Rejected timesheet: ${timesheetId}`);
  };

  const getStatusChip = (status) => {
    const chipConfig = {
      pending: { color: 'warning', label: 'Pending' },
      approved: { color: 'success', label: 'Approved' },
      rejected: { color: 'error', label: 'Rejected' }
    };
    
    const config = chipConfig[status];
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Timesheet Approval
            </Typography>
          </Box>

          {/* Table */}
          <TableContainer component={Paper} elevation={2}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ backgroundColor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '25%' }}>Employee</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '25%' }}>Project</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '15%' }}>Shifts</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '15%' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '20%' }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timesheets.map((timesheet) => (
                  <TableRow 
                    key={timesheet.id}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    {/* Employee Column */}
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {timesheet.employee.name}
                      </Typography>
                    </TableCell>

                    {/* Project Column */}
                    <TableCell>
                      <Typography variant="subtitle1">
                        {timesheet.project.name}
                      </Typography>
                    </TableCell>

                    {/* Shifts Column */}
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {timesheet.shifts.map((_, index) => (
                          <Chip
                            key={index}
                            label={`Shift ${index + 1}`}
                            variant="outlined"
                            size="small"
                            color="primary"
                          />
                        ))}
                      </Box>
                    </TableCell>

                    {/* Status Column */}
                    <TableCell>
                      {getStatusChip(timesheet.status)}
                    </TableCell>

                    {/* Actions Column - All buttons side by side */}
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                       
                        

                        {/* Approve/Reject Buttons - Only for pending status */}
                        {timesheet.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => handleApprove(timesheet.id)}
                              size="small"
                              startIcon={<Check />}
                              variant="contained"
                              sx={{ 
                                backgroundColor: '#4caf50',
                                '&:hover': {
                                  backgroundColor: '#388e3c'
                                },
                                minWidth: 100
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReject(timesheet.id)}
                              size="small"
                              startIcon={<Close />}
                              variant="contained"
                              sx={{ 
                                backgroundColor: '#f44336',
                                '&:hover': {
                                  backgroundColor: '#d32f2f'
                                },
                                minWidth: 100
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        <Button
                          color="primary"
                          onClick={() => navigate('/timesheet')}
                          size="small"
                          startIcon={<Visibility />}
                          variant="contained"
                          sx={{ 
                            backgroundColor: '#1976d2',
                            '&:hover': {
                              backgroundColor: '#1565c0'
                            },
                            minWidth: 100
                          }}
                        >
                          View
                        </Button>

                        {/* Status Display for non-pending timesheets */}
                        {timesheet.status !== 'pending' && (
                          <Chip
                            label={timesheet.status === 'approved' ? 'Approved' : 'Rejected'}
                            size="small"
                            sx={{
                              backgroundColor: timesheet.status === 'approved' ? '#4caf50' : '#f44336',
                              color: 'white',
                              fontWeight: 'bold',
                              minWidth: 100,
                              height: '32px'
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {timesheets.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No timesheets pending approval
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

// Mock Data
const mockTimesheets = [
  {
    id: 1,
    employee: { 
      name: 'John Doe'
    },
    project: { 
      name: 'Website Redesign'
    },
    status: 'pending',
    shifts: [
      { 
        date: '2024-01-15', 
        startTime: '09:00', 
        endTime: '17:00', 
        hours: 8, 
        breakMinutes: 60,
        notes: 'Completed homepage components and fixed responsive issues'
      },
      { 
        date: '2024-01-16', 
        startTime: '09:00', 
        endTime: '18:00', 
        hours: 9, 
        breakMinutes: 60,
        notes: 'Worked on mobile optimization and performance improvements'
      }
    ]
  },
  {
    id: 2,
    employee: { 
      name: 'Jane Smith'
    },
    project: { 
      name: 'Mobile App Development'
    },
    status: 'pending',
    shifts: [
      { 
        date: '2024-01-15', 
        startTime: '08:00', 
        endTime: '16:00', 
        hours: 8, 
        breakMinutes: 45,
        notes: 'Created user interface wireframes and design prototypes'
      }
    ]
  },

];

export default TimesheetApprovalList;