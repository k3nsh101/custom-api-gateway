import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UnAuthorizedError } from "../utils/errorUtils";
import { Route } from "../interfaces";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const routeConfig: Route = res.locals["routeConfig"];

  if (!routeConfig.protected) return next();

  const authHeader = req.header("Authorization");
  if (!authHeader) return next(new UnAuthorizedError());

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  if (!token) throw new UnAuthorizedError();

  const jwtSecret = process.env["JWT_SECRET"];
  if (!jwtSecret)
    return next(
      new Error("Setup Error: Environment variable for JWT_SECRET is not set"),
    );

  try {
    jwt.verify(token!, process.env["JWT_SECRET"]!);
    next();
  } catch (err) {
    return next(new UnAuthorizedError());
  }
};

export default authMiddleware;
