import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import employeeRoutes from "./routes/employee.routes.js";
dotenv.config();

const app = express();
app.use(cors({
  origin: "*" // your Vercel frontend domain
  
}));
app.use(express.json());

app.use("/employee", employeeRoutes);

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => console.log(`✅ Employee service running on port ${PORT}`));
