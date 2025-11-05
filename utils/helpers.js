
import fs from "fs";
import path from "path";
import winston from "winston";

export function screenshotPath(name) {
  const outDir = path.join("reportes", "screenshots");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return path.join(outDir, `${timestamp}_${name}.png`);
}

const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

export const Logger = winston.createLogger({
  level: "info", 
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      ({ timestamp, level, message }) =>
        `${timestamp} ${level.toUpperCase()} ${message}`
    )
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, "tests.log"),
      options: { flags: "a" },
    }),
    new winston.transports.Console(),
  ],
});
