import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// import { addSubmission } from '../../features/vendor/formSlice';
import { Upload, Users, FileText, CheckCircle, Clock } from 'lucide-react';
import { AUTH_API } from "../../utils/constants";


const VendorPanel = () => {
  const dispatch = useDispatch();
  //const { formConfig, submissions } = useSelector(state => state.form);
  const { formConfig } = useSelector(state => state.form);

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  // Calculate vendor stats
  // const vendorStats = {
  //   totalSubmissions: submissions.length,
  //   approvedVendors: submissions.filter(s => s.status === "Approved").length,
  //   pendingReview: submissions.filter(s => s.status === "Pending").length
  // };

  const handleChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  // const validateForm = () => {
  //   const newErrors = {};
  //   formConfig.forEach((field) => {
  //     if (field.required && !formData[field.id]) {
  //       newErrors[field.id] = `${field.label} is required`;
  //     }
  //   });
  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };
const validateForm = () => {
  const newErrors = {};

  stepFields[currentStep].forEach((field) => {
    if (field.required && !formData[field.id]) {
      newErrors[field.id] = `${field.label} is required`;
    }
  });

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  try {
    /* =========================
       STEP 1: REGISTER VENDOR
    ========================== */
const registerPayload = {
  company_name: formData[1],
  email: formData[2],
  phone: formData[3],
  business_type: formData[4],
  years_in_business: formData[5],
  company_website: formData[6] || null,
  bank_details: formData[7] || {},
  tax_registration: formData[8] || {},
};

const registerRes = await fetch(`${AUTH_API.VENDOR}/register`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(registerPayload),
});

const registerData = await registerRes.json();

if (!registerRes.ok) {
  console.error("Register error:", registerData);
  alert(registerData.error || "Vendor registration failed");
  return;
}

    /* =========================
       STEP 2: SUBMIT DOCUMENTS
    ========================== */
    const submitPayload = new FormData();

    submitPayload.append("email", formData[2]); // REQUIRED BY BACKEND

    // TAX DETAILS
    // submitPayload.append("pan", formData[8]?.pan || "");
    // submitPayload.append("gst", formData[8]?.gst || "");
    // submitPayload.append("tan", formData[8]?.tan || "");
if (formData[8]?.pan) {
  submitPayload.append("pan", formData[8].pan);
}

if (formData[8]?.gst) {
  submitPayload.append("gst", formData[8].gst);
}

if (formData[8]?.tan) {
  submitPayload.append("tan", formData[8].tan);
}


    // FILES
    if (!formData[9]) {
      alert("Business License is required");
      return;
    }
    submitPayload.append("businessLicense", formData[9]);

    if (Array.isArray(formData[10]) && formData[10].length > 0) {
      formData[10].forEach((file) => {
        submitPayload.append("requiredDocuments", file);
      });
    }

    const submitRes = await fetch(`${AUTH_API.VENDOR}/submit`, {
      method: "POST",
      body: submitPayload,
    });

    const submitData = await submitRes.json();

    if (!submitRes.ok) {
      console.error("Submit error:", submitData);
      alert(submitData.error || "Document submission failed");
      return;
    }

    /* =========================
       SUCCESS
    ========================== */
    alert("Vendor registered successfully! Check your email for login details.");

    setFormData({});
    setCurrentStep(1);

  } catch (err) {
    console.error("Vendor flow failed:", err);
    alert("Something went wrong. Please try again.");
  }
};


  const renderField = (field) => {
    const commonProps = {
      className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all",
      value: formData[field.id] || "",
      onChange: (e) => handleChange(field.id, e.target.value),
    };

    switch (field.type) {
      case "textarea":
        return <textarea {...commonProps} rows="3" />;

      case "select":
        return (
          <select {...commonProps}>
            <option value="">Select...</option>
            {field.options?.map((opt, index) => (
              <option key={index} value={opt}>{opt}</option>
            ))}
          </select>
        );

      case "file":
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <input
              type="file"
              className="hidden"
              id={`file-${field.id}`}
              // onChange={(e) =>
              //   handleChange(field.id, e.target.files[0]?.name)
              // }
              onChange={(e) =>
                handleChange(field.id, e.target.files[0])
              }

            />
            <label htmlFor={`file-${field.id}`} className="cursor-pointer text-blue-600 hover:text-blue-700">
              Click to upload file
            </label>
            {/* {formData[field.id] && (
              <p className="text-sm text-green-600 mt-2">✓ {formData[field.id]}</p>
            )} */}
            {formData[field.id] && (
            <p className="text-sm text-green-600 mt-2">
          ✓ {formData[field.id].name}
          </p>
          )}

          </div>
        );

      case "multiFile":
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <input
              type="file"
              multiple
              className="hidden"
              id={`multiFile-${field.id}`}
              onChange={(e) =>
                handleChange(
                  field.id,
                  //Array.from(e.target.files).map((f) => f.name)
                  Array.from(e.target.files)

                )
              }
            />
            <label htmlFor={`multiFile-${field.id}`} className="cursor-pointer text-blue-600 hover:text-blue-700">
              Click to upload multiple files
            </label>
            {/* {formData[field.id] && (
              <div className="mt-2">
                {formData[field.id].map((file, index) => (
                  <p key={index} className="text-sm text-green-600">✓ {file}</p>
                ))}
              </div>
            )} */}

            {Array.isArray(formData[field.id]) && (
            <div className="mt-2">
            {formData[field.id].map((file, index) => (
              <p key={index} className="text-sm text-green-600">
                ✓ {file.name}
              </p>
            ))}
          </div>
        )}

          </div>
        );

      case "website":
        return (
          <input
            {...commonProps}
            type="url"
            placeholder="https://example.com"
          />
        );

      case "bank":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-1">Account Holder Name</label>
              <input 
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="John Doe"
                value={formData[field.id]?.holder || ""}
                onChange={(e) =>
                  handleChange(field.id, {
                    ...formData[field.id],
                    holder: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Account Number</label>
              <input 
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="1234567890"
                value={formData[field.id]?.accNo || ""}
                onChange={(e) =>
                  handleChange(field.id, {
                    ...formData[field.id],
                    accNo: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">IFSC Code</label>
              <input 
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="SBIN0000123"
                value={formData[field.id]?.ifsc || ""}
                onChange={(e) =>
                  handleChange(field.id, {
                    ...formData[field.id],
                    ifsc: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bank Name</label>
              <input 
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="State Bank of India"
                value={formData[field.id]?.bankName || ""}
                onChange={(e) =>
                  handleChange(field.id, {
                    ...formData[field.id],
                    bankName: e.target.value,
                  })
                }
              />
            </div>
          </div>
        );

      case "tax":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-1">PAN Number</label>
              <input 
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="ABCDE1234F"
                value={formData[field.id]?.pan || ""}
                onChange={(e) =>
                  handleChange(field.id, {
                    ...formData[field.id],
                    pan: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">GST Number</label>
              <input 
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="07ABCDE1234F1Z5"
                value={formData[field.id]?.gst || ""}
                onChange={(e) =>
                  handleChange(field.id, {
                    ...formData[field.id],
                    gst: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TAN Number</label>
              <input 
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="BLRE12345F"
                value={formData[field.id]?.tan || ""}
                onChange={(e) =>
                  handleChange(field.id, {
                    ...formData[field.id],
                    tan: e.target.value,
                  })
                }
              />
            </div>
          </div>
        );

      default:
        return <input {...commonProps} type={field.type} />;
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Group fields by steps
  const stepFields = {
    1: formConfig.slice(0, 4), // Basic info
    2: formConfig.slice(4, 8), // Business details
    3: formConfig.slice(8)     // Documents
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Vendor Dashboard Header */}
      {/* <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Vendor Portal</h1>
            <p className="text-gray-600">Complete your registration to become an approved vendor</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Welcome,</p>
              <p className="font-semibold">New Vendor</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div> */}
        {/* Vendor Dashboard Header */}
<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Vendor Portal</h1>
      <p className="text-gray-600">
        Complete your registration to become an approved vendor
      </p>
    </div>

    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="text-sm text-gray-600">Welcome,</p>
        <p className="font-semibold">New Vendor</p>
      </div>
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
        <Users className="w-6 h-6 text-blue-600" />
      </div>
    </div>
  </div>



        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{vendorStats.totalSubmissions}</p>
                <p className="text-sm text-blue-800">Total Submissions</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{vendorStats.approvedVendors}</p>
                <p className="text-sm text-green-800">Approved Vendors</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{vendorStats.pendingReview}</p>
                <p className="text-sm text-yellow-800">Pending Review</p>
              </div>
            </div>
          </div>
        </div> */}
      </div>

      {/* Registration Form */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-20 h-1 mx-2 ${
                  currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {currentStep === 1 && "Company Information"}
            {currentStep === 2 && "Business Details"}
            {currentStep === 3 && "Documents & Verification"}
          </h2>
          <p className="text-gray-600">Step {currentStep} of 3</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dynamic Fields based on current step */}
          {stepFields[currentStep]?.map((field) => (
            <div key={field.id} className={field.type === 'select' ? 'md:col-span-2' : ''}>
              <label className="block text-sm font-medium mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(field)}
              {errors[field.id] && (
                <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>
              )}
            </div>
          ))}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg ${
                currentStep === 1 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              Previous
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Submit Registration
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorPanel;