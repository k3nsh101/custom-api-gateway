import { createClient, RedisClientType } from "redis";
import logger from "./logger";

class RedisClient {
  private static instance: RedisClient;
  private client: RedisClientType;
  private isConnected: boolean = false;

  private constructor() {
    this.client = createClient({
      url: process.env["REDIS_URL"] || "redis://localhost:6379",
      socket: {
        reconnectStrategy: (retries: number, cause: any) => {
          if (cause.code === "ECONNREFUSED" && retries < 5) {
            return Math.min(retries * 1000, 30000);
          }

          if (retries > 10) {
            logger.error("Setup Error:", {
              message: "Too many attempts creating create Redis Client",
              status: 500,
              timestamp: new Date().toISOString(),
              stack: cause,
            });
            return new Error("Too many reconnection attempts");
          }

          return Math.min(retries * 50, 5000);
        },
      },
    });

    this.client.on("error", (err) => {
      logger.error("Setup Error:", {
        message: `Failed to create Redis Client ${err.message}`,
        status: 500,
        timestamp: new Date().toISOString(),
        stack: err.stack,
      });
    });
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
      this.isConnected = true;
      logger.info("Redis Connected");
    }
  }

  public getClient(): RedisClientType {
    if (!this.isConnected) {
      throw new Error("Redis client is not connected yet");
    }
    return this.client;
  }
}

export default RedisClient;
