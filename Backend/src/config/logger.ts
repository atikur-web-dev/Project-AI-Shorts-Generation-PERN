
import winston from "winston";
import { config } from "./index.js";

const { combine, timestamp, printf, colorize, json, errors } =
  winston.format;

const developmentFormat = combine(
  errors({ stack: true }),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  colorize(),
  printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} ${level}: ${message}${stack ? `\n${stack}` : ""}`;
  }),
);

const productionFormat = combine(
  errors({ stack: true }),
  timestamp(),
  json(),
);

export const logger = winston.createLogger({
  level: config.NODE_ENV === "production" ? "info" : "debug",

  format:
    config.NODE_ENV === "production"
      ? productionFormat
      : developmentFormat,

  transports: [
    new winston.transports.Console(),
  ],
});

