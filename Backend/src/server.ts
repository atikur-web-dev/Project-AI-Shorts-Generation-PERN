
import "dotenv/config";

import { app } from "./app.js";
import { config } from "./config/index.js";
import { logger } from "./config/logger.js";
import { prisma } from "./lib/prisma.js";
import { connectRedis } from "./lib/redis.js";

const PORT = Number(process.env.PORT) || config.PORT || 8000;
const HOST = "0.0.0.0";

async function startServer() {
  console.log("SERVER.JS STARTED");
  console.log("PORT =", PORT);
  console.log("HOST =", HOST);

  try {
    console.log("Attempting Redis connection...");

    await connectRedis();

    logger.info("Redis connection established");

    console.log("Attempting database connection...");

    await prisma.$connect();

    logger.info("Database Connected Successfully");

    app.listen(PORT, HOST, () => {
      logger.info(`Server is running on ${HOST}:${PORT}`);
      logger.info(`Environment: ${config.NODE_ENV}`);
      logger.info(`Health Check: http://${HOST}:${PORT}/health`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
}

startServer();
