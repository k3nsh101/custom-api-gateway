import { Router } from "express";
import {
  createProxyMiddleware,
  responseInterceptor,
} from "http-proxy-middleware";
import { Route } from "../interfaces";
import authMiddleware from "./auth";
import rateLimitMiddleware from "./rateLimit";
import cachingMiddleware from "./cache";
import RedisClient from "../config/redis";
import logger from "../config/logger";

const proxyMiddleware = (routes: Route[]) => {
  const router = Router();
  const redis = RedisClient.getInstance();
  const redisClient = redis.getClient();
  const ttl = Number(process.env["CACHE_TTL"]) || 5 * 60;

  routes.forEach((route) => {
    router.use(
      route.path,
      (req, res, next) => {
        res.locals["routeConfig"] = route;
        next();
      },
      rateLimitMiddleware,
      authMiddleware,
      cachingMiddleware,
      createProxyMiddleware({
        target: route.upstream,
        changeOrigin: true,
        selfHandleResponse: true,
        on: {
          proxyRes: responseInterceptor(
            async (responseBuffer, proxyRes, req, res) => {
              const response = responseBuffer.toString("utf8");
              const method = req.method;
              const key = `cache:${req.originalUrl}`;
              const contentType = res.getHeader("Content-Type")?.toString();
              res.locals["cacheHit"] = false;

              try {
                if (contentType?.includes("application/json")) {
                  redisClient.setEx(key, ttl, response);

                  logger.info("Route cache set", {
                    route,
                    method,
                    cacheKey: key,
                    status: proxyRes.statusCode,
                    bodyLength: response.length,
                    timestamp: new Date().toISOString(),
                  });
                } else {
                  logger.info("Route response skipped caching (non-JSON)", {
                    route,
                    method,
                    status: proxyRes.statusCode,
                    contentType,
                    timestamp: new Date().toISOString(),
                  });
                }
              } catch (err: any) {
                logger.error("Error caching route response", {
                  route,
                  method,
                  status: proxyRes.statusCode,
                  error: err.message,
                  stack: err.stack,
                  timestamp: new Date().toISOString(),
                });
              }
              return response;
            },
          ),
        },
      }),
    );
  });

  return router;
};

export default proxyMiddleware;
