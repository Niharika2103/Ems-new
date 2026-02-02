import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",

  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.printf(
      ({ timestamp, level, message }) =>
        `${timestamp} [${level.toUpperCase()}] ${message}`
    )
  ),

  transports: [
    // ✅ Show in terminal
    new transports.Console(),

    // ✅ Save logs
    new transports.File({ filename: "logs/shift-service.log" }),

    // ❌ Only errors
    new transports.File({
      filename: "logs/shift-service-error.log",
      level: "error",
    }),
  ],
});

export default logger;
