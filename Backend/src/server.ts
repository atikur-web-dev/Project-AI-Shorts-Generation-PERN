import "dotenv/config";

import { app } from "./app.js";
import { config } from "./config/index.js";
import { logger } from "./config/logger.js";
import { prisma } from "./lib/prisma.js";

const { PORT } = config;

async function startServer() {
  console.log("SERVER.JS STARTED");

  try {
    console.log("PORT =", PORT);
    console.log("Attempting database connection...");

    await prisma.$connect();

    logger.info("Database Connected Successfully");

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
