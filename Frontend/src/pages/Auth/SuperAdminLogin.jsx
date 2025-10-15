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
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import { checkEmail, login, resetEmailStatus } from "../../features/auth/authSlice";
import { ToastContainer, toast } from "react-toastify";
import { validateLogin } from "../../utils/validation";
import "react-toastify/dist/ReactToastify.css";
import "./login.css";
import { CheckCircle, Cancel } from "@mui/icons-material";
import debounce from "lodash.debounce";

// === Swiper ===
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/autoplay";

// === Images ===
import company from "../../assets/company.jpg";
import company1 from "../../assets/company1.jpg";
import company2 from "../../assets/company2.jpg";

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const emailStatus = useSelector((state) => state.auth.emailStatus);

  const [formData, setFormData] = useState({
    email: "",
    password: "",

  });
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(true);

  const debouncedCheckEmail = debounce((email) => {
    if (email) dispatch(checkEmail(email));
  }, 500);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "email") {
      // Only trigger email check if it looks like an email
      const emailRegex = /\S+@\S+\.\S+/;
      if (emailRegex.test(value)) {
        debouncedCheckEmail(value);
      } else {
        dispatch(resetEmailStatus()); // Reset status if not valid
      }
    }
  };
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (emailStatus !== true) {
      toast.error("Please enter a valid authorized email first.");
      return;
    }
    const validationErrors = validateLogin(formData);

    if (Object.keys(validationErrors).length === 0) {


      dispatch(login({ ...formData, otp }))
        .unwrap()
        .then((response) => {
          toast.success(response.message);
          setFormData({
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
            role: "superadmin",
          });
          setOtp("");
          dispatch(resetEmailStatus());
          setErrors({});
          setTimeout(() => {
            navigate("/dashboard",{ replace: true });
          }, 2000);
          window.onpopstate = null;
        })
        .catch((err) => {
          toast.error(err.error || "Login failed");
        });
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <Box className="super-admin-container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* === Top Half Carousel === */}
      <Box className="super-admin-top">
        <Swiper
          className="super-strip-swiper"
          effect="coverflow"
          grabCursor
          centeredSlides
          slidesPerView={3}
          loop
          speed={1000}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          coverflowEffect={{ rotate: 0, stretch: 0, depth: 150, modifier: 2, slideShadows: false }}
          modules={[Autoplay, EffectCoverflow]}
        >
          {[company, company1, company2, company, company1, company2].map((img, idx) => (
            <SwiperSlide key={idx}>
              <img src={img} alt={`company${idx}`} className="strip-img" />
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      {/* === Bottom White Half === */}
      <Box className="super-admin-bottom" />

      {/* === Login Card === */}
      <Box className="super-admin-card">
        <Card sx={{ borderRadius: 3, boxShadow: 6, width: "100%" }}>
          <CardContent>
            <Box textAlign="center" mb={2}>
              <PersonIcon className="admin-icon" sx={{ fontSize: { xs: 35, sm: 40 } }} />
              <Typography variant="h6" fontWeight="bold" mt={1} fontSize={{ xs: "1rem", sm: "1.2rem" }}>
                SuperAdmin Sign In
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box component="form" onSubmit={handleLoginSubmit} noValidate>

              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.email || emailStatus === false}
                helperText={errors.email || (emailStatus === false ? "Email not authorized" : "")}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {emailStatus === true && <CheckCircle sx={{ color: "green" }} />}
                      {emailStatus === false && <Cancel sx={{ color: "red" }} />}
                    </InputAdornment>
                  ),
                }}
              />


              {/* Password */}
              <TextField
                label="Password"
                name="password"
                type={showPassword ? "password" : "text"}
                value={formData.password}
                onChange={handleChange}
                fullWidth
                size="small"
                margin="normal"
                variant="outlined"
                error={!!errors.password}
                helperText={errors.password}
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



              {/* OTP */}
              <TextField
                label="Enter OTP"
                name="otp"
                fullWidth
                size="small"
                margin="normal"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />

              <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                Don’t have an account?{" "}
                <a href="/#/superadmin/register" className="admin-register-link">
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
      </Box>
    </Box>
  );
}
