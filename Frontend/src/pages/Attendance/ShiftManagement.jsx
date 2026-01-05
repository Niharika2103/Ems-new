import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  FormControlLabel,
  Chip,
  Divider
} from "@mui/material";
import AddShiftModal from "../../components/AddShiftModal";

export default function ShiftManagement() {
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [history, setHistory] = useState([]);
const [openShiftModal, setOpenShiftModal] = useState(false);
const [editShift, setEditShift] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const loadShifts = async () => {
    const res = await axios.get("/api/shifts");
    setShifts(res.data);
  };
  const [form, setForm] = useState({
    employee_id: "",
    shift_id: "",
    effective_from: "",
    effective_to: "",
    ot_allowed: false,
    max_ot_hours: 0,
    reason: ""
  });

   useEffect(() => {
    loadShifts();
  }, []);

  const saveShift = async (data) => {
    if (editShift) {
      await axios.put(`/api/shifts/${editShift.id}`, data);
    } else {
      await axios.post("/api/shifts", data);
    }
    setOpenModal(false);
    setEditShift(null);
    loadShifts();
  };
  /* 🔹 Load data */
  useEffect(() => {
    // API calls (replace with real APIs)
    setEmployees([
      { id: "1", name: "Ravi Kumar", employee_id: "EMP001" },
      { id: "2", name: "Anu Priya", employee_id: "EMP002" }
    ]);

    setShifts([
      { id: "1", shift_name: "General", start_time: "09:00", end_time: "18:00", is_night_shift: false },
      { id: "2", shift_name: "Night", start_time: "22:00", end_time: "06:00", is_night_shift: true }
    ]);

    setHistory([]);
  }, []);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = () => {
    console.log("Submitting", form);
    // POST → /api/shift-assignments
  };

  return (
    <Box p={3}>
      {/* ================= HEADER ================= */}
      <Typography variant="h5" fontWeight={600}>
        Shift Management
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Create shifts and assign them to employees for any date range
      </Typography>

      {/* ================= MAIN CONTENT ================= */}
      <Grid container spacing={3}>
        {/* ===== SHIFT MASTER ===== */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardHeader
              title="Shift Master"
              action={<Button
  variant="contained"
  size="small"
  onClick={() => {
    setEditShift(null);
    setOpenShiftModal(true);
  }}
>
  Add Shift
</Button>}
            />
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Shift</TableCell>
                      <TableCell>Start</TableCell>
                      <TableCell>End</TableCell>
                      <TableCell>Night</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {shifts.map(s => (
                      <TableRow key={s.id}>
                        <TableCell>{s.shift_name}</TableCell>
                        <TableCell>{s.start_time}</TableCell>
                        <TableCell>{s.end_time}</TableCell>
                        <TableCell>
                          <Chip
                            label={s.is_night_shift ? "Yes" : "No"}
                            color={s.is_night_shift ? "warning" : "default"}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* ===== SHIFT ASSIGNMENT ===== */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Employee Shift Assignment" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Select
                    fullWidth
                    displayEmpty
                    value={form.employee_id}
                    onChange={e => handleChange("employee_id", e.target.value)}
                  >
                    <MenuItem value="">Select Employee</MenuItem>
                    {employees.map(e => (
                      <MenuItem key={e.id} value={e.id}>
                        {e.name} ({e.employee_id})
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Select
                    fullWidth
                    displayEmpty
                    value={form.shift_id}
                    onChange={e => handleChange("shift_id", e.target.value)}
                  >
                    <MenuItem value="">Select Shift</MenuItem>
                    {shifts.map(s => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.shift_name} ({s.start_time}-{s.end_time})
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Effective From"
                    InputLabelProps={{ shrink: true }}
                    value={form.effective_from}
                    onChange={e => handleChange("effective_from", e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Effective To"
                    InputLabelProps={{ shrink: true }}
                    value={form.effective_to}
                    onChange={e => handleChange("effective_to", e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.ot_allowed}
                        onChange={e => handleChange("ot_allowed", e.target.checked)}
                      />
                    }
                    label="OT Allowed"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Max OT Hours"
                    disabled={!form.ot_allowed}
                    value={form.max_ot_hours}
                    onChange={e => handleChange("max_ot_hours", e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reason"
                    multiline
                    rows={2}
                    value={form.reason}
                    onChange={e => handleChange("reason", e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button variant="contained" onClick={handleSubmit}>
                    Save Assignment
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ================= HISTORY ================= */}
<AddShiftModal
  open={openShiftModal}
  onClose={() => setOpenShiftModal(false)}
  onSave={saveShift}
  editData={editShift}
/>
     
    </Box>
  );
}
