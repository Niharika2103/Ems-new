import React from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { API_BASES } from "../../../../utils/constants";

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";

const EmployeeROI = () => {
  const [empData, setEmpData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const [roiRange, setRoiRange] = React.useState("all");
  const [projectType, setProjectType] = React.useState("all");
  const [projectList, setProjectList] = React.useState([]);

  const [totalSpend, setTotalSpend] = React.useState(0);
  const [avgRoi, setAvgRoi] = React.useState(0);
  const [costSavings, setCostSavings] = React.useState(0);

  const [prevSpend, setPrevSpend] = React.useState(0);
  const [prevAvgRoi, setPrevAvgRoi] = React.useState(0);
  const [prevSavings, setPrevSavings] = React.useState(0);

  const [spendTrend, setSpendTrend] = React.useState(0);
  const [roiTrend, setRoiTrend] = React.useState(0);
  const [savingsTrend, setSavingsTrend] = React.useState(0);

  const [page, setPage] = React.useState(0);
  const rowsPerPage = 5;

  const getRemaining = (value) => parseInt(value) || 0;

  const calculateROI = (cost, value) => {
    if (!cost || cost === 0) return 0;
    return Math.round(((value - cost) / cost) * 100);
  };

  const calcTrend = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const getTrendColor = (change) =>
    change > 0 ? "success.main" : change < 0 ? "error.main" : "grey.600";

  const getTrendIcon = (change) => {
    if (change > 0)
      return <TrendingUpIcon sx={{ color: "success.main", mr: 0.5 }} />;

    if (change < 0)
      return (
        <TrendingUpIcon
          sx={{ color: "error.main", mr: 0.5, transform: "rotate(180deg)" }}
        />
      );

    return <TrendingUpIcon sx={{ color: "grey.600", mr: 0.5 }} />;
  };

  const getTrendLabel = (c) =>
    c > 0 ? `+${c}% improvement` : c < 0 ? `${c}% drop` : "No change";

  // ============================
  // ⭐ FETCH EMPLOYEE ROI DATA
  // ============================
  const fetchEmployeeROI = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_BASES.ADMIN}/admin/reports/employee-roi`
      );

      if (response.data.success) {
        const raw = response.data.data;

        const processed = raw.map((item) => ({
          project: item.project,
          employee_name: item.employee_name,
          cost: item.cost,
          value: item.value,
          roi: calculateROI(item.cost, item.value),
          duration_days: item.duration_days,
          remaining_days: item.remaining_days,
        }));

        setEmpData(processed);
        setProjectList([...new Set(processed.map((x) => x.project))]);

        const totalSpendCalc = processed.reduce((s, x) => s + x.cost, 0);
        const avgRoiCalc =
          processed.length === 0
            ? 0
            : Math.round(
                processed.reduce((sum, x) => sum + x.roi, 0) /
                  processed.length
              );
        const costSavingsCalc = processed.reduce(
          (sum, x) => sum + (x.value - x.cost),
          0
        );

        setTotalSpend(totalSpendCalc);
        setAvgRoi(avgRoiCalc);
        setCostSavings(costSavingsCalc);

        setSpendTrend(calcTrend(totalSpendCalc, prevSpend));
        setRoiTrend(calcTrend(avgRoiCalc, prevAvgRoi));
        setSavingsTrend(calcTrend(costSavingsCalc, prevSavings));

        setPrevSpend(totalSpendCalc);
        setPrevAvgRoi(avgRoiCalc);
        setPrevSavings(costSavingsCalc);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to fetch employee ROI");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEmployeeROI();
  }, []);

  const handleRefresh = () => {
    setRoiRange("all");
    setProjectType("all");
    fetchEmployeeROI();
  };

  const handleExport = () => {
    const element = document.getElementById("export-table");

    html2pdf()
      .set({
        margin: 0.5,
        filename: "Employee_ROI_Report.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
      })
      .from(element)
      .save();
  };

  const filtered = empData.filter((item) => {
    const r = item.roi;

    if (roiRange === "high" && r < 75) return false;
    if (roiRange === "medium" && (r < 50 || r >= 75)) return false;
    if (roiRange === "low" && r >= 50) return false;

    if (projectType !== "all" && item.project !== projectType) return false;

    return true;
  });

  const paginated = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getROIColorChip = (roi) =>
    roi >= 80 ? "success" : roi >= 50 ? "warning" : "error";

  return (
    <Box>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Employee ROI Analysis</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>

          <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExport}>
            Export Report
          </Button>
        </Box>
      </Box>

      {/* ⭐ TOP CARDS */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        
        {/* TOTAL SPEND */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Total Employee Spend</Typography>
              <Typography variant="h5">₹{totalSpend}</Typography>

              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                {getTrendIcon(spendTrend)}
                <Typography variant="body2" sx={{ color: getTrendColor(spendTrend) }}>
                  {getTrendLabel(spendTrend)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* AVG ROI */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Average ROI</Typography>
              <Typography variant="h5">{avgRoi}%</Typography>

              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                {getTrendIcon(roiTrend)}
                <Typography variant="body2" sx={{ color: getTrendColor(roiTrend) }}>
                  {getTrendLabel(roiTrend)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* COST SAVINGS */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Cost Savings</Typography>
              <Typography variant="h5">₹{costSavings}</Typography>

              {/* ⭐ FIXED NEGATIVE ARROW LOGIC */}
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                {costSavings < 0 ? (
                  <>
                    <TrendingUpIcon
                      sx={{
                        color: "error.main",
                        mr: 0.5,
                        transform: "rotate(180deg)",
                      }}
                    />
                    <Typography variant="body2" sx={{ color: "error.main" }}>
                      Loss
                    </Typography>
                  </>
                ) : (
                  <>
                    {getTrendIcon(savingsTrend)}
                    <Typography
                      variant="body2"
                      sx={{ color: getTrendColor(savingsTrend) }}
                    >
                      {getTrendLabel(savingsTrend)}
                    </Typography>
                  </>
                )}
              </Box>

            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FILTERS */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <FormControl size="small">
          <InputLabel>ROI Range</InputLabel>
          <Select
            label="ROI Range"
            value={roiRange}
            onChange={(e) => setRoiRange(e.target.value)}
          >
            <MenuItem value="all">All ROI</MenuItem>
            <MenuItem value="high">High (75%+)</MenuItem>
            <MenuItem value="medium">Medium (50–75%)</MenuItem>
            <MenuItem value="low">Low (&lt;50%)</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel>Project</InputLabel>
          <Select
            label="Project"
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
          >
            <MenuItem value="all">All Projects</MenuItem>
            {projectList.map((p, idx) => (
              <MenuItem key={idx} value={p}>
                {p}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* TABLE */}
      <div id="export-table">
        <Card>
          <CardContent>
            <Typography variant="h6">Employee Project ROI Report</Typography>

            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project</TableCell>
                    <TableCell>Employee</TableCell>
                    <TableCell align="right">Cost</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell align="right">ROI</TableCell>
                    <TableCell align="right">Duration</TableCell>
                    <TableCell align="right">Remaining Days</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginated.map((row, index) => {
                    const remaining = getRemaining(row.remaining_days);

                    return (
                      <TableRow key={index}>
                        <TableCell>{row.project}</TableCell>
                        <TableCell>{row.employee_name}</TableCell>

                        <TableCell align="right">₹{row.cost}</TableCell>
                        <TableCell align="right">₹{row.value}</TableCell>

                        <TableCell align="right">
                          <Chip
                            label={`${row.roi}%`}
                            color={getROIColorChip(row.roi)}
                            size="small"
                          />
                        </TableCell>

                        <TableCell align="right">
                          {row.duration_days} days
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: "bold",
                            color:
                              remaining < 0
                                ? "red"
                                : remaining === 0
                                ? "orange"
                                : "green",
                          }}
                        >
                          {remaining < 0
                            ? `Delayed by ${Math.abs(remaining)} days`
                            : remaining === 0
                            ? "Ends today"
                            : `${remaining} days left`}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* PAGINATION */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 2 }}>
              <Button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                variant="outlined"
              >
                Prev
              </Button>

              <Button
                disabled={(page + 1) * rowsPerPage >= filtered.length}
                onClick={() => setPage(page + 1)}
                variant="outlined"
              >
                Next
              </Button>
            </Box>
          </CardContent>
        </Card>
      </div>

      {/* TOP PERFORMERS */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Top Performing Employees</Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {filtered
                  .sort((a, b) => b.roi - a.roi)
                  .slice(0, 3)
                  .map((emp, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography>{emp.employee_name}</Typography>
                      <Chip label={`${emp.roi}%`} color="success" size="small" />
                    </Box>
                  ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Recommendations</Typography>
              <Typography variant="body2" color="text.secondary">
                • Reward high-performing employees  
                <br />
                • Improve training for low-ROI areas  
                <br />
                • Optimize project allocation  
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeROI;
