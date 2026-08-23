import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { logger } from "../../config/logger.js";
import { Prisma } from "../../generated/prisma/client.js";

const escapeCSV = (value: any): string => {
  if (value === null || value === undefined) return "";
  const str = typeof value === "object" ? JSON.stringify(value) : String(value);
  const escaped = str.replace(/"/g, '""');
  if (escaped.includes(",") || escaped.includes('"') || escaped.includes("\n") || escaped.includes("\r")) {
    return `"${escaped}"`;
  }
  return escaped;
};

export const getRevenueReport = async (req: Request, res: Response) => {
  try {
    const { period = "monthly" } = req.query as { period?: string };

    let dateTrunc = "month";
    if (period === "daily") dateTrunc = "day";
    else if (period === "weekly") dateTrunc = "week";
    else if (period === "yearly") dateTrunc = "year";

    const safeTrunc = Prisma.raw(`'${dateTrunc}'`);

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
    return res.status(500).json({ success: false, message: "Failed to generate revenue report" });
  }
};

export const getUserActivityReport = async (_req: Request, res: Response) => {
  try {
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

    const activeUsers = await prisma.$queryRaw<any[]>`
      SELECT 
        COUNT(DISTINCT u.id)::int as active_users,
        COUNT(DISTINCT p.id)::int as projects_created,
        COUNT(DISTINCT o.id)::int as orders_placed
      FROM "users" u
      LEFT JOIN "projects" p ON p."userId" = u.id AND p."createdAt" >= NOW() - INTERVAL '30 days'
      LEFT JOIN "orders" o ON o."userId" = u.id AND o."createdAt" >= NOW() - INTERVAL '30 days'
    `;

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
    return res.status(500).json({
      success: false,
      message: "Failed to generate user activity report",
    });
  }
};

export const getProjectAnalytics = async (_req: Request, res: Response) => {
  try {
    const projectStats = await prisma.$queryRaw<any[]>`
      SELECT 
        COUNT(*)::int as total_projects,
        COUNT(CASE WHEN "generatedImage" IS NOT NULL AND "generatedImage" != '' THEN 1 END)::int as with_image,
        COUNT(CASE WHEN "generatedVideo" IS NOT NULL AND "generatedVideo" != '' THEN 1 END)::int as with_video,
        COUNT(CASE WHEN "generatedImage" IS NULL OR "generatedImage" = '' THEN 1 END)::int as without_image,
        COUNT(CASE WHEN ("generatedVideo" IS NULL OR "generatedVideo" = '') AND ("generatedImage" IS NOT NULL AND "generatedImage" != '') THEN 1 END)::int as image_only
      FROM "projects"
    `;

    const aspectRatios = await prisma.$queryRaw`
      SELECT "aspectRatio", COUNT(*)::int as count
      FROM "projects"
      GROUP BY "aspectRatio"
      ORDER BY count DESC
    `;

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
        projectStats: projectStats[0] || {
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
    return res.status(500).json({
      success: false,
      message: "Failed to generate project analytics",
    });
  }
};

export const exportReport = async (req: Request, res: Response) => {
  try {
    const { type = "users" } = req.query as { type?: string };

    let data: any[] = [];
    let headers: string[] = [];

    if (type === "users") {
      data = await prisma.$queryRaw`
        SELECT 
          id, name, email, role, "loginType", "createdAt",
          (SELECT COUNT(*)::int FROM "projects" p WHERE p."userId" = u.id) as project_count,
          (SELECT COUNT(*)::int FROM "orders" o WHERE o."userId" = u.id) as order_count
        FROM "users" u
        ORDER BY "createdAt" DESC
      `;
      headers = ["ID", "Name", "Email", "Role", "Login Type", "Created At", "Projects", "Orders"];
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
      headers = ["Order ID", "Amount", "Status", "Created At", "User", "Email", "Plan"];
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
      headers = ["Project ID", "Name", "Product", "Has Image", "Has Video", "Aspect Ratio", "Created At", "User"];
    } else {
      return res.status(400).json({ success: false, message: "Invalid export type" });
    }

    let csv = headers.join(",") + "\n";
    for (const row of data) {
      const rowValues = Object.keys(row).map((key) => escapeCSV(row[key]));
      csv += rowValues.join(",") + "\n";
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${type}_report_${Date.now()}.csv`);
    return res.status(200).send(csv);
  } catch (error) {
    logger.error("Export report error:", error);
    return res.status(500).json({ success: false, message: "Failed to export report" });
  }
};