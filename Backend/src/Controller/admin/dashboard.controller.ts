// Backend/src/controller/admin/dashboard.controller.ts
import type { Request, Response } from "express";
import { logger } from "../../config/logger.js";
import { prisma } from "../../lib/prisma.js";
import { CacheService } from "../../services/cache.service.js";

export const getDashboardStats = async (
  req: Request,
  res: Response,
) => {
  try {
    const cacheKey = CacheService.generateKey("dashboard:stats", {
      user: req.user?.id,
    });

    const cached = await CacheService.get(cacheKey);

    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    const [stats, recentOrders] = await Promise.all([
      prisma.$queryRaw<
        Array<{
          total_users: number;
          total_orders: number;
          total_projects: number;
          total_revenue: number;
          completed_orders: number;
          pending_orders: number;
          failed_orders: number;
          active_subscriptions: number;
        }>
      >`
        SELECT
          (SELECT COUNT(*)::int
           FROM "users") AS total_users,

          (SELECT COUNT(*)::int
           FROM "orders") AS total_orders,

          (SELECT COUNT(*)::int
           FROM "Project") AS total_projects,

          (SELECT COALESCE(SUM(amount), 0)::int
           FROM "orders"
           WHERE status = 'completed') AS total_revenue,

          (SELECT COUNT(*)::int
           FROM "orders"
           WHERE status = 'completed') AS completed_orders,

          (SELECT COUNT(*)::int
           FROM "orders"
           WHERE status = 'pending') AS pending_orders,

          (SELECT COUNT(*)::int
           FROM "orders"
           WHERE status = 'failed') AS failed_orders,

          (SELECT COUNT(*)::int
           FROM "user_subscriptions") AS active_subscriptions
      `,

      prisma.$queryRaw<
        Array<{
          id: string;
          amount: number;
          status: string;
          transaction_id: string | null;
          created_at: Date;
          user_name: string;
          user_email: string;
          subscription_name: string;
        }>
      >`
        SELECT
          o.id,
          o.amount,
          o.status::text AS status,
          o."transactionId" AS transaction_id,
          o."createdAt" AS created_at,
          u.name AS user_name,
          u.email AS user_email,
          s.name AS subscription_name
        FROM "orders" o
        INNER JOIN "users" u
          ON u.id = o."userId"
        INNER JOIN "subscriptions" s
          ON s.id = o."subscriptionId"
        ORDER BY o."createdAt" DESC
        LIMIT 5
      `,
    ]);

    const data = {
      totalUsers: stats[0]?.total_users ?? 0,
      totalOrders: stats[0]?.total_orders ?? 0,
      totalProjects: stats[0]?.total_projects ?? 0,
      totalRevenue: stats[0]?.total_revenue ?? 0,
      completedOrders: stats[0]?.completed_orders ?? 0,
      pendingOrders: stats[0]?.pending_orders ?? 0,
      failedOrders: stats[0]?.failed_orders ?? 0,
      activeSubscriptions: stats[0]?.active_subscriptions ?? 0,
      recentOrders,
    };

    await CacheService.set(cacheKey, data, 300);

    return res.status(200).json({
      success: true,
      data,
      cached: false,
    });
  } catch (error) {
    logger.error("Dashboard stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
};


export const getDashboardSummary = async (
  _req: Request,
  res: Response,
) => {
  try {
    const [stats, today, recentActivity] = await Promise.all([
      prisma.$queryRaw<
        Array<{
          total_users: number;
          total_orders: number;
          completed_orders: number;
          pending_orders: number;
          failed_orders: number;
          total_revenue: number;
          total_projects: number;
          generated_images: number;
          generated_videos: number;
          active_subscriptions: number;
        }>
      >`
        SELECT
          (SELECT COUNT(*)::int
           FROM "users") AS total_users,

          (SELECT COUNT(*)::int
           FROM "orders") AS total_orders,

          (SELECT COUNT(*)::int
           FROM "orders"
           WHERE status = 'completed') AS completed_orders,

          (SELECT COUNT(*)::int
           FROM "orders"
           WHERE status = 'pending') AS pending_orders,

          (SELECT COUNT(*)::int
           FROM "orders"
           WHERE status = 'failed') AS failed_orders,

          (SELECT COALESCE(SUM(amount), 0)::int
           FROM "orders"
           WHERE status = 'completed') AS total_revenue,

          (SELECT COUNT(*)::int
           FROM "Project") AS total_projects,

          (SELECT COUNT(*)::int
           FROM "Project"
           WHERE "generatedImage" IS NOT NULL
             AND "generatedImage" != '') AS generated_images,

          (SELECT COUNT(*)::int
           FROM "Project"
           WHERE "generatedVideo" IS NOT NULL
             AND "generatedVideo" != '') AS generated_videos,

          (SELECT COUNT(*)::int
           FROM "user_subscriptions") AS active_subscriptions
      `,

      prisma.$queryRaw<
        Array<{
          new_users_today: number;
          projects_today: number;
          orders_today: number;
          revenue_today: number;
        }>
      >`
        SELECT
          (
            SELECT COUNT(*)::int
            FROM "users"
            WHERE "createdAt" >= CURRENT_DATE
          ) AS new_users_today,

          (
            SELECT COUNT(*)::int
            FROM "Project"
            WHERE "createdAt" >= CURRENT_DATE
          ) AS projects_today,

          (
            SELECT COUNT(*)::int
            FROM "orders"
            WHERE "createdAt" >= CURRENT_DATE
          ) AS orders_today,

          (
            SELECT COALESCE(SUM(amount), 0)::int
            FROM "orders"
            WHERE "createdAt" >= CURRENT_DATE
              AND status = 'completed'
          ) AS revenue_today
      `,

      prisma.$queryRaw<
        Array<{
          type: string;
          id: string;
          title: string;
          created_at: Date;
        }>
      >`
        (
          SELECT
            'user' AS type,
            id::text AS id,
            name AS title,
            "createdAt" AS created_at
          FROM "users"
          ORDER BY "createdAt" DESC
          LIMIT 5
        )

        UNION ALL

        (
          SELECT
            'order' AS type,
            id::text AS id,
            CONCAT('Order #', LEFT(id::text, 8)) AS title,
            "createdAt" AS created_at
          FROM "orders"
          ORDER BY "createdAt" DESC
          LIMIT 5
        )

        UNION ALL

        (
          SELECT
            'project' AS type,
            id::text AS id,
            "projectName" AS title,
            "createdAt" AS created_at
          FROM "Project"
          ORDER BY "createdAt" DESC
          LIMIT 5
        )

        ORDER BY created_at DESC
        LIMIT 15
      `,
    ]);

    return res.status(200).json({
      success: true,
      data: {
        stats: stats[0] ?? {
          total_users: 0,
          total_orders: 0,
          completed_orders: 0,
          pending_orders: 0,
          failed_orders: 0,
          total_revenue: 0,
          total_projects: 0,
          generated_images: 0,
          generated_videos: 0,
          active_subscriptions: 0,
        },

        today: today[0] ?? {
          new_users_today: 0,
          projects_today: 0,
          orders_today: 0,
          revenue_today: 0,
        },

        recentActivity,
      },
    });
  } catch (error) {
    logger.error("Dashboard summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get dashboard summary",
    });
  }
};


export const getTimeSeriesStats = async (
  req: Request,
  res: Response,
) => {
  try {
    const period = String(req.query.period ?? "daily");

    let daysLimit = 30;

    if (period === "weekly") {
      daysLimit = 7;
    } else if (period === "monthly") {
      daysLimit = 30;
    } else if (period !== "daily") {
      return res.status(400).json({
        success: false,
        message: "Invalid period. Use daily, weekly, or monthly.",
      });
    }

    const [orders, users, projects] = await Promise.all([
      prisma.$queryRaw<
        Array<{
          date: Date;
          order_count: number;
          total_amount: number;
        }>
      >`
        SELECT
          DATE_TRUNC('day', "createdAt") AS date,
          COUNT(*)::int AS order_count,
          COALESCE(SUM(amount), 0)::int AS total_amount
        FROM "orders"
        WHERE "createdAt" >= NOW() - (${daysLimit} * INTERVAL '1 day')
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY date ASC
      `,

      prisma.$queryRaw<
        Array<{
          date: Date;
          new_users: number;
        }>
      >`
        SELECT
          DATE_TRUNC('day', "createdAt") AS date,
          COUNT(*)::int AS new_users
        FROM "users"
        WHERE "createdAt" >= NOW() - (${daysLimit} * INTERVAL '1 day')
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY date ASC
      `,

      prisma.$queryRaw<
        Array<{
          date: Date;
          new_projects: number;
        }>
      >`
        SELECT
          DATE_TRUNC('day', "createdAt") AS date,
          COUNT(*)::int AS new_projects
        FROM "Project"
        WHERE "createdAt" >= NOW() - (${daysLimit} * INTERVAL '1 day')
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY date ASC
      `,
    ]);

    return res.status(200).json({
      success: true,
      data: {
        orders,
        users,
        projects,
        period,
        days: daysLimit,
      },
    });
  } catch (error) {
    logger.error("Time series stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch time series stats",
    });
  }
};