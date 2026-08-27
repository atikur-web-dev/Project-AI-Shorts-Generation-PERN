// Backend/src/controller/admin/user.controller.ts
import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { logger } from "../../config/logger.js";
import { createAdminLog } from "../../services/adminLog.service.js";
import { CacheService } from "../../services/cache.service.js";
import {
  getPaginationOptions,
  buildPaginatedResponse,
} from "../../utils/pagination.js";

const ALLOWED_ROLES = ["USER", "ADMIN"] as const;

const ALLOWED_SORT_COLUMNS: Record<string, string> = {
  name: 'u."name"',
  email: 'u."email"',
  role: 'u."role"',
  loginType: 'u."loginType"',
  createdAt: 'u."createdAt"',
  project_count: "project_count",
  order_count: "order_count",
  total_spent: "total_spent",
};

const ALLOWED_CURSOR_SORT_COLUMNS: Record<string, string> = {
  name: '"name"',
  email: '"email"',
  role: '"role"',
  createdAt: '"createdAt"',
};

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.$queryRaw<any[]>`
      SELECT
        u.id,
        u.name,
        u.email,
        u.picture,
        u.role,
        u."loginType",
        u."createdAt",

        (
          SELECT COUNT(*)::int
          FROM "Project" p
          WHERE p."userId" = u.id
        ) AS project_count,

        (
          SELECT COUNT(*)::int
          FROM "orders" o
          WHERE o."userId" = u.id
        ) AS order_count

      FROM "users" u
      ORDER BY u."createdAt" DESC
    `;

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    logger.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

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
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!ALLOWED_ROLES.includes(role as any)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be USER or ADMIN",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (existingUser.role === role) {
      return res.status(400).json({
        success: false,
        message: "User already has this role",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    await createAdminLog(adminId, "UPDATE_USER_ROLE", userId, {
      newRole: role,
      previousRole: existingUser.role,
    });

    await CacheService.invalidateUserCache(userId);
    await CacheService.invalidateDashboard(adminId);

    return res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    logger.error("Update user role error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user role",
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;

    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (userId === adminId) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    await createAdminLog(adminId, "DELETE_USER", userId);

    await CacheService.invalidateUserCache(userId);
    await CacheService.invalidateDashboard(adminId);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    logger.error("Delete user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

export const searchUsers = async (req: Request, res: Response) => {
  try {
    const options = getPaginationOptions(req.query);

    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      filter,
    } = options;

    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (search) {
      whereClause += `
        AND (
          u.name ILIKE $${params.length + 1}
          OR u.email ILIKE $${params.length + 2}
        )
      `;

      params.push(
        `%${search}%`,
        `%${search}%`,
      );
    }

    if (filter.role) {
      whereClause += `
        AND u.role = $${params.length + 1}
      `;

      params.push(filter.role);
    }

    if (filter.loginType) {
      whereClause += `
        AND u."loginType" = $${params.length + 1}
      `;

      params.push(filter.loginType);
    }

    if (filter.startDate) {
      whereClause += `
        AND u."createdAt" >= $${params.length + 1}
      `;

      params.push(new Date(filter.startDate));
    }

    if (filter.endDate) {
      whereClause += `
        AND u."createdAt" <= $${params.length + 1}
      `;

      params.push(new Date(filter.endDate));
    }

    const countResult = await prisma.$queryRawUnsafe<
      { total: string }[]
    >(
      `
        SELECT COUNT(*)::text AS total
        FROM "users" u
        ${whereClause}
      `,
      ...params,
    );

    const total = Number(countResult[0]?.total) || 0;

    const offset = (page - 1) * limit;

    const orderByColumn =
      ALLOWED_SORT_COLUMNS[sortBy] ??
      'u."createdAt"';

    const orderDirection =
      sortOrder === "asc" ? "ASC" : "DESC";

    const data = await prisma.$queryRawUnsafe(
      `
        SELECT
          u.id,
          u.name,
          u.email,
          u.role,
          u."loginType",
          u.picture,
          u."createdAt",

          COUNT(DISTINCT p.id)::int AS project_count,

          COUNT(DISTINCT o.id)::int AS order_count,

          COALESCE(
            SUM(o.amount),
            0
          )::float AS total_spent

        FROM "users" u

        LEFT JOIN "Project" p
          ON p."userId" = u.id

        LEFT JOIN "orders" o
          ON o."userId" = u.id
          AND o.status = 'completed'

        ${whereClause}

        GROUP BY
          u.id,
          u.name,
          u.email,
          u.role,
          u."loginType",
          u.picture,
          u."createdAt"

        ORDER BY
          ${orderByColumn} ${orderDirection}

        LIMIT ${limit}
        OFFSET ${offset}
      `,
      ...params,
    );

    const response = buildPaginatedResponse(
      data as any[],
      total,
      options,
    );

    return res.json({
      success: true,
      ...response,
    });
  } catch (error) {
    logger.error("Search users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search users",
    });
  }
};

export const getUsersCursor = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      cursor,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const parsedLimit = Math.min(
      Math.max(Number(limit) || 10, 1),
      100,
    );

    const safeSortBy =
      ALLOWED_CURSOR_SORT_COLUMNS[String(sortBy)] ??
      '"createdAt"';

    const safeSortOrder =
      sortOrder === "asc" ? "ASC" : "DESC";

    const take = parsedLimit + 1;

    let whereClause = "";
    const params: any[] = [];

    if (cursor) {
      const decoded = Buffer.from(
        String(cursor),
        "base64",
      ).toString("utf-8");

      const separatorIndex = decoded.indexOf("|");

      if (separatorIndex === -1) {
        return res.status(400).json({
          success: false,
          message: "Invalid cursor",
        });
      }

      const cursorValue = decoded.slice(
        separatorIndex + 1,
      );

      if (!cursorValue) {
        return res.status(400).json({
          success: false,
          message: "Invalid cursor",
        });
      }

      whereClause = `
        WHERE "createdAt" ${
          safeSortOrder === "DESC" ? "<" : ">"
        } $1
      `;

      params.push(new Date(cursorValue));
    }

    const query = `
      SELECT
        id,
        name,
        email,
        role,
        "loginType",
        picture,
        "createdAt"

      FROM "users"

      ${whereClause}

      ORDER BY
        ${safeSortBy} ${safeSortOrder}

      LIMIT ${take}
    `;

    const data = (
      await prisma.$queryRawUnsafe(
        query,
        ...params,
      )
    ) as any[];

    const hasNext =
      data.length > parsedLimit;

    const result = hasNext
      ? data.slice(0, parsedLimit)
      : data;

    let nextCursor: string | null = null;

    if (hasNext && result.length > 0) {
      const last =
        result[result.length - 1];

      const cursorValue =
        `${String(sortBy)}|${last.createdAt}`;

      nextCursor = Buffer.from(
        cursorValue,
      ).toString("base64");
    }

    return res.json({
      success: true,
      data: result,
      meta: {
        hasNext,
        nextCursor,
        limit: parsedLimit,
        sortBy: String(sortBy),
        sortOrder: safeSortOrder.toLowerCase(),
      },
    });
  } catch (error) {
    logger.error(
      "Cursor pagination error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};