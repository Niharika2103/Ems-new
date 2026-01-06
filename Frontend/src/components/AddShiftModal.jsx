import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Checkbox,
  FormControlLabel
} from "@mui/material";

export default function AddShiftModal({
  open,
  onClose,
  onSave,
  editData
}) {
  const [form, setForm] = useState({
    shift_name: "",
    start_time: "",
    end_time: "",
    break_minutes: 0,
    grace_minutes: 0,
    is_night_shift: false,
    is_active: true
  });

  useEffect(() => {
    if (editData) setForm(editData);
  }, [editData]);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = () => {
    onSave(form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {editData ? "Edit Shift" : "Add Shift"}
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Shift Name"
              value={form.shift_name}
              onChange={e => handleChange("shift_name", e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="time"
              label="Start Time"
              InputLabelProps={{ shrink: true }}
              value={form.start_time}
              onChange={e => handleChange("start_time", e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="time"
              label="End Time"
              InputLabelProps={{ shrink: true }}
              value={form.end_time}
              onChange={e => handleChange("end_time", e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Break Minutes"
              value={form.break_minutes}
              onChange={e =>
                handleChange("break_minutes", e.target.value)
              }
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Grace Minutes"
              value={form.grace_minutes}
              onChange={e =>
                handleChange("grace_minutes", e.target.value)
              }
            />
          </Grid>

          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.is_night_shift}
                  onChange={e =>
                    handleChange("is_night_shift", e.target.checked)
                  }
                />
              }
              label="Night Shift"
            />
          </Grid>

          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.is_active}
                  onChange={e =>
                    handleChange("is_active", e.target.checked)
                  }
                />
              }
              label="Active"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {editData ? "Update Shift" : "Save Shift"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
