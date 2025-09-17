import express from "express";
import errorMiddleware from "./middleware/error";
import notFoundMiddleware from "./middleware/notFound";
import { register } from "prom-client";
import apiMiddleware from "./middleware/api";

const setupApp = () => {
  const app = express();
  app.use("/api", apiMiddleware());

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
