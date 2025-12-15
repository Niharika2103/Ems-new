import React, { useEffect, useState } from "react";
import {
  Box,
  Stack,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Button,
} from "@mui/material";
import { fetchSettings ,updateWhiteLabel} from "../../api/authApi";

export default function BrandingWhiteLabelForm({ onClose }) {
  const [enabled, setEnabled] = useState(false);
  const [tenant, setTenant] = useState("");

  // 🔹 Load existing white-label config
  useEffect(() => {
    fetchSettings().then((res) => {
      const wl = res.data?.whiteLabel;
      if (!wl) return;

      setEnabled(!!wl.enabled);
      setTenant(wl.activeTenant || "");
    });
  }, []);

  // 🔹 Save
  const handleSubmit = async (e) => {
    e.preventDefault();

    await updateWhiteLabel({
      enabled,
      activeTenant: tenant,
    });

    onClose();
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <FormControlLabel
          control={
            <Checkbox
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
          }
          label="Enable white-label branding"
        />

        {enabled && (
          <FormControl fullWidth>
            <InputLabel id="tenant-label">Tenant</InputLabel>
            <Select
              labelId="tenant-label"
              label="Tenant"
              value={tenant}
              onChange={(e) => setTenant(e.target.value)}
              required
            >
              <MenuItem value="tenant-a">Tenant A</MenuItem>
              <MenuItem value="tenant-b">Tenant B</MenuItem>
              <MenuItem value="tenant-c">Tenant C</MenuItem>
            </Select>
          </FormControl>
        )}

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
