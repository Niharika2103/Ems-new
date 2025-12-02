// import pool from "../config/db.js";

// export const getPanelMembers = async (req, res) => {
//   try {
//     const query = `
//       SELECT id, name, email, department, role
//       FROM user_employees_master
//       WHERE is_active = true 
//         AND (role = 'HR' OR role = 'INTERVIEW_PANEL')
//     `;

//     const result = await pool.query(query);

//     res.json({ success: true, panel_members: result.rows });

//   } catch (error) {
//     console.error("Get Panel Members Error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };
