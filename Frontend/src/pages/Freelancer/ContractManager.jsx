import React, { useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Button,
  Divider,
  Chip,
} from "@mui/material";

const contractTypes = [
  "Service Contract",
  "Employment Contract",
  "Vendor Contract",
  "NDA Contract",
];

export default function ContractManager() {
  const [contractType, setContractType] = useState("");
  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState("Draft");

  // Dynamic fields based on selected contract type
  const getFields = () => {
    switch (contractType) {
      case "Service Contract":
        return [
          "Service Provider",
          "Scope of Work",
          "Start Date",
          "End Date",
          "Payment Terms",
        ];

      case "Employment Contract":
        return [
          "Employee Name",
          "Department",
          "Role",
          "Salary",
          "Joining Date",
        ];

      case "Vendor Contract":
        return [
          "Vendor Name",
          "Business Type",
          "License Number",
          "Start Date",
          "End Date",
        ];

      case "NDA Contract":
        return [
          "Party Name",
          "Confidential Terms",
          "Start Date",
        ];

      default:
        return [];
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Box p={3}>
      <Card sx={{ p: 3, maxWidth: 900, margin: "0 auto" }}>
        <Typography variant="h5" fontWeight="bold">
          Contract Manager
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Contract Type Selector */}
        <TextField
          fullWidth
          select
          label="Select Contract Type"
          value={contractType}
          onChange={(e) => setContractType(e.target.value)}
        >
          {contractTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>

        {/* Dynamic Fields */}
        <Grid container spacing={2} mt={2}>
          {getFields().map((field) => (
            <Grid item xs={12} md={6} key={field}>
              <TextField
                label={field}
                fullWidth
                onChange={(e) => handleChange(field, e.target.value)}
              />
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Workflow Status */}
        <Chip label={`Status: ${status}`} color="info" sx={{ mb: 2 }} />

        {/* Action Buttons */}
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setStatus("Submitted for Approval")}
          >
            Submit for Approval
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={() => setStatus("Approved")}
          >
            Approve
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={() => setStatus("Rejected")}
          >
            Reject
          </Button>

          <Button variant="outlined" color="secondary">
            Generate PDF
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
