// Backend/src/controller/admin/order.controller.ts
import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { logger } from "../../config/logger.js";
import { createAdminLog } from "../../services/adminLog.service.js";

const ORDER_STATUSES = ["pending", "completed", "failed"] as const;

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      100,
    );
    const offset = (page - 1) * limit;

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const status =
      typeof req.query.status === "string"
        ? req.query.status
        : "";

    const params: unknown[] = [];
    let whereClause = "WHERE 1 = 1";

    if (search) {
      params.push(`%${search}%`);

      whereClause += `
        AND (
          u.name ILIKE $${params.length}
          OR u.email ILIKE $${params.length}
          OR o.id::text ILIKE $${params.length}
          OR COALESCE(o."transactionId", '') ILIKE $${params.length}
        )
      `;
    }

    if (status) {
      if (!ORDER_STATUSES.includes(status as any)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status",
        });
      }

      params.push(status);
      whereClause += ` AND o.status = $${params.length}`;
    }

    const countResult = await prisma.$queryRawUnsafe<
      Array<{ total: bigint }>
    >(
      `
        SELECT COUNT(*) AS total
        FROM "orders" o
        INNER JOIN "users" u
          ON u.id = o."userId"
        ${whereClause}
      `,
      ...params,
    );

    const total = Number(countResult[0]?.total ?? 0);

    const dataParams = [...params, limit, offset];

    const orders = await prisma.$queryRawUnsafe(
      `
        SELECT
          o.id,
          o."userId",
          o."subscriptionId",
          o.amount,
          o.status,
          o."transactionId",
          o."createdAt",
          o."updatedAt",

          u.name AS user_name,
          u.email AS user_email,
          u.picture AS user_picture,

          s.name AS subscription_name,
          s.price AS subscription_price,
          s.credits AS subscription_credits

        FROM "orders" o

        INNER JOIN "users" u
          ON u.id = o."userId"

        INNER JOIN "subscriptions" s
          ON s.id = o."subscriptionId"

        ${whereClause}

        ORDER BY o."createdAt" DESC

        LIMIT $${dataParams.length - 1}
        OFFSET $${dataParams.length}
      `,
      ...dataParams,
    );

    return res.status(200).json({
      success: true,
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    logger.error("Get orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const orderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
    const status = Array.isArray(req.body.status) ? req.body.status[0] : req.body.status;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    if (!ORDER_STATUSES.includes(status as any)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });

    if (!existingOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: { select: { name: true, email: true } },
        subscription: { select: { name: true } },
      },
    });

    await createAdminLog(adminId, "UPDATE_ORDER_STATUS", orderId, {
      newStatus: status,
      previousStatus: existingOrder.status,
    });

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    logger.error("Update order error:", error);
    return res.status(500).json({ success: false, message: "Failed to update order" });
  }
};