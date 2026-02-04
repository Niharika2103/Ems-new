import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
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
  Tooltip,
} from "@mui/material";
import { Visibility, Download } from "@mui/icons-material";
import { employeeUploadDocFecth } from "../../features/employeesDetails/employeesSlice";
import { useDispatch, useSelector } from "react-redux";
import {employeeDocDownloadbyAdminApi} from "../../api/authApi"
const documentTypes = {
  bankPassBook: { label: "Bank Pass Book", color: "primary" },
  aadhar: { label: "Aadhar Card", color: "secondary" },
  pan: { label: "PAN Card", color: "success" },
  previousCompany: { label: "Previous Company Docs", color: "warning" },
  educational: { label: "Educational Docs", color: "info" },
};

const EmployeeDocumentList = () => {
  const dispatch = useDispatch();

  const { doclist = [], loading: sliceLoading = false } = useSelector(
    (state) => state.employeeDetails
  );

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(5);



  useEffect(() => {
    dispatch(employeeUploadDocFecth());
  }, [dispatch]);

  // ✅ Transform backend → UI format
  useEffect(() => {
    if (!doclist?.employees) return;

    const transformed = doclist.employees.map((emp) => {
      const docs = [];
      const d = emp.document_url || {};
      // inside your useEffect that transforms doclist.employees -> transformed
      if (d.pan)
        docs.push({
          type: "pan",
          name: d.pan,
          uploadedAt: emp.date_of_joining,
          url: d.pan,
          docKey: "pan",       // backend expects 'pan'
        });

      if (d.aadhaar)
        docs.push({
          type: "aadhar",
          name: d.aadhaar,
          uploadedAt: emp.date_of_joining,
          url: d.aadhaar,
          docKey: "aadhaar",
        });

      if (d.passbook)
        docs.push({
          type: "bankPassBook",
          name: d.passbook,
          uploadedAt: emp.date_of_joining,
          url: d.passbook,
          docKey: "passbook",
        });

      // experience_docs (array) — include index
      (d.experience_docs || []).forEach((file, idx) =>
        docs.push({
          type: "previousCompany",
          name: file,
          uploadedAt: emp.date_of_joining,
          url: file,
          docKey: "experience_docs",
          index: idx,
        })
      );

      // educational_docs (array) — include index
      (d.educational_docs || []).forEach((file, idx) =>
        docs.push({
          type: "educational",
          name: file,
          uploadedAt: emp.date_of_joining,
          url: file,
          docKey: "educational_docs",
          index: idx,
        })
      );


      return {
        id: emp.id,
        name: emp.name,
        department: emp.department || "N/A",
        status: emp.status,
        date_of_joining: emp.date_of_joining,
        email: emp.email,
        uploadedDocuments: docs,

      };
    });

    setEmployees(transformed);
setPage(0); // reset pagination when data updates

  }, [doclist]);

  const handleViewDocuments = (employee) => {
    console.log(employee, 'employee')
    setSelectedEmployee(employee);
    setViewDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedEmployee(null);
    setViewDialogOpen(false);
  };

  const handleChangePage = (event, newPage) => {
  setPage(newPage);
};

const handleChangeRowsPerPage = (event) => {
  setRowsPerPage(parseInt(event.target.value, 10));
  setPage(0);
};


 const handleDownloadDocument = async (doc) => {
  try {
    const response = await employeeDocDownloadbyAdminApi(
      selectedEmployee.id,
      doc.docKey,
      doc.index
    );

    const fileURL = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");

    link.href = fileURL;
    link.download = doc.name; // file name from DB
    link.click();
    window.URL.revokeObjectURL(fileURL);

  } catch (error) {
    console.error("Download failed:", error);
    alert("Error downloading file");
  }
};

  const getDocumentCount = (emp) => emp.uploadedDocuments.length;

  if (sliceLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <Typography>Loading employee documents...</Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Employee Documents
      </Typography>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.main" }}>
              <TableCell sx={{ color: "white" }}>Name</TableCell>
              <TableCell sx={{ color: "white" }}>Department</TableCell>
              <TableCell sx={{ color: "white" }}>Status</TableCell>
              <TableCell sx={{ color: "white" }}>Date of Joining</TableCell>
              <TableCell sx={{ color: "white" }}>Documents</TableCell>
              <TableCell sx={{ color: "white" }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {employees
  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  .map((emp) => (

              <TableRow key={emp.id}>
                <TableCell>{emp.name}</TableCell>

                <TableCell>
                  <Chip label={emp.department} variant="outlined" />
                </TableCell>

                <TableCell>
                  <Chip
                    label={emp.status}
                    color={emp.status === "uploaded" ? "success" : "warning"}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  {emp.date_of_joining
                    ? new Date(emp.date_of_joining).toLocaleDateString()
                    : "---"}
                </TableCell>

                <TableCell>
                  <Chip
                    label={`${getDocumentCount(emp)} docs`}
                    color="primary"
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Tooltip title="View Documents">
                    <IconButton onClick={() => handleViewDocuments(emp)}>
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
  component="div"
  count={employees.length}
  page={page}
  onPageChange={handleChangePage}
  rowsPerPage={rowsPerPage}
  onRowsPerPageChange={handleChangeRowsPerPage}
  rowsPerPageOptions={[5, 10, 25]}
/>


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
                Employee Email: {selectedEmployee.email}
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
                          <TableCell><strong>joining date</strong></TableCell>
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