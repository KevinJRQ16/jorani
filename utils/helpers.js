import fs from "fs";
import path from "path";

export function screenshotPath(name) {
  const outDir = path.join("reportes", "screenshots");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return path.join(outDir, `${timestamp}_${name}.png`);
}
