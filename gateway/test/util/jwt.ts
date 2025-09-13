import jwt from "jsonwebtoken";

export function generateTestToken(payload: Record<string, any> = {}) {
  return jwt.sign(payload, process.env["JWT_SECRET"]!, { expiresIn: "15m" });
}
