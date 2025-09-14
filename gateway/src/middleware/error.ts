import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errorUtils";

const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  } else {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default errorMiddleware;
