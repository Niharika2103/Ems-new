import { useState, useEffect } from "react";
import { Table, Button, Space, Popconfirm, Input } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteEmployee,
  fetchAllEmployees,
  updateEmployeebyAdmin,
  fetchEmployeeProfile,
} from "../../features/employeesDetails/employeesSlice";
import { promoteEmployeeApi } from "../../api/authApi";
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

import { fetchAllFreelancer } from "../../features/freelancer/freelancerSlice";
import { decodeToken } from "../../api/decodeToekn";
import { validateEmployeeEdit } from "../../utils/validation";

const { Search } = Input;

export default function FreelancerTable() {
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  const freelancers = useSelector(
    (state) => state.freelancerInfo.freelancerlist
  );

  useEffect(() => {
    dispatch(fetchAllFreelancer());
  }, [dispatch]);

  // SEARCH STATE
  const [searchText, setSearchText] = useState("");

  // FILTER FREELANCERS
  const filteredFreelancers = freelancers?.filter((item) => {
    const search = searchText.toLowerCase();
    return (
      item.name?.toLowerCase().includes(search) ||
      item.email?.toLowerCase().includes(search) ||
      item.department?.toLowerCase().includes(search) ||
      item.address?.toLowerCase().includes(search)
    );
  });

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

  // Edit Record
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateEmployeeEdit(formData);
    if (Object.keys(errors).length > 0) {
      toast.error(Object.values(errors)[0]);
      return;
    }

    setLoading(true);
    try {
      const res = await dispatch(
        updateEmployeebyAdmin({ id: editingRecord?.id, data: formData })
      ).unwrap();

      toast.success(res?.message || "Employee updated successfully");

      const currentUser = await decodeToken();
      if (editingRecord?.email === currentUser.email) {
        dispatch(fetchEmployeeProfile(currentUser.email));
      }

      setIsModalOpen(false);
      dispatch(fetchAllEmployees());
    } catch (err) {
      toast.error(err?.message || "Failed to update employee");
    } finally {
      setLoading(false);
    }
  };

  // Table Columns
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
          <Button type="default" onClick={() => handleEdit(record)}>
            Edit
          </Button>

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
              <Button type="primary">Active</Button>
            ) : (
              <Button type="default" danger>
                Deactivate
              </Button>
            )}
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />

      <h1 className="text-xl font-bold mb-4">Freelancer List</h1>

      {/* 🔍 SEARCH BAR */}
      <Search
        placeholder="Search by name, email, department..."
        allowClear
        style={{ width: 300, marginBottom: 16 }}
        onChange={(e) => setSearchText(e.target.value)}
      />

      {/* TABLE */}
      <Table
        columns={columns}
        dataSource={filteredFreelancers}
        rowKey="id"
        pagination={{ pageSize: 8 }}
      />

      {/* MODAL */}
      <ReusableModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Employee Details"
      >
        <Box sx={{ padding: 2 }}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ background: "white", padding: "24px", borderRadius: "12px" }}
          >
            <Grid container spacing={2}>
              {/* Your form fields remain unchanged */}
              {/* ---- Name ---- */}
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

              {/* ---- Email ---- */}
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

              {/* Gender */}
              <Grid item xs={12}>
                <FormLabel component="legend">Gender</FormLabel>
                <RadioGroup
                  row
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="Male"
                    control={<Radio />}
                    label="Male"
                  />
                  <FormControlLabel
                    value="Female"
                    control={<Radio />}
                    label="Female"
                  />
                </RadioGroup>
              </Grid>

              {/* DOB */}
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

              {/* DOJ */}
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

              {/* Phone */}
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

              {/* Emergency Contact */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Emergency Contact"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>

              {/* Address */}
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

              {/* Permanent Address */}
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

              {/* Department */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="HR">HR</MenuItem>
                  <MenuItem value="Finance">Finance</MenuItem>
                  <MenuItem value="IT">IT</MenuItem>
                  <MenuItem value="Sales">Sales</MenuItem>
                </TextField>
              </Grid>

              {/* Designation */}
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

              {/* Job Type */}
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

              {/* Submit */}
              <Grid item xs={12}>
                <Button
                  htmlType="submit"
                  type="primary"
                  block
                  loading={loading}
                  style={{ marginTop: "10px" }}
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
