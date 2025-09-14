import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { Route } from "../interfaces";
import authMiddleware from "./auth";
import rateLimitMiddleware from "./rateLimit";

const proxyMiddleware = (routes: Route[]) => {
  const router = Router();

  routes.forEach((route) => {
    router.use(
      route.path,
      (req, res, next) => {
        res.locals["routeConfig"] = route;
        next();
      },
      rateLimitMiddleware,
      authMiddleware,
      createProxyMiddleware({
        target: route.upstream,
        changeOrigin: true,
      }),
    );
  });

  return router;
};

export default proxyMiddleware;
