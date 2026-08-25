// Backend/src/controller/subscription.controller.ts
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { logger } from "../config/logger.js";

export const getAvailableSubscriptions = async (
  _req: Request,
  res: Response,
) => {
  try {
    const subscriptions = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        price: number;
        credits: number;
      }>
    >`
      SELECT
        id,
        name,
        price,
        credits
      FROM "subscriptions"
      ORDER BY price ASC, "createdAt" ASC
    `;

    return res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    logger.error("Get available subscriptions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscription plans",
    });
  }
};