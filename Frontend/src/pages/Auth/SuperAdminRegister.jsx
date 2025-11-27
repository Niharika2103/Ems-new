import React, { useState, useEffect } from "react";
import {
  Typography,
  TextField,
  Button,
  Box,
  Stack,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { checkEmail, register, verifyOtp, resetEmailStatus } from "../../features/auth/authSlice";
import { validateRegistration } from "../../utils/validation";
import RegisterImg from "../../assets/register.svg";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./register.css";
import { CheckCircle, Cancel } from "@mui/icons-material";
import debounce from "lodash.debounce";


export default function SuperAdminRegister() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const emailStatus = useSelector((state) => state.auth.emailStatus);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "superadmin",
  });
  const [errors, setErrors] = useState({});
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("register"); // "register" | "mfa-setup" | "mfa-login"
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [showConPassword, setShowConPassword] = useState(true);

  // Persist step & QR code on refresh
  useEffect(() => {
    const savedStep = localStorage.getItem("step");
    const qr = localStorage.getItem("qrCodeUrl");
    const email = localStorage.getItem("email");

    if (savedStep) setStep(savedStep);
    if (qr) setQrCodeUrl(qr);
    if (email) setFormData((prev) => ({ ...prev, email }));
  }, []);

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

  // Register submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (emailStatus !== true) {
      toast.error("Please enter a valid authorized email first.");
      return;
    }
    const validationErrors = validateRegistration(formData);

    if (Object.keys(validationErrors).length === 0) {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      dispatch(register(formData))
        .unwrap()
        .then((response) => {
          localStorage.setItem("step", "mfa-setup");
          localStorage.setItem("qrCodeUrl", response.qrCodeUrl);
          localStorage.setItem("email", formData.email);

          if (response.qrCodeUrl) {
            setStep("mfa-setup");
            setQrCodeUrl(response.qrCodeUrl);
            toast.info(response.message);

            setErrors({});
          } else {
            toast.warning("Please complete MFA setup first.");
          }
        })
        .catch((err) => {
          if (err.error === "OTP required for login") {
            setStep("mfa-login");
            toast.warning("Enter OTP to continue");
          } else if (err.error === "OTP required to complete MFA setup" && err.qrCodeUrl) {
            setStep("mfa-setup");
            setQrCodeUrl(err.qrCodeUrl);
          } else {
            toast.error(err.error || "Register failed");
          }
        });
    } else {
      setErrors(validationErrors);
    }
  };

  // OTP verification submission
  const handleOtpSetupSubmit = (e) => {
    e.preventDefault();
    dispatch(verifyOtp({ email: formData.email, otp }))
      .unwrap()
      .then((response) => {
        toast.success(response.message);
        localStorage.removeItem("step");
        localStorage.removeItem("qrCodeUrl");
        localStorage.removeItem("email");
        setFormData({
          fullName: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "superadmin",
        });
        navigate("/superadmin/login");
      })
      .catch((err) => {
        toast.error(err.error || "OTP verification failed");
      });
  };

  return (
    <Box className="register-container">
      {/* Left Side - Image */}
      <Box className="register-left">
        <img src={RegisterImg} alt="Register" />
      </Box>

      {/* Right Side - Form */}
      <Box className="register-right">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

        <Box className="register-form-box">
          <Typography variant="h6" gutterBottom className="register-title">
            SuperAdmin Register Here
          </Typography>

          {(step === "register" || step === "mfa-login") && (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2}>
                <TextField
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  error={!!errors.fullName}
                  helperText={errors.fullName}
                  required
                />

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



                <TextField
                  label="Password"
                  name="password"
                  type={showPassword ? "password" : "text"}
                  value={formData.password}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  error={!!errors.password}
                  helperText={errors.password}
                  onCopy={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={showPassword ? "Show password" : "Hide password"}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConPassword ? "password" : "text"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  onCopy={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={() => setShowConPassword((prev) => !prev)}
                          aria-label={showConPassword ? "Show password" : "Hide password"}
                        >
                          {showConPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Role"
                  name="role"
                  value={formData.role}
                  fullWidth
                  size="small"
                  required
                />

                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                  Already have an account?{" "}
                  <a href="/#/superadmin/login" className="register-link">
                    Login Here
                  </a>
                </Typography>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  className="register-button"
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Register"}
                </Button>
              </Stack>
            </Box>
          )}

          {step === "mfa-setup" && (
            <Box component="form" onSubmit={handleOtpSetupSubmit} noValidate>
              <Box mt={3} sx={{ display: "flex", justifyContent: "center" }}>
                {qrCodeUrl && <img src={qrCodeUrl} alt="Scan QR" width="100" />}
              </Box>
              <TextField
                label="Enter OTP"
                name="otp"
                fullWidth
                margin="normal"
                variant="outlined"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  className="admin-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
