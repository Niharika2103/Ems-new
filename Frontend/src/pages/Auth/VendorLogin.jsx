import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { vendorForgotPasswordApi,vendorLoginApi ,  vendorResetPasswordOtpApi,vendorResetPasswordAfterLoginApi } from "../../api/authApi";
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

  const [resetMode, setResetMode] = useState(null); 
  // "TEMP" | "FORGOT"
  const [vendorId, setVendorId] = useState(null);


  /* ===================== LOGIN STATE ===================== */
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  /* ===================== FORGOT PASSWORD STATE ===================== */
  // LOGIN | EMAIL | OTP
  const [forgotStep, setForgotStep] = useState("LOGIN");

  const [forgotPasswordData, setForgotPasswordData] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [forgotErrors, setForgotErrors] = useState({});
  const [forgotLoading, setForgotLoading] = useState(false);

  /* ===================== INPUT HANDLERS ===================== */
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

  /* ===================== LOGIN ===================== */
  const handleLogin = async (e) => {
    e.preventDefault();

    let validation = {};
    if (!formData.email.trim()) validation.email = "Email is required";
    if (!formData.password.trim()) validation.password = "Password is required";

    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    try {
      const response = await vendorLoginApi(formData);

      // 🔐 TEMP PASSWORD → FORCE RESET
    //   if (response.data.changePasswordRequired) {
    //   toast.info("Please change your password to continue");
    //   setForgotStep("FORCE_RESET"); // ✅ NO OTP
    //   return;
    // }

     if (response.data.changePasswordRequired) {
  setResetMode("TEMP");     // 🔴 VERY IMPORTANT
  setVendorId(response.data.vendorId);
  setForgotStep("OTP");     // reuse same UI
  toast.info("Please change your password to continue");
  return;
}






      // ✅ NORMAL LOGIN
      if (response.data.success) {
        toast.success("Vendor Login Successful!");
        localStorage.setItem("vendor", JSON.stringify(response.data.vendor));
        setTimeout(() => navigate("/vendor"), 1200);
      }

    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        toast.warning("Your account is pending admin approval.");
      } else if (err.response?.status === 401) {
        toast.error("Invalid email or password");
      } else {
        toast.error("Login failed. Please try again.");
      }
    }
  };

  /* ===================== FORGOT PASSWORD ===================== */
  // const handleForgotClick = () => {
  //   if (!formData.email.trim()) {
  //     toast.error("Please enter your email first");
  //     return;
  //   }
  //   setForgotStep("EMAIL");
  // };

  const handleForgotClick = () => {
  if (!formData.email.trim()) {
    toast.error("Please enter your email first");
    return;
  }

  setResetMode("FORGOT");   // ✅ important
  setForgotStep("EMAIL");
};


  const handleSendOtp = async () => {
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    setForgotLoading(true);
    try {
      await vendorForgotPasswordApi({ email: formData.email });
      toast.success("OTP sent to your email");
      setForgotStep("OTP");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Unable to send OTP");
    } finally {
      setForgotLoading(false);
    }
  };

//   const handleVerifyOtpAndReset = async (e) => {
//   e.preventDefault();

//   // 🛑 ensure this runs ONLY for forgot-password OTP flow
//   if (forgotStep !== "OTP") {
//     toast.error("Invalid password reset flow");
//     return;
//   }

//   let validation = {};

//   if (!forgotPasswordData.otp)
//     validation.otp = "OTP is required";

//   if (!forgotPasswordData.newPassword)
//     validation.newPassword = "New password required";

//   if (!forgotPasswordData.confirmPassword)
//     validation.confirmPassword = "Confirm password required";

//   if (
//     forgotPasswordData.newPassword &&
//     forgotPasswordData.confirmPassword &&
//     forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword
//   ) {
//     validation.confirmPassword = "Passwords do not match";
//   }

//   if (Object.keys(validation).length > 0) {
//     setForgotErrors(validation);
//     return;
//   }

//   setForgotLoading(true);

//   try {
//     await vendorResetPasswordOtpApi({
//       email: formData.email,
//       otp: forgotPasswordData.otp,
//       newPassword: forgotPasswordData.newPassword,
//     });

//     toast.success("Password reset successful. Please login.");

//     // 🔁 BACK TO LOGIN
//     setForgotStep("LOGIN");
//     setForgotPasswordData({
//       otp: "",
//       newPassword: "",
//       confirmPassword: "",
//     });
//     setForgotErrors({});

