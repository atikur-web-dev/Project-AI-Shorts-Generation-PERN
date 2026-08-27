// Backend/src/controller/admin/project.controller.ts
import type { Request, Response } from "express";

import { logger } from "../../config/logger.js";
import { prisma } from "../../lib/prisma.js";

export const getAllProjects = async (
  req: Request,
  res: Response,
) => {
  try {
    const page = Math.max(
      Number(req.query.page) || 1,
      1,
    );

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      100,
    );

    const offset = (page - 1) * limit;

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const isPublic =
      typeof req.query.isPublic === "string"
        ? req.query.isPublic
        : undefined;

    const hasGeneratedImage =
      typeof req.query.hasGeneratedImage === "string"
        ? req.query.hasGeneratedImage
        : undefined;

    const hasGeneratedVideo =
      typeof req.query.hasGeneratedVideo === "string"
        ? req.query.hasGeneratedVideo
        : undefined;

    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "projectName",
      "productName",
    ];

    const requestedSortBy =
      typeof req.query.sortBy === "string"
        ? req.query.sortBy
        : "createdAt";

    const sortBy = allowedSortFields.includes(
      requestedSortBy,
    )
      ? requestedSortBy
      : "createdAt";

    const sortOrder =
      req.query.sortOrder === "asc"
        ? "ASC"
        : "DESC";

    const params: unknown[] = [];

    let whereClause = `WHERE 1=1`;

    // Search
    if (search) {
      const searchParam = `$${params.length + 1}`;

      params.push(`%${search}%`);

      whereClause += `
        AND (
          p."projectName" ILIKE ${searchParam}
          OR p."productName" ILIKE ${searchParam}
          OR p."productDescription" ILIKE ${searchParam}
          OR p."userPrompt" ILIKE ${searchParam}
          OR u.name ILIKE ${searchParam}
          OR u.email ILIKE ${searchParam}
        )
      `;
    }

    // Public / Private filter
    if (
      isPublic === "true" ||
      isPublic === "false"
    ) {
      const publicParam = `$${params.length + 1}`;

      params.push(isPublic === "true");

      whereClause += `
        AND p."isPublic" = ${publicParam}
      `;
    }

    // Generated image filter
    if (
      hasGeneratedImage === "true" ||
      hasGeneratedImage === "false"
    ) {
      if (hasGeneratedImage === "true") {
        whereClause += `
          AND p."generatedImage" IS NOT NULL
          AND p."generatedImage" != ''
        `;
      } else {
        whereClause += `
          AND (
            p."generatedImage" IS NULL
            OR p."generatedImage" = ''
          )
        `;
      }
    }

    // Generated video filter
    if (
      hasGeneratedVideo === "true" ||
      hasGeneratedVideo === "false"
    ) {
      if (hasGeneratedVideo === "true") {
        whereClause += `
          AND p."generatedVideo" IS NOT NULL
          AND p."generatedVideo" != ''
        `;
      } else {
        whereClause += `
          AND (
            p."generatedVideo" IS NULL
            OR p."generatedVideo" = ''
          )
        `;
      }
    }

    // Total count
    const countResult =
      await prisma.$queryRawUnsafe<
        Array<{ total: bigint }>
      >(
        `
          SELECT COUNT(*) AS total
          FROM "Project" p
          INNER JOIN "users" u
            ON u.id = p."userId"
          ${whereClause}
        `,
        ...params,
      );

    const total = Number(
      countResult[0]?.total ?? 0,
    );

    // Projects
    const projects =
      await prisma.$queryRawUnsafe<
        Array<Record<string, unknown>>
      >(
        `
          SELECT
            p.id,
            p."projectName",
            p."productName",
            p."productDescription",
            p."userPrompt",
            p."productImage",
            p."modelImage",
            p."generatedImage",
            p."generatedVideo",
            p."aspectRatio",
            p."isPublic",
            p."createdAt",
            p."updatedAt",

            u.id AS user_id,
            u.name AS user_name,
            u.email AS user_email,
            u.picture AS user_picture

          FROM "Project" p

          INNER JOIN "users" u
            ON u.id = p."userId"

          ${whereClause}

          ORDER BY
            p."${sortBy}" ${sortOrder}

          LIMIT ${limit}
          OFFSET ${offset}
        `,
        ...params,
      );

    const totalPages =
      Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: projects,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    logger.error(
      "Get all projects error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get projects",
    });
  }
};


export const getProjectById = async (
  req: Request,
  res: Response,
) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    const projects =
      await prisma.$queryRaw<
        Array<Record<string, unknown>>
      >`
        SELECT
          p.id,
          p."projectName",
          p."productName",
          p."productDescription",
          p."userPrompt",
          p."productImage",
          p."modelImage",
          p."generatedImage",
          p."generatedVideo",
          p."aspectRatio",
          p."isPublic",
          p."createdAt",
          p."updatedAt",

          u.id AS user_id,
          u.name AS user_name,
          u.email AS user_email,
          u.picture AS user_picture,
          u.role AS user_role,
          u."loginType" AS user_login_type

        FROM "Project" p

        INNER JOIN "users" u
          ON u.id = p."userId"

        WHERE p.id = ${projectId}
      `;

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: projects[0],
    });
  } catch (error) {
    logger.error(
      "Get project by ID error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get project",
    });
  }
};


export const deleteProject = async (
  req: Request,
  res: Response,
) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    // Check project exists
    const existingProject =
      await prisma.$queryRaw<
        Array<{ id: string }>
      >`
        SELECT id
        FROM "Project"
        WHERE id = ${projectId}
      `;

    if (existingProject.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Delete project
    await prisma.$executeRaw`
      DELETE FROM "Project"
      WHERE id = ${projectId}
    `;

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    logger.error(
      "Delete project error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete project",
    });
  }
};


export const getProjectAnalytics = async (
  _req: Request,
  res: Response,
) => {
  try {
    const analytics =
      await prisma.$queryRaw<
        Array<{
          total_projects: number;
          public_projects: number;
          private_projects: number;
          generated_images: number;
          generated_videos: number;
        }>
      >`
        SELECT
          COUNT(*)::int AS total_projects,

          COUNT(*) FILTER (
            WHERE "isPublic" = true
          )::int AS public_projects,

          COUNT(*) FILTER (
            WHERE "isPublic" = false
          )::int AS private_projects,

          COUNT(*) FILTER (
            WHERE
              "generatedImage" IS NOT NULL
              AND "generatedImage" != ''
          )::int AS generated_images,

          COUNT(*) FILTER (
            WHERE
              "generatedVideo" IS NOT NULL
              AND "generatedVideo" != ''
          )::int AS generated_videos

        FROM "Project"
      `;

    return res.status(200).json({
      success: true,
      data: analytics[0] ?? {
        total_projects: 0,
        public_projects: 0,
        private_projects: 0,
        generated_images: 0,
        generated_videos: 0,
      },
    });
  } catch (error) {
    logger.error(
      "Project analytics error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get project analytics",
    });
  }
};
