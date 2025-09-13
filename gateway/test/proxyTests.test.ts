import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app";

describe("Requesting forwarding", () => {
  it("should return success from service A", async () => {
    const res = await request(app).get("/api/serviceA");
    expect(res.status).toBe(200);
  });

  it("should return success from service B", async () => {
    const res = await request(app).get("/api/serviceB");
    expect(res.status).toBe(200);
  });
});
