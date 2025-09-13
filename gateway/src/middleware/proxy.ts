import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { Route } from "../interfaces";

const proxyMiddleware = (routes: Route[]) => {
  const router = Router();

  routes.forEach((route) => {
    router.use(
      route.path,
      createProxyMiddleware({
        target: route.upstream,
        changeOrigin: true,
      }),
    );
  });

  return router;
};

export default proxyMiddleware;
