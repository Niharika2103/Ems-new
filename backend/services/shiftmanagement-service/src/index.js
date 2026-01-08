
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import shift from "./routes/shift.routes.js";
import shiftAssignment from "./routes/shiftAssignment.routes.js";
import "./shift/shiftReminderJob.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/api", shift);
app.use("/api", shiftAssignment);
app.set("trust proxy", true);

const PORT = process.env.PORT || 5010;
app.listen(PORT, () =>
  console.log(`✅ Settings service running on port ${PORT}`)
);
