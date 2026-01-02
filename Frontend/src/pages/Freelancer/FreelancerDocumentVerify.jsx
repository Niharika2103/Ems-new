import React, { useState, useEffect } from "react";
import jsQR from "jsqr";

import { GlobalWorkerOptions } from 'pdfjs-dist';

// Use the CDN version of the worker
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

import * as asn1js from "asn1js"; 
import * as pkijs from "pkijs";
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
  TablePagination,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllFreelancer } from "../../features/freelancer/freelancerSlice";

// PDF.js for text-based PDF extraction
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.min.mjs";

// OCR (for scanned PDFs)
import { createWorker } from "tesseract.js";




const UIDAI_ROOT_CERT_PEM = `
-----BEGIN CERTIFICATE-----
MIIGDzCCA/egAwIBAgIBADANBgkqhkiG9w0BAQsFADCBqTELMAkGA1UEBhMCSU4x
...
-----END CERTIFICATE-----
`;

const pemToBuffer = (pem) =>
  Uint8Array.from(
    atob(pem.replace(/-----(BEGIN|END) CERTIFICATE-----/g, "").replace(/\s/g, "")),
    c => c.charCodeAt(0)
  ).buffer;

const validateAadhaarQRSignature = async (qrPayload) => {
  try {
    // Secure QR comes base64-encoded
    const bytes = Uint8Array.from(atob(qrPayload), c => c.charCodeAt(0));

    const asn1 = asn1js.fromBER(bytes.buffer);
    const cms = new pkijs.ContentInfo({ schema: asn1.result });
    const signed = new pkijs.SignedData({ schema: cms.content });

    const trustedCert = new pkijs.Certificate({
      schema: asn1js.fromBER(pemToBuffer(UIDAI_ROOT_CERT_PEM)).result
    });

    const result = await signed.verify({
      signer: 0,
      trustedCerts: [trustedCert]
    });

    return {
      valid: result,
      signedBy: signed.certificates[0]?.subject?.typesAndValues?.[0]?.value.valueBlock.value || "UIDAI",
      certificateExpiry: signed.certificates[0]?.notAfter?.value || null
    };
  } catch (err) {
    console.error("Signature verify failed", err);
    return { valid: false };
  }
};

// ------------------------------------------------------
// Convert PDF page → IMAGE (for OCR)
// ------------------------------------------------------
const pdfPageToImage = async (page) => {
  const viewport = page.getViewport({ scale: 4 });
  const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });


  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: ctx, viewport }).promise;

  return canvas.toDataURL("image/png");
};

// ------------------------------------------------------
// Aadhaar PDF Extractor (Text → Parsed fields)
// ------------------------------------------------------

// ---------------- Aadhaar Extractor ----------------
const extractAadhaarFromPDF = async (fileUrl) => {
  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();

    // Try normal PDF text extraction
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(t => t.str).join(" ");
    }

    text = text.replace(/\s+/g, " ").toUpperCase();

    return {
      // aadhaarNumber: (text.match(/\d{4}\s\d{4}\s\d{4}/) || [null])[0],
      aadhaarNumber: (
        text.match(/\b\d{12}\b/) ||
        text.match(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/)
      )?.[0] || null,

      name: (text.match(/NAME[:\s]+([A-Z ]+)/)?.[1] || null),
      dob: (text.match(/DOB[:\s]+([0-9\-\/]+)/)?.[1] || null),
      source: "TEXT",
    };
  } catch (err) {
    console.warn("⚠️ PDF text extract failed — switching to OCR…", err);

    // 👉 Force OCR fallback
    return await extractAadhaarOCR(fileUrl);
  }
};

const extractAadhaarOCR = async (fileUrl) => {
  const response = await fetch(fileUrl);
  const blob = await response.blob();
  const buffer = await blob.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const worker = await createWorker("eng");

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const img = await pdfPageToImage(page);
    const { data } = await worker.recognize(img);
    text += data.text + " ";
  }

  await worker.terminate();

  text = text.replace(/\s+/g, " ").toUpperCase();

  return {
    aadhaarNumber: (text.match(/\d{4}\s\d{4}\s\d{4}/) || [null])[0],
    name: (text.match(/NAME[:\s]+([A-Z ]+)/)?.[1] || null),
    dob: (text.match(/DOB[:\s]+([0-9\-\/]+)/)?.[1] || null),
    source: "OCR",
  };
};


