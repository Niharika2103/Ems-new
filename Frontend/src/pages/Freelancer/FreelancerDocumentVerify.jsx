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

// PDF.js for text-based PDF extraction
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.min.mjs";

// OCR (for scanned PDFs)
import { createWorker } from "tesseract.js";

// ------------------------------------------------------
// Convert PDF page → IMAGE (for OCR)
// ------------------------------------------------------
const pdfPageToImage = async (page) => {
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: ctx, viewport }).promise;

  return canvas.toDataURL("image/png");
};

// ------------------------------------------------------
// OCR Extraction (fallback for scanned passbooks)
// ------------------------------------------------------
const extractIFSC_OCR = async (fileUrl) => {
  try {
    console.log("⚠️ Running OCR fallback…");

    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

    const worker = await createWorker("eng");
    let extracted = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);

      // Convert page to image
      const img = await pdfPageToImage(page);

      // Run OCR on image
      const { data } = await worker.recognize(img);

      extracted += data.text + " ";
    }

    await worker.terminate();

    extracted = extracted.replace(/\s+/g, "").toUpperCase();

    const match = extracted.match(/[A-Z]{4}0[A-Z0-9]{6}/);

    return match ? match[0] : null;
  } catch (err) {
    console.error("OCR Failed:", err);
    return null;
  }
};

// ------------------------------------------------------
// Master IFSC Extractor (Text → OCR fallback)
// ------------------------------------------------------
const extractIFSC = async (fileUrl, password = null) => {
  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();

    const pdf = await pdfjsLib
      .getDocument({
        data: buffer,
        password: password || undefined,
      })
      .promise;

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((t) => t.str).join(" ");
    }

    const cleaned = text.replace(/\s+/g, "").toUpperCase();
    const match = cleaned.match(/[A-Z]{4}0[A-Z0-9]{6}/);

    if (match) return match[0];

    // Fallback → OCR
    return await extractIFSC_OCR(fileUrl);
  } catch (err) {
    console.log("PDF Error → Switching to OCR");
    return await extractIFSC_OCR(fileUrl);
  }
};

// ------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------
export default function AdminVerificationTabs() {
  const [tab, setTab] = useState(2); // default bank tab for testing
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

  const verify = async (type) => {
  if (!selected?.extractedIFSC) {
    alert("No IFSC code extracted!");
    return;
  }

  const url = `https://ifsc.razorpay.com/${selected.extractedIFSC}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      alert("Invalid IFSC Code or API Error");
      return;
    }

    const data = await response.json();

    alert(
      `✅ ${type} Verification Successful\n\n` +
      `Bank: ${data.BANK}\n` +
      `Branch: ${data.BRANCH}\n` +
      `Address: ${data.ADDRESS}\n` +
      `State: ${data.STATE}\n` +
      `District: ${data.DISTRICT}`
    );
  } catch (err) {
    alert("API request failed. Please check internet or try again.");
    console.error(err);
  }
};

  // ------------------------------------------------------
  // BANK PDF Extraction Handler
  // ------------------------------------------------------
  const openPassbook = async () => {
    const fileUrl = selected?.document_url?.bankPassbook;

    if (!fileUrl) {
      alert("No passbook uploaded!");
      return;
    }

    const password = prompt("Enter PDF Password (if any):");

    const ifsc = await extractIFSC(fileUrl, password);

    if (ifsc) {
      alert("IFSC Found: " + ifsc);
      setSelected((prev) => ({ ...prev, extractedIFSC: ifsc }));
    } else {
      alert("❌ Unable to extract IFSC from this PDF");
    }

    window.open(fileUrl, "_blank");
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

              {tab === 2 && (
                <>
                  <Typography fontWeight={700}>Bank Account</Typography>
                  {selected.extractedIFSC && (
                    <Typography sx={{ mt: 1 }}>
                      Extracted IFSC:{" "}
                      <b style={{ color: "green" }}>
                        {selected.extractedIFSC}
                      </b>
                    </Typography>
                  )}

                  {selected.document_url?.bankPassbook ? (
                    <>
                    <Button
                      variant="outlined"
                      sx={{ mt: 2 }}
                      onClick={openPassbook}
                    >
                      View / Extract IFSC
                    </Button>
                     <Button
                    variant="contained"
                    sx={{ mt: 2, ml: 2 }}
                    onClick={() => verify("Bank")}
                  >
                    Verify Bank
                  </Button>
                  </>
                  ) : (
                    <Typography>No Passbook Uploaded</Typography>
                  )}
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