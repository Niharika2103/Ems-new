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
} from "@mui/material";

const steps = [
  "Bank Passbook Upload",
  "Aadhaar & PAN Upload",
  "Educational Certificates",
  "Previous Company Docs",
  "Review & Submit",
];

const Letters = () => {
  const [activeStep, setActiveStep] = useState(0);

  const [formData, setFormData] = useState({
    bankPassbook: null,
    panCard: null,
    aadhaarCard: null,
    educationFiles: null,
    previousDocs: null,
  });

  const handleNext = () => {
    if (activeStep < steps.length - 1) setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep((prev) => prev - 1);
  };

  const handleFileChange = (e, key) => {
    const files = e.target.files;
    if (files) {
      setFormData({ ...formData, [key]: files.length > 1 ? Array.from(files) : files[0] });
    }
  };

  const handleSubmit = () => {
    alert("All documents submitted successfully!");
    console.log(formData);
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
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ mt: 5 }}>
            {/* Step 1: Bank Passbook Upload */}
            {activeStep === 0 && (
              <Box textAlign="center" sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                  Step 1: Upload Bank Passbook
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Please upload a clear image or PDF of your bank passbook showing your account details
                </Typography>

                {/* Upload Bank Passbook */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
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
                    <Box sx={{ mt: 2, p: 2, border: "1px dashed #ccc", borderRadius: 1, width: "100%" }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary">
                        Selected File:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formData.bankPassbook.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                        Size: {(formData.bankPassbook.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                  )}
                  
                  {!formData.bankPassbook && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      No file chosen
                    </Typography>
                  )}
                </Box>

                {/* File requirements */}
                <Box sx={{ mt: 3, p: 2, backgroundColor: "#f8f9fa", borderRadius: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                    File Requirements:
                  </Typography>
                  <Typography variant="caption" display="block">
                    • Supported formats: JPG, PNG, PDF
                  </Typography>
                  <Typography variant="caption" display="block">
                    • Maximum file size: 5MB
                  </Typography>
                  <Typography variant="caption" display="block">
                    • Ensure all details are clearly visible
                  </Typography>
                  <Typography variant="caption" display="block">
                    • File should show account holder name, account number, and IFSC code
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Step 2: Aadhaar & PAN Upload */}
            {activeStep === 1 && (
              <Box textAlign="center" sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                  Step 2: Aadhaar & PAN Upload
                </Typography>

                {/* Upload Aadhaar */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontSize: "1.1rem", fontWeight: 500 }}>Upload Aadhaar Card</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Button variant="outlined" component="label">
                      Choose File
                      <input
                        hidden
                        type="file"
                        onChange={(e) => handleFileChange(e, "aadhaarCard")}
                      />
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                      {formData.aadhaarCard ? formData.aadhaarCard.name : "No file chosen"}
                    </Typography>
                  </Box>
                </Box>

                {/* Upload PAN */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontSize: "1.1rem", fontWeight: 500 }}>Upload PAN Card</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Button variant="outlined" component="label">
                      Choose File
                      <input
                        hidden
                        type="file"
                        onChange={(e) => handleFileChange(e, "panCard")}
                      />
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                      {formData.panCard ? formData.panCard.name : "No file chosen"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Step 3: Educational Certificates */}
            {activeStep === 2 && (
              <Box textAlign="center">
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Step 3: Educational Certificates
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Button variant="outlined" component="label">
                    Choose Files
                    <input
                      hidden
                      type="file"
                      multiple
                      onChange={(e) => handleFileChange(e, "educationFiles")}
                    />
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    {formData.educationFiles
                      ? Array.isArray(formData.educationFiles)
                        ? formData.educationFiles.map((f) => f.name).join(", ")
                        : formData.educationFiles.name
                      : "No file chosen"}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Step 4: Previous Company Docs */}
            {activeStep === 3 && (
              <Box textAlign="center">
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Step 4: Previous Company Documents
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Button variant="outlined" component="label">
                    Choose Files
                    <input
                      hidden
                      type="file"
                      multiple
                      onChange={(e) => handleFileChange(e, "previousDocs")}
                    />
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    {formData.previousDocs
                      ? Array.isArray(formData.previousDocs)
                        ? formData.previousDocs.map((f) => f.name).join(", ")
                        : formData.previousDocs.name
                      : "No file chosen"}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Step 5: Review & Submit */}
            {activeStep === 4 && (
              <Box textAlign="center">
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Step 5: Review & Submit
                </Typography>
                <Typography variant="body1" mb={2}>
                  Please review your uploads before submission.
                </Typography>

                <Box sx={{ textAlign: "left", p: 2, backgroundColor: "#f8f9fa", borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    📘 Bank Passbook: {formData.bankPassbook?.name || "No file chosen"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    🆔 Aadhaar: {formData.aadhaarCard?.name || "No file chosen"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    💳 PAN: {formData.panCard?.name || "No file chosen"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    🎓 Education Files:{" "}
                    {formData.educationFiles
                      ? Array.isArray(formData.educationFiles)
                        ? formData.educationFiles.map((f) => f.name).join(", ")
                        : formData.educationFiles.name
                      : "No file chosen"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    💼 Company Docs:{" "}
                    {formData.previousDocs
                      ? Array.isArray(formData.previousDocs)
                        ? formData.previousDocs.map((f) => f.name).join(", ")
                        : formData.previousDocs.name
                      : "No file chosen"}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {/* Navigation Buttons */}
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

export default Letters;