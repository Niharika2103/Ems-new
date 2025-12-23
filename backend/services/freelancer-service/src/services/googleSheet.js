import { google } from "googleapis";
import pool from "../config/db.js";   

export const getSheetData = async () => {
  console.log("⚠️ DEBUG: Starting Google Sheet fetch");

  const settings = await pool.query(
    "SELECT sheet_id FROM system_settings LIMIT 1"
  );

  console.log("⚠️ DEBUG: system_settings =", settings.rows);

  if (settings.rows.length === 0) {
    throw new Error("No sheet_id configured in system_settings");
  }

  const SHEET_ID = settings.rows[0].sheet_id;
  console.log("⚠️ DEBUG: SHEET_ID =", SHEET_ID);

  const auth = new google.auth.GoogleAuth({
    keyFile: "google-credentials.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  console.log("⚠️ DEBUG: Fetching from sheet tab → Form responses 1");

  // IMPORTANT FIX: Use exact sheet name + range A:G
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Form responses 1!A:Z"

  });

  console.log("⚠️ DEBUG: Raw response =", response.data.values);

  const rows = response.data.values || [];

  if (rows.length === 0) {
    console.log("❌ NO DATA FOUND IN SHEET");
  }

  rows.shift(); // remove header row

  console.log("⚠️ DEBUG: After removing header =", rows);

  // Mapping matches screenshot EXACTLY
  return rows.map((r) => ({
    name: r[1] || null,
    email: r[2] || null,
    role: r[3] || null,
    project_cost: r[4] || null,
    experience: r[5] || null,
    other_details: r[6] || null,
    terms:r[7] || null,
  }));
};
