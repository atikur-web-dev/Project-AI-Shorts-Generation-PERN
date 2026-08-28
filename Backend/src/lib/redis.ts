// Backend/src/lib/redis.ts

import { createClient } from "redis";
import { logger } from "../config/logger.js";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redisClient = createClient({
  url: redisUrl,

  socket: {
    reconnectStrategy: (retries) => {
      const delay = Math.min(retries * 500, 5000);

      logger.warn(
        `Redis reconnecting... attempt ${retries}, retrying in ${delay}ms`,
      );

      return delay;
    },
  },
});

redisClient.on("connect", () => {
  logger.info("Redis socket connecting...");
});

redisClient.on("ready", () => {
  logger.info("Redis connected and ready");
});

redisClient.on("reconnecting", () => {
  logger.warn("Redis reconnecting...");
});

redisClient.on("end", () => {
  logger.warn("Redis connection closed");
});

redisClient.on("error", (error) => {
  logger.error(`Redis Client Error: ${error.message}`, {
    stack: error.stack,
  });
});

export async function connectRedis(): Promise<void> {
  if (redisClient.isOpen) {
    return;
  }

  await redisClient.connect();
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
}
