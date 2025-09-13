import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UnAuthorizedError } from "../utils/errorUtils";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization");

  if (!token) throw new UnAuthorizedError();

  const jwt_secret = process.env["JWT_SECRET"];
  if (!jwt_secret) throw new Error();

  console.log("jwt_secret", jwt_secret);

  const decorded = jwt.verify(token!, process.env["JWT_SECRET"]!);
  console.log(decorded);
  next();
};

export default authMiddleware;
