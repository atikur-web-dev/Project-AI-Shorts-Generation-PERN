// Backend/src/controller/admin.controller.ts
import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { logger } from "../config/logger.js";
import { createAdminLog } from "../services/adminLog.service.js";

/**
 * @desc    Get Dashboard Statistics
 * @route   GET /api/v1/admin/dashboard-stats
 * @access  Private/Admin
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [totalUsers, totalOrders, totalRevenue, totalProjects, recentOrders] =
      await Promise.all([
        prisma.user.count(),
        prisma.order.count(),
        prisma.order.aggregate({
          _sum: { amount: true },
          where: { status: "completed" },
        }),
        prisma.project.count(),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { name: true, email: true } },
            subscription: { select: { name: true } },
          },
        }),
      ]);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalProjects,
        recentOrders,
      },
    });
  } catch (error) {
    logger.error("Dashboard stats error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};

/**
 * @desc    Get All Users with pagination metadata (Recommended for Industry Standard)
 * @route   GET /api/v1/admin/users
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        picture: true,
        role: true,
        loginType: true,
        createdAt: true,
        _count: {
          select: {
            projects: true,
            orders: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    logger.error("Get users error: ", error);
    return res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

/**
 * @desc    Update User Role
 * @route   PATCH /api/v1/admin/users/:userId/role
 */
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const role = Array.isArray(req.body.role) ? req.body.role[0] : req.body.role;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    if (!["USER", "ADMIN"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be USER or ADMIN",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // আগের রোল এবং নতুন রোল এক হলে ডাটাবেজ হিট করার দরকার নেই
    if (existingUser.role === role) {
      return res.status(400).json({ success: false, message: "User already has this role" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    await createAdminLog(adminId, "UPDATE_USER_ROLE", userId, {
      newRole: role,
      previousRole: existingUser.role,
    });

    return res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    logger.error("Update User Role Error: ", error);
    return res.status(500).json({ success: false, message: "Failed to update User Role" });
  }
};

/**
 * @desc    Delete User
 * @route   DELETE /api/v1/admin/users/:userId
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as { userId: string };
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (userId === adminId) {
      return res.status(400).json({ success: false, message: "Cannot delete your own account" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await prisma.user.delete({ where: { id: userId } });

    await createAdminLog(adminId, 'DELETE_USER', userId);

    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    logger.error("Delete user error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

/**
 * @desc    Get All Orders
 * @route   GET /api/v1/admin/orders
 */
export const getAllOrders = async (req: Request, res: Response) => {
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

/**
 * @desc    Update Order Status
 * @route   PATCH /api/v1/admin/orders/:orderId/status
 */
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

    if (!["pending", "completed", "failed"].includes(status)) {
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

    await createAdminLog(adminId, 'UPDATE_ORDER_STATUS', orderId, {
      newStatus: status,
      previousStatus: existingOrder.status,
    });

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    logger.error("Update order error:", error);
    return res.status(500).json({ success: false, message: "Failed to update order" });
  }
};

/**
 * @desc    Get Time Series Statistics (Safe Raw SQL)
 * @route   GET /api/v1/admin/time-series
 */
export const getTimeSeriesStats = async (req: Request, res: Response) => {
  try {
    const { period = "daily" } = req.query;

    // ইন্ডাস্ট্রি স্ট্যান্ডার্ড ভ্যালু ম্যাপিং এবং টাইপ সেফ SQL Injection প্রোটেকশন
    let daysLimit = 30;
    if (period === "weekly") daysLimit = 7;
    else if (period === "monthly") daysLimit = 30;

    // Safe Dynamic SQL Query using Prisma.raw for dynamic intervals
    const intervalQuery = Prisma.raw(`'${daysLimit} days'`);

    // প্রিজমার নিয়মানুযায়ী এখানে টেবিল নেম সিঙ্গুলার এবং স্মলকেস হওয়ার কথা schema অনুযায়ী (যেমন: "User", "Order")
    const orders = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', "createdAt") as date,
        COUNT(*)::int as order_count,
        COALESCE(SUM(amount), 0)::float as total_amount
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL ${intervalQuery}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date DESC
    `;

    const users = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', "createdAt") as date,
        COUNT(*)::int as new_users
      FROM "User"
      WHERE "createdAt" >= NOW() - INTERVAL ${intervalQuery}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date DESC
    `;

    return res.status(200).json({
      success: true,
      data: { orders, users, period },
    });
  } catch (error) {
    logger.error("Time series stats error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};
