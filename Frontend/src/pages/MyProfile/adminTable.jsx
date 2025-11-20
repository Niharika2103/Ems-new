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
  Typography,
  TextField,
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

  
  const handleNavigate = ( email) => {
    const query = new URLSearchParams();

  if (email) query.set("email", email);
  navigate(`/accounts/salary-structure/?${query.toString()}`);
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

          {/* Grant Button */}
          <Button
            type="dashed"
            onClick={() => handleGrant(record.email)}
          >
            Grant
          </Button>

          {/* Revoke Button */}
          <Button
            type="dashed"
            danger
            onClick={() => handleRevoke(record.email)}
          >
            Revoke
          </Button>
          <Button
            type={record.is_promoted ? "default" : "primary"}
            style={{
              backgroundColor: record.is_promoted ? "#52c41a" : "",
              color: record.is_promoted ? "white" : "",
              borderColor: record.is_promoted ? "#52c41a" : "",
            }}
            disabled={record.is_promoted}
            onClick={() => handlePromote(record)}
          >
            {record.is_promoted ? "Promoted" : "Promote"}
          </Button>
           <Button variant="contained" onClick={() => handleNavigate( record.email)}>
      Go to Salary Structure
    </Button>

        </Space>
      ),
    }

  ];

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <h1 className="text-xl font-bold mb-4">Employee List</h1>
      <EmployeeTable columns={columns} />
      <ReusableModal
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
                    minWidth: 200, //  makes input box longer
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

              <Grid item xs={12} sm={6}>
  <TextField
    label="Designation"
    name="designation"
    value={formData.designation}
    onChange={handleChange}
    fullWidth
    size="small"
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
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </ReusableModal>
    </>
  );
}
