import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import authMiddleware from "../../src/middleware/auth";
import { UnAuthorizedError } from "../../src/utils/errorUtils";

vi.mock("jsonwebtoken", () => ({
  default: { verify: vi.fn() },
}));

describe("Auth Middleware Tests (Unit) - Route not protected", () => {
  const mockRequest = {} as Request;
  let mockResponse: Partial<Response>;
  let mockNext: Mock;

  beforeEach(() => {
    mockResponse = {
      locals: {},
    };
    mockNext = vi.fn();
  });

  function setRouteProtected(protectedStatus: boolean) {
    mockResponse.locals = { routeConfig: { protected: protectedStatus } };
  }

  it("should call next if the route is not authorized", () => {
    setRouteProtected(false);

    authMiddleware(mockRequest, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });
});

describe("Auth Middleware Tests (Unit) - Route protected", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: Mock;

  const mockJwtVerify = jwt.verify as Mock;

  beforeEach(() => {
    mockRequest = {
      header: vi.fn(),
    };
    mockResponse = {
      locals: {},
    };
    mockNext = vi.fn();
    mockJwtVerify.mockClear();
  });

  function setAuthHeader(value: string | undefined) {
    (mockRequest.header as Mock).mockReturnValue(value);
  }

  function setRouteProtected(protectedStatus: boolean) {
    mockResponse.locals = { routeConfig: { protected: protectedStatus } };
  }

  it("should throw unauthorized error if the authorization header is missing", () => {
    setRouteProtected(true);
    setAuthHeader(undefined);

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    const errorPassed = mockNext.mock.calls[0]?.[0];
    expect(errorPassed).toBeInstanceOf(UnAuthorizedError);
  });

  it("should throw unauthorized error if the token is invalid", () => {
    setRouteProtected(true);
    setAuthHeader("Bearer invalidtoken");
    mockJwtVerify.mockImplementation(() => {
      throw new Error("invalid token");
    });

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    const errorPassed = mockNext.mock.calls[0]?.[0];
    expect(errorPassed).toBeInstanceOf(UnAuthorizedError);
  });

  it.each([
    ["Bearer validtoken", "validtoken"],
    ["validtoken", "validtoken"],
  ])("should call next for valid token %s", (headerValue, expectedToken) => {
    setRouteProtected(true);
    setAuthHeader(headerValue);
    mockJwtVerify.mockReturnValue({ userId: 1 });

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith(
      expectedToken,
      process.env["JWT_SECRET"],
    );
    expect(mockNext).toHaveBeenCalled();
  });
});
