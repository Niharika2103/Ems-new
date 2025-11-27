import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { employeeResetPassword } from "../../features/auth/employeeSlice";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./login.css";
import { validateResetPassword } from "../../utils/validation";

import company from "../../assets/company.jpg";
import company1 from "../../assets/company1.jpg";
import company2 from "../../assets/company2.jpg";
// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";

export default function ResetPassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [formData, setFormData] = useState({
    token: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const { loading, error } = useSelector((state) => state.employee);


  // Extract token from URL or LocalStorage
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlToken = queryParams.get("token");
    if (urlToken) {
      setFormData((prev) => ({
        ...prev,
        token: urlToken,
      }));
    } else {
      const savedToken = localStorage.getItem("resetToken");
      if (savedToken) {
        setFormData((prev) => ({
          ...prev,
          token: savedToken,
        }));
      }
    }
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "confirmPassword") {
      if (value !== formData.newPassword) {
        setFormError("Passwords do not match");
      } else {
        setFormError("");
      }
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateResetPassword({
      password: formData.newPassword,
      confirmPassword: formData.confirmPassword,
    });

    if (Object.keys(validationErrors).length > 0) {
      setFormError(validationErrors.password || validationErrors.confirmPassword);
      return;
    }

    try {
      await dispatch(
        employeeResetPassword({ token: formData.token, newPassword: formData.newPassword })
      ).unwrap();
      toast.success("Password reset successful!");
      navigate("/");
    } catch (err) {
      toast.error(err.error || "Password reset failed!");
    }
  };

  return (
    <div className="login-page">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* TOP 50vh: carousel */}
      <div className="top-carousel login-top">
        <Swiper
          modules={[Autoplay, EffectCoverflow]}
          effect="coverflow"
          centeredSlides={true}
          slidesPerView={3}
          loop={true}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 120,
            modifier: 1.1,
          }}
          className="login-strip-swiper"
        >
          <SwiperSlide>
            <img src={company} className="strip-img" alt="company" />
          </SwiperSlide>
          <SwiperSlide>
            <img src={company1} className="strip-img" alt="company1" />
          </SwiperSlide>
          <SwiperSlide>
            <img src={company2} className="strip-img" alt="company2" />
          </SwiperSlide>
          <SwiperSlide>
            <img src={company} className="strip-img" alt="repeat" />
          </SwiperSlide>
          <SwiperSlide>
            <img src={company1} className="strip-img" alt="repeat" />
          </SwiperSlide>
          <SwiperSlide>
            <img src={company2} className="strip-img" alt="repeat" />
          </SwiperSlide>
        </Swiper>
      </div>

      {/* BOTTOM 50vh: background */}
      <div className="bottom-area login-bottom" />

      {/* LOGIN CARD overlapping top & bottom */}
      <div className="login-card">
        <div className="login-inner">
          <Card sx={{ borderRadius: 3, boxShadow: 6, width: "100%" }}>
            <CardContent>
              <Box textAlign="center" mb={2}>
                <PersonIcon
                  className="admin-icon"
                  sx={{ fontSize: { xs: 35, sm: 40 } }}
                />
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  mt={1}
                  fontSize={{ xs: "1rem", sm: "1.2rem" }}
                >
                  Reset NewPassword
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box component="form" onSubmit={handleLoginSubmit} noValidate>
                <TextField
                  label="Token"
                  name="token"
                  type="hidden"
                  fullWidth
                  size="small"
                  margin="normal"
                  variant="outlined"
                  value={formData.token}
                  onChange={handleChange}
                  hidden

                />

                <TextField
                  label="Password"
                  name="newPassword"
                  type={showPassword ? "password" : "text"}
                  fullWidth
                  size="small"
                  margin="normal"
                  variant="outlined"
                  value={formData.newPassword}
                  onChange={handleChange}
                  onCopy={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showPassword ? "password" : "text"}
                  fullWidth
                  size="small"
                  margin="normal"
                  variant="outlined"
                  onCopy={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!formError}
                  helperText={formError}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  className="!px-1 !py-1 !text-md admin-button"
                  sx={{ mt: 2, fontSize: { xs: "0.9rem", sm: "1rem" } }}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "create Password"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
