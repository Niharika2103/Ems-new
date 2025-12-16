// src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import adminRoutes from "./routes/admin.routes.js";
import path from "path";
import pool from "./config/db.js"; // PostgreSQL connection
import zohoAuthRoutes from "./routes/zohoAuthRoutes.js";
import "./cron/emailCron.js";
dotenv.config();
const app = express();


app.use("/", zohoAuthRoutes);

app.use(cors({
  origin: "*" // your Vercel frontend domain
  
}));
app.use('/uploads', express.static(path.resolve('./src/uploads')));
app.use(express.json());

app.use("/admin", adminRoutes);


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

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Admin service running on port ${PORT}`));


