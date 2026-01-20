// import React, { useState, useRef } from 'react';
import React, { useState, useRef, useEffect } from 'react';

import { FileText, Download, Upload, CheckCircle, Edit, Save, Send } from 'lucide-react';
import axios from "axios";

import { toast } from "react-toastify";


const MoUGenerationSystem = () => {
  const [activeView, setActiveView] = useState('template'); // 'template', 'generate', 'preview', 'sign'
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // MoU Template
  const [mouTemplate, setMouTemplate] = useState({
    title: "MEMORANDUM OF UNDERSTANDING",
    sections: [
      { id: 1, title: "Parties", content: "This MoU is entered into on {{date}} between:\n\nParty A: {{company_name}}\nAddress: {{company_address}}\nRepresented by: {{company_representative}}\n\nAND\n\nParty B: {{vendor_name}}\nAddress: {{vendor_address}}\nRepresented by: {{vendor_representative}}" },
      { id: 2, title: "Purpose", content: "The purpose of this MoU is to establish a partnership for {{purpose}}." },
      { id: 3, title: "Scope of Work", content: "{{vendor_name}} agrees to provide the following services:\n\n{{scope_of_work}}" },
      { id: 4, title: "Terms and Conditions", content: "1. Duration: {{duration}}\n2. Payment Terms: {{payment_terms}}\n3. Delivery Schedule: {{delivery_schedule}}" },
      { id: 5, title: "Confidentiality", content: "Both parties agree to maintain confidentiality of proprietary information shared during the course of this partnership." },
      { id: 6, title: "Termination", content: "Either party may terminate this MoU with {{notice_period}} days written notice." }
    ]
  });

  // Vendor Data
  // const [vendorData, setVendorData] = useState({
  //   vendor_name: "Tech Solutions Pvt Ltd",
  //   vendor_address: "123 Business Park, Mumbai, Maharashtra",
  //   vendor_representative: "Mr. Rajesh Kumar",
  //   company_name: "ABC Corporation",
  //   company_address: "456 Corporate Tower, Pune, Maharashtra",
  //   company_representative: "Ms. Priya Sharma",
  //   date: new Date().toLocaleDateString('en-IN'),
  //   purpose: "Software Development and IT Services",
  //   scope_of_work: "Web application development, Mobile app development, Cloud infrastructure management",
  //   duration: "12 months from the date of signing",
  //   payment_terms: "Net 30 days from invoice date",
  //   delivery_schedule: "As per project milestones agreed separately",
  //   notice_period: "30"
  // });


const [vendors, setVendors] = useState([]);
const [selectedVendor, setSelectedVendor] = useState("");
const [mouFile, setMouFile] = useState(null);
const [effectiveFrom, setEffectiveFrom] = useState("");
const [expiresAt, setExpiresAt] = useState("");


useEffect(() => {
  axios.get("/vendor")
    .then(res => setVendors(res.data))
    .catch(err => {
      console.error("Vendor fetch error", err);
      toast.error("Failed to load vendors");
    });
}, []);



  const [generatedMoU, setGeneratedMoU] = useState('');
  const [signature, setSignature] = useState(null);
  const [signedDocuments, setSignedDocuments] = useState([]);

  // Replace placeholders in template
  const generateMoU = () => {
    let document = `${mouTemplate.title}\n\n`;
    
    mouTemplate.sections.forEach(section => {
      document += `${section.title.toUpperCase()}\n`;
      document += `${'='.repeat(50)}\n\n`;
      
      let content = section.content;
      Object.keys(vendorData).forEach(key => {
        const placeholder = `{{${key}}}`;
        content = content.replaceAll(placeholder, vendorData[key]);
      });
      
      document += `${content}\n\n`;
    });

    document += `\n${'='.repeat(50)}\n\n`;
    document += `SIGNATURES\n\n`;
    document += `For ${vendorData.company_name}:\n\n`;
    document += `Signature: _________________\n`;
    document += `Name: ${vendorData.company_representative}\n`;
    document += `Date: ${vendorData.date}\n\n\n`;
    document += `For ${vendorData.vendor_name}:\n\n`;
    document += `Signature: _________________\n`;
    document += `Name: ${vendorData.vendor_representative}\n`;
    document += `Date: ${vendorData.date}\n`;

    setGeneratedMoU(document);
    setActiveView('preview');
  };

  

  // Template Editor View
  const TemplateEditor = () => (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <FileText className="w-8 h-8 text-blue-600" />
        MoU Template Editor
      </h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Document Title</label>
        <input
          type="text"
          value={mouTemplate.title}
          onChange={(e) => setMouTemplate(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-4 mb-6">
        {mouTemplate.sections.map((section, idx) => (
          <div key={section.id} className="border rounded-lg p-4 bg-gray-50">
            <input
              type="text"
              value={section.title}
              onChange={(e) => {
                const newSections = [...mouTemplate.sections];
                newSections[idx].title = e.target.value;
                setMouTemplate(prev => ({ ...prev, sections: newSections }));
              }}
              className="w-full px-3 py-2 border rounded-lg mb-3 font-semibold"
            />
            <textarea
              value={section.content}
              onChange={(e) => {
                const newSections = [...mouTemplate.sections];
                newSections[idx].content = e.target.value;
                setMouTemplate(prev => ({ ...prev, sections: newSections }));
              }}
              rows="4"
              className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
            />
            <div className="mt-2 text-xs text-gray-500">
              Available placeholders: {'{'}{'{'} vendor_name, company_name, date, purpose, etc. {'}'}{'}'}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setActiveView('generate')}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
      >
        Continue to Generate MoU
      </button>
    </div>
  );

  // Data Input View
  // const DataInputView = () => (
  //   <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-8">
  //     <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
  //       <Edit className="w-8 h-8 text-blue-600" />
  //       Enter Vendor-Specific Data
  //     </h2>

  //     <div className="grid grid-cols-2 gap-6 mb-6">
  //       {Object.keys(vendorData).map(key => (
  //         <div key={key}>
  //           <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
  //             {key.replace(/_/g, ' ')}
  //           </label>
  //           {key === 'scope_of_work' ? (
  //             <textarea
  //               value={vendorData[key]}
  //               onChange={(e) => setVendorData(prev => ({ ...prev, [key]: e.target.value }))}
  //               rows="3"
  //               className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
  //             />
  //           ) : (
  //             <input
  //               type="text"
  //               value={vendorData[key]}
  //               onChange={(e) => setVendorData(prev => ({ ...prev, [key]: e.target.value }))}
  //               className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
  //             />
  //           )}
  //         </div>
  //       ))}
  //     </div>

  //     <div className="flex gap-4">
  //       <button
  //         onClick={() => setActiveView('template')}
  //         className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
  //       >
  //         Back to Template
  //       </button>
  //       <button
  //         onClick={generateMoU}
  //         className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
  //       >
  //         Generate MoU Document
  //       </button>
  //     </div>
  //   </div>
  // );




  const DataInputView = () => (
  <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-8">
    <h2 className="text-3xl font-bold mb-6">Upload New MoU Document</h2>

    <select
      value={selectedVendor}
      onChange={(e) => setSelectedVendor(e.target.value)}
      className="w-full border rounded p-3 mb-4"
    >
      <option value="">Select Vendor</option>
      {vendors.map(v => (
        <option key={v.id} value={v.id}>
          {v.company_name} ({v.email})
        </option>
      ))}
    </select>

    <input
      type="date"
      value={effectiveFrom}
      onChange={(e) => setEffectiveFrom(e.target.value)}
      className="w-full border rounded p-3 mb-4"
    />

    <input
      type="date"
      value={expiresAt}
      onChange={(e) => setExpiresAt(e.target.value)}
      className="w-full border rounded p-3 mb-4"
    />

    <input
      type="file"
      onChange={(e) => setMouFile(e.target.files[0])}
      className="w-full border rounded p-3 mb-6"
    />

    <button
      onClick={handleUploadMoU}
      className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
    >
      Upload MoU
    </button>
  </div>
);


  // Preview View
  const PreviewView = () => (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          MoU Preview
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const blob = new Blob([generatedMoU], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `MoU_${vendorData.vendor_name}_${Date.now()}.txt`;
              a.click();
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download
          </button>
          <button
            onClick={() => setActiveView('sign')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> Sign Document
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-8 rounded-lg border-2 border-gray-200 max-h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed">
          {generatedMoU}
        </pre>
      </div>

      <button
        onClick={() => setActiveView('generate')}
        className="w-full mt-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
      >
        Back to Edit Data
      </button>
    </div>
  );

  // Digital Signature View
  const SignatureView = () => {
    const startDrawing = (e) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      setIsDrawing(true);
    };

    const draw = (e) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const stopDrawing = () => {
      setIsDrawing(false);
    };

    const clearSignature = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const saveSignature = () => {
      const canvas = canvasRef.current;
      const signatureData = canvas.toDataURL();
      setSignature(signatureData);
      
      const signedDoc = {
        id: Date.now(),
        vendorName: vendorData.vendor_name,
        document: generatedMoU,
        signature: signatureData,
        signedAt: new Date().toLocaleString('en-IN'),
        status: 'Signed'
      };
      
      setSignedDocuments(prev => [...prev, signedDoc]);
      alert('Document signed successfully!');
      setActiveView('signed');
    };
   

  const handleUploadMoU = async () => {
  if (!selectedVendor || !mouFile || !effectiveFrom || !expiresAt) {
    toast.error("All fields are required");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("vendor_id", selectedVendor);
    formData.append("mou_effective_from", effectiveFrom);
    formData.append("mou_expires_at", expiresAt);
    formData.append("mou_file", mouFile);

    await axios.post("/vendor/upload-mou", formData);

    toast.success("MoU uploaded successfully");

    setSelectedVendor("");
    setMouFile(null);
    setEffectiveFrom("");
    setExpiresAt("");
  } catch (err) {
    console.error("Upload error", err);
    toast.error("MoU upload failed");
  }
};

    return (
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <Edit className="w-8 h-8 text-blue-600" />
          Digital Signature
        </h2>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">Please sign below to confirm your agreement to the MoU terms:</p>
          <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
            <canvas
              ref={canvasRef}
              width="700"
              height="200"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="bg-white border rounded cursor-crosshair w-full"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={clearSignature}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Clear
          </button>
          <button
            onClick={() => setActiveView('preview')}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Back
          </button>
          <button
            onClick={saveSignature}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" /> Sign & Complete
          </button>
        </div>
      </div>
    );
  };

  // Signed Documents View
  const SignedDocumentsView = () => (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <CheckCircle className="w-8 h-8 text-green-600" />
        Signed Documents
      </h2>

      {signedDocuments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No signed documents yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {signedDocuments.map(doc => (
            <div key={doc.id} className="border rounded-lg p-6 bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{doc.vendorName}</h3>
                  <p className="text-sm text-gray-500">Signed on: {doc.signedAt}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {doc.status}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Digital Signature:</p>
                <img src={doc.signature} alt="Signature" className="border rounded h-20" />
              </div>

              <button
                onClick={() => {
                  const fullDoc = `${doc.document}\n\n[DIGITALLY SIGNED]\nSignature captured on: ${doc.signedAt}`;
                  const blob = new Blob([fullDoc], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Signed_MoU_${doc.vendorName}_${doc.id}.txt`;
                  a.click();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Signed Document
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setActiveView('generate')}
        className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
      >
        Create New MoU
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white rounded-lg shadow p-2 inline-flex gap-2">
          <button
            onClick={() => setActiveView('template')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeView === 'template' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Template
          </button>
          <button
            onClick={() => setActiveView('generate')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeView === 'generate' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Generate
          </button>
          <button
            onClick={() => activeView === 'preview' && setActiveView('preview')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeView === 'preview' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveView('signed')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeView === 'signed' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Signed Docs ({signedDocuments.length})
          </button>
        </div>
      </div>

      {/* {activeView === 'template' && <TemplateEditor />}
      {activeView === 'generate' && <DataInputView />}
      {activeView === 'preview' && <PreviewView />}
      {activeView === 'sign' && <SignatureView />}
      {activeView === 'signed' && <SignedDocumentsView />} */}
      {activeView === 'generate' && <DataInputView />}

    </div>
  );
};

export default MoUGenerationSystem;