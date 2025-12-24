import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Search, Download, Add, Save } from "@mui/icons-material";

/* =========================================================
   1️⃣ FREELANCER DUMMY MASTER DATA
========================================================= */

const FREELANCER_REPORTS_LIST = [
  { id: 1, name: "Freelancer Cost Report", department: "Finance" },
  { id: 2, name: "Project Utilization", department: "Operations" },
  { id: 3, name: "Active Contracts", department: "HR" },
];

const DUMMY_FREELANCERS = [
  {
    name: "Suresh R",
    department: "Operations",
    rate: "₹1,200 / day",
    project: "Mobile App",
    contractType: "Hourly",
  },
  {
    name: "Meera Patel",
    department: "Finance",
    rate: "₹80,000 / month",
    project: "ERP Migration",
    contractType: "Monthly",
  },
];

const AVAILABLE_FIELDS = [
  "Freelancer Name",
  "Department",
  "Rate",
  "Project",
  "Contract Type",
];

const FIELD_MAP = {
  "Freelancer Name": "name",
  "Department": "department",
  "Rate": "rate",
  "Project": "project",
  "Contract Type": "contractType",
};

/* =========================================================
   2️⃣ MAIN COMPONENT
========================================================= */

export default function FreelancerCustomReports() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [openGenerate, setOpenGenerate] = useState(false);

  const [selectedFields, setSelectedFields] = useState([]);
  const [generatedReport, setGeneratedReport] = useState(null);

  /* =========================================================
     3️⃣ FILTER LOGIC
  ========================================================= */

  const filteredReports = FREELANCER_REPORTS_LIST.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) &&
      (department ? r.department === department : true)
  );

  /* =========================================================
     4️⃣ FIELD SELECTION
  ========================================================= */

  const toggleField = (field) => {
    setSelectedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  /* =========================================================
     5️⃣ GENERATE REPORT
  ========================================================= */

  const handleGenerateReport = () => {
    if (!selectedFields.length) return;

    setGeneratedReport({
      fields: selectedFields,
      data: DUMMY_FREELANCERS,
    });

    setSelectedFields([]);
    setOpenGenerate(false);
  };

  return (
    <Box sx={{ p: 4, backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      {/* HEADER */}
      <Box mb={3}>
        <Typography fontSize="26px" fontWeight={700}>
          Freelancer Custom Reports
        </Typography>
        <Typography color="text.secondary">
          Generate and preview freelancer reports
        </Typography>
      </Box>

      {/* FILTER BAR */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search report"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel shrink>Department</InputLabel>
                <Select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>All Departments</em>
                  </MenuItem>
                  <MenuItem value="HR">HR</MenuItem>
                  <MenuItem value="Finance">Finance</MenuItem>
                  <MenuItem value="Operations">Operations</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={5} textAlign="right">
              <Button variant="outlined" startIcon={<Download />} sx={{ mr: 1 }}>
                PDF
              </Button>
              <Button variant="outlined" startIcon={<Download />} sx={{ mr: 1 }}>
                Excel
              </Button>
              <Button variant="outlined" startIcon={<Download />}>
                CSV
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* REPORT LIST */}
      <Grid container spacing={3}>
        {filteredReports.map((report) => (
          <Grid item xs={12} md={4} key={report.id}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography fontWeight={600}>{report.name}</Typography>
                <Divider sx={{ my: 1 }} />
                <Chip label={report.department} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* GENERATE BUTTON */}
      <Box mt={4}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenGenerate(true)}
        >
          Generate Freelancer Report
        </Button>
      </Box>

      {/* REPORT PREVIEW */}
      {generatedReport && (
        <Box mt={5}>
          <Typography fontWeight={600} mb={2}>
            Generated Report Preview
          </Typography>

          <Card>
            <CardContent>
              <table width="100%" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {generatedReport.fields.map((field) => (
                      <th
                        key={field}
                        style={{
                          padding: 10,
                          background: "#f1f5f9",
                          textAlign: "left",
                        }}
                      >
                        {field}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {generatedReport.data.map((row, index) => (
                    <tr key={index}>
                      {generatedReport.fields.map((field) => (
                        <td
                          key={field}
                          style={{
                            padding: 10,
                            borderTop: "1px solid #e5e7eb",
                          }}
                        >
                          {row[FIELD_MAP[field]]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* MODAL */}
      <Dialog open={openGenerate} onClose={() => setOpenGenerate(false)}>
        <DialogTitle>Generate Freelancer Report</DialogTitle>
        <DialogContent>
          {AVAILABLE_FIELDS.map((field) => (
            <FormControlLabel
              key={field}
              control={
                <Checkbox
                  checked={selectedFields.includes(field)}
                  onChange={() => toggleField(field)}
                />
              }
              label={field}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGenerate(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Save />} onClick={handleGenerateReport}>
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
