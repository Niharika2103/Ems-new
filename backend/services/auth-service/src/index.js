import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js"; 
import path from "path";

dotenv.config();
const app = express();

app.use(cors({
  origin: "*" // your Vercel frontend domain
  
}));
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

app.use(express.json());

app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));
