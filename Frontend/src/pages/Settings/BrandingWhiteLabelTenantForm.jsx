// src/pages/Settings/BrandingWhiteLabelTenantForm.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Stack,
  TextField,
  Button,
  Typography,
  Chip,
  Avatar,
  Divider,
  Paper,
} from "@mui/material";
import {
  getTenantBrandingApi,
  updateTenantBrandingApi,
} from "../../api/authApi";

export default function BrandingWhiteLabelTenantForm({
  tenantKey,
  onClose,
}) {
  const [branding, setBranding] = useState({
    companyName: "",
    logoFile: null,
    logoUrl: "",
    primaryColor: "#1976d2",
    secondaryColor: "#2e7d32",
  });

  const [previewUrl, setPreviewUrl] = useState("");

  /* 🔹 LOAD TENANT BRANDING */
  useEffect(() => {
    if (!tenantKey) return;

    getTenantBrandingApi(tenantKey).then((res) => {
      const b = res.data;
      if (!b) return;

      setBranding({
        companyName: b.company_name || "",
        logoFile: null,
        logoUrl: b.logo_url || "",
        primaryColor: b.primary_color || "#1976d2",
        secondaryColor: b.secondary_color || "#2e7d32",
      });
    });
  }, [tenantKey]);

  /* 🔹 LOGO PREVIEW */
  useEffect(() => {
    if (branding.logoFile) {
      const url = URL.createObjectURL(branding.logoFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl("");
  }, [branding.logoFile]);

  /* 🔹 SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("companyName", branding.companyName);
    formData.append("primaryColor", branding.primaryColor);
    formData.append("secondaryColor", branding.secondaryColor);
    if (branding.logoFile) {
      formData.append("logo", branding.logoFile);
    }

    await updateTenantBrandingApi(tenantKey, formData);
    onClose();
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* HEADER */}
        <Box>
          <Typography variant="h6">Tenant Branding</Typography>
          <Stack direction="row" spacing={1} alignItems="center" mt={1}>
            <Typography variant="body2" color="text.secondary">
              Editing branding for
            </Typography>
            <Chip
              label={tenantKey.toUpperCase()}
              color="primary"
              size="small"
            />
          </Stack>
        </Box>

        <Divider />

        {/* LOGO */}
        <Stack direction="row" spacing={3} alignItems="center">
          <Avatar
            src={previewUrl || branding.logoUrl}
            sx={{ width: 64, height: 64 }}
          />

          <Button component="label" variant="outlined">
            Upload Logo
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={(e) =>
                setBranding({
                  ...branding,
                  logoFile: e.target.files?.[0] || null,
                })
              }
            />
          </Button>
        </Stack>

        {/* COMPANY NAME */}
        <TextField
          label="Company Name"
          value={branding.companyName}
          onChange={(e) =>
            setBranding({ ...branding, companyName: e.target.value })
          }
          fullWidth
          required
        />

        {/* COLORS */}
        <Stack direction="row" spacing={2}>
          <TextField
            type="color"
            label="Primary Color"
            value={branding.primaryColor}
            onChange={(e) =>
              setBranding({
                ...branding,
                primaryColor: e.target.value,
              })
            }
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            type="color"
            label="Secondary Color"
            value={branding.secondaryColor}
            onChange={(e) =>
              setBranding({
                ...branding,
                secondaryColor: e.target.value,
              })
            }
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Stack>

        {/* COLOR PREVIEW */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Preview:
          </Typography>
          <Box
            sx={{
              width: 24,
              height: 24,
              bgcolor: branding.primaryColor,
              borderRadius: 1,
            }}
          />
          <Box
            sx={{
              width: 24,
              height: 24,
              bgcolor: branding.secondaryColor,
              borderRadius: 1,
            }}
          />
        </Stack>

        <Divider />

        {/* ACTIONS */}
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Save Changes
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
