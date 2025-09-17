import { Request, Response, NextFunction } from "express";
import { Counter } from "prom-client";

const requestsCounter = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP request",
  labelNames: ["route", "method", "status", "cache"],
});

const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.on("finish", () => {
    const route = req.originalUrl;
    const method = req.method;
    const status = res.statusCode;
    const cache = res.locals["cacheHit"] ? "Hit" : "Miss";

    requestsCounter.labels(route, method, status.toString(), cache).inc();
  });

  next();
};

export default metricsMiddleware;
