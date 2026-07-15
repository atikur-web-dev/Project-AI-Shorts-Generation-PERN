// Backend/src/controller/admin.controller.ts
import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { logger } from "../config/logger.js";
import { createAdminLog } from "../services/adminLog.service.js";
import {
  saveSearchHistory,
  getSearchHistory,
  clearSearchHistory,
} from "../services/searchHistory.service.js";
import { CacheService } from '../services/cache.service.js';
import type { ParsedQs } from "qs";


// Get Dashboard Statistics (Admin only, private)
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const cacheKey = CacheService.generateKey('dashboard:stats', {
      user: req.user?.id,
    });

    // Try cache first
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, data: cached, cached: true });
    }

    // Fetch fresh data
    const [totalUsers, totalOrders, totalRevenue, totalProjects, recentOrders] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { amount: true },
        where: { status: 'completed' },
      }),
      prisma.project.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
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

    // Cache for 5 minutes
    await CacheService.set(cacheKey, data, 300);

    return res.status(200).json({ success: true, data, cached: false });
  } catch (error) {
    logger.error('Dashboard stats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};


// Get All Users with pagination metadata
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
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch users" });
  }
};

// Update User Role
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;
    const role = Array.isArray(req.body.role)
      ? req.body.role[0]
      : req.body.role;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
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
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (existingUser.role === role) {
      return res
        .status(400)
        .json({ success: false, message: "User already has this role" });
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

    // Invalidate caches after successful update
    await CacheService.invalidateUserCache(userId);
    await CacheService.invalidateDashboard(adminId);

    return res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    logger.error("Update User Role Error: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update User Role" });
  }
};


// Delete User
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as { userId: string };
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (userId === adminId) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot delete your own account" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await prisma.user.delete({ where: { id: userId } });

    await createAdminLog(adminId, "DELETE_USER", userId);

    return res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    logger.error("Delete user error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete user" });
  }
};

// Get All Orders
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
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch orders" });
  }
};

// Update Order Status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const orderId = Array.isArray(req.params.orderId)
      ? req.params.orderId[0]
      : req.params.orderId;
    const status = Array.isArray(req.body.status)
      ? req.body.status[0]
      : req.body.status;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID is required" });
    }

    if (!["pending", "completed", "failed"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });

    if (!existingOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
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
    return res
      .status(500)
      .json({ success: false, message: "Failed to update order" });
  }
};

// Get Time Series Statistics (Safe Raw SQL)
export const getTimeSeriesStats = async (req: Request, res: Response) => {
  try {
    const { period = "daily" } = req.query;

    let daysLimit = 30;
    if (period === "weekly") daysLimit = 7;
    else if (period === "monthly") daysLimit = 30;

    // Safe Dynamic SQL Query using Prisma.raw for dynamic intervals
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
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch stats" });
  }
};

// get admin logs (API)
export const getAdminLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.adminLog.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        admin: {
          select: { name: true, email: true },
        },
      },
    });

    res.json({ success: true, data: logs });
  } catch (error) {
    logger.error("Get admin logs error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch logs" });
  }
};

// User Search and Filter
export const searchUsersBasic = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id!;
    const { query, role, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    let sql = `
      SELECT id, name, email, role, "createdAt", 
             (SELECT COUNT(*) FROM projects WHERE "userId" = users.id) as project_count,
             (SELECT COUNT(*) FROM orders WHERE "userId" = users.id) as order_count
      FROM users
      WHERE 1=1
    `;

    const params: any[] = [];

    if (query) {
      sql += ` AND (name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 2})`;
      params.push(`%${query}%`, `%${query}%`);
    }

    if (role) {
      sql += ` AND role = $${params.length + 1}`;
      params.push(role);
    }

    sql += ` ORDER BY "${sortBy}" ${sortOrder === "asc" ? "ASC" : "DESC"}`;
    sql += ` LIMIT 50`;

    const users = await prisma.$queryRawUnsafe(sql, ...params);

    // Save search history (No existing functionality changed)
    await saveSearchHistory(
      adminId,
      String(query || ""),
      "users",
      role ? String(role) : undefined,
    );

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    logger.error("Search users error:", error);
    res.status(500).json({
      success: false,
      message: "Search failed",
    });
  }
};