//   } catch (err) {
//     console.error(err);
//     toast.error(
//       err.response?.data?.error || "OTP verification failed"
//     );
//   } finally {
//     setForgotLoading(false);
//   }
// };
const handleVerifyOtpAndReset = async (e) => {
  e.preventDefault();

  let validation = {};

  // 🔐 FORGOT PASSWORD → OTP REQUIRED
  if (resetMode === "FORGOT") {
    if (!forgotPasswordData.otp) {
      validation.otp = "OTP is required";
    }
  }

  // 🔐 BOTH FLOWS NEED PASSWORD
  if (!forgotPasswordData.newPassword) {
    validation.newPassword = "New password required";
  }

  if (!forgotPasswordData.confirmPassword) {
    validation.confirmPassword = "Confirm password required";
  }

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

  try {
    // ===============================
    // 🔴 TEMP PASSWORD (NO OTP)
    // ===============================
    if (resetMode === "TEMP") {
      await vendorResetPasswordAfterLoginApi({
        vendorId,                 // REQUIRED
        newPassword: forgotPasswordData.newPassword,
      });

      toast.success("Password updated. Please login again.");
    }

    // ===============================
    // 🔴 FORGOT PASSWORD (OTP)
    // ===============================
    if (resetMode === "FORGOT") {
      await vendorResetPasswordOtpApi({
        email: formData.email,
        otp: forgotPasswordData.otp,
        newPassword: forgotPasswordData.newPassword,
      });

      toast.success("Password reset successful. Please login.");
    }

    // 🔁 RESET UI
    setForgotStep("LOGIN");
    setResetMode(null);
    setForgotPasswordData({
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });

  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.error || "Password reset failed");
  } finally {
    setForgotLoading(false);
  }
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
             // minHeight: showForgotPassword ? "420px" : "auto",
             minHeight: forgotStep !== "LOGIN" ? "420px" : "auto",
              transition: "all 0.3s ease-in-out",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              {/* Back button when forgot password */}
              {forgotStep !== "LOGIN" && (
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => setForgotStep("LOGIN")}
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
                  {/* {showForgotPassword ? "Reset Password" : "Vendor Sign In"} */}
                  {forgotStep === "LOGIN" ? "Vendor Sign In" : "Reset Password"}

                </Typography>
              </Box>

              <Divider sx={{ mb: 1.5 }} />
{/* ---------------- LOGIN FORM ---------------- */}
<Fade in={forgotStep === "LOGIN"}>
  <Box
    component="form"
    onSubmit={handleLogin}
    sx={{ display: forgotStep === "LOGIN" ? "block" : "none" }}
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
            <IconButton onClick={() => setShowPassword((p) => !p)}>
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
        onClick={() => {
          setResetMode("FORGOT");     // ✅ IMPORTANT
          setForgotStep("EMAIL");
        }}
      >
        Forgot Password?
      </Button>
    </Box>

    {/* Register */}
    <Typography align="center" sx={{ mt: 1.5, fontSize: "0.8rem" }}>
      Don't have an account?{" "}
      <span
        onClick={() => navigate("/vendor/registration")}
        style={{ color: "#1976d2", cursor: "pointer" }}
      >
        Register Here
      </span>
    </Typography>

    {/* Login Button */}
    <Button fullWidth variant="contained" sx={{ mt: 2, py: 1 }} type="submit">
      Log In
    </Button>
  </Box>
</Fade>

{/* ---------------- RESET / FORGOT PASSWORD ---------------- */}
<Fade in={forgotStep !== "LOGIN"}>
  <Box
    component="form"
    onSubmit={handleVerifyOtpAndReset}
    sx={{ display: forgotStep !== "LOGIN" ? "block" : "none" }}
  >
    {/* ===== SEND OTP STEP (FORGOT ONLY) ===== */}
    {forgotStep === "EMAIL" && (
      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 1 }}
        onClick={handleSendOtp}
        disabled={forgotLoading}
      >
        {forgotLoading ? "Sending OTP..." : "Send OTP"}
      </Button>
    )}

    {/* ===== PASSWORD RESET STEP ===== */}
    {forgotStep === "OTP" && (
      <>
        {/* OTP — ONLY FOR FORGOT PASSWORD */}
        {resetMode === "FORGOT" && (
          <TextField
            label="OTP"
            name="otp"
            fullWidth
            size="small"
            margin="dense"
            value={forgotPasswordData.otp}
            onChange={handleForgotChange}
            error={!!forgotErrors.otp}
            helperText={forgotErrors.otp}
          />
        )}

        {/* New Password */}
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

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2, py: 1 }}
          type="submit"
          disabled={forgotLoading}
        >
          {forgotLoading
            ? "Updating..."
            : resetMode === "TEMP"
            ? "Update Password"
            : "Reset Password"}
        </Button>
      </>
    )}
  </Box>
</Fade>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}