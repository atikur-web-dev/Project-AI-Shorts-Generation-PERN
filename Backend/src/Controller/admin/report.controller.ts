// Backend/src/controller/admin/report.controller.ts

import type { Request, Response } from "express";
import PDFDocument from "pdfkit";

import { prisma } from "../../lib/prisma.js";
import { logger } from "../../config/logger.js";
import { Prisma } from "../../generated/prisma/client.js";


// REVENUE REPORT
export const getRevenueReport = async (
  req: Request,
  res: Response,
) => {
  try {
    const { period = "monthly" } =
      req.query as { period?: string };

    let dateTrunc = "month";

    if (period === "daily") {
      dateTrunc = "day";
    } else if (period === "weekly") {
      dateTrunc = "week";
    } else if (period === "yearly") {
      dateTrunc = "year";
    }

    const safeTrunc = Prisma.raw(`'${dateTrunc}'`);

    const revenueData = await prisma.$queryRaw<
      Array<{
        period: Date;
        order_count: number;
        total_revenue: number;
        avg_order_value: number;
      }>
    >`
      SELECT
        DATE_TRUNC(
          ${safeTrunc},
          "createdAt"
        ) AS period,
        COUNT(*)::int AS order_count,
        COALESCE(SUM(amount), 0)::float AS total_revenue,
        COALESCE(AVG(amount), 0)::float AS avg_order_value
      FROM "orders"
      WHERE status = 'completed'
      GROUP BY DATE_TRUNC(
        ${safeTrunc},
        "createdAt"
      )
      ORDER BY period DESC
      LIMIT 12
    `;

    const summary = await prisma.$queryRaw<
      Array<{
        total_orders: number;
        total_revenue: number;
        avg_order_value: number;
        max_order_value: number;
        min_order_value: number;
      }>
    >`
      SELECT
        COUNT(*)::int AS total_orders,
        COALESCE(SUM(amount), 0)::float AS total_revenue,
        COALESCE(AVG(amount), 0)::float AS avg_order_value,
        COALESCE(MAX(amount), 0)::float AS max_order_value,
        COALESCE(MIN(amount), 0)::float AS min_order_value
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

    return res.status(500).json({
      success: false,
      message: "Failed to generate revenue report",
    });
  }
};


//   USER ACTIVITY REPORT
export const getUserActivityReport = async (
  _req: Request,
  res: Response,
) => {
  try {
    const topUsersByProjects = await prisma.$queryRaw`
      SELECT
        u.id,
        u.name,
        u.email,
        COUNT(DISTINCT p.id)::int AS project_count,
        COUNT(DISTINCT o.id)::int AS order_count,
        COALESCE(SUM(DISTINCT o.amount), 0)::float AS total_spent
      FROM "users" u
      LEFT JOIN "Project" p
        ON p."userId" = u.id
      LEFT JOIN "orders" o
        ON o."userId" = u.id
        AND o.status = 'completed'
      GROUP BY
        u.id,
        u.name,
        u.email
      ORDER BY project_count DESC
      LIMIT 10
    `;

    const activeUsers = await prisma.$queryRaw<any[]>`
      SELECT
        COUNT(DISTINCT u.id)::int AS active_users,
        COUNT(DISTINCT p.id)::int AS projects_created,
        COUNT(DISTINCT o.id)::int AS orders_placed
      FROM "users" u
      LEFT JOIN "Project" p
        ON p."userId" = u.id
        AND p."createdAt" >= NOW() - INTERVAL '30 days'
      LEFT JOIN "orders" o
        ON o."userId" = u.id
        AND o."createdAt" >= NOW() - INTERVAL '30 days'
    `;

    const userGrowth = await prisma.$queryRaw`
      SELECT
        DATE_TRUNC(
          'day',
          "createdAt"
        ) AS date,
        COUNT(*)::int AS new_users
      FROM "users"
      WHERE "createdAt" >= NOW() - INTERVAL '7 days'
      GROUP BY DATE_TRUNC(
        'day',
        "createdAt"
      )
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
    logger.error(
      "User activity report error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate user activity report",
    });
  }
};


