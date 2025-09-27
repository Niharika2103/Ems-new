// src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import adminRoutes from "./routes/admin.routes.js";
import path from "path";
dotenv.config();
const app = express();

app.use(cors({
  origin: "*" // your Vercel frontend domain
  
}));
app.use('/uploads', express.static(path.resolve('./src/uploads')));
app.use(express.json());

app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Admin service running on port ${PORT}`));
