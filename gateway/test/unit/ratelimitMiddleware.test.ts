import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { NextFunction, Request, Response } from "express";
import RedisClient from "../../src/config/redis";
import rateLimitMiddleware from "../../src/middleware/rateLimit";
import { TooManyRequestsError } from "../../src/utils/errorUtils";

describe("Token Bucket Rate Limiter", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  const RATE_LIMIT_CAPACITY = Number(process.env["RATE_LIMIT_CAPACITY"]);

  // Mock Redis
  const mockHGetAll = vi.fn();
  const mockHSet = vi.fn();
  const mockRedisClient = { hGetAll: mockHGetAll, hSet: mockHSet };
  const mockGetInstance = vi.spyOn(RedisClient, "getInstance").mockReturnValue({
    getClient: () => mockRedisClient,
  } as any);

  beforeEach(() => {
    mockRequest = { ip: "127.0.0.1" };
    mockResponse = {};
    mockNext = vi.fn();

    mockHGetAll.mockReset();
    mockHSet.mockReset();
  });

  it("allows requests when tokens are available", async () => {
    mockHGetAll.mockResolvedValue({ tokens: "5", last: `${Date.now()}` });

    await rateLimitMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockNext).toHaveBeenCalledOnce();
    const errorPassed = (mockNext as Mock).mock.calls[0]?.[0];
    expect(errorPassed).toBeUndefined();
    expect(mockHSet).toHaveBeenCalled();
  });

  it("reduces token count for each request", async () => {
    const initialCapacity = 5;
    const lastTime = Date.now();
    mockHGetAll.mockResolvedValue({ tokens: initialCapacity, last: lastTime });

    await rateLimitMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockHSet).toHaveBeenCalledWith(
      `rate:${mockRequest.ip}`,
      expect.objectContaining({
        tokens: initialCapacity - 1,
      }),
    );
  });

  it("blocks request when tokens are exhausted", async () => {
    mockHGetAll.mockResolvedValue({ tokens: 0, last: Date.now() });

    await rateLimitMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    const errorPassed = (mockNext as Mock).mock.calls[0]?.[0];
    expect(errorPassed).toBeInstanceOf(TooManyRequestsError);
    expect(mockHSet).not.toHaveBeenCalled();
  });

  it("refills tokens over time", async () => {
    const currentTokens = RATE_LIMIT_CAPACITY - 1;
    mockHGetAll.mockResolvedValue({
      tokens: currentTokens,
      last: Date.now() - 1000,
    });

    await rateLimitMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    // Tokens should have refilled
    expect(mockNext).toHaveBeenCalled();
    expect(mockHSet).toHaveBeenCalledWith(
      `rate:${mockRequest.ip}`,
      expect.objectContaining({
        tokens: currentTokens, // tokens = currentTokens + 1 - 1
      }),
    );
    const errorPassed = (mockNext as Mock).mock.calls[0]?.[0];
    expect(errorPassed).toBeUndefined();
  });
});
