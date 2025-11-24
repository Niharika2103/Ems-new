import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  Chip,
  Avatar
} from '@mui/material';
import {
  Visibility,
  Engineering,
  People,
  BusinessCenter,
  DesignServices,
  LocalAtm
} from '@mui/icons-material';

const EmployeeDocumentUpload = () => {
  const navigate = useNavigate();

  const employees = [
    {
      id: 1,
      name: 'John Doe',
      department: 'Engineering'
    },
    {
      id: 2,
      name: 'Jane Smith',
      department: 'HR'
    },
    
  ];

  const getDepartmentIcon = (department) => {
    const icons = {
      'Engineering': <Engineering />,
      'HR': <People />,
      'Marketing': <BusinessCenter />,
      'Sales': <BusinessCenter />,
      'Finance': <LocalAtm />,
      'Design': <DesignServices />
    };
    return icons[department] || <BusinessCenter />;
  };

  const getDepartmentColor = (department) => {
    const colors = {
      'Engineering': '#1976d2',
      'HR': '#9c27b0',
      'Marketing': '#2e7d32',
      'Sales': '#ed6c02',
      'Finance': '#d32f2f',
      'Design': '#0288d1'
    };
    return colors[department] || '#666666';
  };

  const handleUploadDocuments = (employee) => {
    navigate('/documents/letters', { 
      state: { 
        employee: employee 
      } 
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          mb: 4, 
          fontWeight: 'bold',
          color: 'primary.main',
          textAlign: 'center'
        }}
      >
        Employee Documents
      </Typography>

      <TableContainer 
        component={Paper} 
        elevation={3}
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem', py: 2 }}>
                Employee Name
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem', py: 2 }}>
                Department
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem', py: 2, textAlign: 'center' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow 
                key={employee.id}
                sx={{ 
                  '&:last-child td, &:last-child th': { border: 0 },
                  '&:hover': { 
                    backgroundColor: 'action.hover',
                    transform: 'scale(1.01)',
                    transition: 'all 0.2s ease-in-out'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <TableCell sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        mr: 2,
                        width: 40,
                        height: 40
                      }}
                    >
                      {employee.name.charAt(0)}
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight="600">
                      {employee.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Chip
                    icon={getDepartmentIcon(employee.department)}
                    label={employee.department}
                    sx={{
                      backgroundColor: getDepartmentColor(employee.department),
                      color: 'white',
                      fontWeight: '600',
                      px: 1,
                      '& .MuiChip-icon': { color: 'white' }
                    }}
                  />
                </TableCell>
                <TableCell sx={{ py: 2, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    startIcon={<Visibility />}
                    onClick={() => handleUploadDocuments(employee)}
                    size="medium"
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'white',
                      fontWeight: 'bold',
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                      },
                      transition: 'all 0.2s ease-in-out',
                      minWidth: '160px'
                    }}
                  >
                    Upload Documents
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EmployeeDocumentUpload;