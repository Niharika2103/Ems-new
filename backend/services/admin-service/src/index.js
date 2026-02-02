// // src/index.js
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import adminRoutes from "./routes/admin.routes.js";
// import path from "path";
// import pool from "./config/db.js"; // PostgreSQL connection
// import zohoAuthRoutes from "./routes/zohoAuthRoutes.js";
// import "./cron/emailCron.js";
// import leavePolicyRoutes from "./routes/leavePolicy.routes.js";
// import freelancerReportRoutes from "./routes/freelancerReport.routes.js";
// import reportRoutes from "./routes/report.routes.js";

// dotenv.config();
// const app = express();


// app.use("/", zohoAuthRoutes);

// app.use(cors({
//   origin: "*" // your Vercel frontend domain
  
// }));
// app.use('/uploads', express.static(path.resolve('./src/uploads')));
// app.use(express.json());

// app.use("/admin", adminRoutes);

// app.use("/admin", leavePolicyRoutes);

// app.use("/admin", freelancerReportRoutes);
// app.use("/admin", reportRoutes);

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

// const PORT = process.env.PORT || 5002;
// app.listen(PORT, () => console.log(`Admin service running on port ${PORT}`));


import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import adminRoutes from "./routes/admin.routes.js";
import zohoAuthRoutes from "./routes/zohoAuthRoutes.js";
import leavePolicyRoutes from "./routes/leavePolicy.routes.js";
import freelancerReportRoutes from "./routes/freelancerReport.routes.js";
import reportRoutes from "./routes/report.routes.js";

import pool from "./config/db.js";
import logger from "./config/logger.js";   // ✅ ADD THIS

import "./cron/emailCron.js";

dotenv.config();
const app = express();

/* ------------------ MIDDLEWARE ------------------ */

app.use(cors({
  origin: "*"
}));

app.use(express.json());
app.use("/uploads", express.static(path.resolve("./src/uploads")));

/* ------------------ ROUTES ------------------ */

app.use("/", zohoAuthRoutes);
app.use("/admin", adminRoutes);
app.use("/admin", leavePolicyRoutes);
app.use("/admin", freelancerReportRoutes);
app.use("/admin", reportRoutes);

/* ------------------ DB CONNECTION CHECK ------------------ */

(async () => {
  try {
    await pool.query("SELECT NOW()");
    logger.info("PostgreSQL connected successfully");
  } catch (err) {
    logger.error(`PostgreSQL connection failed: ${err.message}`);
  }
})();

/* ------------------ SERVER START ------------------ */

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  logger.info(`Admin service running on port ${PORT}`);
});
