import { createClient, RedisClientType } from "redis";

class RedisClient {
  private static instance: RedisClient;
  private client: RedisClientType;
  private isConnected: boolean = false;

  private constructor() {
    this.client = createClient({
      url: process.env["REDIS_URL"] || "redis://localhost:6379",
    });

    this.client.on("error", (err) => {
      console.error("Redis Client Error", err);
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
      console.log("Redis connected");
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
