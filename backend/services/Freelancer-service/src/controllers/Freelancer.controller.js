// src/controllers/Freelancer.controller.js
import {
  saveFreelancerDocumentsService,
  getFreelancerDocumentsService,
} from "../services/Freelancer.services.js";

// POST /freelancer/documents/upload
export const uploadFreelancerDocs = async (req, res) => {
  try {
    const { id, gstNumber } = req.body;
    const files = req.files;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Id is required",
      });
    }

    // store only file names 
    const documentJson = {
      bankPassbook: files?.bankPassbook?.[0] ? files.bankPassbook[0].filename : null,
      aadhaarCard: files?.aadhaarCard?.[0] ? files.aadhaarCard[0].filename : null,
      panCard: files?.panCard?.[0] ? files.panCard[0].filename : null,
      gstCertificate: files?.gstCertificate?.[0] ? files.gstCertificate[0].filename : null,
      gstReturns: files?.gstReturns ? files.gstReturns.map(f => f.filename) : [],
      photo: files?.photo?.[0] ? files.photo[0].filename : null,
    };

    const updatedRow = await saveFreelancerDocumentsService(id, documentJson,gstNumber);

    return res.status(200).json({
      success: true,
      message: "Documents uploaded & saved successfully",
      data: {
        id,
        gstNumber,
        document: documentJson,
        dbRow: updatedRow,
      },
    });
  } catch (err) {
    console.error("❌ uploadFreelancerDocs error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error during upload",
      error: err.message,
    });
  }
};


// GET /freelancer/documents/:employeeId
export const getFreelancerDocs = async (req, res) => {
  try {
    const { id } = req.params;

    const row = await getFreelancerDocumentsService(id);

    if (!row) {
      return res.status(404).json({
        success: false,
        message: "No document data found for this employee",
      });
    }

    let parsedDoc = null;
    try {
      parsedDoc = row.document_url ? JSON.parse(row.document_url) : null;
    } catch {
      parsedDoc = row.document_url;
    }

    return res.status(200).json({
      success: true,
      data: {
        employeeId: row.id,
        gstNumber:row.gst,
        document: parsedDoc,
      },
    });
  } catch (err) {
    console.error("❌ getFreelancerDocs error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching documents",
      error: err.message,
    });
  }
};


