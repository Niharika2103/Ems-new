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
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { adminLogin } from "../../features/auth/adminSlice";
import PersonIcon from "@mui/icons-material/Person";
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

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateLogin(formData);

    

    // OTP validation
    if (!formData.otp.trim()) {
      validationErrors.otp = "Please enter the OTP"; // ✅ Added OTP field error
    }

    if (Object.keys(validationErrors).length === 0) {
      // No errors → dispatch login
      dispatch(adminLogin(formData))
        .unwrap()
        .then((response) => {
          toast.success(response.message);
          setTimeout(() => navigate("/dashboard"), 2000);
        })
        .catch((err) => toast.error(err.error || "Login failed"));

      setErrors({});
    } else {
      setErrors(validationErrors); // ✅ Show field-level errors
    }
  };

  return (
    <div className="admin-page">
      <ToastContainer position="top-right" autoClose={3000} />

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

      <div className="login-card">
        <div className="login-inner">
          <Card sx={{ borderRadius: 3, boxShadow: 6, width: "100%" }}>
            <CardContent>
              <Box textAlign="center" mb={2}>
                <PersonIcon className="admin-icon" sx={{ fontSize: { xs: 35, sm: 40 } }} />
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  mt={1}
                  fontSize={{ xs: "1rem", sm: "1.2rem" }}
                >
                  Admin Sign In
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />


              <Box component="form" onSubmit={handleLoginSubmit} noValidate>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  fullWidth
                  margin="normal"
                  size="small"
                  variant="outlined"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                />

                <TextField
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  margin="normal"
                  size="small"
                  variant="outlined"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
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

               

                {/* ✅ OTP field with error display */}
                <TextField
                  label="Enter OTP"
                  name="otp"
                  fullWidth
                  size="small"
                  margin="normal"
                  value={formData.otp}
                  onChange={handleChange}
                  error={!!errors.otp}          // ✅ show red border if error exists
                  helperText={errors.otp}       // ✅ display error message below field
                  required
                />

                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                  Don’t have an account?{" "}
                  <a href="/#/admin/register" className="admin-register-link">
                    Register Here
                  </a>
                </Typography>

                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  className="!px-1 !py-1 !text-md admin-button"
                  sx={{ mt: 2, fontSize: { xs: "0.9rem", sm: "1rem" } }}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Log In"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
