import winston from 'winston';
import { config } from './index.js';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const myFormat = combine(
  errors({ stack: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  config.NODE_ENV === 'production'
    ? json()
    : combine(colorize(), printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} ${level}: ${message}${stack ? `\n${stack}` : ''}`;
      }))
);

const transports = config.NODE_ENV === 'production'
  ? [
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' }),
    ]
  : [new winston.transports.Console()];

export const logger = winston.createLogger({
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  format: myFormat,
  transports,
});