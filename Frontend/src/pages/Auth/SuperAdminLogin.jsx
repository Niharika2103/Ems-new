import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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

import { Visibility, VisibilityOff, CheckCircle, Cancel } from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";

import debounce from "lodash.debounce";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { validateLogin } from "../../utils/validation";

// Redux actions
import { checkEmail, login, resetEmailStatus } from "../../features/auth/authSlice";

// API calls for forgot / reset password
import {
  superAdminForgotPasswordApi,
  superAdminResetPasswordApi,
} from "../../api/authApi";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";

// Images
import company from "../../assets/company.jpg";
import company1 from "../../assets/company1.jpg";
import company2 from "../../assets/company2.jpg";

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.auth);
  const emailStatus = useSelector((state) => state.auth.emailStatus);

  /* ---------------- LOGIN FORM STATE ---------------- */
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  /* ---------------- FORGOT PASSWORD STATE ---------------- */
  const [showForgot, setShowForgot] = useState(false);
  const [fp, setFp] = useState({ email: "", otp: "", newPassword: "" });
  const [otpSent, setOtpSent] = useState(false);

  /* --------- CHECK EMAIL LIVE ----------- */
  const debouncedCheckEmail = debounce((email) => {
    if (email) dispatch(checkEmail(email));
  }, 500);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "password" && value.length > 16) {
      setErrors((p) => ({ ...p, password: "Password cannot exceed 16 characters" }));
      return;
    }

    setErrors((p) => ({ ...p, [name]: "" }));
    setFormData({ ...formData, [name]: value });

    if (name === "email") {
      const emailRegex = /\S+@\S+\.\S+/;
      if (emailRegex.test(value)) debouncedCheckEmail(value);
      else dispatch(resetEmailStatus());
    }
  };

  /* ---------------- LOGIN SUBMIT ---------------- */
  const handleLoginSubmit = (e) => {
    e.preventDefault();

    if (emailStatus !== true) {
      toast.error("Please enter a valid authorized email");
      return;
    }

    const validationErrors = validateLogin(formData);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    dispatch(login({ ...formData, otp }))
      .unwrap()
      .then((res) => {
        toast.success(res.message || "Login success");
        setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
      })
      .catch((err) => {
        toast.error(err.error || "Login failed");
      });
  };

  /* ---------------- FORGOT PASSWORD FLOW ---------------- */

  const sendResetOtp = async () => {
    try {
      await superAdminForgotPasswordApi({ email: fp.email });
      toast.success("OTP sent to email");
      setOtpSent(true);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send OTP");
    }
  };

  const resetPassword = async () => {
    if (!fp.email || !fp.otp || !fp.newPassword) {
      toast.error("All fields required");
      return;
    }

    try {
      await superAdminResetPasswordApi(fp);
      toast.success("Password reset successfully");
      setShowForgot(false);
      setOtpSent(false);
      setFp({ email: "", otp: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Reset failed");
    }
  };

  return (
    <Box className="super-admin-container">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* ====== IMAGE CAROUSEL ====== */}
      <Box className="super-admin-top">
        <Swiper
          modules={[Autoplay, EffectCoverflow]}
          effect="coverflow"
          centeredSlides
          slidesPerView={3}
          loop
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          coverflowEffect={{ rotate: 0, stretch: 0, depth: 150, modifier: 1 }}
        >
          {[company, company1, company2, company].map((img, i) => (
            <SwiperSlide key={i}>
              <img src={img} className="strip-img" alt="company" />
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      {/* ====== LOGIN / FORGOT CARD ====== */}
      <Box className="super-admin-card">
        <Card sx={{ borderRadius: 3, boxShadow: 6, width: "100%" }}>
          <CardContent>
            {!showForgot && (
              <>
                <Box textAlign="center">
                  <PersonIcon sx={{ fontSize: 35 }} />
                  <Typography variant="h6" fontWeight="bold">
                    SuperAdmin Sign In
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box component="form" onSubmit={handleLoginSubmit}>
                  <TextField
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    error={!!errors.email || emailStatus === false}
                    helperText={
                      errors.email ||
                      (emailStatus === false ? "Email not authorized" : "")
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {emailStatus === true && <CheckCircle sx={{ color: "green" }} />}
                          {emailStatus === false && <Cancel sx={{ color: "red" }} />}
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    margin="dense"
                    error={!!errors.password}
                    helperText={errors.password}
                    inputProps={{ maxLength: 16 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    label="Enter OTP"
                    fullWidth
                    size="small"
                    margin="dense"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />

                  <Typography align="right">
                    <Button size="small" onClick={() => setShowForgot(true)}>
                      Forgot Password?
                    </Button>
                  </Typography>

                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 1 }}
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Log In"}
                  </Button>
                </Box>
              </>
            )}

            {/* ===== FORGOT PASSWORD ===== */}
            {showForgot && (
              <>
                <Typography variant="h6" textAlign="center">
                  Reset SuperAdmin Password
                </Typography>

                <Divider sx={{ my: 2 }} />

                <TextField
                  label="Registered Email"
                  fullWidth
                  size="small"
                  value={fp.email}
                  onChange={(e) => setFp({ ...fp, email: e.target.value })}
                />

                <Button sx={{ mt: 1 }} variant="outlined" onClick={sendResetOtp}>
                  Send OTP
                </Button>

                {otpSent && (
                  <>
                    <TextField
                      label="Enter OTP"
                      fullWidth
                      size="small"
                      sx={{ mt: 1 }}
                      value={fp.otp}
                      onChange={(e) => setFp({ ...fp, otp: e.target.value })}
                    />

                    <TextField
                      label="New Password"
                      type="password"
                      fullWidth
                      size="small"
                      sx={{ mt: 1 }}
                      value={fp.newPassword}
                      onChange={(e) => setFp({ ...fp, newPassword: e.target.value })}
                    />

                    <Button
                      fullWidth
                      variant="contained"
                      sx={{ mt: 2 }}
                      onClick={resetPassword}
                    >
                      Reset Password
                    </Button>
                  </>
                )}

                <Button sx={{ mt: 1 }} onClick={() => setShowForgot(false)}>
                  Back to Login
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
