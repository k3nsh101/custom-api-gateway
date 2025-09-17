import dotenv from "dotenv";

dotenv.config();

export const RATE_LIMIT_CAPACITY = Number(process.env["RATE_LIMIT_CAPACITY"]);
export const BUCKET_REFILL_RATE = Number(process.env["BUCKET_REFILL_RATE"]);

interface Config {
  port: number;
  env: string;
}

const config: Config = {
  port: Number(process.env["PORT"]) || 3000,
  env: process.env["NODE_ENV"] || "development",
};

export default config;