// Revenue Report
export const getRevenueReport = async (req: Request, res: Response) => {
  try {
    const { period = "monthly" } = req.query as { period?: string };

    let dateTrunc: string;
    if (period === "daily") dateTrunc = "day";
    else if (period === "weekly") dateTrunc = "week";
    else if (period === "yearly") dateTrunc = "year";
    else dateTrunc = "month";

    // Safe Dynamic Identifier mapping to prevent Prisma query breakdown
    const safeTrunc = Prisma.raw(`'${dateTrunc}'`);

    // Raw SQL – Revenue by period
    const revenueData = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC(${safeTrunc}, "createdAt") as period,
        COUNT(*)::int as order_count,
        COALESCE(SUM(amount), 0)::float as total_revenue,
        COALESCE(AVG(amount), 0)::float as avg_order_value
      FROM "orders"
      WHERE status = 'completed'
      GROUP BY DATE_TRUNC(${safeTrunc}, "createdAt")
      ORDER BY period DESC
      LIMIT 12
    `;

    // Total summary
    const summary = await prisma.$queryRaw<any[]>`
      SELECT 
        COUNT(*)::int as total_orders,
        COALESCE(SUM(amount), 0)::float as total_revenue,
        COALESCE(AVG(amount), 0)::float as avg_order_value,
        COALESCE(MAX(amount), 0)::float as max_order_value,
        COALESCE(MIN(amount), 0)::float as min_order_value
      FROM "orders"
      WHERE status = 'completed'
    `;

    return res.status(200).json({
      success: true,
      data: {
        summary: summary[0] || {
          total_orders: 0,
          total_revenue: 0,
          avg_order_value: 0,
          max_order_value: 0,
          min_order_value: 0,
        },
        revenueData,
        period,
      },
    });
  } catch (error) {
    logger.error("Revenue report error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to generate revenue report" });
  }
};

// ============ Get Search History ============
export const getSearchHistoryController = async (
  req: Request,
  res: Response,
) => {
  try {
    const adminId = req.user?.id!;
    const history = await getSearchHistory(adminId);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    logger.error("Get search history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get search history",
    });
  }
};

// ============ Clear Search History ============
export const clearSearchHistoryController = async (
  req: Request,
  res: Response,
) => {
  try {
    const adminId = req.user?.id!;

    await clearSearchHistory(adminId);

    res.json({
      success: true,
      message: "Search history cleared",
    });
  } catch (error) {
    logger.error("Clear search history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear search history",
    });
  }
};

// User Activity report
export const getUserActivityReport = async (req: Request, res: Response) => {
  try {
    // 1. Top users by project count (Fixed Cartesian product multiplier and typecasting)
    const topUsersByProjects = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(DISTINCT p.id)::int as project_count,
        COUNT(DISTINCT o.id)::int as order_count,
        COALESCE(SUM(DISTINCT o.amount), 0)::float as total_spent
      FROM "users" u
      LEFT JOIN "projects" p ON p."userId" = u.id
      LEFT JOIN "orders" o ON o."userId" = u.id AND o.status = 'completed'
      GROUP BY u.id, u.name, u.email
      ORDER BY project_count DESC
      LIMIT 10
    `;

    // 2. Active users (last 30 days) (Fixed typecasting for JSON serialization)
    const activeUsers = await prisma.$queryRaw<any[]>`
      SELECT 
        COUNT(DISTINCT u.id)::int as active_users,
        COUNT(DISTINCT p.id)::int as projects_created,
        COUNT(DISTINCT o.id)::int as orders_placed
      FROM "users" u
      LEFT JOIN "projects" p ON p."userId" = u.id AND p."createdAt" >= NOW() - INTERVAL '30 days'
      LEFT JOIN "orders" o ON o."userId" = u.id AND o."createdAt" >= NOW() - INTERVAL '30 days'
    `;

    // 3. User growth (last 7 days) (Fixed BigInt conversion)
    const userGrowth = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', "createdAt") as date,
        COUNT(*)::int as new_users
      FROM "users"
      WHERE "createdAt" >= NOW() - INTERVAL '7 days'
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date DESC
    `;

    return res.status(200).json({
      success: true,
      data: {
        topUsersByProjects,
        activeUsers: activeUsers[0] || {
          active_users: 0,
          projects_created: 0,
          orders_placed: 0,
        },
        userGrowth,
      },
    });
  } catch (error) {
    logger.error("User activity report error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to generate user activity report",
      });
  }
};

// Project Analytics
export const getProjectAnalytics = async (req: Request, res: Response) => {
  try {
    // Total projects by status (Fixed BigInt casting & NULL/Empty string edge cases)
    const projectStats = await prisma.$queryRaw<any[]>`
      SELECT 
        COUNT(*)::int as total_projects,
        COUNT(CASE WHEN "generatedImage" IS NOT NULL AND "generatedImage" != '' THEN 1 END)::int as with_image,
        COUNT(CASE WHEN "generatedVideo" IS NOT NULL AND "generatedVideo" != '' THEN 1 END)::int as with_video,
        COUNT(CASE WHEN "generatedImage" IS NULL OR "generatedImage" = '' THEN 1 END)::int as without_image,
        COUNT(CASE WHEN ("generatedVideo" IS NULL OR "generatedVideo" = '') AND ("generatedImage" IS NOT NULL AND "generatedImage" != '') THEN 1 END)::int as image_only
      FROM "projects"
    `;

    // Most popular aspect ratios (Fixed BigInt casting for JSON conversion)
    const aspectRatios = await prisma.$queryRaw`
      SELECT 
        "aspectRatio",
        COUNT(*)::int as count
      FROM "projects"
      GROUP BY "aspectRatio"
      ORDER BY count DESC
    `;

    // Projects per day (last 30 days) (Fixed BigInt casting)
    const projectsTrend = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', "createdAt") as date,
        COUNT(*)::int as project_count
      FROM "projects"
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date DESC
    `;

    return res.status(200).json({
      success: true,
      data: {
        projectStats: projectStats || {
          total_projects: 0,
          with_image: 0,
          with_video: 0,
          without_image: 0,
          image_only: 0,
        },
        aspectRatios,
        projectsTrend,
      },
    });
  } catch (error) {
    logger.error("Project analytics error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to generate project analytics",
      });
  }
};

