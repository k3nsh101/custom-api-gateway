import { describe, it } from "vitest";
import express from "express";
import { NotFoundError, UnAuthorizedError } from "../../src/utils/errorUtils";
import errorMiddleware from "../../src/middleware/error";
import request from "supertest";

describe("Error Middleware (Integration)", () => {
  it("Should return 401 for unauthorized error", async () => {
    const app = express();

    app.get("/unauthorized", (req, res) => {
      throw new UnAuthorizedError();
    });

    app.use(errorMiddleware);

    await request(app).get("/unauthorized").expect(401).expect({
      message: "Unauthorized",
    });
  });

  it("Should return 404 for resource not found error", async () => {
    const app = express();

    app.get("/not-found", (req, res) => {
      throw new NotFoundError();
    });

    app.use(errorMiddleware);

    await request(app).get("/not-found").expect(404).expect({
      message: "Resource Not Found",
    });
  });

  it("Should return 500 for resource internal server error", async () => {
    const app = express();

    app.get("/error", (req, res) => {
      throw new Error();
    });

    app.use(errorMiddleware);

    await request(app).get("/error").expect(500).expect({
      message: "Internal Server Error",
    });
  });
});
