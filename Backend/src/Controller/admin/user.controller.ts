import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { logger } from "../../config/logger.js";
import { createAdminLog } from "../../services/adminLog.service.js";
import { CacheService } from "../../services/cache.service.js";
import { getPaginationOptions, buildPaginatedResponse } from "../../utils/pagination.js";

const ALLOWED_ROLES = ["USER", "ADMIN"] as const;

export const getAllUsers = async (_req: Request, res: Response) => {
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
    logger.error("Get users error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

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

    if (!ALLOWED_ROLES.includes(role as any)) {
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

    await CacheService.invalidateUserCache(userId);
    await CacheService.invalidateDashboard(adminId);

    return res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    logger.error("Update user role error:", error);
    return res.status(500).json({ success: false, message: "Failed to update user role" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
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
    await createAdminLog(adminId, "DELETE_USER", userId);

    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    logger.error("Delete user error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

export const searchUsers = async (req: Request, res: Response) => {
  try {
    const options = getPaginationOptions(req.query);
    const { page, limit, sortBy, sortOrder, search, filter } = options;

    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (search) {
      whereClause += ` AND (u.name ILIKE $${params.length + 1} OR u.email ILIKE $${params.length + 2})`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (filter.role) {
      whereClause += ` AND u.role = $${params.length + 1}`;
      params.push(filter.role);
    }

    if (filter.loginType) {
      whereClause += ` AND u."loginType" = $${params.length + 1}`;
      params.push(filter.loginType);
    }

    if (filter.startDate) {
      whereClause += ` AND u."createdAt" >= $${params.length + 1}`;
      params.push(new Date(filter.startDate));
    }

    if (filter.endDate) {
      whereClause += ` AND u."createdAt" <= $${params.length + 1}`;
      params.push(new Date(filter.endDate));
    }

    const countResult = await prisma.$queryRawUnsafe<{ total: string }>(
      `SELECT COUNT(*) as total FROM users u ${whereClause}`,
      ...params
    );

    const total = Number(countResult[0]?.total) || 0;
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
      ...params
    );

    const response = buildPaginatedResponse(data as any[], total, options);
    return res.json({ success: true, ...response });
  } catch (error) {
    logger.error("Search users error:", error);
    return res.status(500).json({ success: false, message: "Failed to search users" });
  }
};

export const getUsersCursor = async (req: Request, res: Response) => {
  try {
    const { cursor, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const take = parseInt(limit as string) + 1;

    let whereClause = "";
    const params: any[] = [];

    if (cursor) {
      const decoded = Buffer.from(cursor as string, "base64").toString();
      const [, value] = decoded.split("|");
      whereClause = `WHERE "createdAt" ${sortOrder === "desc" ? "<" : ">"} $${params.length + 1}`;
      if (value) params.push(new Date(value));
    }

    const query = `
      SELECT id, name, email, role, "createdAt"
      FROM users
      ${whereClause}
      ORDER BY "${sortBy}" ${sortOrder === "asc" ? "ASC" : "DESC"}
      LIMIT ${take}
    `;

    const data = (await prisma.$queryRawUnsafe(query, ...params)) as any[];
    const hasNext = data.length > parseInt(limit as string);
    const result = hasNext ? data.slice(0, -1) : data;

    let nextCursor: string | null = null;
    if (hasNext && result.length > 0) {
      const last = result[result.length - 1];
      const cursorValue = `${sortBy}|${last.createdAt}`;
      nextCursor = Buffer.from(cursorValue).toString("base64");
    }

    return res.json({
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
    return res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};