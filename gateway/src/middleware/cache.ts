import { Request, Response, NextFunction } from "express";
import RedisClient from "../config/redis";

const cachingMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const redis = RedisClient.getInstance();
  const redisClient = redis.getClient();
  const key = `cache:${req.originalUrl}`;

  try {
    const cached = await redisClient.get(key);

    if (cached) {
      res.locals["cacheHit"] = true;
      res.setHeader("X-Cache", "HIT");
      return res.json(JSON.parse(cached));
    }
    return next();
  } catch (err: any) {
    console.log("Error in caching middleware", err);
    next(new Error(err.mesasge));
  }
};

export default cachingMiddleware;
