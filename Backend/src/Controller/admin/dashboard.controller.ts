import type { Request, Response } from "express";
import { logger } from "../../config/logger.js";
import { prisma } from "../../lib/prisma.js";
import { CacheService } from "../../services/cache.service.js";
import { Prisma } from "../../generated/prisma/client.js";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const cacheKey = CacheService.generateKey("dashboard:stats", {
      user: req.user?.id,
    });

    const cached = await CacheService.get(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, data: cached, cached: true });
    }

    const [totalUsers, totalOrders, totalRevenue, totalProjects, recentOrders] = await Promise.all([
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

    const data = {
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalProjects,
      recentOrders,
    };

    await CacheService.set(cacheKey, data, 300);

    return res.status(200).json({ success: true, data, cached: false });
  } catch (error) {
    logger.error("Dashboard stats error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};

export const getDashboardSummary = async (_req: Request, res: Response) => {
  try {
    const stats = await prisma.$queryRaw<any[]>`
      SELECT 
        (SELECT COUNT(*)::int FROM "users") as total_users,
        (SELECT COUNT(*)::int FROM "orders") as total_orders,
        (SELECT COUNT(*)::int FROM "orders" WHERE status = 'completed') as completed_orders,
        (SELECT COALESCE(SUM(amount), 0)::float FROM "orders" WHERE status = 'completed') as total_revenue,
        (SELECT COUNT(*)::int FROM "projects") as total_projects,
        (SELECT COUNT(*)::int FROM "projects" WHERE "generatedImage" IS NOT NULL AND "generatedImage" != '') as generated_images,
        (SELECT COUNT(*)::int FROM "projects" WHERE "generatedVideo" IS NOT NULL AND "generatedVideo" != '') as generated_videos
    `;

    const today = await prisma.$queryRaw<any[]>`
      SELECT 
        (SELECT COUNT(*)::int FROM "users" WHERE "createdAt" >= CURRENT_DATE) as new_users_today,
        (SELECT COUNT(*)::int FROM "orders" WHERE "createdAt" >= CURRENT_DATE) as orders_today,
        (SELECT COALESCE(SUM(amount), 0)::float FROM "orders" WHERE "createdAt" >= CURRENT_DATE AND status = 'completed') as revenue_today
    `;

    const recentActivity = await prisma.$queryRaw`
      (SELECT 'user' as type, id::text, name as title, "createdAt" 
       FROM "users" 
       ORDER BY "createdAt" DESC 
       LIMIT 5)
      UNION ALL
      (SELECT 'order' as type, id::text, CONCAT('Order #', id::text) as title, "createdAt" 
       FROM "orders" 
       ORDER BY "createdAt" DESC 
       LIMIT 5)
      ORDER BY "createdAt" DESC
      LIMIT 10
    `;

    return res.status(200).json({
      success: true,
      data: {
        stats: stats[0] || {
          total_users: 0,
          total_orders: 0,
          completed_orders: 0,
          total_revenue: 0,
          total_projects: 0,
          generated_images: 0,
          generated_videos: 0,
        },
        today: today[0] || {
          new_users_today: 0,
          orders_today: 0,
          revenue_today: 0,
        },
        recentActivity,
      },
    });
  } catch (error) {
    logger.error("Dashboard summary error:", error);
    return res.status(500).json({ success: false, message: "Failed to get dashboard summary" });
  }
};

export const getTimeSeriesStats = async (req: Request, res: Response) => {
  try {
    const { period = "daily" } = req.query;

    let daysLimit = 30;
    if (period === "weekly") daysLimit = 7;
    else if (period === "monthly") daysLimit = 30;

    const intervalQuery = Prisma.raw(`'${daysLimit} days'`);

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