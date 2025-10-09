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

  // OTP & Email verification states
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
          } else if (roles === "employee") {
            dispatch(fetchEmployeeProfile(decoded.email));
          }
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    };

    getDecoded();
  }, [dispatch, roles]);


  useEffect(() => {
    if (profile) {
      setFormData({
        ...formData,
        ...profile,
      });
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
    const newErrors = validateProfileForm(formData);
    setErrors(newErrors);
  };

  // Phone OTP
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

  // Email OTP
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
    if (role === "employee") return updateEmployeeProfile({ data: formData, id });
  };

  //update profile using role 
  const handleSubmit = (e) => {
    e.preventDefault();

    // const validationErrors = validateProfileForm(formData,roles);
    // setErrors(validationErrors);
    // setTouched(
    //   Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    // );

    // if (Object.keys(validationErrors).length > 0) return;



    const id = data?.id;

    if (id && roles) {
      // Dispatch update based on role
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
       <nav className="text-gray-600 text-sm mb-4" aria-label="breadcrumb">
            <ol className="list-reset flex">
              <li>
                <Link to="/dashboard" className="text-sky-600 hover:underline">
                  Dashboard
                </Link>
                 </li><li>
                <span className="mx-2">/</span>
                 <Link to="/dashboard/emp_info" className="text-sky-600 hover:underline">
                Employee Info
                </Link>
              </li>
              {pathnames.map((name, index) => {
                const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
                const isLast = index === pathnames.length - 1;
                return (
                  <li key={routeTo} className="flex items-center">
                    <span className="mx-2">/</span>
                    {isLast ? (
                      <span className="text-gray-400">
                        {/* {name.charAt(0).toUpperCase() + name.slice(1)} */}
                        MyInfo
                        </span>
                    ) : (
                      <Link to={routeTo} className="text-sky-600 hover:underline">
                        {/* {name.charAt(0).toUpperCase() + name.slice(1)} */}
                         MyInfo
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
      <Box className="flex justify-center items-center bg-gray-100">
        <Paper
          elevation={4}
          sx={{
            p: 4,
            width: "100%",
            maxWidth: 800,
            borderRadius: "16px",
            bgcolor: "white",
          }}
        >
          <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
            {roles === "admin"
              ? "Admin  Information"
              : roles === "superadmin"
                ? "SuperAdmin  Information"
                : roles === "employee"
                  ? "Employee  Information"
                  : "Profile Information"}
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Full Name */}
              <Grid item xs={12}>
                <Typography variant="subtitle1">Full Name</Typography>
                <TextField
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  size="small"
                  error={touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12}>
                <Typography variant="subtitle1">Email</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  {/* Email input */}
                  <TextField
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    size="small"
                  />

                  {/* Send OTP button */}
                  {!emailVerified && !emailSent && (
                    <Button
                      size="medium"
                      variant="outlined"
                      onClick={handleSendEmailOtp}
                      // disabled={loading || !formData.email}
                    >
                      {loading ? "Sending..." : "Send OTP"}
                    </Button>
                  )}

                  {/* OTP input + Verify button */}
                  {!emailVerified && emailSent && (
                    <>
                      <TextField
                        label="Enter OTP"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value)}
                        size="small"
                      />
                      <Button
                        size="medium"
                        variant="outlined"
                        onClick={() => handleVerifyEmailOtp(emailOtp)}
                        // disabled={loading || !emailOtp}
                      >
                        Verify
                        {/* {loading ? "Verifying..." : "Verify"} */}
                      </Button>
                    </>
                  )}

                  {/* Verified message */}
                  {emailVerified && (
                    <Typography color="success.main" variant="subtitle2" sx={{ ml: 1, fontWeight: 'bold' }}>
                      Email Verified Successfully
                    </Typography>
                  )}
                </Box>
              </Grid>
              {roles === "employee" && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Employee ID</Typography>
                    <TextField name="empId" value={user} fullWidth size="small" InputProps={{ readOnly: true }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Date of Joining</Typography>
                    <TextField
                      name="date_of_joining"
                      type="date"
                      value={formData.date_of_joining}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiInputBase-root': {
                          height: 40,
                        },
                        '& .MuiOutlinedInput-input': {
                          padding: '10px 35px',
                        },
                      }}
                    />
                  </Grid>
                </>
              )}

              {/* Gender */}
              <Grid item xs={12}>
                <FormLabel>Gender</FormLabel>
                <RadioGroup row name="gender" value={formData.gender} onChange={handleChange}>
                  <FormControlLabel value="Male" control={<Radio />} label="Male" />
                  <FormControlLabel value="Female" control={<Radio />} label="Female" />
                </RadioGroup>
              </Grid>

              {/* DOB */}
              <Grid item xs={12}>
                <Typography variant="subtitle1">Date of Birth</Typography>
                <TextField
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: 40,
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '10px 35px',
                    },
                  }}
                />
              </Grid>

              {/* Emergency Contact */}
              <Grid item xs={12}>
                <Typography variant="subtitle1">Emergency Contact</Typography>
                <TextField
                  name="emergency_contact"
                  type="tel"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>

              {/* Department */}
              <Grid item xs={12}>
                <Typography variant="subtitle1">Department</Typography>
                <TextField
                  select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  sx={{
                    minWidth: 200,
                    maxWidth: 400,
                    '& .MuiInputBase-root': {
                      height: 40,
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '10px 14px',
                    },
                  }}

                >
                  <MenuItem value="HR">HR</MenuItem>
                  <MenuItem value="IT">IT</MenuItem>
                  <MenuItem value="Finance">Finance</MenuItem>
                  <MenuItem value="Sales">Sales</MenuItem>
                </TextField>
              </Grid>

              {/* Profile Photo */}
              <Grid item xs={12}>
                <Typography variant="subtitle1">Profile Photo</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TextField
                    variant="outlined"
                    size="small"
                    value={
                      formData.profilePhoto instanceof File
                        ? formData.profilePhoto.name
                        : profile?.profile_photo
                          ? "Existing Profile Photo"
                          : ""
                    }
                    placeholder="No file chosen"
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <label htmlFor="profile-photo-upload">
                          <Button
                            component="span"
                            size="small"
                            sx={{ ml: 0 }}
                          >
                            Upload
                          </Button>
                        </label>
                      ),
                    }}
                  />
                  {/* Hidden file input */}
                  <input
                    accept="image/png, image/jpeg"
                    style={{ display: "none" }}
                    id="profile-photo-upload"
                    type="file"
                    name="profilePhoto"
                    onChange={handleChange}
                  />
                  {/* Preview Avatar */}
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
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Resume</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>

                    {/* TextField with Upload button */}
                    <TextField
                      variant="outlined"
                      size="small"
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
                            <Button
                              component="span"
                              size="small"
                              sx={{ ml: 0 }}
                            >
                              Upload
                            </Button>
                          </label>
                        ),
                      }}
                    />

                    {/* Hidden file input */}
                    <input
                      type="file"
                      name="resume"
                      accept=".pdf,.doc,.docx"
                      style={{ display: "none" }}
                      id="resume-upload"
                      onChange={handleChange}
                    />

                    {/* Preview / Download section */}
                    {formData.resume instanceof File ? (
                      <>
                        {formData.resume.type === "application/pdf" ? (
                          <Button
                            variant="outlined"
                            size="small"
                            component="a"
                            href={URL.createObjectURL(formData.resume)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Preview
                          </Button>
                        ) : (
                          <Button
                            variant="outlined"
                            size="small"
                            component="a"
                            href={URL.createObjectURL(formData.resume)}
                            download={formData.resume.name}
                          >
                            Download
                          </Button>
                        )}
                      </>
                    ) : profile?.resume ? (
                      <>
                        {profile.resume.endsWith(".pdf") ? (
                          <Button
                            variant="outlined"
                            size="small"
                            component="a"
                            href={profile.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </Button>
                        ) : (
                          <Button
                            variant="outlined"
                            size="small"
                            component="a"
                            href={profile.resume}
                            download
                          >
                            Download
                          </Button>
                        )}
                      </>
                    ) : null}
                  </Box>
                </Grid>
              )}

              {/* Phone */}
              <Grid item xs={12}>
                <Typography variant="subtitle1">Phone Number</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
                  <TextField name="phone" type="tel" value={formData.phone} onChange={handleChange} size="small" />
                  {!otpSent && !phoneVerified && (
                    <Button size="small" variant="outlined" sx={{ mt: 1 }} onClick={handleSendOtp}>
                      Send OTP
                    </Button>
                  )}
                  {otpSent && !phoneVerified && (
                    <Box mt={1}>
                      <TextField label="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} size="small" />
                      <Button size="small" sx={{ ml: 1, mt: 1 }} onClick={handleVerifyOtp}>
                        Verify
                      </Button>
                    </Box>
                  )}
                  {phoneVerified && (
                    <Typography color="success.main" variant="subtitle2" sx={{ ml: 1, fontWeight: 'bold' }} mt={1}>
                      Phone Verified Successfully
                    </Typography>
                  )}
                </Box>
              </Grid>
              {/* Address */}
              <Grid item xs={12}>
                <Typography variant="subtitle1">Current Address</Typography>
                <TextField name="address" value={formData.address} onChange={handleChange} fullWidth multiline rows={2} size="small" sx={{ width: "100%" }} />
              </Grid>
              {/*permanent  Address */}
              <Grid item xs={12}>
                <Typography variant="subtitle1">Permanent Address</Typography>
                <TextField name="permanent_address" value={formData.permanent_address} onChange={handleChange} fullWidth multiline rows={2} size="small" sx={{ width: "100%" }} />
              </Grid>

              {/* Submit */}
              <Grid item xs={12} mt={1}>
                <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 5, borderRadius: "12px", background: "#00c853" }} disabled={loading} >
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
