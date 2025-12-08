import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Stack,
} from "@mui/material";

// Demo freelancers with salary added
const FREELANCERS = [
  { id: 1, name: "Rohit Sharma", role: "Frontend Developer", email: "rohit@example.com", salary: "₹60,000" },
  { id: 2, name: "Priya Singh", role: "UI/UX Designer", email: "priya@example.com", salary: "₹55,000" },
  { id: 3, name: "Karthik Rao", role: "Backend Developer", email: "karthik@example.com", salary: "₹70,000" },
];

export default function FreelancerApprovalTable() {
  const [list, setList] = useState(FREELANCERS);

  const handleApprove = (id) => {
    alert("Freelancer Approved!");
  };

  const handleReject = (id) => {
    if (window.confirm("Are you sure you want to reject this freelancer?")) {
      setList((prev) => prev.filter((f) => f.id !== id));
    }
  };

  // NEW: Create button click
  const handleCreate = () => {
    alert("Create Freelancer Form Coming Soon!");
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight="bold">
          Freelancer Approval List
        </Typography>

        <Button 
          variant="contained" 
          color="primary"
          onClick={handleCreate}
        >
          + Create Freelancer
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Name</b></TableCell>
              <TableCell><b>Role</b></TableCell>
              <TableCell><b>Email</b></TableCell>
              <TableCell><b>Salary</b></TableCell>
              <TableCell align="center"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {list.map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.name}</TableCell>
                <TableCell>{f.role}</TableCell>
                <TableCell>{f.email}</TableCell>
                <TableCell>{f.salary}</TableCell>

                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleApprove(f.id)}
                    >
                      Approve
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleReject(f.id)}
                    >
                      Reject
                    </Button>
                  </Stack>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>

        </Table>
      </TableContainer>
    </Box>
  );
}
