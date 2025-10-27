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
  Typography,
  Button,
  Box,
  Grid,
  Paper,
  Avatar,
} from "@mui/material";

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

        // Fetch employee profile
        dispatch(fetchEmployeeProfile(decoded.email));
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    };
    getDecoded();
  }, [dispatch]);

  // Set profile data
  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({ ...prev, ...profile }));
    }
  }, [profile]);

  // Handle file upload
  const handleChange = (e) => {
    const { name, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userId) return;

    dispatch(updateEmployeeProfile({ data: formData, id: userId }))
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

  // Reusable component for Label : Value display
const InfoRow = ({ label, value }) => (
  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
    <Typography
      sx={{
        fontWeight: 600,
        color: "#333",
        minWidth: 160, // keeps labels aligned nicely
      }}
    >
      {label}:
    </Typography>
    <Typography sx={{ color: "#555", ml: 1 }}>{value || "-"}</Typography>
  </Box>
);


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
            Employee Profile
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            {/* Profile Info Section */}
            <Box sx={{ mb: 3, pl: 1 }}>
              <InfoRow label="Full Name" value={formData.name} />
              <InfoRow label="Email" value={formData.email} />
              <InfoRow label="Phone Number" value={formData.phone} />
              <InfoRow label="Gender" value={formData.gender} />
              <InfoRow label="Date of Birth" value={formData.dob} />
              <InfoRow label="Date of Joining" value={formData.date_of_joining} />
              <InfoRow label="Department" value={formData.department} />
              <InfoRow label="Current Address" value={formData.address} />
              <InfoRow label="Permanent Address" value={formData.permanent_address} />
              <InfoRow label="Emergency Contact" value={formData.emergency_contact} />
              <InfoRow label="Project Name" value={""} />
               <InfoRow label="Reporting Manager" value={""} />
            </Box>

            {/* Profile Photo Section */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontWeight: 600 }}>Profile Photo</Typography>
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
                    sx={{ mt: 1 }}
                  >
                    Upload
                  </Button>
                </label>
              </Grid>
              <Grid item>
                <Avatar
                  src={
                    formData.profilePhoto instanceof File
                      ? URL.createObjectURL(formData.profilePhoto)
                      : profile?.profile_photo || undefined
                  }
                  sx={{ width: 64, height: 64 }}
                />
              </Grid>
            </Grid>

            {/* Resume Section */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontWeight: 600 }}>Resume</Typography>
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
                  sx={{ mt: 1 }}
                >
                  Upload
                </Button>
              </label>
              <Typography sx={{ mt: 1, color: "#666", fontSize: 14 }}>
                {formData.resume instanceof File
                  ? formData.resume.name
                  : profile?.resume
                  ? profile.resume.split("/").pop()
                  : "No file chosen"}
              </Typography>
            </Box>

            {/* Update Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{
                mt: 2,
                borderRadius: "12px",
                background: "#00c853",
              }}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default EmployeeProfile;