// Export Report (CSV)
export const exportReport = async (req: Request, res: Response) => {
  try {
    const { type = "users" } = req.query as { type?: string };

    let data: any[] = [];
    let headers: string[] = [];

    if (type === "users") {
      data = await prisma.$queryRaw`
        SELECT 
          id, name, email, role, "loginType", 
          "createdAt", 
          (SELECT COUNT(*)::int FROM "projects" p WHERE p."userId" = u.id) as project_count,
          (SELECT COUNT(*)::int FROM "orders" o WHERE o."userId" = u.id) as order_count
        FROM "users" u
        ORDER BY "createdAt" DESC
      `;
      headers = [
        "ID",
        "Name",
        "Email",
        "Role",
        "Login Type",
        "Created At",
        "Projects",
        "Orders",
      ];
    } else if (type === "orders") {
      data = await prisma.$queryRaw`
        SELECT 
          o.id, o.amount::float, o.status, o."createdAt",
          u.name as user_name, u.email as user_email,
          s.name as plan_name
        FROM "orders" o
        JOIN "users" u ON u.id = o."userId"
        JOIN "subscriptions" s ON s.id = o."subscriptionId"
        ORDER BY o."createdAt" DESC
      `;
      headers = [
        "Order ID",
        "Amount",
        "Status",
        "Created At",
        "User",
        "Email",
        "Plan",
      ];
    } else if (type === "projects") {
      data = await prisma.$queryRaw`
        SELECT 
          p.id, p."projectName", p."productName", 
          CASE WHEN p."generatedImage" IS NOT NULL AND p."generatedImage" != '' THEN 'Yes' ELSE 'No' END as has_image,
          CASE WHEN p."generatedVideo" IS NOT NULL AND p."generatedVideo" != '' THEN 'Yes' ELSE 'No' END as has_video,
          p."aspectRatio", p."createdAt",
          u.name as user_name
        FROM "projects" p
        JOIN "users" u ON u.id = p."userId"
        ORDER BY p."createdAt" DESC
      `;
      headers = [
        "Project ID",
        "Name",
        "Product",
        "Has Image",
        "Has Video",
        "Aspect Ratio",
        "Created At",
        "User",
      ];
    }

    // 1. Safe CSV Data Parsing (RFC 4180 Compliant - Prevents broken layout from commas or quotes)
    const escapeCSV = (val: any): string => {
      if (val === null || val === undefined) return "";
      let str = typeof val === "object" ? JSON.stringify(val) : String(val);
      str = str.replace(/"/g, '""');
      if (
        str.includes(",") ||
        str.includes('"') ||
        str.includes("\n") ||
        str.includes("\r")
      ) {
        str = `"${str}"`;
      }
      return str;
    };

    // 2. Build CSV with precise ordering mapping instead of raw Object.values()
    let csv = headers.join(",") + "\n";

    data.forEach((row) => {
      const rowValues = Object.keys(row).map((key) => escapeCSV(row[key]));
      csv += rowValues.join(",") + "\n";
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${type}_report_${Date.now()}.csv`,
    );
    return res.status(200).send(csv);
  } catch (error) {
    logger.error("Export report error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to export report" });
  }
};

// Dashboard Summary (All-in-One)
export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    // 1. Basic stats (Fixed BigInt casting to prevent server crash & NULL string safety)
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

    // 2. Today's stats (Fixed Index-friendly date ranges to avoid full table scans)
    const today = await prisma.$queryRaw<any[]>`
      SELECT 
        (SELECT COUNT(*)::int FROM "users" WHERE "createdAt" >= CURRENT_DATE) as new_users_today,
        (SELECT COUNT(*)::int FROM "orders" WHERE "createdAt" >= CURRENT_DATE) as orders_today,
        (SELECT COALESCE(SUM(amount), 0)::float FROM "orders" WHERE "createdAt" >= CURRENT_DATE AND status = 'completed') as revenue_today
    `;

    // 3. Recent activity (Fixed UNION ALL implicit casting errors for UUID/Int mixed types)
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
    return res
      .status(500)
      .json({ success: false, message: "Failed to get dashboard summary" });
  }
};

// ============ Advanced User Search with Pagination ============
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const options = getPaginationOptions(req.query);
    const { page, limit, sortBy, sortOrder, search, filter } = options;

    // Build WHERE clause
    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    // Search (name, email)
    if (search) {
      whereClause += ` AND (u.name ILIKE $${params.length + 1} OR u.email ILIKE $${params.length + 2})`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // Filter by role
    if (filter.role) {
      whereClause += ` AND u.role = $${params.length + 1}`;
      params.push(filter.role);
    }

    // Filter by login type
    if (filter.loginType) {
      whereClause += ` AND u."loginType" = $${params.length + 1}`;
      params.push(filter.loginType);
    }

    // Filter by date range
    if (filter.startDate) {
      whereClause += ` AND u."createdAt" >= $${params.length + 1}`;
      params.push(new Date(filter.startDate));
    }
    if (filter.endDate) {
      whereClause += ` AND u."createdAt" <= $${params.length + 1}`;
      params.push(new Date(filter.endDate));
    }

    // Get total count
    const countResult = await prisma.$queryRawUnsafe<{ total: string }>(
      `SELECT COUNT(*) as total 
      FROM users u
      ${whereClause}`,
    );
    const total = Number(countResult[0]?.total) || 0;

    // Get paginated data
    const offset = (page - 1) * limit;
    const data = await prisma.$queryRawUnsafe(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u."loginType",
        u.picture,
        u."createdAt",
        COUNT(DISTINCT p.id) as project_count,
        COUNT(DISTINCT o.id) as order_count,
        COALESCE(SUM(o.amount), 0) as total_spent
      FROM users u
      LEFT JOIN projects p ON p."userId" = u.id
      LEFT JOIN orders o ON o."userId" = u.id AND o.status = 'completed'
      ${whereClause}
      GROUP BY u.id
      ORDER BY "${sortBy}" ${sortOrder === "asc" ? "ASC" : "DESC"}
      LIMIT ${limit} OFFSET ${offset}`,
    );

    const response = buildPaginatedResponse(data, total, options);
    res.json({ success: true, ...response });
  } catch (error) {
    logger.error("Search users error:", error);
    res.status(500).json({ success: false, message: "Failed to search users" });
  }
};

function buildPaginatedResponse(data: unknown, total: number, options: any) {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
function getPaginationOptions(query: ParsedQs) {
  const pageValue = Array.isArray(query.page) ? query.page[0] : query.page;
  const limitValue = Array.isArray(query.limit) ? query.limit[0] : query.limit;
  const sortByValue = Array.isArray(query.sortBy)
    ? query.sortBy[0]
    : query.sortBy;
  const sortOrderValue = Array.isArray(query.sortOrder)
    ? query.sortOrder[0]
    : query.sortOrder;
  const searchValue = Array.isArray(query.search)
    ? query.search[0]
    : query.search;
  const roleValue = Array.isArray(query.role) ? query.role[0] : query.role;
  const loginTypeValue = Array.isArray(query.loginType)
    ? query.loginType[0]
    : query.loginType;
  const startDateValue = Array.isArray(query.startDate)
    ? query.startDate[0]
    : query.startDate;
  const endDateValue = Array.isArray(query.endDate)
    ? query.endDate[0]
    : query.endDate;

  const page = Number(pageValue) > 0 ? Number(pageValue) : 1;
  let limit = Number(limitValue) > 0 ? Number(limitValue) : 10;
  if (limit > 100) limit = 100;

  const sortBy =
    typeof sortByValue === "string" && sortByValue.trim() !== ""
      ? sortByValue
      : "createdAt";
  const sortOrderRaw =
    typeof sortOrderValue === "string" ? sortOrderValue.toLowerCase() : "desc";
  const sortOrder = sortOrderRaw === "asc" ? "asc" : "desc";

  const search =
    typeof searchValue === "string" && searchValue.trim() !== ""
      ? searchValue.trim()
      : undefined;

  return {
    page,
    limit,
    sortBy,
    sortOrder,
    search,
    filter: {
      role:
        typeof roleValue === "string" && roleValue.trim() !== ""
          ? roleValue
          : undefined,
      loginType:
        typeof loginTypeValue === "string" && loginTypeValue.trim() !== ""
          ? loginTypeValue
          : undefined,
      startDate:
        typeof startDateValue === "string" && startDateValue.trim() !== ""
          ? startDateValue
          : undefined,
      endDate:
        typeof endDateValue === "string" && endDateValue.trim() !== ""
          ? endDateValue
          : undefined,
    },
  };
}

// ============ Cursor-based Pagination (Next/Previous) ============
export const getUsersCursor = async (req: Request, res: Response) => {
  try {
    const {
      cursor,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    const take = parseInt(limit as string) + 1; // +1 to check if next exists

    let whereClause = "";
    const params: any[] = [];

    if (cursor) {
      const decoded = Buffer.from(cursor as string, "base64").toString();
      const [field, value] = decoded.split("|");
      whereClause = `WHERE "createdAt" ${sortOrder === "desc" ? "<" : ">"} $${params.length + 1}`;
      if (value) params.push(new Date(value));
    }

    const query = `
      SELECT 
        id, name, email, role, "createdAt"
      FROM users
      ${whereClause}
      ORDER BY "${sortBy}" ${sortOrder === "asc" ? "ASC" : "DESC"}
      LIMIT ${take}
    `;

    const data = (await prisma.$queryRawUnsafe(query, ...params)) as any[];

    // Check if next exists
    const hasNext = data.length > parseInt(limit as string);
    const result = hasNext ? data.slice(0, -1) : data;

    // Generate next cursor
    let nextCursor: string | null = null;
    if (hasNext && result.length > 0) {
      const last = result[result.length - 1];
      const cursorValue = `${sortBy}|${last.createdAt}`;
      nextCursor = Buffer.from(cursorValue).toString("base64");
    }

    res.json({
      success: true,
      data: result,
      meta: {
        hasNext,
        nextCursor,
        limit: parseInt(limit as string),
      },
    });
  } catch (error) {
    logger.error("Cursor pagination error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};
