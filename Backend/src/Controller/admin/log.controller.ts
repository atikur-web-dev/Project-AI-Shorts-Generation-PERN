import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { logger } from "../../config/logger.js";
import { saveSearchHistory, getSearchHistory, clearSearchHistory } from "../../services/searchHistory.service.js";

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

    return res.json({ success: true, data: logs });
  } catch (error) {
    logger.error("Get admin logs error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch logs" });
  }
};

export const searchUsersBasic = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id;
    const { query, role, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

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

    const sortDirection = sortOrder === "asc" ? "ASC" : "DESC";
    sql += ` ORDER BY "${sortBy}" ${sortDirection} LIMIT 50`;

    const users = await prisma.$queryRawUnsafe(sql, ...params);

    await saveSearchHistory(adminId, String(query || ""), "users", role ? String(role) : undefined);

    return res.json({ success: true, data: users });
  } catch (error) {
    logger.error("Search users basic error:", error);
    return res.status(500).json({ success: false, message: "Search failed" });
  }
};

export const getSearchHistoryController = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const history = await getSearchHistory(adminId);
    return res.json({ success: true, data: history });
  } catch (error) {
    logger.error("Get search history error:", error);
    return res.status(500).json({ success: false, message: "Failed to get search history" });
  }
};

export const clearSearchHistoryController = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await clearSearchHistory(adminId);
    return res.json({ success: true, message: "Search history cleared" });
  } catch (error) {
    logger.error("Clear search history error:", error);
    return res.status(500).json({ success: false, message: "Failed to clear search history" });
  }
};