import { useState, useEffect } from "react";
import { Table, Button, Space, Popconfirm, Input, DatePicker } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Added import
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
import moment from 'moment';

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
import { createFreelancerContractApi,createInvoiceApi, fetchFreelancerContractsApi } from "../../api/authApi";
const { Search } = Input;

export default function FreelancerTable() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  // Contract states
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [contractForm, setContractForm] = useState({
    contract_title: "",
    start_date: moment(),
    end_date: moment(),
    payment_type: "",
    payment_amount: "",
    payment_terms: "",
    scope_of_work: ""
  });

  // Invoice states
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedFreelancerForInvoice, setSelectedFreelancerForInvoice] = useState(null);
  const [invoiceForm, setInvoiceForm] = useState({
    amount: "",
    invoice_date: moment(),
    due_date: moment().add(7, 'days'),
  });
const [selectedFreelancerContracts, setSelectedFreelancerContracts] = useState([]);
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

  const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date_of_joining: getCurrentDate(),
    phone: "",
    address: "",
    permanent_address: "",
    dob: getCurrentDate(),
    department: "",
    gender: "",
    emergency_contact: "",
    employment_type:"",
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
      employment_type:record.employment_type || "",
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

  // Contract Handlers
  const handleCreateContract = (record) => {
    setSelectedFreelancer(record);
    setContractForm({
      contract_title: "",
      start_date: moment(),
      end_date: moment(),
      payment_type: "",
      payment_amount: "",
      payment_terms: "",
      scope_of_work: ""
    });
    setIsContractModalOpen(true);
  };

  const handleContractChange = (name, value) => {
    setContractForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Special handler for date fields
  const handleDateChange = (name, date) => {
    setContractForm(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleContractSubmit = async (e) => {
    e.preventDefault();

    const startDateStr = contractForm.start_date ? contractForm.start_date.format('YYYY-MM-DD') : "";
    const endDateStr = contractForm.end_date ? contractForm.end_date.format('YYYY-MM-DD') : "";

    if (!contractForm.contract_title || !startDateStr || !endDateStr || !contractForm.payment_type || !contractForm.payment_amount) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const contractData = {
        freelancer_id: selectedFreelancer.id,
        contract_title: contractForm.contract_title,
        contract_start_date: startDateStr,
        contract_end_date: endDateStr,
        payment_type: contractForm.payment_type,
        payment_amount: contractForm.payment_amount,
        payment_terms: contractForm.payment_terms,
        scope_of_work: contractForm.scope_of_work
      };

      const response = await createFreelancerContractApi(contractData);

      toast.success("Contract created successfully!");
      setIsContractModalOpen(false);

    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to create contract");
    } finally {
      setLoading(false);
    }
  };

  // Invoice Handlers
 const handleCreateInvoice = async (record) => {
  setSelectedFreelancerForInvoice(record);

  // Fetch contracts for that freelancer
  const res = await fetchFreelancerContractsApi(record.id);
  setSelectedFreelancerContracts(res.data);

  setInvoiceForm({
    amount: "",
    contract_id: "",
    invoice_date: moment(),
    due_date: moment().add(7, "days"),
  });

  setIsInvoiceModalOpen(true);
};


  const handleInvoiceChange = (name, value) => {
    setInvoiceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInvoiceDateChange = (name, date) => {
    setInvoiceForm(prev => ({
      ...prev,
      [name]: date
    }));
  };
const handleInvoiceSubmit = async (e) => {
  e.preventDefault();

  const invoiceDateStr = invoiceForm.invoice_date?.format("YYYY-MM-DD");
  const dueDateStr = invoiceForm.due_date?.format("YYYY-MM-DD");

  if (!invoiceForm.amount || !invoiceDateStr || !dueDateStr) {
    toast.error("Please fill all required fields");
    return;
  }

  setLoading(true);

  try {
    const payload = {
      freelancer_id: selectedFreelancerForInvoice.id,
      contract_id: invoiceForm.contract_id || null,
      amount: Number(invoiceForm.amount),
      invoice_date: invoiceDateStr,
      due_date: dueDateStr,
      created_by: "ADMIN",
    };

    await createInvoiceApi(payload);

    toast.success("Invoice created successfully!");
    setIsInvoiceModalOpen(false);
    navigate("/invoices");
  } catch (error) {
    toast.error(error?.response?.data?.error || "Failed to create invoice");
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
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="default" onClick={() => handleEdit(record)}>
            Edit
          </Button>

          {/* Create Contract Button */}
          {record.is_active && (
            <Button 
              type="primary" 
              onClick={() => handleCreateContract(record)}
              style={{ background: "#52c41a", borderColor: "#52c41a" }}
            >
              Create Contract
            </Button>
          )}

          {/* Create Invoice Button */}
          {record.is_active && (
            <Button 
              type="primary" 
              onClick={() => handleCreateInvoice(record)}
              style={{ background: "#1890ff", borderColor: "#1890ff" }}
            >
              Create Invoice
            </Button>
          )}

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

      {/* EDIT EMPLOYEE MODAL */}
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

      {/* CONTRACT CREATION MODAL */}
      <ReusableModal
        open={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        title={`Create Contract for ${selectedFreelancer?.name}`}
        width={600}
      >
        <Box sx={{ padding: 2 }}>
          <Box
            component="form"
            onSubmit={handleContractSubmit}
            sx={{ background: "white", padding: "24px", borderRadius: "12px" }}
          >
            <Grid container spacing={2}>
              {/* Contract Title */}
              <Grid item xs={12}>
                <TextField
                  label="Contract Title *"
                  name="contract_title"
                  value={contractForm.contract_title}
                  onChange={(e) => handleContractChange("contract_title", e.target.value)}
                  fullWidth
                  size="small"
                  required
                />
              </Grid>

              {/* Start Date */}
              <Grid item xs={12} sm={6}>
                <FormLabel component="legend">Start Date *</FormLabel>
                <DatePicker
                  style={{ width: "100%" }}
                  value={contractForm.start_date}
                  onChange={(date) => handleDateChange("start_date", date)}
                  format="YYYY-MM-DD"
                />
              </Grid>

              {/* End Date */}
              <Grid item xs={12} sm={6}>
                <FormLabel component="legend">End Date *</FormLabel>
                <DatePicker
                  style={{ width: "100%" }}
                  value={contractForm.end_date}
                  onChange={(date) => handleDateChange("end_date", date)}
                  format="YYYY-MM-DD"
                />
              </Grid>

              {/* Payment Type */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Payment Type *"
                  name="payment_type"
                  value={contractForm.payment_type}
                  onChange={(e) => handleContractChange("payment_type", e.target.value)}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="Hourly">Hourly</MenuItem>
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Fixed">Fixed</MenuItem>
                </TextField>
              </Grid>

              {/* Payment Amount */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Payment Amount *"
                  name="payment_amount"
                  type="number"
                  value={contractForm.payment_amount}
                  onChange={(e) => handleContractChange("payment_amount", e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>

              {/* Payment Terms */}
              <Grid item xs={12}>
                <TextField
                  select
                  label="Payment Terms"
                  name="payment_terms"
                  value={contractForm.payment_terms}
                  onChange={(e) => handleContractChange("payment_terms", e.target.value)}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="Net 7">Net 7</MenuItem>
                  <MenuItem value="Net 15">Net 15</MenuItem>
                  <MenuItem value="Net 30">Net 30</MenuItem>
                  <MenuItem value="Milestone Based">Milestone Based</MenuItem>
                </TextField>
              </Grid>

              {/* Scope of Work */}
              <Grid item xs={12}>
                <TextField
                  label="Scope of Work"
                  name="scope_of_work"
                  multiline
                  rows={4}
                  value={contractForm.scope_of_work}
                  onChange={(e) => handleContractChange("scope_of_work", e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="Describe the scope of work..."
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  htmlType="submit"
                  type="primary"
                  block
                  loading={loading}
                  style={{ marginTop: "10px" }}
                >
                  Create Contract
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </ReusableModal>

      {/* INVOICE CREATION MODAL */}
      <ReusableModal
        open={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title={`Create Invoice for ${selectedFreelancerForInvoice?.name}`}
        width={500}
      >
        <Box sx={{ padding: 2 }}>
          <Box
            component="form"
            onSubmit={handleInvoiceSubmit}
            sx={{ background: "white", padding: "24px", borderRadius: "12px" }}
          >

            <Grid item xs={12}>
  <TextField
    select
    label="Select Contract"
    fullWidth
    size="small"
    value={invoiceForm.contract_id}
    onChange={(e) => handleInvoiceChange("contract_id", e.target.value)}
    required
  >
    {selectedFreelancerContracts.map((contract) => (
      <MenuItem key={contract.id} value={contract.id}>
        {contract.contract_title} – ₹{contract.payment_amount}
      </MenuItem>
    ))}
  </TextField>
</Grid>

            <Grid container spacing={2}>
              {/* Invoice Amount */}
              <Grid item xs={12}>
                <TextField
                  label="Invoice Amount *"
                  name="amount"
                  type="number"
                  value={invoiceForm.amount}
                  onChange={(e) => handleInvoiceChange("amount", e.target.value)}
                  fullWidth
                  size="small"
                  required
                  placeholder="Enter amount"
                />
              </Grid>

              {/* Invoice Date */}
              <Grid item xs={12} sm={6}>
                <FormLabel component="legend">Invoice Date *</FormLabel>
                <DatePicker
                  style={{ width: "100%" }}
                  value={invoiceForm.invoice_date}
                  onChange={(date) => handleInvoiceDateChange("invoice_date", date)}
                  format="YYYY-MM-DD"
                />
              </Grid>

              {/* Due Date */}
              <Grid item xs={12} sm={6}>
                <FormLabel component="legend">Due Date *</FormLabel>
                <DatePicker
                  style={{ width: "100%" }}
                  value={invoiceForm.due_date}
                  onChange={(date) => handleInvoiceDateChange("due_date", date)}
                  format="YYYY-MM-DD"
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  htmlType="submit"
                  type="primary"
                  block
                  loading={loading}
                  style={{ marginTop: "10px" }}
                >
                  Create Invoice
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </ReusableModal>
    </>
  );
}