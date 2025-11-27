import React, { useState, useEffect } from "react";
import {
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  Stack,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { adminRegister, adminverifyOtp } from "../../features/auth/adminSlice";
import { validateRegistration } from "../../utils/validation";
import RegisterImg from "../../assets/register.svg";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./register.css";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function AdminRegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(true);
  const [showconpassword, setShowConPassword] = useState(true);
  const { loading, error } = useSelector((state) => state.admin);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
  });
  const [errors, setErrors] = useState({});
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("register");
  const [qrCodeUrl, setQrCodeUrl] = useState("");


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //in case of refersh want to store 
  useEffect(() => {
    const step = localStorage.getItem("step");
    const qr = localStorage.getItem("qrCodeUrl");
    const email = localStorage.getItem("email");

    if (step) setStep("mfa-setup");
    if (qr) setQrCodeUrl(qr);
    if (email) setFormData((prev) => ({ ...prev, email }));
  }, []);

  //Admin Register Here
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateRegistration(formData);
    if (Object.keys(validationErrors).length === 0) {
      dispatch(adminRegister(formData))
        .unwrap()
        .then((response) => {
          localStorage.setItem("step", response.message);
          localStorage.setItem("qrCodeUrl", response.qrCodeUrl);
          localStorage.setItem("email", formData.email);

          if (response.qrCodeUrl) {
            setStep("mfa-setup");
            setQrCodeUrl(response.qrCodeUrl);
            toast.info(response.message);
          } else {
            toast.warning("Please complete MFA setup first.");
          }
        })
        .catch((err) => {
          if (err.error === "OTP required for login") {
            setStep("mfa-login");
            toast.warning("Enter OTP to continue");
          } else if (
            err.error === "OTP required to complete MFA setup" &&
            err.qrCodeUrl
          ) {
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

  //verfication
  const handleOtpSetupSubmit = (e) => {
    e.preventDefault();
    dispatch(adminverifyOtp({ email: formData.email, otp }))
      .unwrap()
      .then((response) => {
        toast.success(response.message);
        localStorage.removeItem("step");
        localStorage.removeItem("qrCodeUrl");
        localStorage.removeItem("email");
        navigate("/admin/login");
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
            Admin Register Here
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
                  error={!!errors.email}
                  helperText={errors.email}
                  required
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
                  type={showconpassword ? "password" : "text"}
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
                        <IconButton onClick={() => setShowConPassword((prev) => !prev)} edge="end">
                          {showconpassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
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
                  <a href="/#/admin/login" className="register-link">
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
              <Box
                mt={3}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                {qrCodeUrl && (
                  <img src={qrCodeUrl} alt="Scan QR" width="100" />
                )}
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
