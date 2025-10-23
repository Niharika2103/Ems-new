import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminProfile,
  updateAdminProfile,
  fetchSuperAdminProfile,
  updateSuperAdminProfile,
} from "../../features/employeesDetails/employeesSlice";
import { sendEmailOtp, verifyEmailOtp } from "../../features/verify/emailVerify";
import { decodeToken } from "../../api/decodeToekn";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Box,
  Grid,
  Paper,
  Avatar,
  Typography,
  Divider,
  TextField,
  Button,
  RadioGroup,
  FormLabel,
  FormControlLabel,
  Radio,
  MenuItem,
  IconButton,
} from "@mui/material";
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Wc as GenderIcon,
  CalendarMonth as DobIcon,
  Apartment as DepartmentIcon,
  LocationOn as AddressIcon,
  ContactEmergency as EmergencyIcon,
  UploadFile as UploadIcon,
} from "@mui/icons-material";
import { validateProfileForm } from "../../utils/validation";

const Profile = () => {
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.employeeDetails);

  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    email: "",
    phone: "",
    department: "",
    address: "",
    permanent_address: "",
    emergency_contact: "",
    profilePhoto: null,
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [data, setData] = useState(null);

  const roles =
    useSelector((state) => state.adminSlice) ||
    useSelector((state) => state.authSlice?.role) ||
    localStorage.getItem("role");

  useEffect(() => {
    const getDecoded = async () => {
      try {
        const decoded = await decodeToken();
        setData(decoded);
        if (roles === "admin") {
          dispatch(fetchAdminProfile(decoded.id));
        } else if (roles === "superadmin") {
          dispatch(fetchSuperAdminProfile(decoded.id));
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    };
    getDecoded();
  }, [dispatch, roles]);

  useEffect(() => {
    if (profile) setFormData({ ...formData, ...profile });
  }, [profile]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSendOtp = () => {
    setOtpSent(true);
    alert("Mock OTP sent to phone");
  };

  const handleSendEmailOtp = () => {
    setEmailSent(true);
    alert("Mock OTP sent to email");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = data?.id;
    if (!id) return;
    if (roles === "admin") {
      dispatch(updateAdminProfile({ data: formData, id }))
        .unwrap()
        .then(() => toast.success("Profile updated successfully!"))
        .catch(() => toast.error("Update failed"));
    } else if (roles === "superadmin") {
      dispatch(updateSuperAdminProfile({ data: formData, id }));
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh", p: 4 }}>
        <Paper
          elevation={6}
          sx={{
            maxWidth: 950,
            mx: "auto",
            p: 4,
            borderRadius: 4,
            backgroundColor: "white",
          }}
        >
          {/* Header Card */}
          <Box
            display="flex"
            alignItems="center"
            gap={3}
            sx={{
              background: "linear-gradient(45deg, #2196f3, #21cbf3)",
              borderRadius: 3,
              p: 3,
              color: "white",
            }}
          >
            <Avatar
              sx={{
                width: 90,
                height: 90,
                fontSize: 32,
                bgcolor: "white",
                color: "#2196f3",
                fontWeight: 600,
              }}
              src={
                formData.profilePhoto instanceof File
                  ? URL.createObjectURL(formData.profilePhoto)
                  : profile?.profile_photo || undefined
              }
            >
              {formData.name?.[0]?.toUpperCase() || "A"}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {formData.name || "Admin User"}
              </Typography>
              <Typography variant="subtitle2" color="rgba(255,255,255,0.8)">
                {roles === "admin" ? "Admin Information" : "Super Admin"}
              </Typography>
            </Box>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
            {/* PERSONAL INFORMATION */}
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              👤 Personal Information
            </Typography>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    // InputProps={{
                    //   startAdornment: <Avatar sx={{ bgcolor: "#2196f3", width: 28, height: 28 }}></Avatar>,
                    // }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date of Birth"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <DobIcon sx={{ color: "#2196f3", mr: 1 }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormLabel><GenderIcon sx={{ mr: 1 }} />Gender</FormLabel>
                  <RadioGroup row name="gender" value={formData.gender} onChange={handleChange}>
                    <FormControlLabel value="Male" control={<Radio />} label="Male" />
                    <FormControlLabel value="Female" control={<Radio />} label="Female" />
                  </RadioGroup>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{
                      startAdornment: <DepartmentIcon sx={{ color: "#2196f3", mr: 1 }} />,
                    }}
                  >
                    <MenuItem value="HR">HR</MenuItem>
                    <MenuItem value="IT">IT</MenuItem>
                    <MenuItem value="Finance">Finance</MenuItem>
                    <MenuItem value="Sales">Sales</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Paper>

            {/* CONTACT INFORMATION */}
            <Typography variant="h6" fontWeight={600} sx={{ mt: 4, mb: 2 }}>
              📞 Contact Information
            </Typography>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ color: "#2196f3", mr: 1 }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  {!emailVerified ? (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleSendEmailOtp}
                      sx={{ mt: 1 }}
                    >
                      {emailSent ? "Resend OTP" : "Send Email OTP"}
                    </Button>
                  ) : (
                    <Typography color="success.main" sx={{ mt: 2 }}>
                      ✔ Email Verified
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ color: "#2196f3", mr: 1 }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  {!phoneVerified ? (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleSendOtp}
                      sx={{ mt: 1 }}
                    >
                      {otpSent ? "Resend OTP" : "Send Phone OTP"}
                    </Button>
                  ) : (
                    <Typography color="success.main" sx={{ mt: 2 }}>
                      ✔ Phone Verified
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Emergency Contact"
                    name="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{
                      startAdornment: <EmergencyIcon sx={{ color: "#2196f3", mr: 1 }} />,
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* ADDRESS SECTION */}
            <Typography variant="h6" fontWeight={600} sx={{ mt: 4, mb: 2 }}>
              🏠 Address Information
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Current Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    multiline
                    rows={1.5}
                    fullWidth
                    InputProps={{
                      startAdornment: <AddressIcon sx={{ color: "#2196f3", mr: 1 }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Permanent Address"
                    name="permanent_address"
                    value={formData.permanent_address}
                    onChange={handleChange}
                    multiline
                    rows={1.5}
                    fullWidth
                    InputProps={{
                      startAdornment: <AddressIcon sx={{ color: "#2196f3", mr: 1 }} />,
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* PROFILE PHOTO */}
            <Typography variant="h6" fontWeight={600} sx={{ mt: 4, mb: 2 }}>
              📸 Profile Photo
            </Typography>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Box display="flex" alignItems="center" gap={3}>
                <Avatar
                  src={
                    formData.profilePhoto instanceof File
                      ? URL.createObjectURL(formData.profilePhoto)
                      : profile?.profile_photo || undefined
                  }
                  sx={{ width: 70, height: 70 }}
                />
                <label htmlFor="photo-upload">
                  <input
                    id="photo-upload"
                    type="file"
                    name="profilePhoto"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleChange}
                  />
                  <IconButton
                    component="span"
                    color="primary"
                    sx={{ bgcolor: "#e3f2fd", p:1.2, borderRadius: 2 }}
                  >
                    <UploadIcon />
                  </IconButton>
                </label>
              </Box>
            </Paper>

            <Box textAlign="center" mt={4}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  px: 6,
                  py: 1.5,
                  borderRadius: 3,
                  background: "linear-gradient(45deg, #2196f3, #21cbf3)",
                }}
              >
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default Profile;
