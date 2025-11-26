import React, { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";

const EmployeeList = () => {
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // 🔹 Dummy Employee Data
  const [employees, setEmployees] = useState([
    {
      id: 101,
      name: "Niharika Kandula",
      email: "niharika.kandula@example.com",
      bankPassbook: "https://example.com/docs/101-passbook.pdf",
      aadhar: "https://example.com/docs/101-aadhar.pdf",
      pan: "https://example.com/docs/101-pan.pdf",
      gst: "https://example.com/docs/101-gst.pdf",
      status: "PENDING",
    },
    {
      id: 102,
      name: "Rohit Sharma",
      email: "rohit.sharma@example.com",
      bankPassbook: "https://example.com/docs/102-passbook.pdf",
      aadhar: "https://example.com/docs/102-aadhar.pdf",
      pan: "https://example.com/docs/102-pan.pdf",
      gst: "https://example.com/docs/102-gst.pdf",
      status: "APPROVED",
    },
    {
      id: 103,
      name: "Manoj Kumar",
      email: "manoj.kumar@example.com",
      bankPassbook: "https://example.com/docs/103-passbook.pdf",
      aadhar: "https://example.com/docs/103-aadhar.pdf",
      pan: "https://example.com/docs/103-pan.pdf",
      gst: "https://example.com/docs/103-gst.pdf",
      status: "REJECTED",
    },
    {
      id: 104,
      name: "Keerthi Sharma",
      email: "keerthi.sharma@example.com",
      bankPassbook: "https://example.com/docs/104-passbook.pdf",
      aadhar: "https://example.com/docs/104-aadhar.pdf",
      pan: "https://example.com/docs/104-pan.pdf",
      gst: "https://example.com/docs/104-gst.pdf",
      status: "PENDING",
    },
  ]);

  // 🔹 Update status locally
  const updateStatus = (id, newStatus) => {
    const updatedList = employees.map((emp) =>
      emp.id === id ? { ...emp, status: newStatus } : emp
    );
    setEmployees(updatedList);
    setOpen(false);
  };

  // 🔹 Table Columns
  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "name", headerName: " Name", width: 220 },
    { field: "email", headerName: "Email", width: 260 },

    {
      field: "view",
      headerName: "View Documents",
      width: 180,
      renderCell: (params) => (
        <Tooltip title="View & Verify Documents">
          <IconButton
            onClick={() => {
              setSelectedEmployee(params.row);
              setOpen(true);
            }}
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      ),
    },

    {
      field: "status",
      headerName: "Status",
      width: 170,
      renderCell: (params) => {
        switch (params.value) {
          case "APPROVED":
            return <Chip label="Verified" color="success" />;
          case "REJECTED":
            return <Chip label="Rejected" color="error" />;
          default:
            return <Chip label="Pending" color="warning" />;
        }
      },
    },
  ];

  return (
    <Box p={3}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Freelancer Document Verification
        </Typography>

        <div style={{ height: 500 }}>
          <DataGrid rows={employees} columns={columns} pageSize={6} />
        </div>
      </Card>

      {/* View & Verify Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Verify Documents - {selectedEmployee?.name}</DialogTitle>

        <DialogContent>
          <Button
            variant="outlined"
            sx={{ mt: 1, mb: 1 }}
            fullWidth
            onClick={() => window.open(selectedEmployee?.bankPassbook, "_blank")}
          >
            View Bank Passbook
          </Button>

          <Button
            variant="outlined"
            sx={{ mb: 1 }}
            fullWidth
            onClick={() => window.open(selectedEmployee?.aadhar, "_blank")}
          >
            View Aadhar
          </Button>

          <Button
            variant="outlined"
            sx={{ mb: 1 }}
            fullWidth
            onClick={() => window.open(selectedEmployee?.pan, "_blank")}
          >
            View PAN
          </Button>

          <Button
            variant="outlined"
            sx={{ mb: 2 }}
            fullWidth
            onClick={() => window.open(selectedEmployee?.gst, "_blank")}
          >
            View GST
          </Button>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={() => updateStatus(selectedEmployee.id, "APPROVED")}
            >
              Approve
            </Button>

            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={() => updateStatus(selectedEmployee.id, "REJECTED")}
            >
              Reject
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default EmployeeList;
