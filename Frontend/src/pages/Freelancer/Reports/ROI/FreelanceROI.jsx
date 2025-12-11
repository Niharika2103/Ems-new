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

const FreelancerROI = () => {
  const [freelancerData, setFreelancerData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const [roiRange, setRoiRange] = React.useState("all");
  const [projectType, setProjectType] = React.useState("all");
  const [projectList, setProjectList] = React.useState([]);

  const [totalSpend, setTotalSpend] = React.useState(0);
  const [avgRoi, setAvgRoi] = React.useState(0);
  const [activeProjects, setActiveProjects] = React.useState(0);
  const [costSavings, setCostSavings] = React.useState(0);

  const [prevSpend, setPrevSpend] = React.useState(0);
  const [prevAvgRoi, setPrevAvgRoi] = React.useState(0);
  const [prevActive, setPrevActive] = React.useState(0);
  const [prevSavings, setPrevSavings] = React.useState(0);

  const [spendTrend, setSpendTrend] = React.useState(0);
  const [roiTrend, setRoiTrend] = React.useState(0);
  const [activeTrend, setActiveTrend] = React.useState(0);
  const [savingsTrend, setSavingsTrend] = React.useState(0);

  const getRemainingNumber = (value) => {
    if (!value) return 0;
    return parseInt(value.toString().replace(/[^0-9-]/g, "")) || 0;
  };

  const calculateROI = (cost, value) => {
    if (!cost || cost === 0) return 0;
    return Math.round(((value - cost) / cost) * 100);
  };

  const calcTrend = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const getTrendColor = (change) => {
    if (change > 0) return "success.main";
    if (change < 0) return "error.main";
    return "grey.600";
  };

  const getTrendIcon = (change) => {
    if (change > 0)
      return <TrendingUpIcon sx={{ color: "success.main", mr: 0.5 }} />;
    if (change < 0)
      return (
        <TrendingUpIcon
          sx={{
            color: "error.main",
            mr: 0.5,
            transform: "rotate(180deg)",
          }}
        />
      );
    return <TrendingUpIcon sx={{ color: "grey.600", mr: 0.5 }} />;
  };

  const getTrendLabel = (change) => {
    if (change > 0) return `+${change}% improvement`;
    if (change < 0) return `${change}% drop`;
    return "No change";
  };

  const fetchFreelancerROI = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_BASES.ADMIN}/admin/reports/freelancer-roi`
      );

      if (response.data.success) {
        const data = response.data.data;

        const processedData = data.map((item) => ({
          ...item,
          roi: calculateROI(item.cost, item.value),
        }));

        setFreelancerData(processedData);

        const uniqueProjects = [
          ...new Set(processedData.map((item) => item.project)),
        ];
        setProjectList(uniqueProjects);

        const totalSpendCalc = processedData.reduce(
          (sum, x) => sum + (x.cost || 0),
          0
        );

        const avgRoiCalc =
          processedData.length > 0
            ? Math.round(
                processedData.reduce((s, x) => s + (x.roi || 0), 0) /
                  processedData.length
              )
            : 0;

        const activeProjectsCalc = new Set(
          processedData.map((x) => x.project)
        ).size;

        const costSavingsCalc = processedData.reduce(
          (sum, x) => sum + ((x.value || 0) - (x.cost || 0)),
          0
        );

        setTotalSpend(totalSpendCalc);
        setAvgRoi(avgRoiCalc);
        setActiveProjects(activeProjectsCalc);
        setCostSavings(costSavingsCalc);

        setSpendTrend(calcTrend(totalSpendCalc, prevSpend));
        setRoiTrend(calcTrend(avgRoiCalc, prevAvgRoi));
        setActiveTrend(calcTrend(activeProjectsCalc, prevActive));
        setSavingsTrend(calcTrend(costSavingsCalc, prevSavings));

        setPrevSpend(totalSpendCalc);
        setPrevAvgRoi(avgRoiCalc);
        setPrevActive(activeProjectsCalc);
        setPrevSavings(costSavingsCalc);
      } else {
        setError("Failed to load ROI data");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to fetch data");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFreelancerROI();
  }, []);

  const handleRefresh = () => {
    setRoiRange("all");
    setProjectType("all");
    fetchFreelancerROI();
  };

  const handleExport = () => {
    const element = document.getElementById("export-table");

    const options = {
      margin: 0.5,
      filename: "Freelancer_ROI_Table.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
    };

    html2pdf().set(options).from(element).save();
  };

  const filteredData = freelancerData.filter((item) => {
    const roiValue = parseFloat(item.roi);

    if (roiRange === "high" && roiValue < 75) return false;
    if (roiRange === "medium" && (roiValue < 50 || roiValue >= 75)) return false;
    if (roiRange === "low" && roiValue >= 50) return false;

    if (projectType !== "all" && item.project !== projectType) return false;

    return true;
  });

  const getROIColorChip = (roi) => {
    const value = parseFloat(roi);
    if (value >= 80) return "success";
    if (value >= 50) return "warning";
    return "error";
  };

  return (
    <Box>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Freelancer ROI Analysis</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>

          <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExport}>
            Export Report
          </Button>
        </Box>
      </Box>

      {/* ⭐ TOP METRICS */}
      <Grid container spacing={3} sx={{ mb: 3 }}>

        {/* TOTAL SPEND */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Total Freelancer Spend</Typography>
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
        <Grid item xs={12} sm={6} md={3}>
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

        {/* ACTIVE PROJECTS */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Active Projects</Typography>
              <Typography variant="h5">{activeProjects}</Typography>

              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                {getTrendIcon(activeTrend)}
                <Typography variant="body2" sx={{ color: getTrendColor(activeTrend) }}>
                  {getTrendLabel(activeTrend)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ⭐ COST SAVINGS — FIXED NEGATIVE ARROW */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Cost Savings</Typography>
              <Typography variant="h5">₹{costSavings}</Typography>

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
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>ROI Range</InputLabel>
            <Select
              label="ROI Range"
              value={roiRange}
              onChange={(e) => setRoiRange(e.target.value)}
            >
              <MenuItem value="all">All ROI</MenuItem>
              <MenuItem value="high">High (75%+)</MenuItem>
              <MenuItem value="medium">Medium (50-75%)</MenuItem>
              <MenuItem value="low">Low (Below 50%)</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Project Type</InputLabel>
            <Select
              label="Project Type"
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
            >
              <MenuItem value="all">All Projects</MenuItem>
              {projectList.map((project, index) => (
                <MenuItem key={index} value={project}>
                  {project}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* TABLE */}
      <div id="export-table">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Freelancer Project ROI Analysis
            </Typography>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project</TableCell>
                    <TableCell>Freelancer</TableCell>
                    <TableCell align="right">Cost</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell align="right">ROI</TableCell>
                    <TableCell align="right">Duration</TableCell>
                    <TableCell align="right">Remaining Days</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {!loading &&
                    !error &&
                    filteredData.map((row, index) => {
                      const remaining = getRemainingNumber(row.remaining_days);

                      return (
                        <TableRow key={index}>
                          <TableCell>{row.project}</TableCell>
                          <TableCell>{row.freelancer}</TableCell>
                          <TableCell align="right">₹{row.cost}</TableCell>
                          <TableCell align="right">₹{row.value}</TableCell>

                          <TableCell align="right">
                            <Chip
                              label={`${row.roi}%`}
                              color={getROIColorChip(row.roi)}
                              size="small"
                            />
                          </TableCell>

                          <TableCell
                            align="right"
                            sx={{
                              color: remaining < 0 ? "red" : "inherit",
                              fontWeight: remaining < 0 ? "bold" : "normal",
                            }}
                          >
                            {row.duration}
                          </TableCell>

                          <TableCell
                            align="right"
                            sx={{
                              color:
                                remaining < 0
                                  ? "red"
                                  : remaining === 0
                                  ? "orange"
                                  : "green",
                              fontWeight: "bold",
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
          </CardContent>
        </Card>
      </div>

      {/* TOP PERFORMERS */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performing Freelancers
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {filteredData.slice(0, 3).map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography>{item.freelancer}</Typography>
                    <Chip label={`${item.roi}%`} color="success" size="small" />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recommendations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Increase budget for high-ROI marketing projects
                <br />
                • Extend contracts with top-performing freelancers
                <br />
                • Review low-ROI development projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FreelancerROI;
