import React, { useState } from "react";
import {
  Box,
  Button,
  Step,
  StepLabel,
  Stepper,
  Typography,
  Card,
  CardContent,
  TextField,
} from "@mui/material";

import { uploadFreelancerDocsApi } from "../../api/authApi";
import { decodeToken } from "../../api/decodeToekn"; // 
// UPDATED STEPS
const steps = [
  "Profile Photo Upload",
  "Freelancer Document Upload",
  "Bank Passbook Upload",
  "Aadhaar & PAN Upload",
  "GST Registration",
  "GST Documents Upload",
  "Review & Submit",
];

const FreelancerDocuments = () => {
  const [activeStep, setActiveStep] = useState(0);

  // UPDATED FORM DATA
  const [formData, setFormData] = useState({
    profilePhoto: null,
    freelancerDocument: null,
    bankPassbook: null,
    panCard: null,
    aadhaarCard: null,
    gstNumber: "",
    gstCertificate: null,
    gstReturns: null,
  });

    //  // ✅ Get employeeId from decoded JWT token
  const decoded = decodeToken();
  const employeeId = decoded?.id; 

  const handleNext = () => {
    if (activeStep < steps.length - 1) setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep((prev) => prev - 1);
  };

  // const handleFileChange = (e, key) => {
  //   const files = e.target.files;
  //   if (files) {
  //     setFormData({
  //       ...formData,
  //       [key]: files.length > 1 ? Array.from(files) : files[0],
  //     });
  //   }
  // };

  const handleFileChange = (e, key) => {
  const files = e.target.files;
  if (!files) return;

  // ✅ Fix ONLY for GST Returns (must always be an array)
  if (key === "gstReturns") {
    setFormData({
      ...formData,
      gstReturns: Array.from(files), // ALWAYS array
    });
    return;
  }

  // ✅ All other file fields
  setFormData({
    ...formData,
    [key]: files.length > 1 ? Array.from(files) : files[0],
  });
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

    const handleSubmit = async () => {
      if (!employeeId) {
        console.error("❌ Employee ID not found. Cannot submit documents.");
        return;
      }

      const fd = new FormData();

      fd.append("id", employeeId);
      fd.append("gstNumber", formData.gstNumber || "");

      // Single files
      if (formData.profilePhoto) fd.append("photo", formData.profilePhoto);
      if (formData.freelancerDocument)
        fd.append("freelancerDocument", formData.freelancerDocument);
      if (formData.bankPassbook) fd.append("bankPassbook", formData.bankPassbook);
      if (formData.aadhaarCard) fd.append("aadhaarCard", formData.aadhaarCard);
      if (formData.panCard) fd.append("panCard", formData.panCard);
      if (formData.gstCertificate)
        fd.append("gstCertificate", formData.gstCertificate);

      // Multiple files (GST Returns)
      if (Array.isArray(formData.gstReturns)) {
        formData.gstReturns.forEach((file) => {
          fd.append("gstReturns", file);
        });
      }

      try {
        const response = await uploadFreelancerDocsApi(fd);
        console.log("UPLOAD SUCCESS", response.data);
        alert("Documents uploaded successfully!");
      } catch (error) {
        console.log("UPLOAD ERROR", error);
        alert("Upload failed");
      }
    };




  // FILE REQUIREMENTS
  const fileRequirements = {
    profilePhoto: {
      formats: ".jpg, .jpeg, .png",
      maxSize: "5MB",
      requirements: [
        "Passport-size photograph",
        "Clear front-facing image",
        "White background preferred",
      ],
    },
    freelancerDocument: {
      formats: ".pdf, .jpg, .jpeg, .png",
      maxSize: "5MB",
      requirements: [
        "Upload Govt/company issued freelancer ID",
        "Document must be clearly visible",
      ],
    },
    bankPassbook: {
      formats: ".jpg, .jpeg, .png, .pdf",
      maxSize: "5MB",
      requirements: [
        "Ensure all details are clearly visible",
        "Account holder name, account number, IFSC must be visible",
      ],
    },
    aadhaarCard: {
      formats: ".jpg, .jpeg, .png, .pdf",
      maxSize: "5MB",
      requirements: [
        "Both front and back required",
        "Aadhaar number must be visible",
      ],
    },
    panCard: {
      formats: ".jpg, .jpeg, .png, .pdf",
      maxSize: "5MB",
      requirements: ["PAN number must be visible"],
    },
    gstCertificate: {
      formats: ".jpg, .jpeg, .png, .pdf",
      maxSize: "10MB",
      requirements: ["GST Registration Certificate required"],
    },
    gstReturns: {
      formats: ".pdf",
      maxSize: "10MB per file",
      requirements: ["Last 6 months GST returns", "PDF only"],
    },
  };

  const FileRequirementsBox = ({ type }) => (
    <Box sx={{ mt: 3, p: 2, backgroundColor: "#f8f9fa", borderRadius: 1 }}>
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
        File Requirements:
      </Typography>
      <Typography variant="caption" display="block">
        • Supported formats: {fileRequirements[type].formats}
      </Typography>
      <Typography variant="caption" display="block">
        • Max size: {fileRequirements[type].maxSize}
      </Typography>
      {fileRequirements[type].requirements.map((req, idx) => (
        <Typography key={idx} variant="caption" display="block">
          • {req}
        </Typography>
      ))}
    </Box>
  );

  const isValidGST = (gst) => {
    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  };

  return (
    <Box
      sx={{
        backgroundColor: "#f5f6fa",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 4,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 700, p: 3, boxShadow: 4 }}>
        <CardContent>
          {/* STEPPER */}
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ mt: 5 }}>
            {/* ================================================================
                STEP 1 — PROFILE PHOTO UPLOAD
            ================================================================= */}
            {activeStep === 0 && (
              <Box
                textAlign="center"
                sx={{ display: "flex", flexDirection: "column", gap: 3 }}
              >
                <Typography variant="h5" fontWeight="bold">
                  Step 1: Upload Profile Photo
                </Typography>

                <Button variant="contained" component="label" sx={{ px: 4, py: 1 }}>
                  Upload Photo
                  <input
                    hidden
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, "profilePhoto")}
                  />
                </Button>

                {formData.profilePhoto && (
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={URL.createObjectURL(formData.profilePhoto)}
                      alt="preview"
                      width={150}
                      height={150}
                      style={{
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #ddd",
                      }}
                    />
                    <Typography variant="body2" mt={1}>
                      {formData.profilePhoto.name} (
                      {(formData.profilePhoto.size / 1024 / 1024).toFixed(2)} MB)
                    </Typography>
                  </Box>
                )}

                {!formData.profilePhoto && (
                  <Typography variant="body2" color="text.secondary">
                    No photo selected
                  </Typography>
                )}

                <FileRequirementsBox type="profilePhoto" />
              </Box>
            )}

            {/* ================================================================
                STEP 2 — FREELANCER DOCUMENT UPLOAD
            ================================================================= */}
            {activeStep === 1 && (
              <Box
                textAlign="center"
                sx={{ display: "flex", flexDirection: "column", gap: 3 }}
              >
                <Typography variant="h5" fontWeight="bold">
                  Step 2: Upload Freelancer Document
                </Typography>

                <Button variant="contained" component="label" sx={{ px: 4, py: 1 }}>
                  Upload Document
                  <input
                    hidden
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, "freelancerDocument")}
                  />
                </Button>

                {formData.freelancerDocument && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      border: "1px dashed #ccc",
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      color="primary"
                    >
                      Selected Document:
                    </Typography>
                    <Typography variant="body2">
                      {formData.freelancerDocument.name}
                    </Typography>
                    <Typography variant="caption">
                      Size:{" "}
                      {(
                        formData.freelancerDocument.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </Typography>
                  </Box>
                )}

                {!formData.freelancerDocument && (
                  <Typography variant="body2" color="text.secondary">
                    No file selected
                  </Typography>
                )}

                <FileRequirementsBox type="freelancerDocument" />
              </Box>
            )}

            {/* ================================================================
                YOUR ORIGINAL 5 STEPS BELOW (NO CHANGE)
            ================================================================= */}

            {/* STEP 3 – BANK PASSBOOK */}
            {activeStep === 2 && (
              <Box textAlign="center" sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                  Upload Bank Passbook
                </Typography>

                <Button 
                  variant="contained" 
                  component="label"
                  sx={{ px: 4, py: 1 }}
                >
                  Upload Bank Passbook
                  <input
                    hidden
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileChange(e, "bankPassbook")}
                  />
                </Button>

                {formData.bankPassbook && (
                  <Box sx={{ mt: 2, p: 2, border: "1px dashed #ccc", borderRadius: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary">
                      Selected File:
                    </Typography>
                    <Typography>{formData.bankPassbook.name}</Typography>
                  </Box>
                )}

                <FileRequirementsBox type="bankPassbook" />
              </Box>
            )}

            {/* STEP 4 – AADHAAR & PAN */}
            {activeStep === 3 && (
              <Box textAlign="center" sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Typography variant="h5" fontWeight="bold">Upload Aadhaar & PAN</Typography>

                {/* Aadhaar */}
                <Button variant="outlined" component="label" sx={{ px: 4 }}>
                  Upload Aadhaar
                  <input hidden type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFileChange(e, "aadhaarCard")} />
                </Button>

                {formData.aadhaarCard && <Typography>{formData.aadhaarCard.name}</Typography>}
                <FileRequirementsBox type="aadhaarCard" />

                {/* PAN */}
                <Button variant="outlined" component="label" sx={{ px: 4, mt: 2 }}>
                  Upload PAN
                  <input hidden type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFileChange(e, "panCard")} />
                </Button>

                {formData.panCard && <Typography>{formData.panCard.name}</Typography>}
                <FileRequirementsBox type="panCard" />
              </Box>
            )}

            {/* STEP 5 – GST REGISTRATION */}
            {activeStep === 4 && (
              <Box textAlign="center">
                <Typography variant="h5" fontWeight="bold">GST Registration</Typography>

                <TextField
                  fullWidth
                  label="GST Number"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleInputChange}
                  error={formData.gstNumber && !isValidGST(formData.gstNumber)}
                  helperText={
                    formData.gstNumber && !isValidGST(formData.gstNumber)
                      ? "Invalid GST Number"
                      : "Format: 22AAAAA0000A1Z5"
                  }
                  sx={{ mt: 3 }}
                />

                <Button variant="contained" component="label" sx={{ mt: 3 }}>
                  Upload GST Certificate
                  <input hidden type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFileChange(e, "gstCertificate")} />
                </Button>

                {formData.gstCertificate && <Typography>{formData.gstCertificate.name}</Typography>}

                <FileRequirementsBox type="gstCertificate" />
              </Box>
            )}

            {/* STEP 6 – GST RETURNS */}
            {activeStep === 5 && (
              <Box textAlign="center">
                <Typography variant="h5" fontWeight="bold">GST Return Documents</Typography>

                <Button variant="contained" component="label" sx={{ mt: 3 }}>
                  Upload GST Returns
                  <input hidden type="file" multiple accept=".pdf" onChange={(e) => handleFileChange(e, "gstReturns")} />
                </Button>

                {formData.gstReturns && (
                  <Box sx={{ mt: 2 }}>
                    {Array.isArray(formData.gstReturns)
                      ? formData.gstReturns.map((f, i) => (
                          <Typography key={i}>{f.name}</Typography>
                        ))
                      : <Typography>{formData.gstReturns.name}</Typography>}
                  </Box>
                )}

                <FileRequirementsBox type="gstReturns" />
              </Box>
            )}

            {/* STEP 7 – REVIEW & SUBMIT */}
            {activeStep === 6 && (
              <Box>
                <Typography variant="h5" fontWeight="bold">Review Your Details</Typography>

                <Box sx={{ p: 2, backgroundColor: "#f8f9fa", borderRadius: 1, mt: 2 }}>
                  <Typography>🖼️ Profile Photo: {formData.profilePhoto?.name || "Not uploaded"}</Typography>
                  <Typography>📄 Freelancer Document: {formData.freelancerDocument?.name || "Not uploaded"}</Typography>
                  <Typography>📘 Bank Passbook: {formData.bankPassbook?.name || "Not uploaded"}</Typography>
                  <Typography>🆔 Aadhaar: {formData.aadhaarCard?.name || "Not uploaded"}</Typography>
                  <Typography>💳 PAN: {formData.panCard?.name || "Not uploaded"}</Typography>
                  <Typography>🏢 GST Number: {formData.gstNumber || "Not entered"}</Typography>
                  <Typography>📄 GST Certificate: {formData.gstCertificate?.name || "Not uploaded"}</Typography>
                  <Typography>
                    📊 GST Returns:{" "}
                    {formData.gstReturns
                      ? Array.isArray(formData.gstReturns)
                        ? formData.gstReturns.map((f) => f.name).join(", ")
                        : formData.gstReturns.name
                      : "Not uploaded"}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {/* BOTTOM NAVIGATION BUTTONS */}
          <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between" }}>
            <Button disabled={activeStep === 0} variant="outlined" onClick={handleBack}>
              Back
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button variant="contained" color="success" onClick={handleSubmit}>
                Submit
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FreelancerDocuments;
