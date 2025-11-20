import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// RESOLVED TEMPLATE FOLDER
const templatePath = path.join(__dirname, "..", "templates");

export function loadTemplate(templateName) {
  try {
    const filePath = path.join(templatePath, templateName);

    console.log("🔍 TEMPLATE PATH:", filePath);

    if (!fs.existsSync(filePath)) {
      console.log("❌ Template does NOT exist on disk");
      return null;
    }

    const content = fs.readFileSync(filePath, "utf-8");

    console.log("✅ Template loaded, length:", content?.length);

    return content;
  } catch (err) {
    console.error("❌ Template loading failed:", err);
    return null;
  }
}
