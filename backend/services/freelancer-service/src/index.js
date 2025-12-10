// src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import freelancerRoutes from "./routes/Freelancer.routes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// static access for uploaded files
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// base route for freelancer documents
app.use("/freelancer", freelancerRoutes);


const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`🚀 Freelancer-service running on port ${PORT}`);
});
