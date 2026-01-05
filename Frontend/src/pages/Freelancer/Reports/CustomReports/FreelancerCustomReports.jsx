import React, { useState, useEffect, useMemo } from "react";
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
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Search, Download, Add, Save } from "@mui/icons-material";
import { AUTH_API } from "../../../../utils/constants";

/* ===== EXPORT LIBRARIES ===== */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/* =========================================================
   CONSTANTS
========================================================= */

const AVAILABLE_FIELDS = [
  "Employee Name",
  "Department",
  "Salary",
  "Attendance",
  "Date of Joining",
];

export default function CustomReports() {
  /* ---------- UI STATES ---------- */
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [openGenerate, setOpenGenerate] = useState(false);

  /* ---------- DATA STATES ---------- */
  const [departments, setDepartments] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [generatedReport, setGeneratedReport] = useState(null);

  /* =========================================================
     FETCH DEPARTMENTS
  ========================================================= */
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${AUTH_API.ADMIN}/freelancer/reports/departments`);
      const data = await res.json();
      setDepartments(data);
    } catch (error) {
      console.error("Failed to fetch departments", error);
    }
  };

  /* =========================================================
     CLEAR OLD REPORT WHEN DEPARTMENT CHANGES
  ========================================================= */
  useEffect(() => {
    setGeneratedReport(null);
    setSearch("");
  }, [department]);

  /* =========================================================
     SEARCH FILTER (FINAL & CORRECT)
  ========================================================= */
  const filteredReportData = useMemo(() => {
    if (!generatedReport) return [];

    if (!search) return generatedReport.data;

    return generatedReport.data.filter((row) =>
      row["Employee Name"]
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [generatedReport, search]);

  /* =========================================================
     FIELD SELECTION
  ========================================================= */
  const toggleField = (field) => {
    setSelectedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  /* =========================================================
     GENERATE REPORT
  ========================================================= */
  const handleGenerateReport = async () => {
    if (!selectedFields.length) return;

    try {
      const res = await fetch(`${AUTH_API.ADMIN}/freelancer/reports/custom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: selectedFields, department }),
      });

      const data = await res.json();
      setGeneratedReport(data);
      setSelectedFields([]);
      setOpenGenerate(false);
    } catch (error) {
      console.error("Failed to generate report", error);
    }
  };

  /* =========================================================
     DOWNLOADS (FILTER AWARE)
  ========================================================= */

  const downloadCSV = () => {
    if (!generatedReport) return;

    const rows = [];
    rows.push(generatedReport.fields.join(","));

    filteredReportData.forEach((row) => {
      rows.push(
        generatedReport.fields
          .map((f) => `"${row[f] ?? ""}"`)
          .join(",")
      );
    });

    saveAs(
      new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" }),
      "custom_report.csv"
    );
  };

  const downloadExcel = () => {
    if (!generatedReport) return;

    const excelData = filteredReportData.map((row) => {
      const obj = {};
      generatedReport.fields.forEach((f) => {
        obj[f] = row[f] ?? "";
      });
      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    saveAs(
      new Blob([buffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "custom_report.xlsx"
    );
  };

  const downloadPDF = () => {
    if (!generatedReport) return;

    const doc = new jsPDF();
    doc.text("Custom Report", 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [generatedReport.fields],
      body: filteredReportData.map((row) =>
        generatedReport.fields.map((f) =>
          f === "Date of Joining" && row[f]
            ? new Date(row[f]).toLocaleDateString()
            : row[f] ?? "-"
        )
      ),
    });

    doc.save("custom_report.pdf");
  };

  return (
    <Box sx={{ p: 4, backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <Typography fontSize="26px" fontWeight={700}>
        Custom Reports
      </Typography>
      <Typography color="text.secondary">
        Generate, filter and preview enterprise reports
      </Typography>

      {/* FILTER BAR */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search report by name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {departments.map((d) => (
                    <MenuItem key={d.department} value={d.department}>
                      {d.department}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={5} textAlign="right">
              <Button onClick={downloadPDF} disabled={!generatedReport} startIcon={<Download />}>PDF</Button>
              <Button onClick={downloadExcel} disabled={!generatedReport} startIcon={<Download />}>Excel</Button>
              <Button onClick={downloadCSV} disabled={!generatedReport} startIcon={<Download />}>CSV</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* GENERATE */}
      <Box mt={3}>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenGenerate(true)}>
          Generate Custom Report
        </Button>
      </Box>

      {/* TABLE */}
      {generatedReport && (
        <Box mt={4}>
          <Typography fontWeight={600}>Generated Report Preview</Typography>
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <table width="100%" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {generatedReport.fields.map((f) => (
                      <th key={f} style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>
                        {f}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredReportData.map((row, i) => (
                    <tr key={i}>
                      {generatedReport.fields.map((f) => (
                        <td key={f} style={{ padding: 8 }}>
                          {f === "Date of Joining" && row[f]
                            ? new Date(row[f]).toLocaleDateString()
                            : row[f] ?? "-"}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {filteredReportData.length === 0 && (
                    <tr>
                      <td colSpan={generatedReport.fields.length} style={{ textAlign: "center", padding: 16 }}>
                        No matching records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* MODAL */}
      <Dialog open={openGenerate} onClose={() => setOpenGenerate(false)}>
        <DialogTitle>Generate Custom Report</DialogTitle>
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
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleGenerateReport}
            disabled={!selectedFields.length}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
