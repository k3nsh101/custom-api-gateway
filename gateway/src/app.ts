import express from "express";
import API_ROUTES from "./config/apiRoutes";
import setupRoutes from "./middleware/proxy";

const app = express();

app.use("/api", setupRoutes(API_ROUTES));

export default app;
