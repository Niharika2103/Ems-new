// import React, { useState } from 'react';
// import { Upload, Plus, Trash2, Eye, Settings } from 'lucide-react';

// const VendorFormSystem = () => {
//   const [activeTab, setActiveTab] = useState("vendor");

//   // INITIAL FORM CONFIG
//   const [formConfig, setFormConfig] = useState([
//     { id: 1, label: "Company Name", type: "text", required: true },
//     { id: 2, label: "Email", type: "email", required: true },
//     { id: 3, label: "Phone", type: "tel", required: true },
//     { id: 4, label: "Business Type", type: "select", options: ["Manufacturer", "Supplier", "Distributor"], required: true },
//     { id: 5, label: "Years in Business", type: "number", required: true },
//     { id: 6, label: "Company Website", type: "website", required: false },
//     { id: 7, label: "Bank Details", type: "bank", required: true },
//     { id: 8, label: "Tax Registration", type: "tax", required: true },
//     { id: 9, label: "Business License", type: "file", required: true },
//     { id: 10, label: "Required Documents", type: "multiFile", required: true }
//   ]);

//   const [submissions, setSubmissions] = useState([]);

//   // ---------------------------------------------------------
//   //   VENDOR FORM
//   // ---------------------------------------------------------
//   const VendorForm = () => {
//     const [formData, setFormData] = useState({});
//     const [errors, setErrors] = useState({});

//     const handleChange = (id, value) => {
//       setFormData(prev => ({ ...prev, [id]: value }));
//       if (errors[id]) {
//         setErrors(prev => ({ ...prev, [id]: null }));
//       }
//     };

//     const validateForm = () => {
//       const newErrors = {};
//       formConfig.forEach((field) => {
//         if (field.required && !formData[field.id]) {
//           newErrors[field.id] = `${field.label} is required`;
//         }
//       });
//       setErrors(newErrors);
//       return Object.keys(newErrors).length === 0;
//     };

//     const handleSubmit = (e) => {
//       e.preventDefault();
//       if (!validateForm()) return;

//       const submission = {
//         id: Date.now(),
//         data: formData,
//         submittedAt: new Date().toLocaleString(),
//         status: "Pending"
//       };

//       setSubmissions(prev => [...prev, submission]);
//       alert("Form submitted successfully!");
//       setFormData({});
//     };

//     // ------------------------------ RENDER FIELD ------------------------------
//     const renderField = (field) => {
//       const commonProps = {
//         className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500",
//         value: formData[field.id] || "",
//         onChange: (e) => handleChange(field.id, e.target.value),
//       };

//       switch (field.type) {
//         case "textarea":
//           return <textarea {...commonProps} rows="3" />;

//         case "select":
//           return (
//             <select {...commonProps}>
//               <option value="">Select...</option>
//               {field.options?.map((opt, index) => (
//                 <option key={index} value={opt}>{opt}</option>
//               ))}
//             </select>
//           );

//         case "file":
//           return (
//             <input
//               type="file"
//               onChange={(e) =>
//                 handleChange(field.id, e.target.files[0]?.name)
//               }
//             />
//           );

//         case "multiFile":
//           return (
//             <input
//               type="file"
//               multiple
//               onChange={(e) =>
//                 handleChange(
//                   field.id,
//                   Array.from(e.target.files).map((f) => f.name)
//                 )
//               }
//             />
//           );

//         case "website":
//           return (
//             <input
//               {...commonProps}
//               type="url"
//               placeholder="https://example.com"
//             />
//           );

//         case "bank":
//           return (
//             <div className="grid grid-cols-2 gap-3">
//               <input className="border p-2 rounded" placeholder="Account Holder Name"
//                 onChange={(e) =>
//                   handleChange(field.id, {
//                     ...formData[field.id],
//                     holder: e.target.value,
//                   })
//                 }
//               />
//               <input className="border p-2 rounded" placeholder="Account Number"
//                 onChange={(e) =>
//                   handleChange(field.id, {
//                     ...formData[field.id],
//                     accNo: e.target.value,
//                   })
//                 }
//               />
//               <input className="border p-2 rounded" placeholder="IFSC Code"
//                 onChange={(e) =>
//                   handleChange(field.id, {
//                     ...formData[field.id],
//                     ifsc: e.target.value,
//                   })
//                 }
//               />
//               <input className="border p-2 rounded" placeholder="Bank Name"
//                 onChange={(e) =>
//                   handleChange(field.id, {
//                     ...formData[field.id],
//                     bankName: e.target.value,
//                   })
//                 }
//               />
//             </div>
//           );

