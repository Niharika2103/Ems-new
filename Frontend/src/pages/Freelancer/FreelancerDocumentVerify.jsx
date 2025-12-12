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
import { useDispatch, useSelector } from "react-redux";
import { fetchAllFreelancer } from "../../features/freelancer/freelancerSlice";

// OCR + PDF
import { getDocument } from "pdfjs-dist";
import Tesseract from "tesseract.js";

// -----------------------------------------------------------
// OCR + PDF BASED IFSC EXTRACTOR
// -----------------------------------------------------------
const extractIFSC_OCR = async (fileOrUrl) => {
  try {
    let pdfBuffer;

    // Case 1 → File upload
    if (fileOrUrl instanceof File) {
      pdfBuffer = await fileOrUrl.arrayBuffer();
    }
    // Case 2 → URL string
    else {
      const resp = await fetch(fileOrUrl);
      const blob = await resp.blob();
      pdfBuffer = await blob.arrayBuffer();
    }

    const pdf = await getDocument({ data: pdfBuffer }).promise;

    // Loop all PDF pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);

      // Render page to canvas (important for OCR)
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;

      // OCR the canvas
      const ocrResult = await Tesseract.recognize(canvas, "eng");

      const text = ocrResult.data.text.toUpperCase().replace(/\s+/g, "");

      // Flexible IFSC pattern
      const match = text.match(/[A-Z]{4}0[0-9]{6}/);

      if (match) return match[0];
    }

    return null;
  } catch (err) {
    console.error("OCR IFSC Error:", err);
    return null;
  }
};

// -----------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------

export default function AdminVerificationTabs() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllFreelancer());
  }, [dispatch]);

  const freelancers = useSelector(
    (state) => state.freelancerInfo.freelancerlist
  );

  const filteredFreelancers = freelancers?.filter((item) => {
    const s = search.toLowerCase();
    return (
      item.name?.toLowerCase().includes(s) ||
      item.email?.toLowerCase().includes(s) ||
      item.id?.toLowerCase().includes(s)
    );
  });

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
    alert(`${type} verification triggered.`);
  };

  // -----------------------------------------------------------
  // BANK PDF → OCR → Extract IFSC
  // -----------------------------------------------------------
  const readPassbookOCR = async () => {
    if (!selected?.document_url?.bankPassbook) {
      alert("No passbook uploaded");
      return;
    }

    const file = selected.document_url.bankPassbook;

    // RUN OCR
    const ifsc = await extractIFSC_OCR(file);

    if (ifsc) {
      alert("Extracted IFSC: " + ifsc);
      setSelected((prev) => ({ ...prev, extractedIFSC: ifsc }));
    } else {
      alert("IFSC not found (PDF very unclear or low quality)");
    }

    // open PDF in new tab
    const url = file instanceof File ? URL.createObjectURL(file) : file;
    window.open(url, "_blank");
  };

  return (
    <Box sx={{ p: 4 }}>
      <Card sx={{ maxWidth: 1200, m: "auto", boxShadow: 5 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} mb={2}>
            Admin Verification Dashboard
          </Typography>

          <Tabs value={tab} onChange={(e, v) => setTab(v)}>
            <Tab label="PAN Verification" />
            <Tab label="Aadhaar Verification" />
            <Tab label="Bank Verification" />
            <Tab label="GST Verification" />
          </Tabs>

          <Divider sx={{ my: 2 }} />

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

          {/* TABLE */}
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
                {filteredFreelancers?.map((row) => (
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

      {/* MODAL */}
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

              {/* PAN TAB */}
              {tab === 0 && (
                <>
                  <Typography>PAN Number: {selected.panNumber}</Typography>
                  <a href={selected.panUrl} target="_blank">
                    View PAN Document
                  </a>

                  <Button
                    sx={{ mt: 2 }}
                    variant="contained"
                    onClick={() => verify("PAN")}
                  >
                    Verify PAN
                  </Button>
                </>
              )}

              {/* AADHAAR TAB */}
              {tab === 1 && (
                <>
                  <Typography>Aadhaar: {selected.aadhaarNumber}</Typography>
                  <a href={selected.aadhaarUrl} target="_blank">
                    View Aadhaar
                  </a>

                  <Button
                    sx={{ mt: 2 }}
                    variant="contained"
                    onClick={() => verify("Aadhaar")}
                  >
                    Verify Aadhaar
                  </Button>
                </>
              )}

              {/* BANK TAB */}
              {tab === 2 && (
                <>
                  <Typography fontWeight={700}>Bank Details</Typography>
                  <Typography>Account Number: {selected.bankAccount}</Typography>
                  <Typography>IFSC (Saved): {selected.ifsc}</Typography>

                  {selected.extractedIFSC && (
                    <Typography sx={{ mt: 1 }}>
                      Extracted from PDF:{" "}
                      <b style={{ color: "green" }}>
                        {selected.extractedIFSC}
                      </b>
                    </Typography>
                  )}

                  {selected.document_url?.bankPassbook ? (
                    <Button
                      sx={{ mt: 2 }}
                      variant="outlined"
                      onClick={readPassbookOCR}
                    >
                      Read Passbook (OCR IFSC)
                    </Button>
                  ) : (
                    <Typography>No Passbook Uploaded</Typography>
                  )}

                  <Button
                    variant="contained"
                    sx={{ mt: 2, ml: 2 }}
                    onClick={() => verify("Bank")}
                  >
                    Verify Bank
                  </Button>
                </>
              )}

              {/* GST TAB */}
              {tab === 3 && (
                <>
                  <Typography>GST Number: {selected.gstNumber}</Typography>

                  <Button
                    sx={{ mt: 2 }}
                    variant="contained"
                    onClick={() => verify("GST")}
                  >
                    Verify GST
                  </Button>
                </>
              )}

              <Button sx={{ mt: 3 }} onClick={closeModal}>
                Close
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
