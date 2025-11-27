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
import { useDispatch, useSelector } from "react-redux";
import { adminLogin } from "../../features/auth/adminSlice";
import PersonIcon from "@mui/icons-material/Person";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { validateLogin } from "../../utils/validation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./login.css";

import company from "../../assets/company.jpg";
import company1 from "../../assets/company1.jpg";
import company2 from "../../assets/company2.jpg";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";

export default function AdminLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.admin);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
  });

  const [forgotPasswordData, setForgotPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [forgotPasswordErrors, setForgotPasswordErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  // Handle input changes for login form
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Prevent password longer than 16 chars
    if (name === "password" && value.length > 16) {
      setErrors((prev) => ({
        ...prev,
        password: "Password cannot exceed 16 characters",
      }));
      return;
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setFormData({ ...formData, [name]: value });
  };

  // Handle forgot password input changes
  const handleForgotPasswordChange = (e) => {
    const { name, value } = e.target;
    // Prevent password longer than 16 chars
    if ((name === "newPassword" || name === "confirmPassword") && value.length > 16) {
      setForgotPasswordErrors((prev) => ({
        ...prev,
        [name]: "Password cannot exceed 16 characters",
      }));
      return;
    } else {
      setForgotPasswordErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setForgotPasswordData({ ...forgotPasswordData, [name]: value });
  };

  // Form validation on submit
  const handleLoginSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateLogin(formData);

    // OTP validation added
    if (!formData.otp.trim()) {
      validationErrors.otp = "Please enter the OTP";
    }
    if (formData.password.length > 16) {
      toast.error("Password cannot exceed 16 characters");
      return;
    }
    if (Object.keys(validationErrors).length === 0) {
      dispatch(adminLogin(formData))
        .unwrap()
        .then((response) => {
          toast.success(response.message);
          setTimeout(() => navigate("/dashboard", { replace: true }), 2000);
          window.onpopstate = null;
        })
        .catch((err) => toast.error(err.error || "Login failed"));
      setErrors({});
    } else {
      setErrors(validationErrors);
    }
  };

  // Handle forgot password submit
  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();

    const validationErrors = {};

    if (!forgotPasswordData.newPassword.trim()) {
      validationErrors.newPassword = "New password is required";
    } else if (forgotPasswordData.newPassword.length < 6) {
      validationErrors.newPassword = "Password must be at least 6 characters";
    } else if (forgotPasswordData.newPassword.length > 16) {
      validationErrors.newPassword = "Password cannot exceed 16 characters";
    }

    if (!forgotPasswordData.confirmPassword.trim()) {
      validationErrors.confirmPassword = "Please confirm your password";
    } else if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(validationErrors).length === 0) {
      setForgotPasswordLoading(true);

      // Simulate API call to reset password
      setTimeout(() => {
        toast.success("Password reset successfully!");
        setForgotPasswordLoading(false);
        setShowForgotPassword(false);
        setForgotPasswordData({ newPassword: "", confirmPassword: "" });
        setForgotPasswordErrors({});
      }, 1500);
    } else {
      setForgotPasswordErrors(validationErrors);
    }
  };

  // Handle back to login
  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setForgotPasswordData({ newPassword: "", confirmPassword: "" });
    setForgotPasswordErrors({});
    setForgotPasswordLoading(false);
  };

  return (
    <div className="admin-page">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Image Carousel */}
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
                <img src={img} className="strip-img" alt={`company-${idx}`} />
              </SwiperSlide>
            )
          )}
        </Swiper>
      </div>

      <div className="bottom-area" />

      {/* Login Card - Reduced Size */}
      <div className="login-card">
        <div className="login-inner">
          <Card sx={{
            borderRadius: 3,
            boxShadow: 6,
            width: "100%",
            maxWidth: "400px",
            margin: "0 auto",
            minHeight: showForgotPassword ? "420px" : "auto",
            transition: "all 0.3s ease-in-out"
          }}>
            <CardContent sx={{
              p: 2,
              '&:last-child': {
                pb: 2
              }
            }}>

              {/* Back Button for Forgot Password */}
              {showForgotPassword && (
                <Box sx={{ mb: 1 }}>
                  <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBackToLogin}
                    variant="text"
                    size="small"
                    sx={{
                      textTransform: 'none',
                      color: 'primary.main',
                      fontSize: '0.8rem',
                      minWidth: 'auto',
                      '&:hover': {
                        backgroundColor: 'transparent',
                      }
                    }}
                  >
                    Back to Login
                  </Button>
                </Box>
              )}

              <Box textAlign="center" mb={1}>
                <PersonIcon
                  className="admin-icon"
                  sx={{ fontSize: 30 }}
                />
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  mt={0.5}
                  fontSize="1.1rem"
                >
                  {showForgotPassword ? "Reset Password" : "Admin Sign In"}
                </Typography>
              </Box>

              <Divider sx={{ mb: 1.5 }} />

              {/* Login Form */}
              <Fade in={!showForgotPassword} timeout={300}>
                <Box component="form" onSubmit={handleLoginSubmit} noValidate sx={{
                  display: showForgotPassword ? 'none' : 'block'
                }}>
                  {/* Email */}
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    fullWidth
                    margin="dense"
                    size="small"
                    variant="outlined"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
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
                    onCopy={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    variant="outlined"
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
                            edge="end"
                            size="small"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
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

                  {/* Forgot Password Link */}
                  <Box textAlign="right" sx={{ mt: 0.5, mb: 0.5 }}>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => setShowForgotPassword(true)}
                      sx={{
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'transparent',
                          textDecoration: 'underline'
                        },
                        padding: '2px 6px',
                        minWidth: 'auto'
                      }}
                    >
                      Forgot Password?
                    </Button>
                  </Box>

                  {/* OTP Field */}
                  <TextField
                    label="Enter OTP"
                    name="otp"
                    fullWidth
                    size="small"
                    margin="dense"
                    value={formData.otp}
                    onChange={handleChange}
                    error={!!errors.otp}
                    helperText={errors.otp}
                    required
                  />

                  <Typography variant="body2" align="center" sx={{ mt: 1.5, fontSize: '0.8rem' }}>
                    Don't have an account?{" "}
                    <a href="/#/admin/register" className="admin-register-link">
                      Register Here
                    </a>
                  </Typography>

                  {/* Login Button - REMOVED DISABLED PROPERTY */}
                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    className="!px-1 !py-1 !text-md admin-button"
                    sx={{
                      mt: 1.5,
                      fontSize: "0.9rem",
                      py: 0.75
                    }}
                    type="submit"
                    disabled={loading} // Only disable when loading, not based on form data
                  >
                    {loading ? "Logging in..." : "Log In"}
                  </Button>
                </Box>
              </Fade>

              {/* Forgot Password Form */}
              <Fade in={showForgotPassword} timeout={300}>
                <Box component="form" onSubmit={handleForgotPasswordSubmit} noValidate sx={{
                  display: showForgotPassword ? 'block' : 'none'
                }}>

                  {/* New Password */}
                  <TextField
                    label="New Password"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    fullWidth
                    margin="dense"
                    size="small"
                    variant="outlined"
                    value={forgotPasswordData.newPassword}
                    onChange={handleForgotPasswordChange}
                    error={!!forgotPasswordErrors.newPassword}
                    helperText={forgotPasswordErrors.newPassword}
                    required
                    inputProps={{ maxLength: 16 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => setShowNewPassword((prev) => !prev)}
                            aria-label={
                              showNewPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showNewPassword ? (
                              <Visibility fontSize="small" />
                            ) : (
                              <VisibilityOff fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Confirm Password */}
                  <TextField
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    fullWidth
                    margin="dense"
                    size="small"
                    variant="outlined"
                    value={forgotPasswordData.confirmPassword}
                    onChange={handleForgotPasswordChange}
                    error={!!forgotPasswordErrors.confirmPassword}
                    helperText={forgotPasswordErrors.confirmPassword}
                    required
                    inputProps={{ maxLength: 16 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            aria-label={
                              showConfirmPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showConfirmPassword ? (
                              <Visibility fontSize="small" />
                            ) : (
                              <VisibilityOff fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Password Requirements */}
                  <Box sx={{
                    mt: 1.5,
                    p: 1,
                    backgroundColor: 'grey.50',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'grey.200'
                  }}>
                    <Typography variant="caption" fontWeight="bold" color="text.primary" display="block" gutterBottom>
                      Password Requirements:
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      • 6-16 characters
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      • Passwords must match
                    </Typography>
                  </Box>

                  {/* Reset Password Button */}
                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    sx={{
                      mt: 2,
                      fontSize: "0.9rem",
                      py: 0.75
                    }}
                    type="submit"
                    disabled={forgotPasswordLoading} // Only disable when loading
                  >
                    {forgotPasswordLoading ? "Resetting..." : "Reset Password"}
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