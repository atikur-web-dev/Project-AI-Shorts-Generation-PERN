// Backend/src/controller/health.controller.ts
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { config } from "../config/index.js";


export const healthCheck = async (_req: Request, res: Response) => {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.NODE_ENV,
      version: process.env.npm_package_version || "1.0.0",
      services: {
        database: "connected",
        redis: process.env.REDIS_URL ? "connected" : "not configured",
      },
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Database connection failed",
    });
  }
};
