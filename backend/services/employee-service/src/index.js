import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import employeeRoutes from "./routes/employee.routes.js";
dotenv.config();

const app = express();
app.use(cors({
  origin: "*" // your Vercel frontend domain
  
}));
app.use('/uploads', express.static(path.resolve('./src/uploads')));
app.use(express.json());
app.get("/test-email", async (req, res) => {
  try {
    await sendEmail("yourpersonal@gmail.com", "Test Email", "<b>Hello from EMS</b>");
    res.send("Email sent!");
  } catch (err) {
    res.status(500).send("Email failed: " + err.response?.body || err.message);
  }
});
app.use("/employee", employeeRoutes);

const PORT = process.env.PORT || 5009;
app.listen(PORT, () => console.log(`✅ Employee service running on port ${PORT}`));
