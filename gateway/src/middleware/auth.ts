import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UnAuthorizedError } from "../utils/errorUtils";
import { Route } from "../interfaces";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const routeConfig: Route = res.locals["routeConfig"];

  if (!routeConfig.protected) return next();

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
