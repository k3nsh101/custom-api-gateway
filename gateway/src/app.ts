import express from "express";
import API_ROUTES from "./config/apiRoutes";
import proxyMiddleware from "./middleware/proxy";
import errorMiddleware from "./middleware/error";
import notFoundMiddleware from "./middleware/notFound";

const setupApp = () => {
  const app = express();
  app.use("/api", proxyMiddleware(API_ROUTES));
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};

export default setupApp;
