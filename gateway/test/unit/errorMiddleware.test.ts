import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextFunction, Request, Response } from "express";
import { NotFoundError, UnAuthorizedError } from "../../src/utils/errorUtils";
import errorMiddleware from "../../src/middleware/error";

describe("Error Middleware Tests (Unit)", () => {
  const mockRequest = {} as Request;
  let mockResponse: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it("should handle unauthorized error", () => {
    const err = new UnAuthorizedError();

    errorMiddleware(err, mockRequest, mockResponse as Response, next);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Unauthorized",
    });
  });

  it("should handle not found error", () => {
    const err = new NotFoundError();

    errorMiddleware(err, mockRequest, mockResponse as Response, next);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Resource Not Found",
    });
  });

  it("should handle generic error", () => {
    const err = new Error();

    errorMiddleware(err, mockRequest, mockResponse as Response, next);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });
});
