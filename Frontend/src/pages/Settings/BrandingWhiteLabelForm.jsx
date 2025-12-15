import React, { useState } from 'react';
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
} from '@mui/material';
    
export default function BrandingWhiteLabelForm({ onClose }) {
  const [enabled, setEnabled] = useState(false);
  const [tenant, setTenant] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ enabled, tenant });
    onClose();
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <FormControlLabel
          control={<Checkbox checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />}
          label="Enable white‑label"
        />

        {enabled && (
          <FormControl fullWidth>
            <InputLabel id="tenant-label">Tenant</InputLabel>
            <Select
              labelId="tenant-label"
              label="Tenant"
              value={tenant}
              onChange={(e) => setTenant(e.target.value)}
            >
              <MenuItem value="tenant-a">Tenant A</MenuItem>
              <MenuItem value="tenant-b">Tenant B</MenuItem>
              <MenuItem value="tenant-c">Tenant C</MenuItem>
            </Select>
          </FormControl>
        )}

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
