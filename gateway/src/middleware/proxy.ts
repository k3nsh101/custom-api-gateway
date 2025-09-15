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
              const key = `cache:${req.originalUrl}`;
              try {
                if (
                  res
                    .getHeader("Content-Type")
                    ?.toString()
                    .includes("application/json")
                ) {
                  redisClient.setEx(key, ttl, response);
                  console.log("setting cache", key);
                }
              } catch (err: any) {
                console.log("Error setting response cache");
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
