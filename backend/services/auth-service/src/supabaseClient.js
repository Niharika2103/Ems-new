import dotenv from "dotenv";
dotenv.config();   // must be first

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("SUPABASE_URL:", supabaseUrl);
  console.error("SUPABASE_KEY:", supabaseKey ? "Loaded ✅" : "Missing ❌");
  throw new Error("Missing Supabase environment variables. Check .env file.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
