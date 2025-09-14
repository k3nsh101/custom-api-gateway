import { NextFunction, Response, Request } from "express";
import { UserTokenBucket } from "../interfaces";
import { TooManyRequestsError } from "../utils/errorUtils";
import { BUCKET_REFILL_RATE, RATE_LIMIT_CAPACITY } from "../config/config";

export let tokenBucket = new Map<string, UserTokenBucket>();

const rateLimitMiddleware = (
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

  if (tokenBucket.get(key)) {
    bucket = tokenBucket.get(key) as UserTokenBucket;
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

  bucket.tokens = bucket.tokens - 1;
  bucket.last = now;

  tokenBucket.set(key, bucket);

  next();
};

export default rateLimitMiddleware;
