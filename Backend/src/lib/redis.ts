import { createClient } from 'redis';
import { logger } from '../config/logger.js';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  logger.info(' Redis connected successfully');
});

await redisClient.connect();

export { redisClient };