import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { NextFunction, Request, Response } from "express";
import rateLimitMiddleware, {
  tokenBucket,
} from "../../src/middleware/rateLimit";
import { TooManyRequestsError } from "../../src/utils/errorUtils";

describe("Token Bucket Rate Limiter", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    tokenBucket.clear();
    mockRequest = { ip: "127.0.0.1" };
    mockResponse = {};
    mockNext = vi.fn();
  });

  it("allows requests when tokens are available", () => {
    rateLimitMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockNext).toHaveBeenCalled();
    const errorPassed = (mockNext as Mock).mock.calls[0]?.[0];
    expect(errorPassed).toBeUndefined();

    const bucket = tokenBucket.get(`rate:${mockRequest.ip}`);
    expect(bucket).toBeDefined();
    expect(bucket?.tokens).toBeLessThanOrEqual(
      Number(process.env["RATE_LIMIT_CAPACITY"]),
    );
  });

  it("reduces token count for each request", () => {
    const initialCapacity = Number(process.env["RATE_LIMIT_CAPACITY"]);
    rateLimitMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );
    const bucket = tokenBucket.get(`rate:${mockRequest.ip}`);
    expect(bucket?.tokens).toBe(initialCapacity - 1);
  });

  it("blocks request when tokens are exhausted", () => {
    const capacity = Number(process.env["RATE_LIMIT_CAPACITY"]) || 2;

    // Exhaust the bucket
    for (let i = 0; i < capacity; i++) {
      rateLimitMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );
    }

    // Next request should fail
    const nextFn = vi.fn();
    rateLimitMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFn,
    );

    const errorPassed = nextFn.mock.calls[0]?.[0];
    expect(errorPassed).toBeInstanceOf(TooManyRequestsError);
  });

  it("refills tokens over time", async () => {
    const capacity = Number(process.env["RATE_LIMIT_CAPACITY"]) || 2;

    // Exhaust the bucket
    for (let i = 0; i < capacity; i++) {
      rateLimitMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );
    }

    // Simulate wait for 1 second
    const bucket = tokenBucket.get(`rate:${mockRequest.ip}`)!;
    bucket.last -= 1000; // go back 1 second

    const nextFn = vi.fn();
    rateLimitMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFn,
    );

    // Tokens should have refilled
    expect(nextFn).toHaveBeenCalled();
    const errorPassed = nextFn.mock.calls[0]?.[0];
    expect(errorPassed).toBeUndefined();
  });
});
