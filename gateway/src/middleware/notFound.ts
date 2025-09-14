import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../utils/errorUtils";

const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  throw new NotFoundError();
};

export default notFoundMiddleware;
