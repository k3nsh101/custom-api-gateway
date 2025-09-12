import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  env: string;
}

const config: Config = {
  port: Number(process.env["PORT"]) || 3000,
  env: process.env["ENVIRONMENT"] || "development",
};

export default config;
