// Backend/src/services/cache.service.ts

import { redisClient } from "../lib/redis.js";
import { logger } from "../config/logger.js";

const DEFAULT_TTL = 300; // 5 minutes

export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redisClient.get(key);

      if (!data) {
        return null;
      }

      return JSON.parse(data) as T;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  static async set(
    key: string,
    value: any,
    ttl: number = DEFAULT_TTL,
  ): Promise<void> {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  static async delete(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  static async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);

      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      logger.error(
        `Cache delete pattern error for ${pattern}:`,
        error,
      );
    }
  }

  static generateKey(prefix: string, params: any): string {
    return `${prefix}:${JSON.stringify(params)}`;
  }

  // Cache invalidation methods
  static async invalidateDashboard(
    _adminId: string,
  ): Promise<void> {
    await this.deletePattern("dashboard:*");
  }

  static async invalidateUserCache(
    userId: string,
  ): Promise<void> {
    await this.deletePattern(`users:*${userId}*`);
  }

  static async invalidateOrderCache(
    orderId: string,
  ): Promise<void> {
    await this.deletePattern(`orders:*${orderId}*`);
  }
}