//   PROJECT ANALYTICS REPORT
export const getProjectAnalytics = async (
  _req: Request,
  res: Response,
) => {
  try {
    const projectStats = await prisma.$queryRaw<any[]>`
      SELECT
        COUNT(*)::int AS total_projects,

        COUNT(
          CASE
            WHEN "generatedImage" IS NOT NULL
              AND "generatedImage" != ''
            THEN 1
          END
        )::int AS with_image,

        COUNT(
          CASE
            WHEN "generatedVideo" IS NOT NULL
              AND "generatedVideo" != ''
            THEN 1
          END
        )::int AS with_video,

        COUNT(
          CASE
            WHEN "generatedImage" IS NULL
              OR "generatedImage" = ''
            THEN 1
          END
        )::int AS without_image,

        COUNT(
          CASE
            WHEN (
              "generatedVideo" IS NULL
              OR "generatedVideo" = ''
            )
            AND (
              "generatedImage" IS NOT NULL
              AND "generatedImage" != ''
            )
            THEN 1
          END
        )::int AS image_only

      FROM "Project"
    `;

    const aspectRatios = await prisma.$queryRaw`
      SELECT
        "aspectRatio",
        COUNT(*)::int AS count
      FROM "Project"
      GROUP BY "aspectRatio"
      ORDER BY count DESC
    `;

    const projectsTrend = await prisma.$queryRaw`
      SELECT
        DATE_TRUNC(
          'day',
          "createdAt"
        ) AS date,
        COUNT(*)::int AS project_count
      FROM "Project"
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC(
        'day',
        "createdAt"
      )
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
    logger.error(
      "Project analytics error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate project analytics",
    });
  }
};


//   PDF HELPERS
const formatCurrency = (value: unknown): string => {
  const number = Number(value) || 0;

  return `BDT ${number.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value: unknown): string => {
  if (!value) return "-";

  const date = new Date(value as string | Date);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const drawTitle = (
  doc: PDFKit.PDFDocument,
  title: string,
) => {
  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .text(title, {
      align: "center",
    });

  doc.moveDown(0.5);

  doc
    .fontSize(9)
    .font("Helvetica")
    .text(
      `Generated on ${new Date().toLocaleString(
        "en-BD",
      )}`,
      {
        align: "center",
      },
    );

  doc.moveDown(1.5);
};

const drawSectionTitle = (
  doc: PDFKit.PDFDocument,
  title: string,
) => {
  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .text(title);

  doc.moveDown(0.5);
};

const drawTableHeader = (
  doc: PDFKit.PDFDocument,
  columns: Array<{
    title: string;
    x: number;
    width: number;
  }>,
) => {
  doc
    .fontSize(9)
    .font("Helvetica-Bold");

  for (const column of columns) {
    doc.text(
      column.title,
      column.x,
      doc.y,
      {
        width: column.width,
      },
    );
  }

  doc.moveDown(0.7);

  doc
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke();

  doc.moveDown(0.5);
};

const ensureSpace = (
  doc: PDFKit.PDFDocument,
  requiredSpace = 60,
) => {
  if (doc.y + requiredSpace > 750) {
    doc.addPage();
  }
};


//   EXPORT REPORT AS PDF
export const exportReport = async (
  req: Request,
  res: Response,
) => {
  try {
    const { type = "users" } =
      req.query as { type?: string };

    if (
      !["users", "orders", "projects", "revenue"].includes(
        type,
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid export type",
      });
    }

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      bufferPages: true,
    });

    const filename = `${type}_report_${Date.now()}.pdf`;

    res.setHeader(
      "Content-Type",
      "application/pdf",
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`,
    );

    doc.pipe(res);

    //   USERS REPORT
    if (type === "users") {
      const users = await prisma.$queryRaw<any[]>`
        SELECT
          u.id,
          u.name,
          u.email,
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

      drawTitle(doc, "Users Report");

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`Total Users: ${users.length}`);

      doc.moveDown(1);

      drawTableHeader(doc, [
        {
          title: "Name",
          x: 50,
          width: 105,
        },
        {
          title: "Email",
          x: 155,
          width: 155,
        },
        {
          title: "Role",
          x: 310,
          width: 55,
        },
        {
          title: "Projects",
          x: 365,
          width: 55,
        },
        {
          title: "Orders",
          x: 420,
          width: 50,
        },
        {
          title: "Created",
          x: 470,
          width: 75,
        },
      ]);

      for (const user of users) {
        ensureSpace(doc, 35);

        const y = doc.y;

        doc
          .fontSize(8)
          .font("Helvetica")
          .text(
            String(user.name ?? "-").substring(0, 20),
            50,
            y,
            {
              width: 105,
            },
          );

        doc.text(
          String(user.email ?? "-").substring(0, 28),
          155,
          y,
          {
            width: 155,
          },
        );

        doc.text(
          String(user.role ?? "-"),
          310,
          y,
          {
            width: 55,
          },
        );

        doc.text(
          String(user.project_count ?? 0),
          365,
          y,
          {
            width: 55,
          },
        );

        doc.text(
          String(user.order_count ?? 0),
          420,
          y,
          {
            width: 50,
          },
        );

        doc.text(
          formatDate(user.createdAt),
          470,
          y,
          {
            width: 75,
          },
        );

        doc.moveDown(1.2);
      }
    }

   
    //   ORDERS REPORT
    if (type === "orders") {
      const orders = await prisma.$queryRaw<any[]>`
        SELECT
          o.id,
          o.amount::float,
          o.status,
          o."createdAt",
          u.name AS user_name,
          u.email AS user_email,
          s.name AS plan_name

        FROM "orders" o

        JOIN "users" u
          ON u.id = o."userId"

        JOIN "subscriptions" s
          ON s.id = o."subscriptionId"

        ORDER BY o."createdAt" DESC
      `;

      drawTitle(doc, "Orders Report");

      const totalAmount = orders.reduce(
        (sum, order) =>
          sum + (Number(order.amount) || 0),
        0,
      );

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`Total Orders: ${orders.length}`);

      doc.text(
        `Total Order Value: ${formatCurrency(
          totalAmount,
        )}`,
      );

      doc.moveDown(1);

      drawTableHeader(doc, [
        {
          title: "Order ID",
          x: 50,
          width: 85,
        },
        {
          title: "User",
          x: 135,
          width: 105,
        },
        {
          title: "Plan",
          x: 240,
          width: 85,
        },
        {
          title: "Amount",
          x: 325,
          width: 75,
        },
        {
          title: "Status",
          x: 400,
          width: 65,
        },
        {
          title: "Date",
          x: 465,
          width: 80,
        },
      ]);

      for (const order of orders) {
        ensureSpace(doc, 35);

        const y = doc.y;

        doc
          .fontSize(7.5)
          .font("Helvetica")
          .text(
            String(order.id).substring(0, 12),
            50,
            y,
            {
              width: 85,
            },
          );

        doc.text(
          String(order.user_name ?? "-").substring(
            0,
            18,
          ),
          135,
          y,
          {
            width: 105,
          },
        );

        doc.text(
          String(order.plan_name ?? "-").substring(
            0,
            14,
          ),
          240,
          y,
          {
            width: 85,
          },
        );

        doc.text(
          formatCurrency(order.amount),
          325,
          y,
          {
            width: 75,
          },
        );

        doc.text(
          String(order.status ?? "-"),
          400,
          y,
          {
            width: 65,
          },
        );

        doc.text(
          formatDate(order.createdAt),
          465,
          y,
          {
            width: 80,
          },
        );

        doc.moveDown(1.2);
      }
    }

   
    //   PROJECTS REPORT
    if (type === "projects") {
      const projects = await prisma.$queryRaw<any[]>`
        SELECT
          p.id,
          p."projectName",
          p."productName",

          CASE
            WHEN p."generatedImage" IS NOT NULL
              AND p."generatedImage" != ''
            THEN 'Yes'
            ELSE 'No'
          END AS has_image,

          CASE
            WHEN p."generatedVideo" IS NOT NULL
              AND p."generatedVideo" != ''
            THEN 'Yes'
            ELSE 'No'
          END AS has_video,

          p."aspectRatio",
          p."createdAt",
          u.name AS user_name

        FROM "Project" p

        JOIN "users" u
          ON u.id = p."userId"

        ORDER BY p."createdAt" DESC
      `;

      drawTitle(doc, "Projects Report");

      const projectsWithImage = projects.filter(
        (project) => project.has_image === "Yes",
      ).length;

      const projectsWithVideo = projects.filter(
        (project) => project.has_video === "Yes",
      ).length;

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(
          `Total Projects: ${projects.length}`,
        );

      doc.text(
        `Projects with Image: ${projectsWithImage}`,
      );

      doc.text(
        `Projects with Video: ${projectsWithVideo}`,
      );

      doc.moveDown(1);

      drawTableHeader(doc, [
        {
          title: "Project",
          x: 50,
          width: 125,
        },
        {
          title: "Product",
          x: 175,
          width: 105,
        },
        {
          title: "User",
          x: 280,
          width: 90,
        },
        {
          title: "Image",
          x: 370,
          width: 45,
        },
        {
          title: "Video",
          x: 415,
          width: 45,
        },
        {
          title: "Ratio",
          x: 460,
          width: 45,
        },
        {
          title: "Date",
          x: 505,
          width: 40,
        },
      ]);

      for (const project of projects) {
        ensureSpace(doc, 35);

        const y = doc.y;

        doc
          .fontSize(7.5)
          .font("Helvetica")
          .text(
            String(project.projectName ?? "-").substring(
              0,
              20,
            ),
            50,
            y,
            {
              width: 125,
            },
          );

        doc.text(
          String(project.productName ?? "-").substring(
            0,
            17,
          ),
          175,
          y,
          {
            width: 105,
          },
        );

        doc.text(
          String(project.user_name ?? "-").substring(
            0,
            15,
          ),
          280,
          y,
          {
            width: 90,
          },
        );

        doc.text(
          String(project.has_image ?? "No"),
          370,
          y,
          {
            width: 45,
          },
        );

        doc.text(
          String(project.has_video ?? "No"),
          415,
          y,
          {
            width: 45,
          },
        );

        doc.text(
          String(project.aspectRatio ?? "-"),
          460,
          y,
          {
            width: 45,
          },
        );

        doc.text(
          formatDate(project.createdAt),
          505,
          y,
          {
            width: 40,
          },
        );

        doc.moveDown(1.2);
      }
    }

    
    //   REVENUE REPORT
    if (type === "revenue") {
      const revenueData = await prisma.$queryRaw<any[]>`
        SELECT
          DATE_TRUNC(
            'month',
            "createdAt"
          ) AS period,

          COUNT(*)::int AS order_count,

          COALESCE(
            SUM(amount),
            0
          )::float AS total_revenue,

          COALESCE(
            AVG(amount),
            0
          )::float AS avg_order_value

        FROM "orders"

        WHERE status = 'completed'

        GROUP BY DATE_TRUNC(
          'month',
          "createdAt"
        )

        ORDER BY period DESC

        LIMIT 12
      `;

      const summary = await prisma.$queryRaw<any[]>`
        SELECT
          COUNT(*)::int AS total_orders,

          COALESCE(
            SUM(amount),
            0
          )::float AS total_revenue,

          COALESCE(
            AVG(amount),
            0
          )::float AS avg_order_value,

          COALESCE(
            MAX(amount),
            0
          )::float AS max_order_value,

          COALESCE(
            MIN(amount),
            0
          )::float AS min_order_value

        FROM "orders"

        WHERE status = 'completed'
      `;

      const reportSummary = summary[0] || {};

      drawTitle(doc, "Revenue Report");

      drawSectionTitle(
        doc,
        "Revenue Summary",
      );

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(
          `Total Orders: ${
            reportSummary.total_orders ?? 0
          }`,
        );

      doc.text(
        `Total Revenue: ${formatCurrency(
          reportSummary.total_revenue,
        )}`,
      );

      doc.text(
        `Average Order Value: ${formatCurrency(
          reportSummary.avg_order_value,
        )}`,
      );

      doc.text(
        `Maximum Order Value: ${formatCurrency(
          reportSummary.max_order_value,
        )}`,
      );

      doc.text(
        `Minimum Order Value: ${formatCurrency(
          reportSummary.min_order_value,
        )}`,
      );

      doc.moveDown(1.5);

      drawSectionTitle(
        doc,
        "Monthly Revenue",
      );

      drawTableHeader(doc, [
        {
          title: "Period",
          x: 50,
          width: 150,
        },
        {
          title: "Orders",
          x: 200,
          width: 100,
        },
        {
          title: "Revenue",
          x: 300,
          width: 120,
        },
        {
          title: "Avg Order",
          x: 420,
          width: 120,
        },
      ]);

      for (const row of revenueData) {
        ensureSpace(doc, 35);

        const y = doc.y;

        doc
          .fontSize(9)
          .font("Helvetica")
          .text(
            formatDate(row.period),
            50,
            y,
            {
              width: 150,
            },
          );

        doc.text(
          String(row.order_count ?? 0),
          200,
          y,
          {
            width: 100,
          },
        );

        doc.text(
          formatCurrency(row.total_revenue),
          300,
          y,
          {
            width: 120,
          },
        );

        doc.text(
          formatCurrency(row.avg_order_value),
          420,
          y,
          {
            width: 120,
          },
        );

        doc.moveDown(1.2);
      }
    }

  
    //   FOOTER / PAGE NUMBERS
    const pageRange = doc.bufferedPageRange();

    for (
      let i = 0;
      i < pageRange.count;
      i++
    ) {
      doc.switchToPage(i);

      doc
        .fontSize(8)
        .font("Helvetica")
        .text(
          `Page ${i + 1} of ${pageRange.count}`,
          50,
          780,
          {
            align: "center",
            width: 495,
          },
        );
    }
    doc.end();
    return;
  } catch (error) {
    logger.error(
      "Export PDF report error:",
      error,
    );

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to export PDF report",
      });
    }

    return res.end();
  }
};

