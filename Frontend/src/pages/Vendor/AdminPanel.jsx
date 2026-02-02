import React, { useState, useEffect } from 'react';
import axios from "axios";
import { toast } from "react-toastify";
import { Upload, Plus, Trash2, Eye, Settings, Search, Download, Clock, CheckCircle, XCircle, GitBranch, Users, FileText, Home } from 'lucide-react';
import { useSelector, useDispatch } from "react-redux";
//import { addField, removeField,updateSubmissions  } from "../../features/vendor/formSlice";
import { addField, removeField } from "../../features/vendor/formSlice";
import { API_BASES, AUTH_API } from "../../utils/constants";


// Form configuration
// const formConfig = [
//   { id: 1, label: "Company Name", type: "text", required: true },
//   { id: 2, label: "Email", type: "email", required: true },
//   { id: 3, label: "Phone", type: "tel", required: true },
//   { id: 4, label: "Business Type", type: "select", options: ["Manufacturer", "Supplier", "Distributor"], required: true },
//   { id: 5, label: "Years in Business", type: "number", required: true },
//   { id: 6, label: "Company Website", type: "website", required: false },
//   { id: 7, label: "Bank Details", type: "bank", required: true },
//   { id: 8, label: "Tax Registration", type: "tax", required: true },
//   { id: 9, label: "Business License", type: "file", required: true },
//   { id: 10, label: "Required Documents", type: "multiFile", required: true }
// ];

