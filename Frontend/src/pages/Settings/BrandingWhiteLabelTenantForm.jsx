import React, { useEffect, useState } from "react";
import {
  Box,
  Stack,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";
import axios from "axios";

export default function BrandingWhiteLabelTenantForm({ onClose }) {
  const [enabled, setEnabled] = useState(false);
  const [tenantKey, setTenantKey] = useState("");
  const [tenants, setTenants] = useState([]);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    axios.get("/api/tenants").then(res => setTenants(res.data));
  }, []);

  const loadPreview = async (key) => {
    const res = await axios.get(`/api/tenants/${key}/branding`);
    setPreview(res.data);
  };

  const handleSave = async () => {
    await axios.put("/api/system-settings/white-label", {
      enabled,
      tenantKey: enabled ? tenantKey : null,
    });
    onClose();
  };

  return (
    <Box>
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
          <>
            <FormControl fullWidth>
              <InputLabel>Tenant</InputLabel>
              <Select
                value={tenantKey}
                label="Tenant"
                onChange={(e) => {
                  setTenantKey(e.target.value);
                  loadPreview(e.target.value);
                }}
              >
                {tenants.map((t) => (
                  <MenuItem key={t.tenant_key} value={t.tenant_key}>
                    {t.company_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 🔥 LIVE PREVIEW */}
            {preview && (
              <Box
                sx={{
                  border: "1px dashed #ccc",
                  p: 2,
                  borderRadius: 2,
                }}
              >
                <Typography variant="subtitle2">Preview</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <img
                    src={preview.logo_url}
                    width={48}
                    height={48}
                    style={{ borderRadius: "50%" }}
                  />
                  <Box>
                    <Typography>{preview.company_name}</Typography>
                    <Stack direction="row" spacing={1}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          bgcolor: preview.primary_color,
                        }}
                      />
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          bgcolor: preview.secondary_color,
                        }}
                      />
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            )}
          </>
        )}

        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
