import type { Request, Response, NextFunction } from "express";

import { redisClient } from "../lib/redis.js";

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

// Custom Redis-based rate limiter middleware creator
export const redisRateLimiter = (options: RateLimitOptions) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key = `rate_limit:${ip}:${req.path}`;

    try {
      const current = await redisClient.incr(key);

      if (current === 1) {
        await redisClient.expire(
          key,
          Math.ceil(options.windowMs / 1000),
        );
      }

      if (current > options.max) {
        res.status(429).json({
          success: false,
          message:
            options.message ||
            "Too many requests, please try again later.",
        });

        return;
      }

      // Add rate limit headers
      res.setHeader("X-RateLimit-Limit", options.max);
      res.setHeader(
        "X-RateLimit-Remaining",
        Math.max(0, options.max - current),
      );

      next();
      return;
    } catch (error) {
      // If Redis fails, allow the request (fail open)
      console.error("Rate limiter error:", error);

      next();
      return;
    }
  };
};

// General API limiter
export const apiLimiter = redisRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message:
    "Too many requests from this IP, please try again later.",
});

// Strict limiter for AI endpoints
export const aiLimiter = redisRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message:
    "AI generation limit reached. Please try again after 1 hour.",
});

// Authentication/login limiter
export const authLimiter = redisRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message:
    "Too many authentication attempts, please try again later.",
});