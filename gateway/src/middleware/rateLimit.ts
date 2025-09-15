import { NextFunction, Response, Request } from "express";
import { UserTokenBucket } from "../interfaces";
import { TooManyRequestsError } from "../utils/errorUtils";
import { BUCKET_REFILL_RATE, RATE_LIMIT_CAPACITY } from "../config/config";
import RedisClient from "../config/redis";

const rateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (isNaN(RATE_LIMIT_CAPACITY) || isNaN(BUCKET_REFILL_RATE)) {
    console.log("Environment variables for Token bucket is not set");
    return next(new Error());
  }

  const now = Date.now();
  const key = `rate:${req.ip}`;
  let bucket: UserTokenBucket | null = null;

  try {
    const redis = RedisClient.getInstance();
    const redisClient = redis.getClient();

    const bucketRaw = await redisClient.hGetAll(key);

    if (bucketRaw && bucketRaw["last"]) {
      bucket = {
        tokens: Number(bucketRaw["tokens"]),
        last: Number(bucketRaw["last"]),
      };
    } else {
      bucket = { tokens: RATE_LIMIT_CAPACITY, last: now };
    }

    const elapsedSeconds = (now - bucket.last) / 1000;
    bucket.tokens = Math.min(
      RATE_LIMIT_CAPACITY,
      bucket.tokens + BUCKET_REFILL_RATE * elapsedSeconds,
    );

    if (bucket.tokens < 1) {
      return next(new TooManyRequestsError());
    }

    bucket.tokens -= 1;
    bucket.last = now;

    await redisClient.hSet(key, {
      tokens: bucket.tokens,
      last: bucket.last,
    });

    next();
  } catch (err) {
    console.error("Redis error in rateLimitMiddleware:", err);
    next(err);
  }
};

export default rateLimitMiddleware;