//         case "tax":
//           return (
//             <div className="grid grid-cols-3 gap-3">
//               <input className="border p-2 rounded" placeholder="PAN Number"
//                 onChange={(e) =>
//                   handleChange(field.id, {
//                     ...formData[field.id],
//                     pan: e.target.value,
//                   })
//                 }
//               />
//               <input className="border p-2 rounded" placeholder="GST Number"
//                 onChange={(e) =>
//                   handleChange(field.id, {
//                     ...formData[field.id],
//                     gst: e.target.value,
//                   })
//                 }
//               />
//               <input className="border p-2 rounded" placeholder="TAN Number"
//                 onChange={(e) =>
//                   handleChange(field.id, {
//                     ...formData[field.id],
//                     tan: e.target.value,
//                   })
//                 }
//               />
//             </div>
//           );

//         default:
//           return <input {...commonProps} type={field.type} />;
//       }
//     };

//     return (
//       <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
//         <h2 className="text-3xl font-bold mb-6">Vendor Registration</h2>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {formConfig.map((field) => (
//             <div key={field.id}>
//               <label className="block text-sm font-medium mb-1">
//                 {field.label}
//                 {field.required && <span className="text-red-500">*</span>}
//               </label>

//               {renderField(field)}

//               {errors[field.id] && (
//                 <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>
//               )}
//             </div>
//           ))}

//           <button className="w-full bg-blue-600 text-white py-3 rounded-lg">
//             Submit
//           </button>
//         </form>
//       </div>
//     );
//   };

//   // ---------------------------------------------------------
//   //   ADMIN PANEL
//   // ---------------------------------------------------------
//   const AdminPanel = () => {
//     const [viewMode, setViewMode] = useState("builder");
//     const [newField, setNewField] = useState({
//       label: "",
//       type: "text",
//       required: false,
//     });

//     const addField = () => {
//       if (!newField.label) return alert("Field label required");

//       setFormConfig((prev) => [...prev, { ...newField, id: Date.now() }]);
//       setNewField({ label: "", type: "text", required: false });
//     };

//     const removeField = (id) => {
//       setFormConfig((prev) => prev.filter((f) => f.id !== id));
//     };

//     return (
//       <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-8">
//         <h2 className="text-3xl font-bold mb-6">Admin Panel</h2>

//         <div className="flex gap-4 mb-6">
//           <button
//             onClick={() => setViewMode("builder")}
//             className={`px-4 py-2 rounded-lg ${viewMode === "builder"
//               ? "bg-blue-600 text-white"
//               : "bg-gray-200"
//               }`}
//           >
//             <Settings className="inline w-4 h-4 mr-2" /> Form Builder
//           </button>

//           <button
//             onClick={() => setViewMode("submissions")}
//             className={`px-4 py-2 rounded-lg ${viewMode === "submissions"
//               ? "bg-blue-600 text-white"
//               : "bg-gray-200"
//               }`}
//           >
//             <Eye className="inline w-4 h-4 mr-2" /> Submissions ({submissions.length})
//           </button>
//         </div>

//         {/* FORM BUILDER VIEW */}
//         {viewMode === "builder" ? (
//           <div className="space-y-6">
//             {/* Add new field */}
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <h3 className="font-semibold mb-3">Add New Field</h3>
//               <div className="grid grid-cols-4 gap-4">
//                 <input
//                   type="text"
//                   placeholder="Field Label"
//                   className="px-3 py-2 border rounded col-span-2"
//                   value={newField.label}
//                   onChange={(e) =>
//                     setNewField((prev) => ({ ...prev, label: e.target.value }))
//                   }
//                 />

