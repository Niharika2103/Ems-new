import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEmployeeProfile,
  updateEmployeeProfile,
  fetchAdminProfile,
  fetchSuperAdminProfile,
  updateAdminProfile,
  updateSuperAdminProfile
} from "../../features/employeesDetails/employeesSlice";
import { sendEmailOtp, verifyEmailOtp } from "../../features/verify/emailVerify";
import { decodeToken } from "../../api/decodeToekn";
import { ToastContainer, toast } from "react-toastify";
import { Link, useLocation } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import {
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Avatar,
  MenuItem,
} from "@mui/material";
import { validateProfileForm } from "../../utils/validation";

const Profile = () => {
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.employeeDetails);

  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    date_of_joining: "",
    gender: "",
    email: "",
    phone: "",
    address: "",
    emergency_contact: "",
    department: "",
    permanent_address: "",
    profilePhoto: null,
    resume: null,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);

  const roles =
    useSelector((state) => state.adminSlice) ||
    useSelector((state) => state.authSlice?.role) ||
    useSelector((state) => state.employeeSlice?.role) ||
    localStorage.getItem("role");

  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  useEffect(() => {
    const getDecoded = async () => {
      try {
        const decoded = await decodeToken();
        setData(decoded);
        setUser(decoded.employeeId);

        if (decoded?.email) {
          if (roles === "admin") {
            dispatch(fetchAdminProfile(decoded.id));
          } else if (roles === "superadmin") {
            dispatch(fetchSuperAdminProfile(decoded.id));
          } 
          // else if (roles === "employee") {
          //   dispatch(fetchEmployeeProfile(decoded.email));
          // }
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    };
    getDecoded();
  }, [dispatch, roles]);

  useEffect(() => {
    if (profile) {
      setFormData({ ...formData, ...profile });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const newValue = files ? files[0] : value;
    setFormData({ ...formData, [name]: newValue });

    if (touched[name]) {
      const newErrors = validateProfileForm({ ...formData, [name]: newValue });
      setErrors(newErrors);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
    setErrors(validateProfileForm(formData));
  };

  const handleSendOtp = () => {
    if (!formData.phone.match(/^[0-9]{10}$/)) {
      alert("Enter a valid phone number first");
      return;
    }
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    setOtpSent(true);
    alert(`Mock OTP sent: ${mockOtp}`);
  };

  const handleVerifyOtp = () => {
    if (otp === generatedOtp) {
      setPhoneVerified(true);
      alert("Phone verified successfully");
    } else {
      alert("Invalid OTP");
    }
  };

  const handleSendEmailOtp = () => {
    dispatch(sendEmailOtp());
    setEmailSent(true);
  };

  const handleVerifyEmailOtp = (otp) => {
    dispatch(verifyEmailOtp(otp))
      .unwrap()
      .then(() => setEmailVerified(true))
      .catch(() => {
        alert("Invalid email OTP");
        setEmailVerified(false);
      });
  };

  const updateProfileByRole = (role, formData, id) => {
    if (role === "admin") return updateAdminProfile({ data: formData, id });
    if (role === "superadmin") return updateSuperAdminProfile({ data: formData, id });
    // if (role === "employee") return updateEmployeeProfile({ data: formData, id });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = data?.id;

    if (id && roles) {
      dispatch(updateProfileByRole(roles, formData, id))
        .unwrap()
        .then((response) => {
          toast.success(response.message);
          if (roles === "admin") {
            dispatch(fetchAdminProfile(id));
          } else if (roles === "superadmin") {
            dispatch(fetchSuperAdminProfile(id));
          } else if (roles === "employee") {
            dispatch(fetchEmployeeProfile(data?.email));
          }
        })
        .catch((err) => {
          console.error("Profile update failed:", err);
        });
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <Box className="flex justify-center items-center bg-gray-100 p-4">
        <Paper
          elevation={4}
          sx={{
            p: 4,
            width: "100%",
            maxWidth: 700,
            borderRadius: 3,
            bgcolor: "white",
          }}
        >
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold", mb: 3 }}
          >
            {roles === "admin"
              ? "Admin Information"
              : roles === "superadmin"
                ? "SuperAdmin Information"
                : roles === "employee"
                  ? "Employee Information"
                  : "Profile Information"}
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container direction="column" spacing={1.5}>
              {/* Full Name */}
              <Grid item>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  size="small"
                  sx={{ maxWidth: "60%" }}
                />
              </Grid>

              {/* Email + OTP */}
              <Grid item>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={7}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={5}>
                    {!emailVerified && !emailSent && (
                      <Button fullWidth variant="outlined" size="small" onClick={handleSendEmailOtp}>
                        Send OTP
                      </Button>
                    )}
                    {emailSent && !emailVerified && (
                      <Grid container spacing={1}>
                        <Grid item xs={7}>
                          <TextField
                            fullWidth
                            label="Enter OTP"
                            value={emailOtp}
                            onChange={(e) => setEmailOtp(e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={5}>
                          <Button
                            fullWidth
                            variant="outlined"
                            size="small"
                            onClick={() => handleVerifyEmailOtp(emailOtp)}
                          >
                            Verify
                          </Button>
                        </Grid>
                      </Grid>
                    )}
                    {emailVerified && (
                      <Typography color="success.main" sx={{ fontWeight: "bold", mt: 1 }}>
                        Email Verified Successfully
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Grid>

              {/* Phone + OTP */}
              <Grid item>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={7}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={5}>
                    {!otpSent && !phoneVerified && (
                      <Button fullWidth variant="outlined" size="small" onClick={handleSendOtp}>
                        Send OTP
                      </Button>
                    )}
                    {otpSent && !phoneVerified && (
                      <Grid container spacing={1}>
                        <Grid item xs={7}>
                          <TextField
                            fullWidth
                            label="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={5}>
                          <Button fullWidth variant="outlined" size="small" onClick={handleVerifyOtp}>
                            Verify
                          </Button>
                        </Grid>
                      </Grid>
                    )}
                    {phoneVerified && (
                      <Typography color="success.main" sx={{ fontWeight: "bold", mt: 1 }}>
                        Phone Verified Successfully
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Grid>

              {/* Gender */}
              <Grid item>
                <FormLabel>Gender</FormLabel>
                <RadioGroup row name="gender" value={formData.gender} onChange={handleChange}>
                  <FormControlLabel value="Male" control={<Radio />} label="Male" />
                  <FormControlLabel value="Female" control={<Radio />} label="Female" />
                </RadioGroup>
              </Grid>

              {/* Date of Birth */}
              <Grid item>
                <TextField
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: "45%" }}
                />
              </Grid>

              {/* Date of Joining */}
              {roles === "employee" && (
                <Grid item>
                  <TextField
                    label="Date of Joining"
                    name="date_of_joining"
                    type="date"
                    value={formData.date_of_joining}
                    onChange={handleChange}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: "45%" }}
                  />
                </Grid>
              )}

              {/* Department */}
              <Grid item>
                <TextField
                  select
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  size="small"
                  sx={{ width: "45%" }}
                >
                  <MenuItem value="HR">HR</MenuItem>
                  <MenuItem value="IT">IT</MenuItem>
                  <MenuItem value="Finance">Finance</MenuItem>
                  <MenuItem value="Sales">Sales</MenuItem>
                </TextField>
              </Grid>

              {/* Addresses */}
              <Grid item>
                <TextField
                  label="Current Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  size="small"
                  sx={{ width: "60%" }}
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Permanent Address"
                  name="permanent_address"
                  value={formData.permanent_address}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  size="small"
                  sx={{ width: "60%" }}
                />
              </Grid>

              {/* Emergency Contact */}
              <Grid item>
                <TextField
                  label="Emergency Contact"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  size="small"
                  sx={{ width: "45%" }}
                />
              </Grid>

              {/* Profile Photo */}
              <Grid item>
                <Typography>Profile Photo</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    size="small"
                    value={
                      formData.profilePhoto instanceof File
                        ? formData.profilePhoto.name
                        : profile?.profile_photo
                          ? "Existing Profile Photo"
                          : ""
                    }
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <label htmlFor="profile-photo-upload">
                          <Button component="span" size="small">
                            Upload
                          </Button>
                        </label>
                      ),
                    }}
                    sx={{ width: "60%" }}
                  />
                  <input
                    accept="image/png, image/jpeg"
                    style={{ display: "none" }}
                    id="profile-photo-upload"
                    type="file"
                    name="profilePhoto"
                    onChange={handleChange}
                  />
                  <Avatar
                    src={
                      formData.profilePhoto instanceof File
                        ? URL.createObjectURL(formData.profilePhoto)
                        : profile?.profile_photo || undefined
                    }
                    sx={{ width: 56, height: 56 }}
                  />
                </Box>
              </Grid>

              {/* Resume */}
              {roles === "employee" && (
                <Grid item>
                  <Typography>Resume</Typography>
                  <Box display="flex" alignItems="center" gap={2} sx={{ width: "60%" }}>
                    <TextField
                      size="small"
                      fullWidth
                      value={
                        formData.resume instanceof File
                          ? formData.resume.name
                          : profile?.resume
                            ? profile.resume.split("/").pop()
                            : ""
                      }
                      placeholder="No file chosen"
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <label htmlFor="resume-upload">
                            <Button component="span" size="small">
                              Upload
                            </Button>
                          </label>
                        ),
                      }}
                    />
                    <input
                      type="file"
                      name="resume"
                      accept=".pdf,.doc,.docx"
                      style={{ display: "none" }}
                      id="resume-upload"
                      onChange={handleChange}
                    />
                  </Box>
                </Grid>
              )}

              {/* Update Button */}
              <Grid item>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ mt: 2, borderRadius: "12px", background: "#00c853" }}
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default Profile;
