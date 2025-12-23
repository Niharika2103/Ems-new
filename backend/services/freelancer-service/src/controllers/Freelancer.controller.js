// src/controllers/Freelancer.controller.js
import {
  saveFreelancerDocumentsService,
  getFreelancerDocumentsService,
} from "../services/Freelancer.services.js";
import { getSheetData } from "../services/googleSheet.js";

import pool from "../config/db.js";

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

      // ✅ Added freelancerDocument support
      freelancerDocument: files?.freelancerDocument?.[0]
        ? files.freelancerDocument[0].filename
        : null,
    };

    const updatedRow = await saveFreelancerDocumentsService(id, documentJson, gstNumber);

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


// // GET /freelancer/documents/:employeeId
// export const getFreelancerDocs = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const row = await getFreelancerDocumentsService(id);

//     if (!row) {
//       return res.status(404).json({
//         success: false,
//         message: "No document data found for this employee",
//       });
//     }

//     let parsedDoc = null;
//     try {
//       parsedDoc = row.document_url ? JSON.parse(row.document_url) : null;
//     } catch {
//       parsedDoc = row.document_url;
//     }

//     return res.status(200).json({
//       success: true,
//       data: {
//         employeeId: row.id,
//         gstNumber: row.gst,
//         document: parsedDoc,
//       },
//     });
//   } catch (err) {
//     console.error("❌ getFreelancerDocs error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error while fetching documents",
//       error: err.message,
//     });
//   }
// };



// ================== GOOGLE FORM SETTINGS ==================
export const saveGoogleForm = async (req, res) => {
  try {
    const { formUrl, sheetId } = req.body;

    if (!formUrl || !sheetId) {
      return res.status(400).json({
        success: false,
        message: "formUrl and sheetId are required",
      });
    }

    // Keep only one row
    await pool.query("DELETE FROM system_settings");

    const result = await pool.query(
      `INSERT INTO system_settings (form_url, sheet_id)
       VALUES ($1, $2)
       RETURNING *`,
      [formUrl, sheetId]
    );

    return res.status(200).json({
      success: true,
      message: "Google Form saved successfully",
      data: {
        formUrl: result.rows[0].form_url,
        sheetId: result.rows[0].sheet_id,
      },
    });
  } catch (err) {
    console.error("❌ saveGoogleForm error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while saving Google Form",
      error: err.message,
    });
  }
};

export const getGoogleForm = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT form_url, sheet_id 
       FROM system_settings 
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No Google Form found",
        data: null,
      });
    }

    const row = result.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        formUrl: row.form_url,
        sheetId: row.sheet_id,
      },
    });
  } catch (err) {
    console.error("❌ getGoogleForm error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching Google Form",
      error: err.message,
    });
  }
};


// ================== SHEET → DB SYNC ==================
export const syncFreelancerSheet = async (req, res) => {
  try {
    console.log("🔄 Syncing Google Sheet...");
    const rows = await getSheetData();

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No rows found in sheet",
      });
    }

    for (let r of rows) {
      console.log("📌 Inserting row:", r);

      await pool.query(
  `INSERT INTO freelancer_responses 
   (name, email, role, project_cost, experience, other_details,terms)
   VALUES ($1, $2, $3, $4, $5, $6,$7) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    project_cost = EXCLUDED.project_cost,
    experience = EXCLUDED.experience,
    other_details = EXCLUDED.other_details,
    terms = EXCLUDED.terms,
    submitted_at = NOW();
`,
  [
    r.name ?? "",
    r.email ?? "",
    r.role ?? "",
    r.project_cost ?? "",
    r.experience ?? "",
    r.other_details ?? "",
    r.terms ?? ""
  ]
);

    }

    return res.status(200).json({
      success: true,
      message: "Sheet synced successfully",
      added: rows.length,
    });

  } catch (err) {
    console.error("❌ Sync Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal error syncing sheet",
      error: err.message,
    });
  }
};



// ================== LIST / APPROVE / REJECT ==================
export const listFreelancers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM freelancer_responses ORDER BY submitted_at DESC"
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("❌ List Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error fetching freelancers",
      error: err.message,
    });
  }
};

export const approveFreelancer = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("UPDATE freelancer_responses SET status='approved' WHERE id=$1", [id]);

    return res.status(200).json({
      success: true,
      message: "Freelancer approved successfully",
    });
  } catch (err) {
    console.error("❌ Approve Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error approving freelancer",
      error: err.message,
    });
  }
};

export const rejectFreelancer = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("UPDATE freelancer_responses SET status='rejected' WHERE id=$1", [id]);

    return res.status(200).json({
      success: true,
      message: "Freelancer rejected successfully",
    });
  } catch (err) {
    console.error("❌ Reject Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error rejecting freelancer",
      error: err.message,
    });
  }
};






