// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import vendorRoutes from "./routes/vendorRoutes.js";
// import path from "path";
// import pool from "./config/db.js"; 
// dotenv.config();
// const app = express();

// app.use(cors({
//   origin: "*" // your Vercel frontend domain
  
// }));
// app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

// app.use(express.json());

// app.use("/vendor", vendorRoutes); 

// // Test PostgreSQL connection on startup
// (async () => {
//   try {
//     await pool.query("SELECT NOW()");
//     console.log("✅ Connected to PostgreSQL successfully");
//     console.log("✅ PostgreSQL connection verified successfully");
//   } catch (err) {
//     console.error("❌ Database connection failed:", err.message);
//   }
// })();

// const PORT = process.env.PORT || 5006;
// app.listen(PORT, () => console.log(`vendor service running on port ${PORT}`));
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import vendorRoutes from "./routes/vendorRoutes.js";
import path from "path";
import pool from "./config/db.js"; 

dotenv.config();

const app = express();

// ✅ Middleware
// app.use(cors({
//   origin: "http://localhost:5173",   // frontend URL
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization", "cache-control"],
//   credentials: true
// }));

// app.options("*", cors());

app.use(cors({
  origin: "*" // your Vercel frontend domain
  
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ Serve uploaded files
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

// ✅ Routes
app.use("/vendor", vendorRoutes);

// ✅ Health check
app.get("/health", (req, res) => {
  res.json({ status: "Vendor service running" });
});

// ✅ Test PostgreSQL connection
(async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ Connected to PostgreSQL successfully");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
})();

const PORT = process.env.PORT || 5006;
app.listen(PORT, () =>
  console.log(`🚀 Vendor service running on port ${PORT}`)
);
