import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { logger } from "../../config/logger.js";
import { createAdminLog } from "../../services/adminLog.service.js";

const ORDER_STATUSES = ["pending", "completed", "failed"] as const;

export const getAllOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        subscription: { select: { name: true, price: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    logger.error("Get orders error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch orders" });
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