// ---------- Parse UIDAI QR Payload ----------
const parseAadhaarQR = (text) => {
  return {
    name: text.match(/name="([^"]+)"/i)?.[1] || null,
    dob: text.match(/dob="([^"]+)"/i)?.[1] || null,
    gender: text.match(/gender="([^"]+)"/i)?.[1] || null,
    aadhaarMasked: text.match(/uid="([^"]+)"/i)?.[1] || null,
    referenceId: text.match(/refid="([^"]+)"/i)?.[1] || null,
    source: "QR"
  };
};

// ---------- Extract QR from PDF ----------

const extractAadhaarFromQR = async (fileUrl) => {
  const res = await fetch(fileUrl);
  const buffer = await res.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);

    // 🔹 Higher scale improves QR readability
    const viewport = page.getViewport({ scale: 5 });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;

    // ---- 1) Try FULL-PAGE scan first ----
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let qr = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    });

    // ---- 2) If not found, try cropped regions ----
    if (!qr) {
      const regions = [
        [canvas.width * 0.60, canvas.height * 0.55, canvas.width * 0.35, canvas.height * 0.35],
        [0, canvas.height * 0.55, canvas.width * 0.35, canvas.height * 0.35],
        [canvas.width * 0.30, canvas.height * 0.55, canvas.width * 0.40, canvas.height * 0.35],
      ];

      for (const [x, y, w, h] of regions) {
        const r = ctx.getImageData(x, y, w, h);
        qr = jsQR(r.data, r.width, r.height, { inversionAttempts: "attemptBoth" });
        if (qr) break;
      }
    }

    if (!qr) continue; // no QR on this page, move on

    const payload = qr.data.trim();
    let parsed = {};
    let signature = { valid: false };

    if (payload.startsWith("<") || payload.includes('uid="')) {
      parsed = parseAadhaarQR(payload);
      parsed.aadhaarSource = "XML_QR";
    } else {
      signature = await validateAadhaarQRSignature(payload);
      const decoded = atob(payload);

      if (decoded.includes("<PrintLetterBarcodeData"))
        parsed = parseAadhaarQR(decoded);

      parsed.aadhaarSource = "SECURE_QR";
    }

    return {
      ...parsed,
      signatureValid: signature.valid,
      signedBy: signature.signedBy,
      certificateExpiry: signature.certificateExpiry,
      source: "QR",
    };
  }

  return null;
};




// ---------------- PAN Extractor ----------------
// const extractPANFromPDF = async (fileUrl) => {
//   try {
//     const response = await fetch(fileUrl);
//     const blob = await response.blob();
//     const buffer = await blob.arrayBuffer();

//     const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
//     let text = "";

//     for (let i = 1; i <= pdf.numPages; i++) {
//       const page = await pdf.getPage(i);
//       const content = await page.getTextContent();
//       text += content.items.map(t => t.str).join(" ");
//     }

//     text = text.replace(/\s+/g, " ").toUpperCase();

//     return {
//       panNumber: (text.match(/[A-Z]{5}[0-9]{4}[A-Z]/) || [null])[0],
//       source: "TEXT",
//     };
//   } catch {
//     return { panNumber: null, source: "FAILED" };
//   }
// };


// ---------------- Aadhaar Open & Verify ----------------

// Temporary signature validator (no external lib)


