import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import systemSettingsRoutes from "./routes/branding.routes.js";
import whatsappTemplateRoutes from "./routes/whatsappTemplate.route.js";
dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/api", systemSettingsRoutes);
app.use("/api/whatsapp",whatsappTemplateRoutes)
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));
app.set("trust proxy", true);

const PORT = process.env.PORT || 5008;
app.listen(PORT, () =>
  console.log(`✅ Settings service running on port ${PORT}`)
);
