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
  Alert,
  CircularProgress,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { uploadEmployeeDocuments } from "../../features/auth/adminSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const steps = [
  "Bank Passbook Upload",
  "Aadhaar & PAN Upload",
  "Educational Certificates",
  "Previous Company Docs",
  "Review & Submit",
];
const FILE_SIZE_LIMITS = {
  bankPassbook: 5 * 1024 * 1024,   // 5MB
  aadhaarCard: 5 * 1024 * 1024,    // 5MB
  panCard: 5 * 1024 * 1024,        // 5MB
  educationFiles: 10 * 1024 * 1024, // 10MB per file
  previousDocs: 10 * 1024 * 1024,   // 10MB per file
};


const Letters = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const employeeId = location.state?.employeeId;

  const [formData, setFormData] = useState({
    bankPassbook: null,
    panCard: null,
    aadhaarCard: null,
    educationFiles: [],
    previousDocs: [],
  });

  const validateCurrentStep = () => {
    const errors = {};
    
    switch(activeStep) {
      case 0: // Bank Passbook
        if (!formData.bankPassbook) {
          errors.bankPassbook = "Bank Passbook is required to proceed";
        }
        break;
      case 1: // Aadhaar & PAN
        if (!formData.aadhaarCard) {
          errors.aadhaarCard = "Aadhaar Card is required to proceed";
        }
        if (!formData.panCard) {
          errors.panCard = "PAN Card is required to proceed";
        }
        break;
      case 2: // Educational Certificates
        if (!formData.educationFiles || formData.educationFiles.length === 0) {
          errors.educationFiles = "At least one educational certificate is required";
        }
        break;
      case 3: // Previous Company Docs
        if (!formData.previousDocs || formData.previousDocs.length === 0) {
          errors.previousDocs = "At least one previous company document is required";
        }
        break;
      default:
        break;
    }
    
    return errors;
  };

  const handleNext = () => {
    const errors = validateCurrentStep();
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      // Show specific error message for current step
      const errorMessage = Object.values(errors)[0];
      toast.error(errorMessage, { position: "top-center" });
      return;
    }
    
    // Clear errors for current step
    setValidationErrors({});
    
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    // Clear validation errors when going back
    setValidationErrors({});
    if (activeStep > 0) setActiveStep((prev) => prev - 1);
  };

  // const handleFileChange = (e, key) => {
  //   const files = e.target.files;

  //   if (!files || files.length === 0) {
  //     setFormData(prev => ({
  //       ...prev,
  //       [key]: (key === 'educationFiles' || key === 'previousDocs') ? [] : null
  //     }));
      
  //     // Clear validation error for this field when file is removed
  //     setValidationErrors(prev => {
  //       const newErrors = { ...prev };
  //       delete newErrors[key];
  //       return newErrors;
  //     });
  //     return;
  //   }

  //   if (key === 'educationFiles' || key === 'previousDocs') {
  //     setFormData(prev => ({
  //       ...prev,
  //       [key]: Array.from(files)
  //     }));
  //   } else {
  //     setFormData(prev => ({
  //       ...prev,
  //       [key]: files[0]
  //     }));
  //   }
    
  //   // Clear validation error for this field when file is selected
  //   setValidationErrors(prev => {
  //     const newErrors = { ...prev };
  //     delete newErrors[key];
  //     return newErrors;
  //   });
  // };

  const handleFileChange = (e, key) => {
  const files = e.target.files;
  const maxSize = FILE_SIZE_LIMITS[key];

  if (!files || files.length === 0) {
    setFormData(prev => ({
      ...prev,
      [key]: (key === "educationFiles" || key === "previousDocs") ? [] : null
    }));
    return;
  }

  // ✅ MULTIPLE FILE VALIDATION
  if (key === "educationFiles" || key === "previousDocs") {
    for (let file of files) {
      if (file.size > maxSize) {
        toast.error(
          `${file.name} exceeds ${maxSize / 1024 / 1024}MB limit`,
          { position: "top-center" }
        );
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [key]: Array.from(files),
    }));
  } 
  // ✅ SINGLE FILE VALIDATION
  else {
    const file = files[0];

    if (file.size > maxSize) {
      toast.error(
        `${key.replace(/([A-Z])/g, " $1")} exceeds ${maxSize / 1024 / 1024}MB`,
        { position: "top-center" }
      );
      return;
    }

    setFormData(prev => ({
      ...prev,
      [key]: file,
    }));
  }

  // ✅ CLEAR ERROR AFTER SUCCESSFUL SELECT
  setValidationErrors(prev => {
    const newErrors = { ...prev };
    delete newErrors[key];
    return newErrors;
  });
};

  const handleSubmit = () => {
    // Validate all steps before submission
    const allErrors = {};
    
    if (!formData.bankPassbook) {
      allErrors.bankPassbook = "Bank Passbook is required";
    }
    if (!formData.aadhaarCard) {
      allErrors.aadhaarCard = "Aadhaar Card is required";
    }
    if (!formData.panCard) {
      allErrors.panCard = "PAN Card is required";
    }
    if (!formData.educationFiles || formData.educationFiles.length === 0) {
      allErrors.educationFiles = "Educational certificates are required";
    }
    if (!formData.previousDocs || formData.previousDocs.length === 0) {
      allErrors.previousDocs = "Previous company documents are required";
    }
    
    if (Object.keys(allErrors).length > 0) {
      setValidationErrors(allErrors);
      toast.error("Please complete all steps before submission", { position: "top-center" });
      return;
    }

    setSubmitLoading(true);
    
    const data = {
      passbook: formData.bankPassbook,
      aadhaar: formData.aadhaarCard,
      pan: formData.panCard,
      educational_docs: formData.educationFiles,
      experience_docs: formData.previousDocs,
    };

    dispatch(uploadEmployeeDocuments({ employeeId, data }))
      .unwrap()
      .then(() => {
        // Show success toast
        toast.success("Documents submitted successfully!", { 
          position: "top-center",
          autoClose: 2000,
          onClose: () => {
            // Navigate only after toast is closed
            navigate("/employee/documents/list");
          }
        });
      })
      .catch((err) => {
        setSubmitLoading(false);
        toast.error("Upload failed: " + (err?.error || err), { position: "top-center" });
      });
  };

  // File requirements configuration
  const fileRequirements = {
    bankPassbook: {
      formats: ".jpg, .jpeg, .png, .pdf",
      maxSize: "5MB",
      requirements: [
        "Ensure all details are clearly visible",
        "File should show account holder name, account number, and IFSC code",
        "Image should be clear and not blurry"
      ]
    },
    aadhaarCard: {
      formats: ".jpg, .jpeg, .png, .pdf",
      maxSize: "5MB",
      requirements: [
        "Both front and back sides required",
        "Aadhaar number should be clearly visible",
        "Image should be clear and not blurry",
        "Ensure all personal details are readable"
      ]
    },
    panCard: {
      formats: ".jpg, .jpeg, .png, .pdf",
      maxSize: "5MB",
      requirements: [
        "PAN number should be clearly visible",
        "Name on PAN should match your legal name",
        "Image should be clear and not blurry",
        "Full card should be visible in the image"
      ]
    },
    educationFiles: {
      formats: ".jpg, .jpeg, .png, .pdf",
      maxSize: "10MB per file",
      requirements: [
        "Upload all educational certificates",
        "Marksheets and degree certificates required",
        "Files should be clearly readable",
        "Multiple files can be uploaded together"
      ]
    },
    previousDocs: {
      formats: ".jpg, .jpeg, .png, .pdf",
      maxSize: "10MB per file",
      requirements: [
        "Experience letters from previous employers",
        "Relieving letters if available",
        "Salary slips (last 3 months from each company)",
        "All documents should be clearly readable"
      ]
    }
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
        • Maximum file size: {fileRequirements[type].maxSize}
      </Typography>
      {fileRequirements[type].requirements.map((req, index) => (
        <Typography key={index} variant="caption" display="block">
          • {req}
        </Typography>
      ))}
      
      {/* Show validation error if exists */}
      {validationErrors[type] && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {validationErrors[type]}
        </Alert>
      )}
    </Box>
  );

  return (
    <>

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

                  <FileRequirementsBox type="bankPassbook" />
                </Box>
              )}

              {/* Step 2: Aadhaar & PAN Upload */}
              {activeStep === 1 && (
                <Box textAlign="center" sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Typography variant="h5" fontWeight="bold">
                    Step 2: Aadhaar & PAN Upload
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontSize: "1.1rem", fontWeight: 500 }}>
                      Upload Aadhaar Card
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
                      <Button variant="outlined" component="label">
                        Choose File
                        <input
                          hidden
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => handleFileChange(e, "aadhaarCard")}
                        />
                      </Button>
                      <Typography variant="body2" color="text.secondary">
                        {formData.aadhaarCard ? formData.aadhaarCard.name : "No file chosen"}
                      </Typography>
                    </Box>
                    {formData.aadhaarCard && (
                      <Typography variant="caption" color="text.secondary">
                        Size: {(formData.aadhaarCard.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    )}
                  </Box>

                  <FileRequirementsBox type="aadhaarCard" />

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontSize: "1.1rem", fontWeight: 500 }}>
                      Upload PAN Card
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
                      <Button variant="outlined" component="label">
                        Choose File
                        <input
                          hidden
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => handleFileChange(e, "panCard")}
                        />
                      </Button>
                      <Typography variant="body2" color="text.secondary">
                        {formData.panCard ? formData.panCard.name : "No file chosen"}
                      </Typography>
                    </Box>
                    {formData.panCard && (
                      <Typography variant="caption" color="text.secondary">
                        Size: {(formData.panCard.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    )}
                  </Box>

                  <FileRequirementsBox type="panCard" />
                </Box>
              )}

              {/* Step 3: Educational Certificates */}
              {activeStep === 2 && (
                <Box textAlign="center" sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Step 3: Educational Certificates
                  </Typography>

                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    Upload all your educational certificates and marksheets
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
                    <Button variant="contained" component="label" sx={{ px: 4, py: 1 }}>
                      Choose Files
                      <input
                        hidden
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => handleFileChange(e, "educationFiles")}
                      />
                    </Button>

                    {formData.educationFiles && formData.educationFiles.length > 0 && (
                      <Box sx={{ mt: 2, p: 2, border: "1px dashed #ccc", borderRadius: 1, width: "100%" }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          Selected Files:
                        </Typography>
                        {formData.educationFiles.map((file, index) => (
                          <Typography key={index} variant="body2" color="text.secondary">
                            • {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </Typography>
                        ))}
                      </Box>
                    )}

                    {(!formData.educationFiles || formData.educationFiles.length === 0) && (
                      <Typography variant="body2" color="text.secondary">
                        No files chosen
                      </Typography>
                    )}
                  </Box>

                  <FileRequirementsBox type="educationFiles" />
                </Box>
              )}

              {/* Step 4: Previous Company Docs */}
              {activeStep === 3 && (
                <Box textAlign="center" sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Step 4: Previous Company Documents
                  </Typography>

                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    Upload documents from your previous employment
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
                    <Button variant="contained" component="label" sx={{ px: 4, py: 1 }}>
                      Choose Files
                      <input
                        hidden
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => handleFileChange(e, "previousDocs")}
                      />
                    </Button>

                    {formData.previousDocs && formData.previousDocs.length > 0 && (
                      <Box sx={{ mt: 2, p: 2, border: "1px dashed #ccc", borderRadius: 1, width: "100%" }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          Selected Files:
                        </Typography>
                        {formData.previousDocs.map((file, index) => (
                          <Typography key={index} variant="body2" color="text.secondary">
                            • {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </Typography>
                        ))}
                      </Box>
                    )}

                    {(!formData.previousDocs || formData.previousDocs.length === 0) && (
                      <Typography variant="body2" color="text.secondary">
                        No files chosen
                      </Typography>
                    )}
                  </Box>

                  <FileRequirementsBox type="previousDocs" />
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
                      {formData.bankPassbook && ` (${(formData.bankPassbook.size / 1024 / 1024).toFixed(2)} MB)`}
                      {validationErrors.bankPassbook && " ❌"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      🆔 Aadhaar: {formData.aadhaarCard?.name || "No file chosen"}
                      {formData.aadhaarCard && ` (${(formData.aadhaarCard.size / 1024 / 1024).toFixed(2)} MB)`}
                      {validationErrors.aadhaarCard && " ❌"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      💳 PAN: {formData.panCard?.name || "No file chosen"}
                      {formData.panCard && ` (${(formData.panCard.size / 1024 / 1024).toFixed(2)} MB)`}
                      {validationErrors.panCard && " ❌"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      🎓 Education Files:{" "}
                      {formData.educationFiles && formData.educationFiles.length > 0
                        ? formData.educationFiles.map((f) => `${f.name} (${(f.size / 1024 / 1024).toFixed(2)} MB)`).join(", ")
                        : "No files chosen"}
                      {validationErrors.educationFiles && " ❌"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      💼 Company Docs:{" "}
                      {formData.previousDocs && formData.previousDocs.length > 0
                        ? formData.previousDocs.map((f) => `${f.name} (${(f.size / 1024 / 1024).toFixed(2)} MB)`).join(", ")
                        : "No files chosen"}
                      {validationErrors.previousDocs && " ❌"}
                    </Typography>
                  </Box>
                  
                  {/* Show validation errors in review step */}
                  {Object.keys(validationErrors).length > 0 && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      Please complete all previous steps before submitting
                    </Alert>
                  )}
                </Box>
              )}
            </Box>

            <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between" }}>
              <Button disabled={activeStep === 0} variant="outlined" onClick={handleBack}>
                Back
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button 
                  variant="contained" 
                  color="success" 
                  onClick={handleSubmit}
                  disabled={submitLoading}
                >
                  {submitLoading ? <CircularProgress size={24} /> : "Submit"}
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
    </>
  );
};

export default Letters;