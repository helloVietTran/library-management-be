import winston from "winston";

const logger = winston.createLogger({
  level: "info", // Ghi log từ mức "info" trở lên
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

export default logger;
