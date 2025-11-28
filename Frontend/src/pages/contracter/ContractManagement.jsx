import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
  fetchAllFreelancerContractsApi,
  fetchFreelancerContractByIdApi,
  createFreelancerContractApi,
  updateFreelancerContractApi,
  cancelFreelancerContractApi,
  renewFreelancerContractApi,
} from "../../api/authApi";

import { fetchAllFreelancer } from "../../features/freelancer/freelancerSlice";

const ContractManagement = () => {
  const dispatch = useDispatch();

  const freelancers = useSelector((s) => s.freelancerInfo.freelancerlist);

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    freelancer_id: "",
    contract_title: "",
    contract_start_date: "",
    contract_end_date: "",
    payment_type: "",
    payment_amount: "",
    payment_terms: "",
    scope_of_work: "",
  });

  const [errors, setErrors] = useState({});

  // Load freelancers + contracts
  useEffect(() => {
    dispatch(fetchAllFreelancer());
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const res = await fetchAllFreelancerContractsApi();
      setContracts(res.data);
    } catch (err) {
      toast.error("Failed to load contracts");
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      freelancer_id: "",
      contract_title: "",
      contract_start_date: "",
      contract_end_date: "",
      payment_type: "",
      payment_amount: "",
      payment_terms: "",
      scope_of_work: "",
    });
    setErrors({});
  };

  // Create new contract
  const handleCreate = () => {
    resetForm();
    setIsEditing(false);
    setDialogOpen(true);
  };

  // Edit contract
  const handleEdit = async (row) => {
    try {
      const res = await fetchFreelancerContractByIdApi(row.id);
      setFormData(res.data);
      setIsEditing(true);
      setDialogOpen(true);
    } catch {
      toast.error("Cannot load contract details");
    }
  };

  // Cancel contract
  const handleCancelContract = async (row) => {
    if (!window.confirm("Cancel this contract?")) return;

    try {
      await cancelFreelancerContractApi(row.id);
      toast.success("Contract cancelled");
      loadContracts();
    } catch {
      toast.error("Failed to cancel contract");
    }
  };

  // Renew contract
  const handleRenew = async (row) => {
    const newDate = prompt("Enter new end date (YYYY-MM-DD):");
    if (!newDate) return;

    try {
      await renewFreelancerContractApi(row.id, newDate);
      toast.success("Contract renewed");
      loadContracts();
    } catch {
      toast.error("Failed to renew");
    }
  };

  // SUBMIT (Create / Update)
  const handleSubmit = async () => {
    const newErrors = {};

    if (!formData.freelancer_id) newErrors.freelancer_id = "Freelancer required";
    if (!formData.contract_title) newErrors.contract_title = "Title required";
    if (!formData.contract_start_date) newErrors.contract_start_date = "Start Date required";
    if (!formData.contract_end_date) newErrors.contract_end_date = "End Date required";
    if (!formData.payment_type) newErrors.payment_type = "Payment Type required";
    if (!formData.payment_amount) newErrors.payment_amount = "Amount required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    try {
      setLoading(true);

      if (isEditing) {
        await updateFreelancerContractApi(formData.id, formData);
        toast.success("Contract updated");
      } else {
        await createFreelancerContractApi(formData);
        toast.success("Contract created");
      }

      setDialogOpen(false);
      loadContracts();
    } catch {
      toast.error("Failed to save contract");
    } finally {
      setLoading(false);
    }
  };

  // VIEW PDF
  const handleViewPdf = (row) => {
  if (!row.pdf_url) {
    toast.error("No PDF available");
    return;
  }
  window.open(row.pdf_url, "_blank");
};



  // DataGrid Columns
  const columns = [
    {
      field: "freelancer_id",
      headerName: "Freelancer",
      width: 200,
      renderCell: (params) => {
        const f = freelancers.find((x) => x.id === params.value);
        return f ? f.name : "Unknown";
      },
    },
    {
      field: "contract_title",
      headerName: "Title",
      width: 180,
    },
    {
      field: "contract_start_date",
      headerName: "Start",
      width: 130,
    },
    {
      field: "contract_end_date",
      headerName: "End",
      width: 130,
    },
    {
      field: "payment_amount",
      headerName: "Amount",
      width: 120,
    },
    {
      field: "contract_status",
      headerName: "Status",
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === "Active"
              ? "success"
              : params.value === "Cancelled"
              ? "warning"
              : params.value === "Expired"
              ? "error"
              : "default"
          }
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 230,
      renderCell: (params) => (
        <Box>
         {/* View PDF */}
<Tooltip title="View PDF">
  <IconButton
    size="small"
    onClick={() => {
      if (!params.row.pdf_url) {
        toast.error("PDF not available");
        return;
      }
      window.open(params.row.pdf_url, "_blank");
    }}
  >
    <ViewIcon />
  </IconButton>
</Tooltip>


          {/* Edit */}
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEdit(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>

          {/* Cancel */}
          <Tooltip title="Cancel Contract">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleCancelContract(params.row)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>

          {/* Renew */}
          <Tooltip title="Renew">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleRenew(params.row)}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Freelancer Contract Management
        </Typography>

       
      </Box>

      {/* Table */}
      <Paper>
        <DataGrid
          rows={contracts}
          getRowId={(row) => row.id}
          columns={columns}
          autoHeight
          pageSizeOptions={[5, 10, 20]}
        />
      </Paper>

      {/* Dialog (Create / Edit) */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? "Edit Contract" : "Create Contract"}
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.freelancer_id}>
                <InputLabel>Freelancer *</InputLabel>
                <Select
                  value={formData.freelancer_id}
                  label="Freelancer"
                  onChange={(e) =>
                    setFormData({ ...formData, freelancer_id: e.target.value })
                  }
                >
                  {freelancers?.map((f) => (
                    <MenuItem key={f.id} value={f.id}>
                      {f.name} ({f.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Contract Title *"
                fullWidth
                value={formData.contract_title}
                onChange={(e) =>
                  setFormData({ ...formData, contract_title: e.target.value })
                }
                error={!!errors.contract_title}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date *"
                type="date"
                fullWidth
                value={formData.contract_start_date}
                onChange={(e) =>
                  setFormData({ ...formData, contract_start_date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                error={!!errors.contract_start_date}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="End Date *"
                type="date"
                fullWidth
                value={formData.contract_end_date}
                onChange={(e) =>
                  setFormData({ ...formData, contract_end_date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                error={!!errors.contract_end_date}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Payment Type *"
                fullWidth
                value={formData.payment_type}
                onChange={(e) =>
                  setFormData({ ...formData, payment_type: e.target.value })
                }
                error={!!errors.payment_type}
              >
                <MenuItem value="Hourly">Hourly</MenuItem>
                <MenuItem value="Monthly">Monthly</MenuItem>
                <MenuItem value="Fixed">Fixed</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Payment Amount *"
                fullWidth
                type="number"
                value={formData.payment_amount}
                onChange={(e) =>
                  setFormData({ ...formData, payment_amount: e.target.value })
                }
                error={!!errors.payment_amount}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                label="Payment Terms"
                fullWidth
                value={formData.payment_terms}
                onChange={(e) =>
                  setFormData({ ...formData, payment_terms: e.target.value })
                }
              >
                <MenuItem value="Net 7">Net 7</MenuItem>
                <MenuItem value="Net 15">Net 15</MenuItem>
                <MenuItem value="Net 30">Net 30</MenuItem>
                <MenuItem value="Milestone Based">Milestone Based</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Scope of Work"
                fullWidth
                multiline
                rows={3}
                value={formData.scope_of_work}
                onChange={(e) =>
                  setFormData({ ...formData, scope_of_work: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button startIcon={<CancelIcon />} onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>

          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={loading}
          >
            {isEditing ? "Update Contract" : "Create Contract"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContractManagement;
