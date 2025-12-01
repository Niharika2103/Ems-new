import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Divider,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import BusinessIcon from "@mui/icons-material/Business"; // Vendor icon
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function VendorLogin() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "password" && value.length > 16) {
      setErrors((prev) => ({
        ...prev,
        password: "Password cannot exceed 16 characters",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormData({ ...formData, [name]: value });
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    let validationErrors = {};

    if (!formData.username.trim()) {
      validationErrors.username = "Username is required";
    }
    if (!formData.password.trim()) {
      validationErrors.password = "Password is required";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    toast.success("Vendor login successful!");

    // TODO: call vendor login API here
    // dispatch(vendorLogin(formData))
  };

  return (
    <div className="vendor-page">
      <ToastContainer position="top-right" autoClose={2500} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 8,
        }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: 400,
            p: 1,
            borderRadius: 3,
            boxShadow: 6,
          }}
        >
          <CardContent>
            <Box textAlign="center">
              <BusinessIcon sx={{ fontSize: 36 }} />
              <Typography variant="h6" fontWeight="bold" mt={1}>
                Vendor Login
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box component="form" onSubmit={handleSubmit}>
              {/* Username */}
              <TextField
                label="Username"
                name="username"
                fullWidth
                margin="dense"
                size="small"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                required
              />

              {/* Password */}
              <TextField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                fullWidth
                margin="dense"
                size="small"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                required
                inputProps={{ maxLength: 16 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        size="small"
                      >
                        {showPassword ? (
                          <Visibility fontSize="small" />
                        ) : (
                          <VisibilityOff fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                variant="contained"
                type="submit"
                sx={{ mt: 2, py: 1 }}
              >
                Log In
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
}
