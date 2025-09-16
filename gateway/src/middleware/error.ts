import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errorUtils";
import logger from "../config/logger";

const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const method = req.method;
  const url = req.originalUrl;
  const stack = err.stack;
  const timestamp = new Date();
  if (err instanceof AppError) {
    logger.error("Application Error:", {
      message: err.message,
      status: err.statusCode,
      method,
      url,
      timestamp,
      stack,
    });
    return res.status(err.statusCode).json({ message: err.message });
  } else {
    logger.error("Application Error:", {
      message: "Internal Server Error",
      status: 500,
      method,
      url,
      timestamp,
      stack,
    });
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default errorMiddleware;
