import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Avatar,
  Button,
  Modal,
  Divider,
  TextField,
  InputAdornment,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";

export default function AdminVerificationTabs() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ⭐ DUMMY DATA
  const dummy = [
    {
      id: "USR001",
      name: "Vignesh Kumar",
      email: "viki@example.com",
      phone: "9876543210",
      panNumber: "ABCDE1234F",
      aadhaarNumber: "1234-5678-9012",
      bankAccount: "1234567890",
      ifsc: "HDFC0001234",
      panUrl: "https://dummy.com/pan.pdf",
      aadhaarUrl: "https://dummy.com/aadhaar.pdf",
      bankUrl: "https://dummy.com/bank.pdf",
      status: "pending",
    },
    {
      id: "USR002",
      name: "Sanjay",
      email: "sanjay@example.com",
      phone: "9876512345",
      panNumber: "PQRSX9876Q",
      aadhaarNumber: "3456-7788-9900",
      bankAccount: "4567891230",
      ifsc: "ICIC0004587",
      panUrl: "https://dummy.com/pan2.pdf",
      aadhaarUrl: "https://dummy.com/aadhaar2.pdf",
      bankUrl: "https://dummy.com/bank2.pdf",
      status: "verified",
    },
  ];

  const filtered = dummy.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase()) ||
      f.id.toLowerCase().includes(search.toLowerCase())
  );

  const statusChip = (st) => {
    switch (st) {
      case "verified":
        return <Chip label="Verified" color="success" />;
      case "pending":
        return <Chip label="Pending" color="warning" />;
      case "failed":
        return <Chip label="Failed" color="error" />;
      default:
        return <Chip label="Unknown" />;
    }
  };

  const openModal = (row) => {
    setSelected(row);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const verify = (type) => {
    alert(`${type} Verification Triggered ✔ (Dummy)`);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Card sx={{ maxWidth: 1200, m: "auto", boxShadow: 5 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} mb={2}>
            Admin Verification Dashboard
          </Typography>

          {/* ⭐ TAB MENU */}
          <Tabs value={tab} onChange={(e, v) => setTab(v)}>
            <Tab label="PAN Verification" />
            <Tab label="Aadhaar Verification" />
            <Tab label="Bank Verification" />
          </Tabs>

          <Divider sx={{ my: 2 }} />

          {/* ⭐ SEARCH BAR */}
          <TextField
            placeholder="Search by name, email, ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300, mb: 2 }}
          />

          {/* ⭐ TABLE */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar />
                        <Box>
                          <Typography fontWeight={700}>{row.name}</Typography>
                          <Typography variant="caption">ID: {row.id}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{statusChip(row.status)}</TableCell>

                    <TableCell>
                      <Button
                        onClick={() => openModal(row)}
                        variant="contained"
                        size="small"
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* ⭐ MODAL WITH DYNAMIC TABS */}
      <Modal open={modalOpen} onClose={closeModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "white",
            p: 4,
            borderRadius: 2,
            boxShadow: 10,
          }}
        >
          {selected && (
            <>
              <Typography variant="h6" fontWeight={700}>
                {selected.name}
              </Typography>
              <Typography variant="caption">{selected.email}</Typography>

              <Divider sx={{ my: 2 }} />

              {/* ⭐ TAB 0 → PAN */}
              {tab === 0 && (
                <>
                  <Typography fontWeight={700}>PAN Number: {selected.panNumber}</Typography>
                  <a href={selected.panUrl} target="_blank">View Document</a>
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => verify("PAN")}
                  >
                    Verify PAN
                  </Button>
                </>
              )}

              {/* ⭐ TAB 1 → AADHAAR */}
              {tab === 1 && (
                <>
                  <Typography fontWeight={700}>Aadhaar: {selected.aadhaarNumber}</Typography>
                  <a href={selected.aadhaarUrl} target="_blank">View Document</a>
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => verify("Aadhaar")}
                  >
                    Verify Aadhaar
                  </Button>
                </>
              )}

              {/* ⭐ TAB 2 → BANK */}
              {tab === 2 && (
                <>
                  <Typography fontWeight={700}>Bank Account</Typography>
                  <Typography>Account: {selected.bankAccount}</Typography>
                  <Typography>IFSC: {selected.ifsc}</Typography>
                  <a href={selected.bankUrl} target="_blank">View Passbook</a>
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => verify("Bank")}
                  >
                    Verify Bank
                  </Button>
                </>
              )}

              <Button sx={{ mt: 3 }} onClick={closeModal}>Close</Button>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
