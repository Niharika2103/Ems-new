import React, { useState ,useEffect} from "react";
import { replace, useNavigate } from "react-router-dom";
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
import { employeeLogin } from "../../features/auth/employeeSlice";
import PersonIcon from "@mui/icons-material/Person";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./login.css";

import company from "../../assets/company.jpg";
import company1 from "../../assets/company1.jpg";
import company2 from "../../assets/company2.jpg";

import { Swiper, SwiperSlide } from "swiper/react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Autoplay, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.employee);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(true);

  // ✅ Handle input changes and password validation
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Password length validation
    if (name === "password" && value.length > 16) {
      setErrors((prev) => ({ ...prev, password: "Password cannot exceed 16 characters" }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    if (step === 1) {
      if (!formData.email || !formData.password) {
        toast.error("Please enter email and password");
        return;
      }

      // ✅ Prevent login if password exceeds 16
      if (formData.password.length > 16) {
        toast.error("Password cannot exceed 16 characters");
        return;
      }

      dispatch(employeeLogin({ email: formData.email, password: formData.password }))
        .unwrap()
        .then((response) => {
          if (response.firstLogin) {
            localStorage.setItem("resetToken", response.resetToken);
            navigate("/login/reset-password");
          } else if (response.otpRequired) {
            setStep(2);
            setOtp("");
            toast.info(response.message);
          } else {
            navigate("/dashboard",{ replace: true });
    window.onpopstate = null;

          }
        })
        .catch((err) => toast.error(err.error || "Login failed"));
    } else if (step === 2) {
      if (!otp) {
        toast.error("Please enter the OTP");
        return;
      }

      dispatch(employeeLogin({ email: formData.email, password: formData.password, otp }))
        .unwrap()
        .then((response) => {
          toast.success(response.message);
          navigate("/dashboard" ,{ replace: true });
    window.onpopstate = null;

        })
        .catch((err) => toast.error(err.error || "OTP verification failed"));
    }
  };

  // Enable Login button only if fields are valid
  const isStep1Valid = formData.email.trim() !== "" && formData.password.trim() !== "";
  const isStep2Valid = otp.trim() !== "";
  const isButtonDisabled = loading || (step === 1 ? !isStep1Valid : !isStep2Valid);

  return (
    <div className="login-page">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="top-carousel login-top">
        <Swiper
          modules={[Autoplay, EffectCoverflow]}
          effect="coverflow"
          centeredSlides={true}
          slidesPerView={3}
          loop={true}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          coverflowEffect={{ rotate: 0, stretch: 0, depth: 120, modifier: 1.1 }}
          className="login-strip-swiper"
        >
          <SwiperSlide><img src={company} className="strip-img" alt="company" /></SwiperSlide>
          <SwiperSlide><img src={company1} className="strip-img" alt="company1" /></SwiperSlide>
          <SwiperSlide><img src={company2} className="strip-img" alt="company2" /></SwiperSlide>
          <SwiperSlide><img src={company} className="strip-img" alt="repeat" /></SwiperSlide>
          <SwiperSlide><img src={company1} className="strip-img" alt="repeat" /></SwiperSlide>
          <SwiperSlide><img src={company2} className="strip-img" alt="repeat" /></SwiperSlide>
        </Swiper>
      </div>

      <div className="bottom-area login-bottom" />

      <div className="login-card">
        <div className="login-inner">
          <Card sx={{ borderRadius: 3, boxShadow: 6, width: "100%" }}>
            <CardContent>
              <Box textAlign="center" mb={2}>
                <PersonIcon className="admin-icon" sx={{ fontSize: { xs: 35, sm: 40 } }} />
                <Typography variant="h6" fontWeight="bold" mt={1} fontSize={{ xs: "1rem", sm: "1.2rem" }}>
                  Login
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box component="form" onSubmit={handleLoginSubmit} noValidate>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  fullWidth
                  size="small"
                  margin="normal"
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
                  size="small"
                  margin="normal"
                  variant="outlined"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  required
                  inputProps={{ maxLength: 16 }} // ✅ limit typing
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton edge="end" onClick={() => setShowPassword((prev) => !prev)}
                         aria-label={showPassword ? "Hide password" : "Show password"} >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {step === 2 && (
                  <TextField
                    label="Enter OTP"
                    name="otp"
                    fullWidth
                    margin="normal"
                    size="small"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                )}

                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  className="!px-1 !py-1 !text-md admin-button"
                  sx={{ mt: 2, fontSize: { xs: "0.9rem", sm: "1rem" } }}
                  type="submit"
                  disabled={isButtonDisabled} // ✅ disabled if invalid
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
