import express from "express";
import API_ROUTES from "./config/apiRoutes";
import proxyMiddleware from "./middleware/proxy";
import errorMiddleware from "./middleware/error";
import notFoundMiddleware from "./middleware/notFound";
import requestLogger from "./middleware/requestLogger";
import metricsMiddleware from "./middleware/metrics";
import { register } from "prom-client";

const setupApp = () => {
  const app = express();
  app.use(metricsMiddleware);
  app.use(requestLogger);
  app.use("/api", proxyMiddleware(API_ROUTES));

  app.get("/metrics", async (req, res, next) => {
    try {
      res.set("Content-Type", register.contentType);
      res.end(await register.metrics());
    } catch (err) {
      next(new Error());
      res.status(500).end(err);
    }
  });

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};

export default setupApp;
