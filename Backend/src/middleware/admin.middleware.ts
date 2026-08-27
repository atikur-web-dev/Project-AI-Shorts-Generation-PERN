import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { prisma } from "../lib/prisma.js";

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin access required",
      });
    }

    return next();
  } catch (error) {
    console.error(
      "Admin verification error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Admin verification failed",
    });
  }
};