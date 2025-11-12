import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEmployeeProfile,
  updateEmployeeProfile,
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
  Person as PersonIcon,
  Work as WorkIcon,
  Cake as CakeIcon,
  Event as EventIcon,
} from "@mui/icons-material";

const EmployeeProfile = () => {
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

  const [userId, setUserId] = useState(null);

  // Fetch employee profile
  useEffect(() => {
    const getDecoded = async () => {
      try {
        const decoded = await decodeToken();
        setUserId(decoded.id);
        dispatch(fetchEmployeeProfile(decoded.email));
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    };
    getDecoded();
  }, [dispatch]);

  // Set profile data
  // useEffect(() => {
  //   if (profile) {
  //     setFormData((prev) => ({ ...prev, ...profile }));
  //   }
  // }, [profile]);

  
// Set profile data
useEffect(() => {
  if (profile) {
    const formatDate = (isoString) => {
      if (!isoString) return "";
      return isoString.split("T")[0]; // Extract "YYYY-MM-DD" from "YYYY-MM-DDTHH:mm:ss.sssZ"
    };

    setFormData((prev) => ({
      ...prev,
      ...profile,
      dob: formatDate(profile.dob),
      date_of_joining: formatDate(profile.date_of_joining),
    }));
  }
}, [profile]);
  // Handle file upload
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle form submit for documents only
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userId) return;

    // Only submit profile photo and resume
    const updateData = {
      profilePhoto: formData.profilePhoto,
      resume: formData.resume
    };

    dispatch(updateEmployeeProfile({ data: updateData, id: userId }))
      .unwrap()
      .then((res) => {
        toast.success(res.message || "Profile updated successfully");
        dispatch(fetchEmployeeProfile(profile.email));
      })
      .catch((err) => {
        toast.error("Failed to update profile");
        console.error(err);
      });
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
                border: "3px solid rgba(255,255,255,0.3)",
              }}
              src={
                formData.profilePhoto instanceof File
                  ? URL.createObjectURL(formData.profilePhoto)
                  : profile?.profile_photo || undefined
              }
            >
              {formData.name?.[0]?.toUpperCase() || "E"}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {formData.name || "Employee Name"}
              </Typography>
              <Typography variant="subtitle2" color="rgba(255,255,255,0.8)">
                {formData.department || "Department"} • Employee
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.8)" sx={{ mt: 0.5 }}>
                {formData.email || "email@company.com"}
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
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ color: "#2196f3", mr: 1 }} />,
                    }}
                    disabled
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
                      startAdornment: <CakeIcon sx={{ color: "#2196f3", mr: 1 }} />,
                    }}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <GenderIcon sx={{ color: "#2196f3", mr: 1 }} />,
                    }}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ color: "#2196f3", mr: 1 }} />,
                    }}
                    disabled
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* PROFESSIONAL INFORMATION */}
            <Typography variant="h6" fontWeight={600} sx={{ mt: 4, mb: 2 }}>
              💼 Professional Information
            </Typography>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <DepartmentIcon sx={{ color: "#2196f3", mr: 1 }} />,
                    }}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date of Joining"
                    name="date_of_joining"
                    value={formData.date_of_joining}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <EventIcon sx={{ color: "#2196f3", mr: 1 }} />,
                    }}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ color: "#2196f3", mr: 1 }} />,
                    }}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Emergency Contact"
                    name="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <EmergencyIcon sx={{ color: "#2196f3", mr: 1 }} />,
                    }}
                    disabled
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* ADDRESS INFORMATION */}
            <Typography variant="h6" fontWeight={600} sx={{ mt: 4, mb: 2 }}>
              🏠 Address Information
            </Typography>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Current Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    fullWidth
                    InputProps={{
                      startAdornment: <AddressIcon sx={{ color: "#2196f3", mr: 1 }} />,
                    }}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Permanent Address"
                    name="permanent_address"
                    value={formData.permanent_address}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    fullWidth
                    InputProps={{
                      startAdornment: <AddressIcon sx={{ color: "#2196f3", mr: 1 }} />,
                    }}
                    disabled
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* DOCUMENTS SECTION */}
            <Typography variant="h6" fontWeight={600} sx={{ mt: 4, mb: 2 }}>
              📄 Documents
            </Typography>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Grid container spacing={3}>
                {/* Profile Photo Upload */}
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      src={
                        formData.profilePhoto instanceof File
                          ? URL.createObjectURL(formData.profilePhoto)
                          : profile?.profile_photo || undefined
                      }
                      sx={{ width: 70, height: 70 }}
                    />
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                        Profile Photo
                      </Typography>
                      <input
                        accept="image/png, image/jpeg"
                        style={{ display: "none" }}
                        id="profile-photo-upload"
                        type="file"
                        name="profilePhoto"
                        onChange={handleChange}
                      />
                      <label htmlFor="profile-photo-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          size="small"
                          startIcon={<UploadIcon />}
                          sx={{ borderRadius: 2 }}
                        >
                          Change Photo
                        </Button>
                      </label>
                    </Box>
                  </Box>
                </Grid>

                {/* Resume Upload */}
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                      Resume
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: "#666", 
                          flex: 1,
                          fontStyle: formData.resume || profile?.resume ? "normal" : "italic"
                        }}
                      >
                        {formData.resume instanceof File
                          ? formData.resume.name
                          : profile?.resume
                          ? profile.resume.split("/").pop()
                          : "No resume uploaded"}
                      </Typography>
                      <input
                        type="file"
                        name="resume"
                        accept=".pdf,.doc,.docx"
                        style={{ display: "none" }}
                        id="resume-upload"
                        onChange={handleChange}
                      />
                      <label htmlFor="resume-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          size="small"
                          startIcon={<UploadIcon />}
                          sx={{ borderRadius: 2 }}
                        >
                          Upload Resume
                        </Button>
                      </label>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Update Button */}
            <Box textAlign="center" mt={4}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  px: 6,
                  py: 1.5,
                  borderRadius: 3,
                  background: "linear-gradient(45deg, #2196f3, #21cbf3)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #1976d2, #00acc1)",
                  },
                }}
              >
                {loading ? "Updating..." : "Update Documents"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default EmployeeProfile;