// Backend/src/controller/admin/subscription.controller.ts
import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { logger } from "../../config/logger.js";

export const getAllSubscriptions = async (
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
        createdAt: Date;
        updatedAt: Date;
        subscriber_count: number;
        order_count: number;
      }>
    >`
      SELECT
        s.id,
        s.name,
        s.price,
        s.credits,
        s."createdAt",
        s."updatedAt",

        (
          SELECT COUNT(*)::int
          FROM "user_subscriptions" us
          WHERE us."subscriptionId" = s.id
        ) AS subscriber_count,

        (
          SELECT COUNT(*)::int
          FROM "orders" o
          WHERE o."subscriptionId" = s.id
        ) AS order_count

      FROM "subscriptions" s

      ORDER BY s.price ASC, s."createdAt" DESC
    `;

    return res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    logger.error("Get subscriptions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscriptions",
    });
  }
};

export const createSubscription = async (
  req: Request,
  res: Response,
) => {
  try {
    const { name, price, credits } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Subscription name is required",
      });
    }

    if (
      typeof price !== "number" ||
      price < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Price must be a non-negative number",
      });
    }

    if (
      typeof credits !== "number" ||
      credits < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Credits must be a non-negative number",
      });
    }

    const existing = await prisma.$queryRaw<
      Array<{ id: string }>
    >`
      SELECT id
      FROM "subscriptions"
      WHERE LOWER(name) = LOWER(${name.trim()})
      LIMIT 1
    `;

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Subscription with this name already exists",
      });
    }

    const subscription = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        price: number;
        credits: number;
        createdAt: Date;
        updatedAt: Date;
      }>
    >`
      INSERT INTO "subscriptions" (
        id,
        name,
        price,
        credits,
        "createdAt",
        "updatedAt"
      )
      VALUES (
        gen_random_uuid(),
        ${name.trim()},
        ${price},
        ${credits},
        NOW(),
        NOW()
      )
      RETURNING
        id,
        name,
        price,
        credits,
        "createdAt",
        "updatedAt"
    `;

    return res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: subscription[0],
    });
  } catch (error) {
    logger.error("Create subscription error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create subscription",
    });
  }
};

export const updateSubscription = async (
  req: Request,
  res: Response,
) => {
  try {
    const subscriptionId = req.params.subscriptionId;
    const { name, price, credits } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        message: "Subscription ID is required",
      });
    }

    if (
      name !== undefined &&
      (typeof name !== "string" || !name.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription name",
      });
    }

    if (
      price !== undefined &&
      (typeof price !== "number" || price < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Price must be a non-negative number",
      });
    }

    if (
      credits !== undefined &&
      (typeof credits !== "number" || credits < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Credits must be a non-negative number",
      });
    }

    const existing = await prisma.$queryRaw<
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
      WHERE id = ${subscriptionId}
      LIMIT 1
    `;

    const existingSubscription = existing[0];

    if (!existingSubscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    const updatedName =
      name !== undefined
        ? name.trim()
        : existingSubscription.name;

    const updatedPrice =
      price !== undefined
        ? price
        : existingSubscription.price;

    const updatedCredits =
      credits !== undefined
        ? credits
        : existingSubscription.credits;

    const duplicate = await prisma.$queryRaw<
      Array<{ id: string }>
    >`
      SELECT id
      FROM "subscriptions"
      WHERE LOWER(name) = LOWER(${updatedName})
        AND id != ${subscriptionId}
      LIMIT 1
    `;

    if (duplicate.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Subscription with this name already exists",
      });
    }

    const updated = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        price: number;
        credits: number;
        createdAt: Date;
        updatedAt: Date;
      }>
    >`
      UPDATE "subscriptions"
      SET
        name = ${updatedName},
        price = ${updatedPrice},
        credits = ${updatedCredits},
        "updatedAt" = NOW()
      WHERE id = ${subscriptionId}
      RETURNING
        id,
        name,
        price,
        credits,
        "createdAt",
        "updatedAt"
    `;

    const updatedSubscription = updated[0];

    if (!updatedSubscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      data: updatedSubscription,
    });
  } catch (error) {
    logger.error("Update subscription error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update subscription",
    });
  }
};