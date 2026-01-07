import React, { useEffect, useState, useRef } from "react";
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
  TablePagination,
  Divider
} from "@mui/material";
import AddShiftModal from "../../components/AddShiftModal";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchAllEmployees } from "../../features/employeesDetails/employeesSlice";
import {
  getShiftsApi, addShiftApi, updateShiftApi, deleteShiftApi, assignShiftApi,
  getShiftAssignmentHistoryApi, updateAssignmentApi
} from "../../api/authApi";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB"); // dd/mm/yyyy
};


export default function ShiftManagement() {
  const today = new Date().toISOString().slice(0, 10);
  const assignmentFormRef = useRef(null);

  const [shifts, setShifts] = useState([]);
  const [history, setHistory] = useState([]);
  const [openShiftModal, setOpenShiftModal] = useState(false);
  const [editShift, setEditShift] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [historyPage, setHistoryPage] = useState(0);
  const [historyRowsPerPage, setHistoryRowsPerPage] = useState(5);

  const filteredHistory = history.filter((h) => {
    const matchesSearch =
      h.employee_name.toLowerCase().includes(searchText.toLowerCase()) ||
      h.shift_name.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || h.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const dispatch = useDispatch();

  const { list = [], loading = false } = useSelector(
    (state) => state.employeeDetails
  );

  const loadShifts = async () => {
    const res = await getShiftsApi();
    setShifts(res.data);
  };
  const initialFormState = {
    employee_id: "",
    shift_id: "",
    effective_from: today,   // ✅ default today
    effective_to: today,     // ✅ default today (or +1 if you want)
    ot_allowed: false,
    max_ot_hours: 0,
    reason: ""
  };

  const [form, setForm] = useState(initialFormState);




  const loadAssignmentHistory = async () => {
    try {
      const res = await getShiftAssignmentHistoryApi();
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to load assignment history");
    }
  };

  useEffect(() => {
    dispatch(fetchAllEmployees());

  }, [dispatch]);

  useEffect(() => {
    loadShifts();
    loadAssignmentHistory();
  }, []);



  const saveShift = async (data) => {
    try {
      if (editShift) {
        await updateShiftApi(editShift.id, data);
        toast.success("Shift updated successfully");
      } else {
        await addShiftApi(data);
        toast.success("Shift added successfully");
      }

      setOpenShiftModal(false);
      setEditShift(null);
      loadShifts();
    } catch (err) {
      toast.error("Operation failed");
    }
  };



  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };


  const handleSubmit = async () => {
    try {
      if (!form.employee_id || !form.shift_id) {
        toast.error("Please select employee and shift");
        return;
      }

      if (editShift && editShift.employee_id) {
        // EDIT assignment
        await updateAssignmentApi(editShift.id, form);
        toast.success("Shift assignment updated");
      } else {
        // NEW assignment
        await assignShiftApi(form);
        toast.success("Shift assigned successfully");
      }

      setEditShift(null);
      setForm(initialFormState);

      // ✅ FORCE reload
      await loadAssignmentHistory();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Assignment failed");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const paginatedShifts = shifts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleHistoryPageChange = (event, newPage) => {
    setHistoryPage(newPage);
  };

  const handleHistoryRowsPerPageChange = (event) => {
    setHistoryRowsPerPage(parseInt(event.target.value, 10));
    setHistoryPage(0);
  };
  const paginatedHistory = filteredHistory.slice(
    historyPage * historyRowsPerPage,
    historyPage * historyRowsPerPage + historyRowsPerPage
  );



  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

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
            <Card sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column"
            }}>
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
              <CardContent  >
                <TableContainer sx={{ flexGrow: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Shift</TableCell>
                        <TableCell>Start</TableCell>
                        <TableCell>End</TableCell>
                        <TableCell>Night</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedShifts.map(s => (
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
                          <TableCell>
                            <Button
                              size="small"
                              onClick={() => {
                                setEditShift(s);
                                setOpenShiftModal(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={async () => {
                                const confirmDelete = window.confirm(
                                  "This will permanently delete the shift. Continue?"
                                );
                                if (!confirmDelete) return;

                                try {
                                  await deleteShiftApi(s.id);
                                  toast.success("Shift deleted permanently");
                                  loadShifts();
                                } catch (err) {
                                  toast.error(
                                    err.response?.data?.message || "Delete failed"
                                  );
                                }
                              }}
                            >
                              Delete
                            </Button>

                          </TableCell>
                        </TableRow>

                      ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    component="div"
                    count={shifts.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                  />
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* ===== SHIFT ASSIGNMENT ===== */}
          <Grid item xs={12} md={8}>
            {editShift && (
              <Box
                sx={{
                  mb: 2,
                  p: 1.5,
                  borderRadius: 1,
                  backgroundColor: "#fff3cd",
                  border: "1px solid #ffeeba"
                }}
              >
                <Typography variant="body2" fontWeight={600} color="warning.main">
                  ⚠️ You are editing an existing shift assignment.
                  Please update the details and click Update.
                </Typography>
              </Box>
            )}

            <Card ref={assignmentFormRef} sx={{
              border: editShift ? "2px solid #ff9800" : "none",
              transition: "border 0.3s ease"
            }}>
              <CardHeader title="Employee Shift Assignment" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Select
                      fullWidth
                      displayEmpty
                      value={form.employee_id}
                      disabled={!!editShift}
                      onChange={(e) =>
                        handleChange("employee_id", e.target.value)
                      }
                    >
                      <MenuItem value="">Select Employee</MenuItem>

                      {editShift ? (
                        <MenuItem value={form.employee_id}>
                          {history.find(h => h.employee_id === form.employee_id)?.employee_name}
                        </MenuItem>
                      ) : (
                        list.map(emp => (
                          <MenuItem key={emp.id} value={emp.id}>
                            {emp.name} ({emp.email})
                          </MenuItem>
                        ))
                      )}

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
                      inputProps={{
                        min: today // disables past dates
                      }}
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
                      inputProps={{
                        min: today // disables past dates
                      }}
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
                      {editShift ? "Update Assignment" : "Save Assignment"}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Search Employee / Shift"
              placeholder="Type employee or shift name"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Select
              fullWidth
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Status</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="CURRENT">Current</MenuItem>
              <MenuItem value="PAST">Past</MenuItem>
            </Select>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />

        <Card>
          <CardHeader title="Shift Assignment History" />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Shift</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell>OT</TableCell>
                <TableCell>Max OT</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>

              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No assignments found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedHistory.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>{h.employee_name}</TableCell>
                    <TableCell>{h.shift_name}</TableCell>
                    <TableCell>{formatDate(h.effective_from)}</TableCell>
                    <TableCell>{formatDate(h.effective_to)}</TableCell>

                    <TableCell>{h.ot_allowed ? "Yes" : "No"}</TableCell>
                    <TableCell>{h.max_ot_hours}</TableCell>
                    <TableCell>
                      <Chip
                        label={h.status}
                        color={
                          h.status === "CURRENT"
                            ? "success"
                            : h.status === "PENDING"
                              ? "warning"
                              : "default"
                        }
                        size="small"
                      />

                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => {
                          setForm({
                            employee_id: h.employee_id,   // ✅ now exists
                            shift_id: h.shift_id,
                            effective_from: h.effective_from.slice(0, 10),
                            effective_to: h.effective_to.slice(0, 10),
                            ot_allowed: h.ot_allowed,
                            max_ot_hours: h.max_ot_hours,
                            reason: ""
                          });
                          setEditShift(h);
                        }}
                      >
                        Assign Shifts
                      </Button>
                      {h.status === "PENDING" && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setForm({
                              employee_id: h.employee_id,
                              shift_id: h.shift_id,
                              effective_from: h.effective_from.slice(0, 10),
                              effective_to: h.effective_to.slice(0, 10),
                              ot_allowed: h.ot_allowed,
                              max_ot_hours: h.max_ot_hours,
                              reason: ""
                            });
                            setEditShift(h);

                            //  SCROLL TO FORM
                            setTimeout(() => {
                              assignmentFormRef.current?.scrollIntoView({
                                behavior: "smooth",
                                block: "start"
                              });
                            }, 100);
                          }}
                        >
                          Edit
                        </Button>

                      )}


                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>

          </Table>
          <TablePagination
            component="div"
            count={filteredHistory.length}
            page={historyPage}
            onPageChange={handleHistoryPageChange}
            rowsPerPage={historyRowsPerPage}
            onRowsPerPageChange={handleHistoryRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25]}
          />

        </Card>

        {/* ================= HISTORY ================= */}
        {openShiftModal && (
          <AddShiftModal
            open
            onClose={() => setOpenShiftModal(false)}
            onSave={saveShift}
            editData={editShift}
          />
        )}


      </Box>
    </>
  );
}
