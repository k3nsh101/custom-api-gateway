import metricsMiddleware from "./metrics";
import requestLogger from "./requestLogger";
import proxyMiddleware from "./proxy";
import API_ROUTES from "../config/apiRoutes";

const apiMiddleware = () => [
  metricsMiddleware,
  requestLogger,
  proxyMiddleware(API_ROUTES),
];

export default apiMiddleware;
