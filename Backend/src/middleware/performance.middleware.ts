import type { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';

export const performanceMonitor = (threshold: number = 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Store original send
    const originalSend = res.send;
    res.send = function (body: any) {
      const duration = Date.now() - start;

      if (duration > threshold) {
        logger.warn(`Slow request: ${req.method} ${req.path} - ${duration}ms`);
      }

      // Add performance header
      res.setHeader('X-Response-Time', `${duration}ms`);

      return originalSend.call(this, body);
    };

    next();
  };
};