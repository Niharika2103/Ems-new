import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Visibility, 
  Download, 
  Person 
} from '@mui/icons-material';

// Mock data - replace with actual API call
const mockEmployees = [
  {
    id: 1,
    name: 'John Doe',
    employeeId: 'EMP001',
    department: 'Engineering',
    uploadedDocuments: [
      { type: 'bankPassBook', name: 'bank_statement.pdf', uploadedAt: '2024-01-15' },
      { type: 'aadhar', name: 'aadhar_card.pdf', uploadedAt: '2024-01-15' },
      { type: 'pan', name: 'pan_card.pdf', uploadedAt: '2024-01-15' }
    ]
  },
  {
    id: 2,
    name: 'Jane Smith',
    employeeId: 'EMP002',
    department: 'HR',
    uploadedDocuments: [
      { type: 'educational', name: 'degree_certificate.pdf', uploadedAt: '2024-01-14' },
      { type: 'previousCompany', name: 'experience_letter.pdf', uploadedAt: '2024-01-14' },
      { type: 'aadhar', name: 'aadhar_card.pdf', uploadedAt: '2024-01-14' },
      { type: 'pan', name: 'pan_card.pdf', uploadedAt: '2024-01-14' }
    ]
  },
  {
    id: 3,
    name: 'Mike Johnson',
    employeeId: 'EMP003',
    department: 'Sales',
    uploadedDocuments: [
      { type: 'bankPassBook', name: 'passbook.pdf', uploadedAt: '2024-01-13' },
      { type: 'aadhar', name: 'aadhar.pdf', uploadedAt: '2024-01-13' }
    ]
  }
];

const documentTypes = {
  bankPassBook: { label: 'Bank Pass Book', color: 'primary' },
  aadhar: { label: 'Aadhar Card', color: 'secondary' },
  pan: { label: 'PAN Card', color: 'success' },
  previousCompany: { label: 'Previous Company', color: 'warning' },
  educational: { label: 'Educational Certificates', color: 'info' }
};

const EmployeeDocumentList = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        // Replace with actual API call
        // const response = await fetch('/api/employees/documents');
        // const data = await response.json();
        
        setTimeout(() => {
          setEmployees(mockEmployees);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleViewDocuments = (employee) => {
    setSelectedEmployee(employee);
    setViewDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setViewDialogOpen(false);
    setSelectedEmployee(null);
  };

  const handleDownloadDocument = (document) => {
    // Implement download functionality
    console.log('Downloading:', document);
    // Add your download logic here
  };

  const getDocumentCount = (employee) => {
    return employee.uploadedDocuments.length;
  };

  const getDocumentTypeCount = (employee, docType) => {
    return employee.uploadedDocuments.filter(doc => doc.type === docType).length;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading employees...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Employee Documents
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Employee ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Department</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Documents Uploaded</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Person sx={{ mr: 1, color: 'primary.main' }} />
                    {employee.employeeId}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {employee.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={employee.department} 
                    size="small" 
                    variant="outlined" 
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Chip 
                      label={`${getDocumentCount(employee)} docs`}
                      color="primary"
                      size="small"
                    />
                    {Object.keys(documentTypes).map(docType => {
                      const count = getDocumentTypeCount(employee, docType);
                      if (count > 0) {
                        return (
                          <Chip
                            key={docType}
                            label={`${documentTypes[docType].label}: ${count}`}
                            size="small"
                            variant="outlined"
                          />
                        );
                      }
                      return null;
                    })}
                  </Box>
                </TableCell>
                <TableCell>
                  <Tooltip title="View Documents">
                    <IconButton
                      color="primary"
                      onClick={() => handleViewDocuments(employee)}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Documents Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Documents Uploaded by {selectedEmployee?.name}
        </DialogTitle>
        <DialogContent>
          {selectedEmployee && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Employee ID: {selectedEmployee.employeeId}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Department: {selectedEmployee.department}
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Uploaded Documents:
                </Typography>
                {selectedEmployee.uploadedDocuments.length === 0 ? (
                  <Typography color="textSecondary">
                    No documents uploaded yet.
                  </Typography>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Document Type</strong></TableCell>
                          <TableCell><strong>File Name</strong></TableCell>
                          <TableCell><strong>Uploaded Date</strong></TableCell>
                          <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedEmployee.uploadedDocuments.map((doc, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Chip
                                label={documentTypes[doc.type]?.label || doc.type}
                                size="small"
                                color={documentTypes[doc.type]?.color || 'default'}
                              />
                            </TableCell>
                            <TableCell>{doc.name}</TableCell>
                            <TableCell>
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Download">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDownloadDocument(doc)}
                                >
                                  <Download fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeDocumentList;