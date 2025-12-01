import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Fade,
} from "@mui/material";

import BusinessIcon from "@mui/icons-material/Business";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./login.css"; // same CSS as admin login

// Import the same carousel images
import company from "../../assets/company.jpg";
import company1 from "../../assets/company1.jpg";
import company2 from "../../assets/company2.jpg";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";

export default function VendorLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [forgotPasswordData, setForgotPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [forgotErrors, setForgotErrors] = useState({});
  const [forgotLoading, setForgotLoading] = useState(false);

  // ------------------------------
  // Input Handling
  // ------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "password" && value.length > 16) {
      setErrors({ ...errors, password: "Password cannot exceed 16 characters" });
      return;
    }

    setErrors({ ...errors, [name]: "" });
    setFormData({ ...formData, [name]: value });
  };

  const handleForgotChange = (e) => {
    const { name, value } = e.target;

    setForgotErrors({ ...forgotErrors, [name]: "" });
    setForgotPasswordData({ ...forgotPasswordData, [name]: value });
  };

  // ------------------------------
  // Login Submit
  // ------------------------------
  const handleLogin = (e) => {
    e.preventDefault();

    let validation = {};
    if (!formData.email.trim()) validation.email = "Email is required";
    if (!formData.password.trim()) validation.password = "Password is required";

    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    toast.success("Vendor Login Successful!");

    setTimeout(() => {
      navigate("/vendor");
    }, 1200);
  };

  // ------------------------------
  // Forgot Password Submit
  // ------------------------------
  const handleForgotSubmit = (e) => {
    e.preventDefault();

    let validation = {};

    if (!forgotPasswordData.newPassword)
      validation.newPassword = "New password required";

    if (!forgotPasswordData.confirmPassword)
      validation.confirmPassword = "Confirm password required";

    if (
      forgotPasswordData.newPassword &&
      forgotPasswordData.confirmPassword &&
      forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword
    ) {
      validation.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(validation).length > 0) {
      setForgotErrors(validation);
      return;
    }

    setForgotLoading(true);

    setTimeout(() => {
      toast.success("Password reset successful!");
      setForgotLoading(false);
      setShowForgotPassword(false);
    }, 1500);
  };

  return (
    <div className="admin-page">
      <ToastContainer position="top-right" autoClose={2500} />

      {/* TOP CAROUSEL SAME AS ADMIN */}
      <div className="top-carousel">
        <Swiper
          modules={[Autoplay, EffectCoverflow]}
          effect="coverflow"
          centeredSlides
          slidesPerView={3}
          loop
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          coverflowEffect={{ rotate: 0, stretch: 0, depth: 120, modifier: 1.1 }}
        >
          {[company, company1, company2, company, company1, company2].map(
            (img, idx) => (
              <SwiperSlide key={idx}>
                <img src={img} className="strip-img" alt="carousel" />
              </SwiperSlide>
            )
          )}
        </Swiper>
      </div>

      {/* Background Gradient Area */}
      <div className="bottom-area" />

      {/* CENTER LOGIN CARD SAME AS ADMIN */}
      <div className="login-card">
        <div className="login-inner">
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: 6,
              width: "100%",
              maxWidth: "400px",
              margin: "0 auto",
              minHeight: showForgotPassword ? "420px" : "auto",
              transition: "all 0.3s ease-in-out",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              {/* Back button when forgot password */}
              {showForgotPassword && (
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => setShowForgotPassword(false)}
                  sx={{
                    mb: 1,
                    fontSize: "0.8rem",
                    textTransform: "none",
                    color: "primary.main",
                  }}
                >
                  Back to Login
                </Button>
              )}

              {/* ICON + TITLE */}
              <Box textAlign="center" mb={1}>
                <BusinessIcon sx={{ fontSize: 30 }} />
                <Typography variant="h6" fontWeight="bold" mt={0.5}>
                  {showForgotPassword ? "Reset Password" : "Vendor Sign In"}
                </Typography>
              </Box>

              <Divider sx={{ mb: 1.5 }} />

              {/* ---------------- LOGIN FORM ---------------- */}
              <Fade in={!showForgotPassword}>
                <Box
                  component="form"
                  onSubmit={handleLogin}
                  sx={{ display: showForgotPassword ? "none" : "block" }}
                >
                  {/* Email */}
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    fullWidth
                    size="small"
                    margin="dense"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                  />

                  {/* Password */}
                  <TextField
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    size="small"
                    margin="dense"
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowPassword((prev) => !prev)
                            }
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Forgot Password */}
                  <Box textAlign="right">
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => setShowForgotPassword(true)}
                      sx={{
                        textTransform: "none",
                        fontSize: "0.75rem",
                        color: "primary.main",
                      }}
                    >
                      Forgot Password?
                    </Button>
                  </Box>

                  {/* Register Here */}
                  <Typography
                    align="center"
                    sx={{ mt: 1.5, fontSize: "0.8rem" }}
                  >
                    Don't have an account?{" "}
                    <span
                      onClick={() => navigate("/vendor/registration")}
                      style={{
                        color: "#1976d2",
                        cursor: "pointer",
                      }}
                    >
                      Register Here
                    </span>
                  </Typography>

                  {/* Login Button */}
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 2, py: 1 }}
                    type="submit"
                  >
                    Log In
                  </Button>
                </Box>
              </Fade>

              {/* ---------------- FORGOT PASSWORD FORM ---------------- */}
              <Fade in={showForgotPassword}>
                <Box
                  component="form"
                  onSubmit={handleForgotSubmit}
                  sx={{ display: showForgotPassword ? "block" : "none" }}
                >
                  {/* New password */}
                  <TextField
                    label="New Password"
                    name="newPassword"
                    type="password"
                    fullWidth
                    size="small"
                    margin="dense"
                    value={forgotPasswordData.newPassword}
                    onChange={handleForgotChange}
                    error={!!forgotErrors.newPassword}
                    helperText={forgotErrors.newPassword}
                  />

                  {/* Confirm Password */}
                  <TextField
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    fullWidth
                    size="small"
                    margin="dense"
                    value={forgotPasswordData.confirmPassword}
                    onChange={handleForgotChange}
                    error={!!forgotErrors.confirmPassword}
                    helperText={forgotErrors.confirmPassword}
                  />

                  {/* Reset Button */}
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 2, py: 1 }}
                    type="submit"
                  >
                    {forgotLoading ? "Resetting..." : "Reset Password"}
                  </Button>
                </Box>
              </Fade>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