//                 <select
//                   className="px-3 py-2 border rounded"
//                   value={newField.type}
//                   onChange={(e) =>
//                     setNewField((prev) => ({ ...prev, type: e.target.value }))
//                   }
//                 >
//                   <option value="text">Text</option>
//                   <option value="email">Email</option>
//                   <option value="tel">Phone</option>
//                   <option value="number">Number</option>
//                   <option value="textarea">Textarea</option>
//                   <option value="select">Dropdown</option>
//                   <option value="file">File Upload</option>
//                   <option value="multiFile">Multiple File Upload</option>
//                   <option value="website">Website</option>
//                   <option value="bank">Bank Details Group</option>
//                   <option value="tax">Tax Group</option>
//                 </select>

//                 <button
//                   className="bg-green-600 text-white rounded flex justify-center items-center"
//                   onClick={addField}
//                 >
//                   <Plus className="w-4 h-4" /> Add
//                 </button>
//               </div>
//             </div>

//             {/* Show existing fields */}
//             <div>
//               <h3 className="font-semibold mb-3">Form Fields</h3>
//               {formConfig.map((field) => (
//                 <div
//                   key={field.id}
//                   className="flex justify-between items-center p-3 bg-gray-100 rounded mb-2"
//                 >
//                   <span>
//                     {field.label}{" "}
//                     <span className="text-gray-500">({field.type})</span>
//                   </span>
//                   <button
//                     className="text-red-500"
//                     onClick={() => removeField(field.id)}
//                   >
//                     <Trash2 className="w-5 h-5" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ) : (
//           <div>
//             <h3 className="font-semibold mb-4">Vendor Submissions</h3>

//             {submissions.length === 0 ? (
//               <p className="text-gray-500 text-center py-6">
//                 No submissions found.
//               </p>
//             ) : (
//               submissions.map((sub) => (
//                 <div key={sub.id} className="border rounded p-4 mb-4">
//                   <h4 className="font-semibold">
//                     Submission #{sub.id}
//                   </h4>
//                   <p className="text-gray-500 text-sm">{sub.submittedAt}</p>

//                   <div className="grid grid-cols-2 gap-2 mt-4">
//                     {Object.entries(sub.data).map(([key, value]) => {
//                       const field = formConfig.find(
//                         (f) => f.id === parseInt(key)
//                       );

//                       return (
//                         <div key={key}>
//                           <strong>{field?.label}: </strong>
//                           {typeof value === "object"
//                             ? JSON.stringify(value)
//                             : value?.toString()}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
//       <div className="max-w-6xl mx-auto mb-6">
//         <div className="bg-white rounded-lg shadow inline-flex p-2 gap-2">
//           <button
//             className={`px-6 py-2 rounded-lg ${activeTab === "vendor"
//               ? "bg-blue-600 text-white"
//               : "text-gray-700"
//               }`}
//             onClick={() => setActiveTab("vendor")}
//           >
//             Vendor Portal
//           </button>

//           <button
//             className={`px-6 py-2 rounded-lg ${activeTab === "admin"
//               ? "bg-blue-600 text-white"
//               : "text-gray-700"
//               }`}
//             onClick={() => setActiveTab("admin")}
//           >
//             Admin Panel
//           </button>
//         </div>
//       </div>

//       {activeTab === "vendor" ? <VendorForm /> : <AdminPanel />}
//     </div>
//   );
// };

// export default VendorFormSystem;


import React, { useState } from 'react';
import { Upload, Plus, Trash2, Eye, Settings, Search, Download, Clock, CheckCircle, XCircle, GitBranch, Users, FileText, Home } from 'lucide-react';

