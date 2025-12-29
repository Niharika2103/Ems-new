import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminProfile,
  updateAdminProfile,
  fetchSuperAdminProfile,
  updateSuperAdminProfile,
} from "../../features/employeesDetails/employeesSlice";
import { decodeToken } from "../../api/decodeToekn";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Box,
  Grid,
  Paper,
  Avatar,
  Typography,
  TextField,
  Button,
  RadioGroup,
  FormLabel,
  FormControlLabel,
  Radio,
  MenuItem,
  IconButton,
   FormControl,
  InputLabel,
  Select,
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

const Profile = () => {
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.employeeDetails);

  const [formData, setFormData] = useState({
    name: "",
    dob: new Date().toISOString().split("T")[0],
    gender: "",
    email: "",
    phone: "",
    department: "",
    address: "",
    permanent_address: "",
    emergency_contact: "",
    // ❌ Removed profilePhoto from formData
  });

  const [profilePicFile, setProfilePicFile] = useState(null); // ✅ Separate file state
  const [decoded, setDecoded] = useState(null);

  const roles =
    useSelector((state) => state.adminSlice?.role) ||
    localStorage.getItem("role");

  // 🔥 Fetch logged-in profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const decodedData = await decodeToken();
        setDecoded(decodedData);

        if (roles === "admin") {
          dispatch(fetchAdminProfile(decodedData.id));
        } else if (roles === "superadmin") {
          dispatch(fetchSuperAdminProfile(decodedData.id));
        }
      } catch (err) {
        console.error("Error decoding:", err);
      }
    };
    loadProfile();
  }, [dispatch, roles]);

  // 🔥 Sync form fields when profile updates
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        dob: profile.dob ? profile.dob.split("T")[0] : "",
        gender: profile.gender || "",
        email: profile.email || "",
        phone: profile.phone || "",
        department: profile.department || "",
        address: profile.address || "",
        permanent_address: profile.permanent_address || "",
        emergency_contact: profile.emergency_contact || "",
      });
      // ✅ Reset file state — only URL matters for display
      setProfilePicFile(null);
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePhoto" && files?.[0]) {
      setProfilePicFile(files[0]);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

 
  const handleSubmit = (e) => {
  e.preventDefault();
  if (!decoded?.id) return;

  const sendData = new FormData();

  // append text fields
  Object.entries(formData).forEach(([key, value]) => {
    sendData.append(key, value || "");
  });

  // append photo
  if (profilePicFile) {
    sendData.append("profilePhoto", profilePicFile);
  }

  // ADMIN
  if (roles === "admin") {
    dispatch(updateAdminProfile({ data: sendData, id: decoded.id }))
      .unwrap()
      .then(() => {
        toast.success("Profile updated successfully!");
        dispatch(fetchAdminProfile(decoded.id));
      });
  }

  // SUPERADMIN
  if (roles === "superadmin") {
    dispatch(updateSuperAdminProfile({ data: sendData, id: decoded.id }))
      .unwrap()
      .then(() => {
        toast.success("Profile updated successfully!");
        dispatch(fetchSuperAdminProfile(decoded.id));
      });
  }
};


  // ✅ Determine photo source for Avatar
  const photoSrc = profilePicFile
    ? URL.createObjectURL(profilePicFile)
    : profile?.profile_photo || undefined;

  return (
    <>
      <ToastContainer position="top-right" autoClose={1500} />
      <Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh", p: 4 }}>
        <Paper elevation={6} sx={{ maxWidth: 950, mx: "auto", p: 4, borderRadius: 4 }}>
          
          {/* Header */}
          <Box
            display="4"
            alignItems="center"
            gap={3}
            sx={{
              background: "linear-gradient(45deg, #2196f3, #21cbf3)",
              p: 3,
              borderRadius: 3,
              color: "white",
            }}
          >
            <Avatar
              key={profile?.profile_photo || 'default'} // ✅ Force re-render when URL changes
              sx={{
                width: 90,
                height: 90,
                fontSize: 32,
                bgcolor: "white",
                color: "#2196f3",
              }}
              src={photoSrc}
            >
              {formData.name?.charAt(0)?.toUpperCase() || "A"}
            </Avatar>

            <Box>
              <Typography variant="h5">{formData.name || "Admin User"}</Typography>
              <Typography variant="subtitle2">
                {roles === "admin" ? "Admin Profile" : "Super Admin Profile"}
              </Typography>
            </Box>
          </Box>

          {/* FORM */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
            
            {/* Personal Info */}
            <Typography variant="h6" sx={{ mb: 2 }}>👤 Personal Information</Typography>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Full Name" name="name" value={formData.name} onChange={handleChange} />
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
                    inputProps={{ max: new Date().toISOString().split("T")[0] }}

                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormLabel><GenderIcon sx={{ mr: 1 }} /> Gender</FormLabel>
                  <RadioGroup row name="gender" value={formData.gender} onChange={handleChange}>
                    <FormControlLabel value="Male" control={<Radio />} label="Male" />
                    <FormControlLabel value="Female" control={<Radio />} label="Female" />
                  </RadioGroup>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
  <InputLabel
    shrink
    sx={{
      fontSize: "1.125rem",
      fontWeight: "600",
      color: "rgba(0, 0, 0, 0.87)",
    }}
  >
    Department *
  </InputLabel>

  <Select
    name="department"
    value={formData.department}
    onChange={handleChange}
    displayEmpty
    label="Department *"
    sx={{
      fontSize: "1.05rem",
      minHeight: "56px",
      borderRadius: "10px",
      background: "#fafafa",
      "& .MuiSelect-select": {
        paddingTop: "14px",
        paddingBottom: "14px",
        fontSize: "1.05rem",
      },
    }}
  >
    {/* Placeholder */}
    <MenuItem value="" disabled>
      <em>Select Department</em>
    </MenuItem>

    <MenuItem value="HR">HR</MenuItem>
    <MenuItem value="Finance">Finance</MenuItem>
    <MenuItem value="IT">IT</MenuItem>
    <MenuItem value="Sales">Sales</MenuItem>
  </Select>
</FormControl>

                </Grid>
              </Grid>
            </Paper>

            {/* Contact Info */}
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>📞 Contact Information</Typography>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Emergency Contact" name="emergency_contact" value={formData.emergency_contact} onChange={handleChange} />
                </Grid>
              </Grid>
            </Paper>

            {/* Address */}
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>🏠 Address Information</Typography>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Current Address" name="address" value={formData.address} onChange={handleChange} multiline rows={2} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Permanent Address" name="permanent_address" value={formData.permanent_address} onChange={handleChange} multiline rows={2} />
                </Grid>
              </Grid>
            </Paper>

            {/* Profile Photo */}
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>📸 Profile Photo</Typography>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Box display="flex" alignItems="center" gap={3}>
                <Avatar
                  src={photoSrc}
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
                  <IconButton component="span" color="primary" sx={{ bgcolor: "#e3f2fd", p: 1.2, borderRadius: 2 }}>
                    <UploadIcon />
                  </IconButton>
                </label>
              </Box>
            </Paper>

            {/* Submit */}
            <Box textAlign="center" mt={4}>
              <Button type="submit" variant="contained" size="large" sx={{ px: 5, py: 1.4 }}>
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