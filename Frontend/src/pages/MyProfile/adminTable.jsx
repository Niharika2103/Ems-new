import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Space, Popconfirm, message } from "antd";
import { useDispatch } from "react-redux";
import { deleteEmployee, fetchAllEmployees, updateEmployeebyAdmin, fetchEmployeeProfile } from "../../features/employeesDetails/employeesSlice";
import EmployeeTable from "../../components/MyProfile/table";
import { grantTempAdminApi, revokeTempAdminApi, promoteEmployeeApi } from "../../api/authApi";
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

import { decodeToken } from "../../api/decodeToekn";
import { validateEmployeeEdit } from "../../utils/validation";

export default function AdminTable() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    designation: "",
    employment_type: "",
  });
  const [loading, setLoading] = useState(false);

  const handleGrant = async (email) => {
    const duration = prompt("Enter duration in hours:");
    if (!duration) return;

    try {
      const res = await grantTempAdminApi(email, Number(duration));
      toast.success(res?.message || "Temporary Admin granted");
      dispatch(fetchAllEmployees());
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.data?.error ||
        err?.error ||
        "Failed to grant access";
      toast.error(msg);
    }
  };

  const handleRevoke = async (email) => {
    try {
      await revokeTempAdminApi(email);
      toast.success("Temporary Admin revoked");
      dispatch(fetchAllEmployees());
    } catch (err) {
      toast.error("Failed to revoke access");
    }
  };

  // View Employee Details - Navigate to employee info page
  // const handleViewEmployee = (record) => {
  //   navigate('/dashboard/emp_info', {
  //     state: {
  //       employee: record
  //     }
  //   });
  // };

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
      designation: record.designation || "",
      employment_type: record.employment_type || "",
    });
    setIsModalOpen(true);
  };

  const handlePromote = async (record) => {
    if (!window.confirm(`Promote ${record.name} to Admin?`)) return;

    try {
      await promoteEmployeeApi(record.id);
      toast.success(`${record.name} promoted successfully!`);
      dispatch(fetchAllEmployees());
    } catch (err) {
      console.error("Promote error:", err);
      toast.error("Failed to promote employee");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

     if (name === "phone" || name==="emergency_contact") {
    if (!/^[0-9]*$/.test(value)) return;  // block letters
    if (value.length > 10) return;        // max 10 digits
  }
    if (name === "date_of_joining") {
      if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
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
        const payload = {
      ...formData,
      date_of_joining: formData.date_of_joining || null,
      dob: formData.dob || null,
    };
      const res = await dispatch(
        updateEmployeebyAdmin({ id: editingRecord?.id, data: payload })
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


  const handleNavigate = (email) => {
    const query = new URLSearchParams();
    if (email) query.set("email", email);
    navigate(`/accounts/salary-structure/?${query.toString()}`);
  };
  //employee table
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
      align: 'center',
      fixed: 'left',
      render: (_, __, index) => (
        <div style={{ textAlign: 'center', fontWeight: '500' }}>
          {index + 1}
        </div>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 140,
      fixed: 'left',
      ellipsis: true,
      render: (name) => (
        <div style={{ fontWeight: '500' }}>
          {name}
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
      
      ellipsis: true,
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      width: 120,
      align: 'center',
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: 130,
      align: 'center',
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "status",
      width: 100,
      align: 'center',
      render: (is_active) => (
        <span
          style={{
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: is_active ? '#f6ffed' : '#fff2f0',
            color: is_active ? '#52c41a' : '#ff4d4f',
            border: `1px solid ${is_active ? '#b7eb8f' : '#ffccc7'}`
          }}
        >
          {is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    // {
    //   title: "View",
    //   key: "view",
    //   width: 100,
    //   align: 'center',
    //   // fixed: 'right',
    //   render: (_, record) => (
    //     <Button
    //       type="primary"
    //       size="small"
    //       onClick={() => handleViewEmployee(record)}
    //       style={{
    //         fontSize: '12px',
    //         padding: '4px 8px',
    //         height: 'auto'
    //       }}
    //     >
    //       View
    //     </Button>
    //   ),
    // },
    {
      title: "Actions",
      key: "actions",
      width: 400,
      // fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap={false} style={{ flexWrap: 'nowrap' }}>
          {/* Edit Button */}
          <Button
            type="default"
            size="small"
            onClick={() => handleEdit(record)}
            style={{ fontSize: '12px', }}
          >
            Edit
          </Button>

          {/* Active/Deactivate Button */}
          <Popconfirm
            title={`Are you sure to ${record.is_active ? "deactivate" : "activate"} this employee?`}
            onConfirm={() =>
              dispatch(deleteEmployee({ id: record.id, status: !record.is_active }))
                .unwrap()
                .then((res) => {
                  toast.success(res.message);
                  dispatch(fetchAllEmployees());
                })
                .catch(() => toast.error("Failed to update employee status"))
            }
            okText="Yes"
            cancelText="No"
          >
            <Button
              type={record.is_active ? "primary" : "default"}
              danger={!record.is_active}
              size="small"
              style={{ fontSize: '12px' }}
            >
              {record.is_active ? 'Deactivate' : 'Activate'}
            </Button>
          </Popconfirm>

          {/* Grant Button */}
          <Button
            type="dashed"
            size="small"
            onClick={() => handleGrant(record.email)}
            style={{ fontSize: '12px', minWidth: '80px', }}
          >
            Grant
          </Button>

          {/* Promote Button */}
          <Button
            type={record.is_promoted ? "default" : "primary"}
            size="small"
            style={{
              //  minWidth: '80px',
              fontSize: '12px',
              backgroundColor: record.is_promoted ? "#52c41a" : "",
              color: record.is_promoted ? "white" : "",
              borderColor: record.is_promoted ? "#52c41a" : "",
            }}
            disabled={record.is_promoted}
            onClick={() => handlePromote(record)}
          >
            {record.is_promoted ? "Promoted" : "Promote"}
          </Button>
          <Button variant="contained" onClick={() => handleNavigate(record.email)}>
            Go to Salary Structure
          </Button>

        </Space>
      ),
    }
  ];

  // Table scroll configuration
  const tableScrollConfig = {
    x: 500, // ✅ Increased from 1000 to ensure horizontal scroll
  };
  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        padding: '0 8px'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          margin: 0,
          color: '#1f2937'
        }}>
          Employee Management
        </h1>
      </div>

      {/* Table Container with Clean Styling */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        overflow: 'hidden'
      }}>
        <EmployeeTable
          columns={columns}
          scroll={tableScrollConfig}
          style={{
            // minWidth: '100%',
          }}
          size="small"
        />
      </div>

      {/* Edit Modal */}
      {/* <ReusableModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Employee Details"
      >
        <Box className="flex justify-center items-center">
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  margin="normal"
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
                  margin="normal"
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
                  margin="normal"
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
                  margin="normal"
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
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
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

              <Grid item xs={12}>
                <Button
                  htmlType="submit"
                  type="primary"
                  block
                  loading={loading}
                  style={{ marginTop: '16px', height: '40px' }}
                >
                  Update Employee
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