const VendorFormSystem = () => {
  const [activeTab, setActiveTab] = useState("vendor");

  // INITIAL FORM CONFIG
  const [formConfig, setFormConfig] = useState([
    { id: 1, label: "Company Name", type: "text", required: true },
    { id: 2, label: "Email", type: "email", required: true },
    { id: 3, label: "Phone", type: "tel", required: true },
    { id: 4, label: "Business Type", type: "select", options: ["Manufacturer", "Supplier", "Distributor"], required: true },
    { id: 5, label: "Years in Business", type: "number", required: true },
    { id: 6, label: "Company Website", type: "website", required: false },
    { id: 7, label: "Bank Details", type: "bank", required: true },
    { id: 8, label: "Tax Registration", type: "tax", required: true },
    { id: 9, label: "Business License", type: "file", required: true },
    { id: 10, label: "Required Documents", type: "multiFile", required: true }
  ]);

  const [submissions, setSubmissions] = useState([]);
  
  // MoU DOCUMENTS STATE
  const [mouDocuments, setMouDocuments] = useState([
    {
      id: 1,
      title: "Standard Vendor Agreement",
      fileName: "vendor_agreement_v1.pdf",
      version: "1.0",
      status: "approved",
      uploadedBy: "Admin",
      uploadedDate: "2024-01-15",
      effectiveDate: "2024-02-01",
      fileSize: "2.4 MB",
      description: "Standard vendor agreement template",
      approvalHistory: [
        { approvedBy: "Legal Team", date: "2024-01-20", status: "approved" }
      ]
    },
    {
      id: 2,
      title: "Confidentiality Agreement",
      fileName: "nda_agreement_v2.pdf",
      version: "2.1",
      status: "pending",
      uploadedBy: "Admin",
      uploadedDate: "2024-01-18",
      effectiveDate: "2024-02-15",
      fileSize: "1.8 MB",
      description: "Non-disclosure agreement for vendors",
      approvalHistory: [
        { approvedBy: "Legal Team", date: "2024-01-19", status: "approved" },
        { approvedBy: "Compliance Team", date: "2024-01-25", status: "pending" }
      ]
    }
  ]);

  const [mouUploadData, setMouUploadData] = useState({
    title: "",
    description: "",
    file: null
  });

  const [searchTerm, setSearchTerm] = useState("");

  // ---------------------------------------------------------
  //   VENDOR PANEL - COMPLETE IMPLEMENTATION
  // ---------------------------------------------------------
  const VendorPanel = () => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [currentStep, setCurrentStep] = useState(1);
    const [vendorStats, setVendorStats] = useState({
      totalSubmissions: 3,
      approvedVendors: 2,
      pendingReview: 1
    });

    const handleChange = (id, value) => {
      setFormData(prev => ({ ...prev, [id]: value }));
      if (errors[id]) {
        setErrors(prev => ({ ...prev, [id]: null }));
      }
    };

    const validateForm = () => {
      const newErrors = {};
      formConfig.forEach((field) => {
        if (field.required && !formData[field.id]) {
          newErrors[field.id] = `${field.label} is required`;
        }
      });
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      const submission = {
        id: Date.now(),
        data: formData,
        submittedAt: new Date().toLocaleString(),
        status: "Pending",
        companyName: formData[1] || "Unknown Company"
      };

      setSubmissions(prev => [...prev, submission]);
      setVendorStats(prev => ({
        ...prev,
        totalSubmissions: prev.totalSubmissions + 1,
        pendingReview: prev.pendingReview + 1
      }));
      alert("Form submitted successfully!");
      setFormData({});
      setCurrentStep(1);
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
                onChange={(e) =>
                  handleChange(field.id, e.target.files[0]?.name)
                }
              />
              <label htmlFor={`file-${field.id}`} className="cursor-pointer text-blue-600 hover:text-blue-700">
                Click to upload file
              </label>
              {formData[field.id] && (
                <p className="text-sm text-green-600 mt-2">✓ {formData[field.id]}</p>
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
                    Array.from(e.target.files).map((f) => f.name)
                  )
                }
              />
              <label htmlFor={`multiFile-${field.id}`} className="cursor-pointer text-blue-600 hover:text-blue-700">
                Click to upload multiple files
              </label>
              {formData[field.id] && (
                <div className="mt-2">
                  {formData[field.id].map((file, index) => (
                    <p key={index} className="text-sm text-green-600">✓ {file}</p>
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

    return (
      <div className="max-w-6xl mx-auto">
        {/* Vendor Dashboard Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
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
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
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
          </div>
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
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formConfig.slice(0, 4).map((field) => (
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
              </div>
            )}

            {/* Step 2: Business Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {formConfig.slice(4, 8).map((field) => (
                  <div key={field.id}>
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
              </div>
            )}

            {/* Step 3: Documents */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {formConfig.slice(8).map((field) => (
                  <div key={field.id}>
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
              </div>
            )}

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

  // ---------------------------------------------------------
  //   MOU DOCUMENTS MANAGEMENT
  // ---------------------------------------------------------
  const MouDocumentsSection = () => {
    const [uploadData, setUploadData] = useState({
      title: "",
      description: "",
      file: null
    });

    const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        setUploadData(prev => ({
          ...prev,
          file: file,
          fileName: file.name
        }));
      }
    };

    const uploadNewVersion = (existingDoc) => {
      if (!uploadData.file) {
        alert("Please select a file to upload");
        return;
      }

      const newVersion = parseFloat(existingDoc.version) + 0.1;
      const newDocument = {
        ...existingDoc,
        id: Date.now(),
        fileName: uploadData.file.name,
        version: newVersion.toFixed(1),
        status: "pending",
        uploadedBy: "Admin",
        uploadedDate: new Date().toISOString().split('T')[0],
        fileSize: `${(uploadData.file.size / (1024 * 1024)).toFixed(1)} MB`,
        description: uploadData.description || existingDoc.description,
        approvalHistory: []
      };

      setMouDocuments(prev => [newDocument, ...prev]);
      setUploadData({ title: "", description: "", file: null });
      alert(`New version ${newVersion.toFixed(1)} uploaded for review`);
    };

    const approveDocument = (docId) => {
      setMouDocuments(prev => prev.map(doc => {
        if (doc.id === docId) {
          const updatedHistory = [
            ...doc.approvalHistory,
            { approvedBy: "Admin", date: new Date().toISOString().split('T')[0], status: "approved" }
          ];
          
          const allApproved = updatedHistory.every(item => item.status === "approved");
          
          return {
            ...doc,
            status: allApproved ? "approved" : "pending",
            approvalHistory: updatedHistory
          };
        }
        return doc;
      }));
    };

    const rejectDocument = (docId) => {
      setMouDocuments(prev => prev.map(doc => 
        doc.id === docId 
          ? { ...doc, status: "rejected" }
          : doc
      ));
    };

    const filteredDocuments = mouDocuments.filter(doc =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusIcon = (status) => {
      switch (status) {
        case "approved": return <CheckCircle className="w-4 h-4 text-green-500" />;
        case "pending": return <Clock className="w-4 h-4 text-yellow-500" />;
        case "rejected": return <XCircle className="w-4 h-4 text-red-500" />;
        default: return <Clock className="w-4 h-4 text-gray-500" />;
      }
    };

    const getStatusColor = (status) => {
      switch (status) {
        case "approved": return "bg-green-100 text-green-800";
        case "pending": return "bg-yellow-100 text-yellow-800";
        case "rejected": return "bg-red-100 text-red-800";
        default: return "bg-gray-100 text-gray-800";
      }
    };

    return (
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="bg-white rounded-lg p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search MoU documents by title, description, or filename..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Upload New Document */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="font-semibold mb-4 text-lg">Upload New MoU Document</h3>
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Document Title"
              className="px-3 py-2 border rounded-lg"
              value={uploadData.title}
              onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
            />
            <textarea
              placeholder="Document Description"
              className="px-3 py-2 border rounded-lg"
              rows="3"
              value={uploadData.description}
              onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
            />
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="flex-1 border rounded-lg p-2"
              />
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                onClick={() => {
                  if (!uploadData.title || !uploadData.file) {
                    alert("Please fill all fields and select a file");
                    return;
                  }
                  
                  const newDoc = {
                    id: Date.now(),
                    title: uploadData.title,
                    fileName: uploadData.file.name,
                    version: "1.0",
                    status: "pending",
                    uploadedBy: "Admin",
                    uploadedDate: new Date().toISOString().split('T')[0],
                    effectiveDate: "",
                    fileSize: `${(uploadData.file.size / (1024 * 1024)).toFixed(1)} MB`,
                    description: uploadData.description,
                    approvalHistory: []
                  };
                  
                  setMouDocuments(prev => [newDoc, ...prev]);
                  setUploadData({ title: "", description: "", file: null });
                  alert("Document uploaded for approval");
                }}
              >
                <Upload className="w-4 h-4" /> Upload New
              </button>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="font-semibold mb-4 text-lg">MoU Documents ({filteredDocuments.length})</h3>
          
          {filteredDocuments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No documents found</p>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-800">{doc.title}</h4>
                      <p className="text-gray-600 mt-1">{doc.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(doc.status)} flex items-center gap-1`}>
                        {getStatusIcon(doc.status)} {doc.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>{doc.fileName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-gray-400" />
                      <span>v{doc.version}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-gray-400" />
                      <span>{doc.fileSize}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{doc.uploadedDate}</span>
                    </div>
                  </div>

                  {/* Approval History */}
                  <div className="mb-4">
                    <h5 className="font-semibold mb-2 text-gray-700">Approval History:</h5>
                    <div className="space-y-2">
                      {doc.approvalHistory.map((approval, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="font-medium">{approval.approvedBy}</span>
                          <span className="text-gray-500">on {approval.date}</span>
                          <span className={`px-2 py-1 rounded text-xs ${approval.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {approval.status}
                          </span>
                        </div>
                      ))}
                      {doc.approvalHistory.length === 0 && (
                        <p className="text-gray-500 text-sm">No approval history</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                      <Download className="w-4 h-4" /> Download
                    </button>
                    
                    {doc.status === "pending" && (
                      <>
                        <button 
                          className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                          onClick={() => approveDocument(doc.id)}
                        >
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button 
                          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
                          onClick={() => rejectDocument(doc.id)}
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </>
                    )}
                    
                    <button 
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                      onClick={() => uploadNewVersion(doc)}
                    >
                      <GitBranch className="w-4 h-4" /> New Version
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------
  //   ADMIN PANEL - COMPLETE IMPLEMENTATION
  // ---------------------------------------------------------
  const AdminPanel = () => {
    const [viewMode, setViewMode] = useState("dashboard");
    const [newField, setNewField] = useState({
      label: "",
      type: "text",
      required: false,
    });

    const addField = () => {
      if (!newField.label) return alert("Field label required");
      setFormConfig((prev) => [...prev, { ...newField, id: Date.now() }]);
      setNewField({ label: "", type: "text", required: false });
    };

    const removeField = (id) => {
      setFormConfig((prev) => prev.filter((f) => f.id !== id));
    };

    const approveSubmission = (submissionId) => {
      setSubmissions(prev => prev.map(sub => 
        sub.id === submissionId 
          ? { ...sub, status: "Approved" }
          : sub
      ));
    };

    const rejectSubmission = (submissionId) => {
      setSubmissions(prev => prev.map(sub => 
        sub.id === submissionId 
          ? { ...sub, status: "Rejected" }
          : sub
      ));
    };

    // Admin Dashboard Stats
    const adminStats = {
      totalSubmissions: submissions.length,
      pendingReview: submissions.filter(s => s.status === "Pending").length,
      approvedVendors: submissions.filter(s => s.status === "Approved").length,
      totalDocuments: mouDocuments.length,
      pendingApprovals: mouDocuments.filter(d => d.status === "pending").length
    };

    return (
      <div className="max-w-7xl mx-auto">
        {/* Admin Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
              <p className="text-gray-600">Manage vendor registrations and MoU documents</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome,</p>
                <p className="font-semibold">Administrator</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Admin Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{adminStats.totalSubmissions}</p>
                  <p className="text-sm text-blue-800">Total Submissions</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{adminStats.pendingReview}</p>
                  <p className="text-sm text-yellow-800">Pending Review</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{adminStats.approvedVendors}</p>
                  <p className="text-sm text-green-800">Approved Vendors</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{adminStats.totalDocuments}</p>
                  <p className="text-sm text-purple-800">MoU Documents</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{adminStats.pendingApprovals}</p>
                  <p className="text-sm text-red-800">Pending Approvals</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Navigation */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setViewMode("dashboard")}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                viewMode === "dashboard" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              <Home className="w-4 h-4" /> Dashboard
            </button>
            <button
              onClick={() => setViewMode("builder")}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                viewMode === "builder" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              <Settings className="w-4 h-4" /> Form Builder
            </button>
            <button
              onClick={() => setViewMode("submissions")}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                viewMode === "submissions" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              <Eye className="w-4 h-4" /> Submissions ({submissions.length})
            </button>
            <button
              onClick={() => setViewMode("mou")}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                viewMode === "mou" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              <FileText className="w-4 h-4" /> MoU Documents
            </button>
          </div>
        </div>

        {/* DASHBOARD VIEW */}
        {viewMode === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Submissions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-lg mb-4">Recent Submissions</h3>
              {submissions.slice(0, 5).map((sub) => (
                <div key={sub.id} className="border-b py-3 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{sub.companyName}</p>
                      <p className="text-sm text-gray-500">{sub.submittedAt}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      sub.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      sub.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                </div>
              ))}
              {submissions.length === 0 && (
                <p className="text-gray-500 text-center py-4">No submissions yet</p>
              )}
            </div>

            {/* Recent MoU Documents */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-lg mb-4">Recent MoU Documents</h3>
              {mouDocuments.slice(0, 5).map((doc) => (
                <div key={doc.id} className="border-b py-3 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-sm text-gray-500">v{doc.version} • {doc.uploadedDate}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FORM BUILDER VIEW */}
        {viewMode === "builder" && (
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
            {/* Add new field */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Add New Field</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Field Label"
                  className="px-3 py-2 border rounded-lg col-span-2"
                  value={newField.label}
                  onChange={(e) =>
                    setNewField((prev) => ({ ...prev, label: e.target.value }))
                  }
                />
                <select
                  className="px-3 py-2 border rounded-lg"
                  value={newField.type}
                  onChange={(e) =>
                    setNewField((prev) => ({ ...prev, type: e.target.value }))
                  }
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="tel">Phone</option>
                  <option value="number">Number</option>
                  <option value="textarea">Textarea</option>
                  <option value="select">Dropdown</option>
                  <option value="file">File Upload</option>
                  <option value="multiFile">Multiple File Upload</option>
                  <option value="website">Website</option>
                  <option value="bank">Bank Details Group</option>
                  <option value="tax">Tax Group</option>
                </select>
                <button
                  className="bg-green-600 text-white rounded-lg flex justify-center items-center gap-2 hover:bg-green-700"
                  onClick={addField}
                >
                  <Plus className="w-4 h-4" /> Add Field
                </button>
              </div>
            </div>

            {/* Show existing fields */}
            <div>
              <h3 className="font-semibold mb-3">Form Fields ({formConfig.length})</h3>
              <div className="space-y-2">
                {formConfig.map((field) => (
                  <div
                    key={field.id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <div>
                      <span className="font-medium">{field.label}</span>
                      <span className="text-gray-500 text-sm ml-2">({field.type})</span>
                      {field.required && <span className="text-red-500 text-sm ml-2">* Required</span>}
                    </div>
                    <button
                      className="text-red-500 hover:text-red-700 p-1"
                      onClick={() => removeField(field.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBMISSIONS VIEW */}
        {viewMode === "submissions" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="font-semibold text-lg mb-4">Vendor Submissions ({submissions.length})</h3>
            {submissions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No submissions found.</p>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => (
                  <div key={sub.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{sub.companyName}</h4>
                        <p className="text-gray-500 text-sm">{sub.submittedAt}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          sub.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          sub.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {sub.status}
                        </span>
                        {sub.status === "Pending" && (
                          <div className="flex gap-2">
                            <button 
                              className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                              onClick={() => approveSubmission(sub.id)}
                            >
                              Approve
                            </button>
                            <button 
                              className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                              onClick={() => rejectSubmission(sub.id)}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(sub.data).map(([key, value]) => {
                        const field = formConfig.find(
                          (f) => f.id === parseInt(key)
                        );
                        return (
                          <div key={key} className="bg-gray-50 p-3 rounded">
                            <strong className="text-sm text-gray-600">{field?.label}: </strong>
                            <span className="text-sm">
                              {typeof value === "object"
                                ? JSON.stringify(value)
                                : value?.toString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MOU DOCUMENTS VIEW */}
        {viewMode === "mou" && <MouDocumentsSection />}
      </div>
    );
  };

  // Helper function for status colors
  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow inline-flex p-2 gap-2">
          <button
            className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
              activeTab === "vendor" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("vendor")}
          >
            <Users className="w-4 h-4" /> Vendor Portal
          </button>

          <button
            className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
              activeTab === "admin" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("admin")}
          >
            <Settings className="w-4 h-4" /> Admin Panel
          </button>
        </div>
      </div>

      {activeTab === "vendor" ? <VendorPanel /> : <AdminPanel />}
    </div>
  );
};

export default VendorFormSystem;
