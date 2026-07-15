import type { Request, Response, NextFunction } from 'express';
import { CacheService } from '../services/cache.service.js';
import { logger } from '../config/logger.js';

export const cache = (ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip cache for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = CacheService.generateKey(req.path, {
      query: req.query,
      user: req.user?.id,
    });

    try {
      const cachedData = await CacheService.get(key);
      if (cachedData) {
        logger.info(`Cache hit: ${key}`);
        return res.json(cachedData);
      }

      // Store original send function
      const originalSend = res.json.bind(res);
      res.json = function (body: any) {
        // Only cache successful responses
        if (res.statusCode === 200) {
          CacheService.set(key, body, ttl).catch(() => {});
        }
        return originalSend(body);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};