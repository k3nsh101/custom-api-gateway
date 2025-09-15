import setupApp from "./app";
import config from "./config/config";
import RedisClient from "./config/redis";

const startServer = async () => {
  try {
    const redis = RedisClient.getInstance();
    await redis.connect();

    const app = setupApp();

    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.log("Failed to start server", error);
  }
};

startServer();
