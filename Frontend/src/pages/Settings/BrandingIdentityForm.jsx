import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Stack,
} from '@mui/material';
import { fetchSettings, updateBranding } from '../../api/authApi';
import { ToastContainer ,toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function BrandingIdentityForm({ onClose }) {
  const [branding, setBranding] = useState({
    companyName: "",
    logoFile: null,
    logoUrl: "",
    primaryColor: "#1976d2",
    secondaryColor: "#2e7d32",
  });

  const [previewUrl, setPreviewUrl] = useState("");


  useEffect(() => {
    fetchSettings()
      .then((res) => {
        const b = res.data?.branding;
        if (!b) return;

        setBranding({
          companyName: b.companyName || "",
          logoFile: null,
          logoUrl: b.logoUrl || "",
          primaryColor: b.primaryColor || "#1976d2",
          secondaryColor: b.secondaryColor || "#2e7d32",
        });
         setPreviewUrl("");
      })
      .catch(() => {
        toast.error("Failed to load branding settings");
      });
  }, []);


  useEffect(() => {
    if (branding.logoFile && branding.logoFile instanceof File) {
      const url = URL.createObjectURL(branding.logoFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl("");
  }, [branding.logoFile]);


  const handleSubmit = async (e) => {
    e.preventDefault();
const toastId = toast.loading("Updating branding...");
    const formData = new FormData();
    formData.append("companyName", branding.companyName);
    formData.append("primaryColor", branding.primaryColor);
    formData.append("secondaryColor", branding.secondaryColor);


    if (branding.logoFile instanceof File) {
      formData.append("logo", branding.logoFile);
    }

    await updateBranding(formData);

    setBranding((prev) => ({
      ...prev,
      logoFile: null,
      logoUrl: res.data.branding.logoUrl,
    }));
      toast.update(toastId, {
      render: "Branding updated successfully ✅",
      type: "success",
      isLoading: false,
      autoClose: 2000,
      onClose: onClose, // ✅ CLOSE DRAWER AFTER TOAST
    });
    onClose();
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Button variant="outlined" component="label">
          Upload Logo
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;

              setBranding((prev) => ({
                ...prev,
                logoFile: file,
              }));
            }}
          />
        </Button>
        {/* Preview */}
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Logo Preview"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        )}

        {!previewUrl && branding.logoUrl && (
          <img
            src={branding.logoUrl}
            alt="Saved Logo"
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: "16px",
            }}
          />
        )}




        <TextField
          label="Company Name"
          value={branding.companyName}
          onChange={(e) =>
            setBranding({ ...branding, companyName: e.target.value })
          }
          fullWidth
          required
        />

        <TextField
          type="color"
          label="Primary Color"
          value={branding.primaryColor}
          onChange={(e) =>
            setBranding({ ...branding, primaryColor: e.target.value })
          }
          fullWidth
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          type="color"
          label="Secondary Color"
          value={branding.secondaryColor}
          onChange={(e) =>
            setBranding({ ...branding, secondaryColor: e.target.value })
          }
          fullWidth
          InputLabelProps={{ shrink: true }}
        />

        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
