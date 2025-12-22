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
import {
  Search,
  Download,
  Add,
  Save,
} from "@mui/icons-material";

/* =========================================================
   1️⃣ DUMMY MASTER DATA (SIMULATES BACKEND RESPONSE)
========================================================= */

const REPORTS_LIST = [
  { id: 1, name: "Employee Attendance", department: "HR" },
  { id: 2, name: "Payroll Summary", department: "Finance" },
  { id: 3, name: "Freelancer Cost Report", department: "Operations" },
];

const DUMMY_EMPLOYEES = [
  {
    name: "Ravi Kumar",
    department: "HR",
    salary: "₹40,000",
    attendance: "95%",
    doj: "2023-01-15",
  },
  {
    name: "Anjali Sharma",
    department: "Finance",
    salary: "₹55,000",
    attendance: "92%",
    doj: "2022-11-10",
  },
];

const AVAILABLE_FIELDS = [
  "Employee Name",
  "Department",
  "Salary",
  "Attendance",
  "Date of Joining",
];

const FIELD_MAP = {
  "Employee Name": "name",
  "Department": "department",
  "Salary": "salary",
  "Attendance": "attendance",
  "Date of Joining": "doj",
};

/* =========================================================
   2️⃣ MAIN COMPONENT
========================================================= */

export default function CustomReports() {
  /* ---------- UI STATES ---------- */
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [openGenerate, setOpenGenerate] = useState(false);

  /* ---------- REPORT STATES ---------- */
  const [selectedFields, setSelectedFields] = useState([]);
  const [generatedReport, setGeneratedReport] = useState(null);

  /* =========================================================
     3️⃣ FILTER LOGIC (SEARCH + DEPARTMENT)
  ========================================================= */

  const filteredReports = REPORTS_LIST.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) &&
      (department ? r.department === department : true)
  );

  /* =========================================================
     4️⃣ FIELD SELECTION LOGIC
  ========================================================= */

  const toggleField = (field) => {
    setSelectedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  /* =========================================================
     5️⃣ GENERATE REPORT (CORE LOGIC)
  ========================================================= */

  const handleGenerateReport = () => {
    if (!selectedFields.length) return;

    setGeneratedReport({
      fields: selectedFields,
      data: DUMMY_EMPLOYEES,
    });

    setSelectedFields([]);
    setOpenGenerate(false);
  };

  return (
    <Box sx={{ p: 4, backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <Box mb={3}>
        <Typography fontSize="26px" fontWeight={700}>
          Custom Reports
        </Typography>
        <Typography color="text.secondary">
          Generate, filter and preview enterprise reports
        </Typography>
      </Box>

      {/* =====================================================
          FILTER BAR
      ====================================================== */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* SEARCH */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search report by name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
              />
            </Grid>

            {/* DEPARTMENT DROPDOWN */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel
                  shrink
                  sx={{
                    fontSize: "16px",
                    fontWeight: 600,
                    transform: "translate(14px, -9px)",
                  }}
                >
                  Department
                </InputLabel>
                <Select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  displayEmpty
                  sx={{
                    mt: 1,
                    borderRadius: 2,
                    backgroundColor: "#fafafa",
                    minHeight: 52,
                  }}
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

            {/* DOWNLOAD BUTTONS (UI ONLY) */}
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

      {/* =====================================================
          REPORT LIST
      ====================================================== */}
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

      {/* =====================================================
          GENERATE BUTTON
      ====================================================== */}
      <Box mt={4}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenGenerate(true)}
        >
          Generate Custom Report
        </Button>
      </Box>

      {/* =====================================================
          GENERATED REPORT PREVIEW
      ====================================================== */}
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
                          textAlign: "left",
                          padding: "10px",
                          background: "#f1f5f9",
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
                            padding: "10px",
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

      {/* =====================================================
          GENERATE MODAL
      ====================================================== */}
      <Dialog
        open={openGenerate}
        onClose={() => setOpenGenerate(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Generate Custom Report</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" mb={2}>
            Select fields to include in the report
          </Typography>

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
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleGenerateReport}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