const openAadhaarDocHandler = async (selected, setSelected) => {
  const fileUrl = selected?.document_url?.aadhaarCard;
  if (!fileUrl) return alert("No Aadhaar document uploaded!");

  let data = await extractAadhaarFromQR(fileUrl);

  let verificationStatus = "failed";

if (data?.aadhaarSource === "SECURE_QR") {
  verificationStatus = data.signatureValid ? "verified" : "failed";
} else if (data?.aadhaarSource === "XML_QR") {
  verificationStatus = "partial";
}


  // Fallback → OCR / Text
  if (!data) {
    console.log("QR not found → using text/OCR fallback");
    data = await extractAadhaarFromPDF(fileUrl);
    verificationStatus = data?.aadhaarNumber ? "partial" : "failed";
  }

  alert(
    `Aadhaar Processed (${data.source})\n\n` +
    `Name: ${data.name || "-" }\n` +
    `DOB: ${data.dob || "-" }\n` +
    `Aadhaar: ${data.aadhaarMasked || data.aadhaarNumber || "-" }\n\n` +
    `Signature: ${
      data.signatureValid ? "VALID ✔️ (Verified)" :
      verificationStatus === "partial" ? "NO QR — Manual Review ⚠️" :
      "FAILED ❌"
    }`
  );

  setSelected(prev => ({
    ...prev,
    aadhaarData: data,
    aadhaarVerified: verificationStatus === "verified",
    aadhaarStatus: verificationStatus
  }));

  window.open(fileUrl, "_blank");
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
  const [tab, setTab] = useState(1); // default bank tab for testing
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(5);

// ---------- Extract Aadhaar QR from IMAGE (JPG/PNG) ----------
const extractAadhaarFromImage = async (fileUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = fileUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      const qr = jsQR(
        imageData.data,
        imageData.width,
        imageData.height,
        { inversionAttempts: "attemptBoth" }
      );

      if (!qr) {
        resolve(null);
        return;
      }

      const payload = qr.data.trim();
      let parsed = {};

      if (payload.startsWith("<") || payload.includes('uid="')) {
        parsed = parseAadhaarQR(payload);
        parsed.aadhaarSource = "XML_QR";
      } else {
        try {
          const decoded = atob(payload);
          if (decoded.includes("<PrintLetterBarcodeData")) {
            parsed = parseAadhaarQR(decoded);
          }
          parsed.aadhaarSource = "SECURE_QR";
        } catch {
          parsed.aadhaarSource = "UNKNOWN_QR";
        }
      }

      resolve({
        ...parsed,
        source: "IMAGE_QR",
      });
    };

    img.onerror = () => resolve(null);
  });
};



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

//  const openModal = (row) => {
//   setSelected({
//     ...row,
//     document_url: {
//       ...row.document_url,
//       aadhaar: row.document_url?.aadhaarCard,
//       bankPassbook: row.document_url?.bankPassbook,
//     },
//   });
//   setModalOpen(true);
// };

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
  // ------------------------------------------------------
// TABLE PAGINATION HANDLERS ✅ MUST BE HERE
// ------------------------------------------------------
const handleChangePage = (event, newPage) => {
  setPage(newPage);
};

const handleChangeRowsPerPage = (event) => {
  setRowsPerPage(parseInt(event.target.value, 10));
  setPage(0);
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
                {filteredFreelancers  ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  .map((row) =>  (
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
          <TablePagination
  component="div"
  count={filteredFreelancers?.length || 0}
  page={page}
  onPageChange={handleChangePage}
  rowsPerPage={rowsPerPage}
  onRowsPerPageChange={handleChangeRowsPerPage}
  rowsPerPageOptions={[5, 10, 25]}
  sx={{
    borderTop: "1px solid #e5e7eb",
  }}
/>

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

              {/* Aadhaar Tab */}
              {tab === 1 && (
  <>
    <Typography fontWeight={700}>Aadhaar Verification</Typography>

    {selected?.aadhaarData && (
      <Typography sx={{ mt: 1 }}>
        Name: <b>{selected.aadhaarData.name}</b><br />
        DOB: <b>{selected.aadhaarData.dob}</b><br />
        Aadhaar: <b>{selected.aadhaarData.aadhaarNumber}</b>
      </Typography>
    )}

    {selected.document_url?.aadhaarCard ? (
      <Button
        variant="outlined"
        sx={{ mt: 2 }}
        // onClick={() =>
        //   openAadhaarDocHandler(
        //     {
        //       ...selected,
        //       document_url: {
        //         aadhaar: selected.document_url.aadhaarCard,
        //       },
        //     },
        //     setSelected
        //   )
        // }
        onClick={() => openAadhaarDocHandler(selected, setSelected)}

      >
        View / Extract Aadhaar
      </Button>
    ) : (
      <Typography>No Aadhaar Uploaded</Typography>
    )}
  </>
)}


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