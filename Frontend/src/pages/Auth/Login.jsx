import React, { useState, useEffect } from "react";
import { replace, useNavigate } from "react-router-dom";
import { decodeToken } from "../../api/decodeToekn";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { employeeLogin, employeeForgotPassword } from "../../features/auth/employeeSlice";
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
    employment_type: "",
  });
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(true);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [newPasswordData, setNewPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const getDecoded = async () => {
      try {
        const decoded = await decodeToken();
        console.log(decoded, "decoded");
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    };

    getDecoded();


  }, []);
  // Handle input changes and password validation
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Password length validation
    if ((name === "password" || name === "newPassword") && value.length > 16) {
      setErrors((prev) => ({ ...prev, [name]: "Password cannot exceed 16 characters" }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setFormData({ ...formData, [name]: value });
  };

  // Handle new password input changes
  const handleNewPasswordChange = (e) => {
    const { name, value } = e.target;

    if (value.length > 16) {
      setErrors((prev) => ({ ...prev, [name]: "Password cannot exceed 16 characters" }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setNewPasswordData({ ...newPasswordData, [name]: value });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    if (step === 1) {
      if (!formData.email || !formData.password) {
        toast.error("Please enter email and password");
        return;
      }

      // Prevent login if password exceeds 16
      if (formData.password.length > 16) {
        toast.error("Password cannot exceed 16 characters");
        return;
      }

      if (formData.employmentType === "fulltime") {
        if (!formData.email.endsWith("@zigmaneural.com")) {
          toast.error("Full-time employees must use @zigmaneural.com email");
          return;
        }
      }
      dispatch(employeeLogin({ email: formData.email, password: formData.password, employment_type: formData.employment_type }))
        .unwrap()
        .then((response) => {
          if (response.firstLogin) {
            localStorage.setItem("resetToken", response.resetToken);
            toast.success("Password Reseted successfully!")
            setTimeout(() => {
              navigate("/login/reset-password");
            }, 700)
          } else if (response.otpRequired) {
            setStep(2);
            setOtp("");
            toast.info(response.message);
          } else {
            localStorage.setItem("token", response.token);
            const decoded = decodeToken();
            console.log("Decoded after login:", decoded.employment_type);
            if (decoded.employment_type === "freelancer") {
              toast.success("Login successfully!")
              setTimeout(() => {
                navigate("/freelancer_dashboard", { replace: true });
              }, 700)

            } else {
              toast.success("Login successfully!")
              setTimeout(() => {
                navigate("/dashboard", { replace: true });
              }, 700)
            }
            window.onpopstate = null;
          }
        })
        .catch((err) => toast.error(err.error || "Login failed"));
    } else if (step === 2) {
      if (!otp) {
        toast.error("Please enter the OTP");
        return;
      }

      dispatch(employeeLogin({ email: formData.email, password: formData.password, employment_type: formData.employment_type, otp }))
        .unwrap()
        .then((response) => {

          localStorage.setItem("token", response.token);
          const decoded = decodeToken();
          if (decoded.employment_type === "freelancer") {
            toast.success("Login Successfully!");
            setTimeout(() => {
              navigate("/freelancer_dashboard", { replace: true });
            }, 700)
          } else {
            toast.success(response.message);
            setTimeout(() => {
              navigate("/dashboard", { replace: true });
            }, 700)
          }
          window.onpopstate = null;
        })
        .catch((err) => toast.error(err.error || "OTP verification failed"));
    }
  };

  // const handleForgotPasswordSubmit = (e) => {
  //   e.preventDefault();

  //   if (!formData.email) {
  //     toast.error("Please enter your email address");
  //     return;
  //   }

  //   if (!newPasswordData.newPassword || !newPasswordData.confirmPassword) {
  //     toast.error("Please enter both new password and confirm password");
  //     return;
  //   }

  //   if (newPasswordData.newPassword !== newPasswordData.confirmPassword) {
  //     toast.error("Passwords do not match");
  //     return;
  //   }

  //   if (newPasswordData.newPassword.length > 16) {
  //     toast.error("Password cannot exceed 16 characters");
  //     return;
  //   }

  //   // Here you would typically make an API call to reset the password
  //   toast.success("Password reset instructions sent to your email");

  //   // Reset the form and go back to login
  //   setForgotPassword(false);
  //   setNewPasswordData({ newPassword: "", confirmPassword: "" });
  // };
  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();

    if (!formData.email) {
      toast.error("Please enter your email");
      return;
    }

    dispatch(employeeForgotPassword({ email: formData.email }))
      .unwrap()
      .then((res) => {
        toast.success(res.message || "Password reset link sent to your email");
        setForgotPassword(false);
      })
      .catch((err) => {
        toast.error(err.error || "Failed to send reset link");
      });
  };


  // Enable Login button only if fields are valid
  const isStep1Valid = formData.email.trim() !== "" && formData.password.trim() !== "" &&
    formData.employment_type.trim() !== "";
  const isStep2Valid = otp.trim() !== "";
  const isButtonDisabled = loading || (step === 1 ? !isStep1Valid : !isStep2Valid);

  // Enable Reset Password button
  const isResetPasswordValid = formData.email.trim() !== "" &&
    newPasswordData.newPassword.trim() !== "" &&
    newPasswordData.confirmPassword.trim() !== "";

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="login-page">

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
                    {forgotPassword ? "Reset Password" : "Login"}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {!forgotPassword ? (
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
                      type={showPassword ? "password" : "text"}
                      fullWidth
                      size="small"
                      margin="normal"
                      variant="outlined"
                      onCopy={(e) => e.preventDefault()}
                      onPaste={(e) => e.preventDefault()}
                      onCut={(e) => e.preventDefault()}
                      onContextMenu={(e) => e.preventDefault()}
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
                              onClick={() => setShowPassword((prev) => !prev)}
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Forgot Password Link - Better positioned */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -0.5, mb: 1 }}>
                      <Link
                        component="button"
                        type="button"
                        variant="body2"
                        sx={{
                          fontSize: '0.8rem',
                          textDecoration: 'none',
                          color: 'primary.main',
                          fontWeight: 500,
                          '&:hover': {
                            textDecoration: 'underline',
                            color: 'primary.dark',
                          },
                        }}
                        onClick={() => setForgotPassword(true)}
                      >
                        Forgot Password?
                      </Link>
                    </Box>

                    <TextField
                      select
                      fullWidth
                      size="small"
                      margin="normal"
                      name="employment_type"
                      label="Employee Type"
                      value={formData.employment_type}
                      onChange={(e) =>
                        setFormData({ ...formData, employment_type: e.target.value })
                      }
                      SelectProps={{
                        MenuProps: {
                          disablePortal: false,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left',
                          },
                          transformOrigin: {
                            vertical: 'top',
                            horizontal: 'left',
                          },
                          PaperProps: {
                            style: {
                              maxHeight: 300,
                              marginTop: 4,
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem value="">Select</MenuItem>
                      <MenuItem value="fulltime">Full-time</MenuItem>
                      <MenuItem value="contract">Contract</MenuItem>
                      <MenuItem value="freelancer">Freelancer</MenuItem>

                    </TextField>

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
                      sx={{
                        mt: 2,
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                        py: 1.2
                      }}
                      type="submit"
                      disabled={isButtonDisabled}
                    >
                      {loading ? "Logging in..." : "Log In"}
                    </Button>
                  </Box>
                ) : (
                  <Box component="form" onSubmit={handleForgotPasswordSubmit} noValidate>

                    <TextField
                      label="Enter your Email"
                      name="email"
                      type="email"
                      fullWidth
                      size="small"
                      margin="normal"
                      variant="outlined"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />

                    <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        onClick={() => setForgotPassword(false)}
                      >
                        Back to Login
                      </Button>

                      <Button
                        fullWidth
                        variant="contained"
                        size="small"
                        type="submit"
                      >
                        Send Reset Link
                      </Button>
                    </Box>

                  </Box>

                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}