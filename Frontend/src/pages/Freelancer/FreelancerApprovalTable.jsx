import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Stack,
  Modal,
  TextField,
  Tooltip
} from "@mui/material";
import axios from "axios";
import { ToastContainer,toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { freelancerClient  } from "../../api/axiosClient";
import { AUTH_API } from "../../utils/constants";

export default function FreelancerApprovalTable() {
  const [list, setList] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formUrl, setFormUrl] = useState("");
  const [sheetId, setSheetId] = useState("");
  const [savedFormUrl, setSavedFormUrl] = useState("");

  useEffect(() => {
    axios.get(`${AUTH_API.FREELANCER}/get-form`).then((res) => {
      if (res.data.success && res.data.data) {
        setSavedFormUrl(res.data.data.formUrl);
        setSheetId(res.data.data.sheetId);
      }
    });

    loadFreelancers();
  }, []);

  const loadFreelancers = () => {
    axios.get(`${AUTH_API.FREELANCER}/list`).then((res) => {
      if (res.data.success) {
        setList(res.data.data || []);
      }
    });
  };

  const handleApprove = async (id) => {
  try {
    const res = await axios.post(`${AUTH_API.FREELANCER}/approve/${id}`);

    if (res.data.success) {
      toast.success("Freelancer approved successfully!");
      loadFreelancers();
    } else {
      toast.error(res.data.message || "Approval failed");
    }
  } catch (err) {
    toast.error("Error approving freelancer");
  }
};

const handleReject = async (id) => {
  try {
    const res = await axios.post(`${AUTH_API.FREELANCER}/reject/${id}`);

    if (res.data.success) {
      toast.warning("Freelancer rejected!");
      loadFreelancers();
    } else {
      toast.error(res.data.message || "Reject failed");
    }
  } catch (err) {
    toast.error("Error rejecting freelancer");
  }
};


  const openModal = () => {
    setFormUrl(savedFormUrl || "");
    setSheetId(sheetId || "");
    setShowFormModal(true);
  };

  const handleSaveGoogleForm = async () => {
    if (!formUrl || !sheetId) {
      toast.warning("Form URL and Sheet ID are required.!"); 
      return;
    }

    await axios.post(`${AUTH_API.FREELANCER}/save-form`, {
      formUrl,
      sheetId,
    });

    setSavedFormUrl(formUrl);
     toast.success("Google Form settings saved!");
    setShowFormModal(false);
  };

   const copyToClipboard = () => {
    navigator.clipboard.writeText(savedFormUrl);
    toast.success("Copied to clipboard!");
  };

   const handleSyncSheet = async () => {
    try {
      const res = await axios.get(`${AUTH_API.FREELANCER}/sync`);

      if (res.data.success) {
         toast.success("heet synced successfully!"); 
        loadFreelancers();
      } else {
          toast.error("Sync failed: " + res.data.message);
      }
    } catch (err) {
      console.error("Sync Error:", err);
    }
  };
  return (
    <>
     <ToastContainer position="top-right" autoClose={2000} />
    <Box p={3}>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight="bold">
          Freelancer Approval List
        </Typography>

        

        <Stack direction="row" spacing={2}>
          <Button variant="contained" color="primary" onClick={openModal}>
            + Add / Update Google Form
          </Button>

  <Button variant="contained" color="secondary" onClick={handleSyncSheet}>
            🔄 Sync Google Sheet
          </Button>
        </Stack>
      </Box>

{savedFormUrl && (
        <Box mt={2} p={2} bgcolor="#f9f9f9" borderRadius="8px">
          <Typography><b>Saved Google Form URL:</b></Typography>

          <Stack direction="row" spacing={1} alignItems="center" mt={1}>
            <TextField 
              fullWidth 
              value={savedFormUrl} 
              InputProps={{ readOnly: true }} 
            />

            <Button variant="outlined" onClick={copyToClipboard}>
              <ContentCopyIcon />
            </Button>
          </Stack>
        </Box>
      )}

      {/* FREELANCER TABLE */}
      <TableContainer component={Paper} elevation={3} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Name</b></TableCell>
              <TableCell><b>Email</b></TableCell>
              <TableCell><b>Role</b></TableCell>
              <TableCell><b>Project Cost</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell align="center"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {list.map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.name}</TableCell>
                <TableCell>{f.email}</TableCell>
                <TableCell>{f.role}</TableCell>
                <TableCell>{f.project_cost}</TableCell>
                <TableCell>{f.status}</TableCell>

                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button color="success" variant="contained" onClick={() => handleApprove(f.id)}>
                      Approve
                    </Button>
                    <Button color="error" variant="outlined" onClick={() => handleReject(f.id)}>
                      Reject
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

        </Table>
      </TableContainer>
 
      {/* MODAL FOR FORM SETTINGS */}
      <Modal open={showFormModal} onClose={() => setShowFormModal(false)}>
        <Box
          sx={{
            width: 450,
            p: 3,
            bgcolor: "white",
            borderRadius: 2,
            mx: "auto",
            mt: "10%",
            boxShadow: 5,
          }}
        >
          <Typography variant="h6" mb={2}>
            Google Form Settings
          </Typography>

          <TextField
            fullWidth
            label="Google Form URL"
            value={formUrl}
             InputProps={{ readOnly: true }}
            onChange={(e) => setFormUrl(e.target.value)}
            sx={{ mb: 2 }}
          />
        

          <TextField
            fullWidth
            label="Google Sheet ID"
            value={sheetId}
             InputProps={{ readOnly: true }}
            onChange={(e) => setSheetId(e.target.value)}
            sx={{ mb: 2 }}
          />
          

          <Typography variant="caption" color="error">
            ⚠️ When you modify Google Form or link a new Sheet, update both fields here.
          </Typography>

          <Stack direction="row" spacing={2} mt={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => setShowFormModal(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSaveGoogleForm}>
              Save
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
    </>
  );
}
