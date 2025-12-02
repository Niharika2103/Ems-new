import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import vendorRoutes from "./routes/vendorRoutes.js";
import path from "path";
import pool from "./config/db.js"; 
dotenv.config();
const app = express();

app.use(cors({
  origin: "*" // your Vercel frontend domain
  
}));
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

app.use(express.json());

app.use("/vendor", vendorRoutes); 

// Test PostgreSQL connection on startup
(async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ Connected to PostgreSQL successfully");
    console.log("✅ PostgreSQL connection verified successfully");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
})();

const PORT = process.env.PORT || 5010;
app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));
