import express from "express";
import API_ROUTES from "./config/apiRoutes";
import proxyMiddleware from "./middleware/proxy";
import authMiddleware from "./middleware/auth";
import errorMiddleware from "./middleware/errorMiddleware";

const app = express();

app.use("/api", authMiddleware, proxyMiddleware(API_ROUTES));
app.use(errorMiddleware);

export default app;
