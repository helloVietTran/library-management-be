import { Request, Response, NextFunction } from "express";
import AppError from "./AppError";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: true,
      message: err.message,
      path: err.path || req.originalUrl,
      method: err.method || req.method,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  } else {
    // Lỗi không xác định
    res.status(500).json({
      error: true,
      message: err.message || "Internal Server Error",
      path: req.originalUrl,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

export default errorHandler;
