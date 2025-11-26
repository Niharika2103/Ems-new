import { useState,useEffect  } from "react";
import {Table, Button, Space, Popconfirm } from "antd";
import { useDispatch } from "react-redux";
import { deleteEmployee, fetchAllEmployees, updateEmployeebyAdmin, fetchEmployeeProfile } from "../../features/employeesDetails/employeesSlice";
import EmployeeTable from "../../components/MyProfile/table";
import {  promoteEmployeeApi } from "../../api/authApi";
import ReusableModal from "../../components/MyProfile/ReusableModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  TextField,
  Box,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  MenuItem,
} from "@mui/material";
import {fetchAllFreelancer} from "../../features/freelancer/freelancerSlice";
import { decodeToken } from "../../api/decodeToekn";
import { validateEmployeeEdit } from "../../utils/validation";
import { useSelector } from "react-redux";
export default function FreelancerTable() {
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date_of_joining: "",
    phone: "",
    address: "",
    permanent_address: "",
    dob: "",
    department: "",
    gender: "",
    emergency_contact: "",
  });
  const [loading, setLoading] = useState(false);
 const freelancers = useSelector((state) => state.freelancerInfo.freelancerlist);
  useEffect(() => {
  dispatch(fetchAllFreelancer());
}, [dispatch]);

  //Edit Register Model
  const handleEdit = (record) => {
    setEditingRecord(record);
    const formatDate = (isoString) => {
      if (!isoString) return "";
      return isoString.split("T")[0];
    };

    setFormData({
      name: record.name || "",
      email: record.email || "",
      date_of_joining: formatDate(record.date_of_joining),
      phone: record.phone || "",
      address: record.address || "",
      permanent_address: record.permanent_address || "",
      department: record.department || "",
      gender: record.gender || "",
      emergency_contact: record.emergency_contact || "",
      dob: formatDate(record.dob),
    });
    setIsModalOpen(true);
  };
  const handlePromote = async (record) => {
    if (!window.confirm(`Promote ${record.name} to Admin?`)) return;

    try {
      await promoteEmployeeApi(record.id);
      toast.success(`${record.name} promoted successfully!`);
      dispatch(fetchAllEmployees()); // optional: refresh list
    } catch (err) {
      console.error("Promote error:", err);
      toast.error("Failed to promote employee");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "date_of_joining") {
      // Optional: reject values that aren't YYYY-MM-DD
      if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        // Don't update if invalid format
        return;
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateEmployeeEdit(formData);
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }

    setLoading(true);
    try {
      const res = await dispatch(
        updateEmployeebyAdmin({ id: editingRecord?.id, data: formData })
      ).unwrap();

      toast.success(res?.message || "Employee updated successfully");

      //If the edited employee is the current user, refresh their profile
      try {
        const currentUser = await decodeToken();
        if (editingRecord?.email === currentUser.email) {
          dispatch(fetchEmployeeProfile(currentUser.email));
        }
      } catch (error) {
        console.warn("Could not refresh user profile after edit:", error);
      }

      setIsModalOpen(false);
      dispatch(fetchAllEmployees());
    } catch (err) {
      console.error("Update error:", err);
      toast.error(
        err?.message ||
        err?.error ||
        err?.data?.message ||
        "Failed to update employee"
      );
    } finally {
      setLoading(false);
    }
  };


  //employee table
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      render: (_text, _record, index) => index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Request",
      dataIndex: "request",
      key: "request",
      filters: [
        { text: "Pending", value: "Pending" },
        { text: "Approved", value: "Approved" },
      ],
      onFilter: (value, record) => record.request?.includes(value),
      render: (status, record) => (
        <Space>
          {/* Edit Button */}
          <Button
            type="default"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>

          {/* Delete Button */}
          <Popconfirm
            title={`Are you sure to ${record.is_active ? "deactivate" : "activate"} this admin?`}
            onConfirm={() =>
              dispatch(deleteEmployee({ id: record.id, status: !record.is_active }))
                .unwrap()
                .then((res) => {
                  toast.success(res.message);
                  dispatch(fetchAllEmployees());
                })
                .catch(() => toast.error("Failed to update admin status"))
            }
            okText="Yes"
            cancelText="No"
          >
            {record.is_active ? (
              <Button type="primary">
                Active
              </Button>
            ) : (
              <Button type="default" danger>
                Deactivate
              </Button>
            )}
          </Popconfirm>
        </Space>
      ),
    }

  ];

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <h1 className="text-xl font-bold mb-4">Freelancer List</h1>
 <Table
        columns={columns}
        dataSource={freelancers}
        rowKey="id"
        pagination={{ pageSize: 8 }}
      />
      {/* <ReusableModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Employee Form"
      >
        <Box className="flex justify-center items-center">
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <FormLabel component="legend">Gender</FormLabel>
                <RadioGroup
                  row
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <FormControlLabel value="Male" control={<Radio />} label="Male" />
                  <FormControlLabel value="Female" control={<Radio />} label="Female" />
                </RadioGroup>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  type="date"
                  label="Date of Joining"
                  name="date_of_joining"
                  value={formData.date_of_joining}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="date"
                  label="Date of Birth"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Permanent Address"
                  name="permanent_address"
                  value={formData.permanent_address}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Emergency contact"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  sx={{
                    minWidth: 200, 
                    "& .MuiSelect-select": {
                      paddingY: 1.2,
                    },
                  }}

                >
                  <MenuItem value="HR">HR</MenuItem>
                  <MenuItem value="Finance">Finance</MenuItem>
                  <MenuItem value="IT">IT</MenuItem>
                  <MenuItem value="Sales">Sales</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Button
                  htmlType="submit"
                  type="primary"
                  block
                  loading={loading}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </ReusableModal> */}
      <ReusableModal
  open={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Edit Employee Details"
>
  <Box
    sx={{
      padding: 2,
      background: "#f5f7fa",
      borderRadius: "12px",
    }}
  >
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        background: "white",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        border: "1px solid #e5e7eb",
      }}
    >
      <Grid container spacing={3}>
        {/* ---- Section Header ---- */}
        <Grid item xs={12}>
          <h3
            style={{
              margin: "0 0 16px 0",
              fontSize: "18px",
              fontWeight: "600",
              color: "#374151",
              borderBottom: "2px solid #e5e7eb",
              paddingBottom: "6px",
            }}
          >
            Personal Information
          </h3>
        </Grid>

        {/* Name */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            size="small"
            margin="normal"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                background: "#fafafa",
              },
            }}
          />
        </Grid>

        {/* Email */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            size="small"
            margin="normal"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                background: "#fafafa",
              },
            }}
          />
        </Grid>

        {/* Gender */}
        <Grid item xs={12}>
          <FormLabel component="legend" sx={{ fontWeight: 600 }}>
            Gender
          </FormLabel>
          <RadioGroup
            row
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <FormControlLabel value="Male" control={<Radio />} label="Male" />
            <FormControlLabel
              value="Female"
              control={<Radio />}
              label="Female"
            />
          </RadioGroup>
        </Grid>

        {/* DOB & DOJ */}
        <Grid item xs={12} sm={6}>
          <TextField
            type="date"
            label="Date of Birth"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            fullWidth
            size="small"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            type="date"
            label="Date of Joining"
            name="date_of_joining"
            value={formData.date_of_joining}
            onChange={handleChange}
            fullWidth
            size="small"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
              },
            }}
          />
        </Grid>

        {/* ---- Contact Section ---- */}
        <Grid item xs={12}>
          <h3
            style={{
              margin: "8px 0 16px 0",
              fontSize: "18px",
              fontWeight: "600",
              color: "#374151",
              borderBottom: "2px solid #e5e7eb",
              paddingBottom: "6px",
            }}
          >
            Contact Details
          </h3>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
            size="small"
            margin="normal"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Emergency Contact"
            name="emergency_contact"
            value={formData.emergency_contact}
            onChange={handleChange}
            fullWidth
            size="small"
            margin="normal"
          />
        </Grid>

        {/* Addresses */}
        <Grid item xs={12}>
          <TextField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            fullWidth
            size="small"
            margin="normal"
            multiline
            rows={2}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Permanent Address"
            name="permanent_address"
            value={formData.permanent_address}
            onChange={handleChange}
            fullWidth
            size="small"
            margin="normal"
            multiline
            rows={2}
          />
        </Grid>

        {/* ---- Job Section ---- */}
        <Grid item xs={12}>
          <h3
            style={{
              margin: "12px 0 16px 0",
              fontSize: "18px",
              fontWeight: "600",
              color: "#374151",
              borderBottom: "2px solid #e5e7eb",
              paddingBottom: "6px",
            }}
          >
            Job Details
          </h3>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            fullWidth
            size="small"
            margin="normal"
          >
            <MenuItem value="HR">HR</MenuItem>
            <MenuItem value="Finance">Finance</MenuItem>
            <MenuItem value="IT">IT</MenuItem>
            <MenuItem value="Sales">Sales</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            fullWidth
            size="small"
            margin="normal"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Employment Type"
            name="employment_type"
            value={formData.employment_type}
            onChange={handleChange}
            fullWidth
            size="small"
            margin="normal"
          >
            <MenuItem value="fulltime">Full Time</MenuItem>
            <MenuItem value="contract">Contract</MenuItem>
            <MenuItem value="freelancer">Freelancer</MenuItem>
          </TextField>
        </Grid>

        {/* Submit */}
        <Grid item xs={12}>
          <Button
            htmlType="submit"
            type="primary"
            block
            loading={loading}
            style={{
              marginTop: "10px",
              height: "40px",
              fontWeight: "600",
            }}
          >
            Update Employee
          </Button>
        </Grid>
      </Grid>
    </Box>
  </Box>
</ReusableModal>

    </>
  );
}
