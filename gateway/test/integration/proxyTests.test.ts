import { Express } from "express";
import { beforeAll, describe, it } from "vitest";
import request from "supertest";
import setupApp from "../../src/app";
import { generateTestToken } from "../util/jwt";
import RedisClient from "../../src/config/redis";

describe("Requesting forwarding", () => {
  let app: Express;
  beforeAll(async () => {
    const redis = RedisClient.getInstance();
    await redis.connect();

    app = setupApp();
  });

  it("should return unauthorized from service A when token is empty", async () => {
    await request(app).get("/api/serviceA").expect(401);
  });

  it("should return unauthorized from service A when token is wrong", async () => {
    await request(app)
      .get("/api/serviceA")
      .auth("wrong-token", { type: "bearer" })
      .expect(401);
  });

  it("should return unauthorized from service A when token is correct", async () => {
    const token = generateTestToken({ id: "user1", role: "admin" });
    await request(app)
      .get("/api/serviceA")
      .auth(token, { type: "bearer" })
      .expect(200);
  });

  it("should return success from service B", async () => {
    await request(app).get("/api/serviceB").expect(200);
  });

  it("should return resource not found from services other than A or B", async () => {
    await request(app).get("/api/serviceE").expect(404);
  });
});
