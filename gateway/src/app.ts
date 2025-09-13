import express from "express";
import API_ROUTES from "./config/apiRoutes";
import proxyMiddleware from "./middleware/proxy";

const app = express();

app.use("/api", proxyMiddleware(API_ROUTES));

export default app;
