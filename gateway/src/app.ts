import express from "express";
import API_ROUTES from "./config/apiRoutes";
import proxyMiddleware from "./middleware/proxy";
import errorMiddleware from "./middleware/errorMiddleware";
import notFoundMiddleware from "./middleware/notFoundMiddleware";

const app = express();

app.use("/api", proxyMiddleware(API_ROUTES));
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
