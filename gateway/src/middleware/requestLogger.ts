import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };

    if (res.statusCode >= 400) {
      logger.error("Gateway request error:", logData);
    } else {
      logger.info("Gateway request processed:", logData);
    }
  });
  next();
};

export default requestLogger;
