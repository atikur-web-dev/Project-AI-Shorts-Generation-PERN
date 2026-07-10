// Backend/src/middleware/admin.controller.ts
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { logger } from "../config/logger.js";

//Dashboard Statistics
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

    res.json({
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
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};

// Get all users
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
    res.json({ success: true, data: users });
  } catch (error) {
    logger.error("Get users error: ", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// update user role
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const userIdParam = req.params.userId;
    const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;
    const { role } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Missing userId parameter",
      });
    }

    if (!["USER", "ADMIN"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be user or admin",
      });
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json({ success: true, data: user });
  } catch (error) {
    logger.error("Update User Role: ", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update User Role" });
  }
};

// Delete User
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userIdParam = req.params.userId;
    const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing userId parameter',
      });
    }

    // Prevent admin self-deletion
    if (userId === req.user?.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account',
      });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};

// Get all Orders
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        subscription: { select: { name: true, price: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    logger.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const orderIdParam = req.params.orderId;
    const orderId = Array.isArray(orderIdParam) ? orderIdParam[0] : orderIdParam;
    const { status } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Missing orderId parameter' });
    }

    if (!['pending', 'completed', 'failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: { select: { name: true, email: true } },
        subscription: { select: { name: true } },
      },
    });

    res.json({ success: true, data: order });
  } catch (error) {
    logger.error('Update order error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order' });
  }
};