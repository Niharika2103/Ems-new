import db from "../config/db.js";

export async function getCompanyName() {
  const res = await db.query("SELECT settings FROM system_settings LIMIT 1");

  if (res.rows.length === 0) return "Zentrix";

  const settings = res.rows[0].settings || {};

  return settings.company_name || "Zentrix";
}
