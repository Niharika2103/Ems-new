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
    new transports.Console(),

    new transports.File({
      filename: "logs/employee-service.log",   // 👈 change file name only
    }),

    new transports.File({
      filename: "logs/employee-service-error.log",
      level: "error",
    }),
  ],
});

export default logger;
