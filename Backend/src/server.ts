import "dotenv/config";
import { app } from "./app.js";
import { config } from "./config/index.js";
import { logger } from "./config/logger.js";
import { PrismaClient } from "@prisma/client";
const Prisma = new PrismaClient();
const { PORT } = config;

// Checking prisma connection
async function startServer() {
  try {
    // DB connection check
    await Prisma.$connect();
    logger.info("Database Connected Successfully");

    // Server start
    app.listen(PORT, () => {
      logger.info(`Server is running on ${config.APP_URL}`);
      logger.info(`Environment: ${config.NODE_ENV}`);
      logger.info(`Health Check: ${config.APP_URL}/health`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
}

startServer();