const AdminPanel = () => {
      const dispatch = useDispatch();
      const formConfig = useSelector((state) => state.form.formConfig);
  //const submissions = useSelector((state) => state.form.submissions);
  const [submissions, setSubmissions] = useState([]);

  const [viewMode, setViewMode] = useState("dashboard");
  const [newField, setNewField] = useState({
    label: "",
    type: "text",
    required: false,
  });

  // Load data from localStorage
//   const [submissions, setSubmissions] = useState([]);
useEffect(() => {
  fetchVendors();
  fetchMoUDocuments();
}, []);

const fetchVendors = async () => {
  try {
    const res = await fetch(`${AUTH_API.VENDOR}`);
    const data = await res.json();
    setSubmissions(data);
  } catch (err) {
    console.error("Failed to fetch vendors", err);
  }
};

const fetchMoUDocuments = async () => {
  try {
    //const res = await axios.get("http://localhost:5006/vendor/admin/mou-documents");
    const res = await axios.get(`${API_BASES.VENDOR}/vendor/admin/mou-documents`);
    setMouDocuments(res.data.documents || []);
  } catch (err) {
    console.error("Failed to fetch MoU documents", err);
  }
};


  const [mouDocuments, setMouDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

 

// const updateVendorStatus = async (vendorId, status) => {
//   try {
//     //await fetch(`${AUTH_API.VENDOR}/admin/vendors/${vendorId}/status`, {
//     await fetch(`${AUTH_API.VENDOR}/${vendorId}/status`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ status }),
//     });

//     fetchVendors(); // refresh UI
//   } catch (err) {
//     console.error("Failed to update vendor status", err);
//   }
// };
const updateVendorStatus = async (vendorId, status) => {
  try {
    const res = await fetch(`${AUTH_API.VENDOR}/${vendorId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to update status");
      return;
    }

    await fetchVendors(); // refresh list
  } catch (err) {
    console.error("Failed to update vendor status", err);
    alert("Server error while updating status");
  }
};



  
const handleAddField = () => {
  if (!newField.label) {
    alert("Field label required");
    return;
  }

  dispatch(addField(newField)); // Redux action works
  setNewField({ label: "", type: "text", required: false });
};

const handleRemoveField = (id) => {
  dispatch(removeField(id)); // Redux action works
};


  // const approveSubmission = (submissionId) => {
  //   const updatedSubmissions = submissions.map(sub => 
  //     sub.id === submissionId 
        // ? { ...sub, status: "Approved" }
  //       : sub
  //   );
  //   dispatch(updateSubmissions(updated));
  //   localStorage.setItem('vendorSubmissions', JSON.stringify(updatedSubmissions));
  // };

  // const rejectSubmission = (submissionId) => {
  //   const updatedSubmissions = submissions.map(sub => 
  //     sub.id === submissionId 
  //       ? { ...sub, status: "Rejected" }
  //       : sub
  //   );
  //   //dispatch(updateSubmissions(updated));
  //   localStorage.setItem('vendorSubmissions', JSON.stringify(updatedSubmissions));
  // };

  // Admin Dashboard Stats
  const adminStats = {
  totalSubmissions: (submissions || []).length,
  pendingReview: (submissions || []).filter(s => s.status === "Pending").length,
  approvedVendors: (submissions || []).filter(s => s.status === "Approved").length,
  totalDocuments: mouDocuments.length,
  pendingApprovals: mouDocuments.filter(d => d.mou_status?.toLowerCase() === "pending").length
};


  // MoU Documents Functions
  // const [uploadData, setUploadData] = useState({
  //   title: "",
  //   description: "",
  //   file: null
  // });

  const [uploadData, setUploadData] = useState({
  vendorId: "",
  title: "",
  description: "",
  validFrom: "",
  validTill: "",
  file: null
});
const fileInputRef = React.useRef(null);



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

    const updatedDocuments = [newDocument, ...mouDocuments];
    setMouDocuments(updatedDocuments);
    localStorage.setItem('mouDocuments', JSON.stringify(updatedDocuments));
   setUploadData(prev => ({
  ...prev,
  title: "",
  description: ""
}));

    alert(`New version ${newVersion.toFixed(1)} uploaded for review`);
  };

  const approveDocument = (docId) => {
    const updatedDocuments = mouDocuments.map(doc => {
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
    });
    
    setMouDocuments(updatedDocuments);
    localStorage.setItem('mouDocuments', JSON.stringify(updatedDocuments));
  };

  const rejectDocument = (docId) => {
    const updatedDocuments = mouDocuments.map(doc => 
      doc.id === docId 
        ? { ...doc, status: "rejected" }
        : doc
    );
    
    setMouDocuments(updatedDocuments);
    localStorage.setItem('mouDocuments', JSON.stringify(updatedDocuments));
  };

  const filteredDocuments = mouDocuments.filter(doc =>
  doc.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  doc.mou_file.toLowerCase().includes(searchTerm.toLowerCase())
);


  const getStatusIcon = (status) => {
    switch (status) {
      case "approved": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "rejected": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  // const getStatusColor = (status) => {
  //   switch (status) {
  //     case "approved": return "bg-green-100 text-green-800";
  //     case "pending": return "bg-yellow-100 text-yellow-800";
  //     case "rejected": return "bg-red-100 text-red-800";
  //     default: return "bg-gray-100 text-gray-800";
  //   }
  // };

      const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case "active": return "bg-green-100 text-green-800";
        case "pending": return "bg-yellow-100 text-yellow-800";
        case "rejected": return "bg-red-100 text-red-800";
        default: return "bg-gray-100 text-gray-800";
      }
    };
    
     const isExpired = (expiresAt) => {
      return new Date(expiresAt) < new Date();
    };



  const MouDocumentsSection = () => (
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

          <select
      className="px-3 py-2 border rounded-lg"
      value={uploadData.vendorId}
      onChange={(e) =>
        setUploadData(prev => ({ ...prev, vendorId: e.target.value }))
      }
    >
      <option value="">Select Vendor</option>
      {(submissions || [])
        .filter(v => v.status === "Approved")
        .map(v => (
          <option key={v.id} value={v.id}>
            {v.company_name}
          </option>
        ))}
    </select>

    
          <input
            type="text"
            className="px-3 py-2 border rounded-lg"
            placeholder="Document Title"
            value={uploadData.title}
            onChange={(e) =>
            setUploadData(prev => ({ ...prev, title: e.target.value }))
          }

          />

          <textarea
            className="px-3 py-2 border rounded-lg resize-none"
            placeholder="Document Description"
            rows={3}
            value={uploadData.description}
            onChange={(e) =>
              setUploadData(prev => ({ ...prev, description: e.target.value }))
            }

          />

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="date"
            className="px-3 py-2 border rounded-lg"
            value={uploadData.validFrom}
            onChange={(e) =>
              setUploadData(prev => ({ ...prev, validFrom: e.target.value }))
            }
          />

          <input
            type="date"
            className="px-3 py-2 border rounded-lg"
            value={uploadData.validTill}
            onChange={(e) =>
              setUploadData(prev => ({ ...prev, validTill: e.target.value }))
            }
          />
        </div>

        <div className="flex flex-col gap-1 mt-4">
          <input
              type="file"
              name="mou_file"
              accept=".pdf,.doc,.docx"
              onChange={(e) =>
                setUploadData(prev => ({ ...prev, file: e.target.files[0] }))
              }
              className="flex-1 border rounded-lg p-2 cursor-pointer"
            />

            {uploadData.file && (
              <p className="text-sm text-gray-600 mt-1">
                Selected File: <span className="font-medium">{uploadData.file.name}</span>
              </p>
            )}

           <button
            className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
         onClick={async () => {
            if (
              !uploadData.vendorId ||
              !uploadData.title ||
              !uploadData.file ||
              !uploadData.validFrom ||
              !uploadData.validTill
            ) {
              toast.error("Please fill all fields and select a file");
              return;
            }

            try {
              const formData = new FormData();
              formData.append("vendor_id", uploadData.vendorId);
              formData.append("mou_effective_from", uploadData.validFrom);
              formData.append("mou_expires_at", uploadData.validTill);
              formData.append("mou_file", uploadData.file);

              const res = await axios.post(
                `${API_BASES.VENDOR}/vendor/upload-mou`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
              );

              if (res.data?.success) {
                toast.success("MoU uploaded successfully");
                fetchMoUDocuments(); // refresh list

                setUploadData({
                  vendorId: "",
                  title: "",
                  description: "",
                  file: null,
                  validFrom: "",
                  validTill: "",
                });
              }
            } catch (err) {
              console.error("MoU upload failed:", err);
              toast.error("MoU upload failed");
            }
          }}


          >
            <Upload className="w-4 h-4" /> Submit
          </button>

          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg p-6">
       <h3 className="font-semibold mb-4 text-lg">
        MoU Documents ({(filteredDocuments || []).length})
      </h3>

        
        {(filteredDocuments || []).length === 0 ? (
          <p className="text-gray-500 text-center py-8">No documents found</p>
        ) : (
          <div className="space-y-4">
            {(filteredDocuments || []).map((doc) => (
              <div key={doc.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-gray-800">{doc.company_name}</h4>
                    <p className="text-sm text-gray-500">
                      File: {doc.mou_file.replace(/^\d+-/, "")}
                    </p>


                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(doc.mou_status)} flex items-center gap-1`}>
                    {/* {getStatusIcon(doc.status)} {doc.mou_status.toUpperCase()} */}
                    {doc.mou_status.toUpperCase()}


                    </span>
                  </div>
                </div>

               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span>{doc.mou_file}</span>
                </div>

                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-gray-400" />
                  <span>
                    From: {new Date(doc.mou_effective_from).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-gray-400" />
                  <span>
                    To: {new Date(doc.mou_expires_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>
                    Uploaded: {new Date(doc.mou_uploaded_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
               
               {doc.signed_mou_file && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Signed</span>
                </div>
              )}


                {/* Approval History */}
                <div className="mb-4">
                  <h5 className="font-semibold mb-2 text-gray-700">Approval History:</h5>
                  <div className="space-y-2">
                    {(doc.approvalHistory || []).map((approval, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="font-medium">{approval.approvedBy}</span>
                        <span className="text-gray-500">on {approval.date}</span>
                        <span className={`px-2 py-1 rounded text-xs ${approval.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {approval.status}
                        </span>
                      </div>
                    ))}
                    {(doc.approvalHistory || []).length === 0 && (
                      <p className="text-gray-500 text-sm">No approval history</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
               <div className="flex flex-wrap items-center gap-4 mt-4">
                {/* Download MoU - Always visible */}
                <a
                  href={`${API_BASES.VENDOR}/vendor/download/${doc.signed_mou_file || doc.mou_file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition 
                    ${doc.signed_mou_file 
                      ? "bg-green-100 text-green-700 hover:bg-green-200" 
                      : "bg-sky-100 text-sky-700 hover:bg-sky-200"}`}
                >
                  <Download className="w-4 h-4" />
                  {doc.signed_mou_file ? "Download Signed MoU" : "Download MoU"}
                </a>

                {/* New Version - Only if expired */}
                {isExpired(doc.mou_expires_at) && (
                  <button
                    onClick={() => {
                      setUploadData({
                        vendorId: doc.vendor_id,
                        title: "Renewed MoU",
                        description: "MoU renewal after expiry",
                        validFrom: "",
                        validTill: "",
                        file: null
                      });
                      toast.info("Upload new MoU version for this vendor");
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium hover:bg-orange-200 transition"
                  >
                    <GitBranch className="w-4 h-4" />
                    New Version
                  </button>
                )}
              </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

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
           <Eye className="w-4 h-4" /> Submissions ({(submissions || []).length})

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
                    {/* <p className="font-medium">{sub.companyName}</p>
                    <p className="text-sm text-gray-500">{sub.submittedAt}</p> */}
                    <p className="font-medium">{sub.company_name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(sub.created_at).toLocaleString()}
                    </p>

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
            {(submissions || []).length === 0 && (
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
                    <p className="font-medium">{doc.company_name}</p>
                    <p className="text-sm text-gray-500">
                      Expires:{" "}
                      {new Date(doc.mou_expires_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      isExpired(doc.mou_expires_at)
                        ? "bg-red-100 text-red-800"
                        : getStatusColor(doc.mou_status)
                    }`}
                  >
                  {isExpired(doc.mou_expires_at) ? "EXPIRED" : doc.mou_status.toUpperCase()}
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
                onClick={handleAddField}
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
                    onClick={() => handleRemoveField(field.id)}
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
    <h3 className="font-semibold text-lg mb-4">
      Vendor Submissions ({submissions.length})
    </h3>

    {submissions.length === 0 ? (
      <p className="text-gray-500 text-center py-8">
        No submissions found.
      </p>
    ) : (
      <div className="space-y-4">
        {submissions.map((sub) => (
          <div
            key={sub.id}
            className="border rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            {/* HEADER */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold text-lg">
                  {sub.company_name}
                </h4>
                <p className="text-gray-500 text-sm">
                  {new Date(sub.created_at).toLocaleString()}
                </p>
              </div>

              {/* STATUS + ACTIONS */}
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    sub.status === "Approved"
                      ? "bg-green-100 text-green-800"
                      : sub.status === "Rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {sub.status}
                </span>

                { sub.status === "Approved" && (
  <>
                { !(mouDocuments || []).some(m => 
                m.id === sub.id && m.mou_status === "active"
              ) && (

                  <span className="text-red-600 text-sm">
                    ⚠ No Active MoU
                  </span>
                )}
              </>
            )}


                {sub.status === "Pending" && (
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                      onClick={() =>
                        //updateVendorStatus(sub.id, "Approved")
                        updateVendorStatus(sub.id, "Approved")
                      }
                    >
                      Approve
                    </button>

                    <button
                      className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                      onClick={() =>
                       // updateVendorStatus(sub.id, "Rejected")
                       updateVendorStatus(sub.id, "Rejected")
                      }
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <strong>Email:</strong> {sub.email}
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <strong>Phone:</strong> {sub.phone}
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <strong>Business Type:</strong> {sub.business_type}
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <strong>Years in Business:</strong> {sub.years_in_business}
              </div>
              <div className="bg-gray-50 p-3 rounded col-span-2">
              <strong>Website:</strong>{" "}
              {sub.company_website ? (
                <a
                  href={sub.company_website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {sub.company_website}
                </a>
              ) : (
                <span className="text-gray-500">Not provided</span>
              )}
            </div>
            {sub.bank_details && (
            <div className="bg-gray-50 p-3 rounded col-span-2">
              <strong>Bank Details:</strong>
              <div className="mt-1 text-sm">
                <div>Account Holder: {sub.bank_details.holder}</div>
                <div>Account No: {sub.bank_details.accNo}</div>
                <div>IFSC: {sub.bank_details.ifsc}</div>
                <div>Bank Name: {sub.bank_details.bankName}</div>
              </div>
            </div>
          )}
          {sub.tax_registration && (
            <div className="bg-gray-50 p-3 rounded col-span-2">
              <strong>Tax Registration:</strong>
              <div className="mt-1 text-sm">
                <div>PAN: {sub.tax_registration.pan}</div>
                <div>GST: {sub.tax_registration.gst}</div>
                <div>TAN: {sub.tax_registration.tan}</div>
              </div>
            </div>
          )}
            </div>

            {/* DOCUMENTS */}
            <div className="mt-4">
              <h5 className="font-medium mb-2">Documents</h5>

             {/* Business License */}
            {sub.business_license && (
              <div className="flex justify-between items-center border p-3 rounded mb-2">
                <span>Business License</span>
                <a
                  href={`${API_BASES.VENDOR}/vendor/download/${sub.business_license}`}
                  download
                  className="text-blue-600 hover:underline"
                >
                  Download
                </a>
              </div>
            )}

            {/* Required Documents */}
            {Array.isArray(sub.required_documents) &&
              sub.required_documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border p-3 rounded mb-2"
                >
                  <span>Document {index + 1}</span>
                  <a
                    href={`${API_BASES.VENDOR}/vendor/download/${doc}`}   
                    download
                    className="text-blue-600 hover:underline"
                  >
                    Download
                  </a>
                </div>
            ))}

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

export default AdminPanel;