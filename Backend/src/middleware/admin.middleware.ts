import type { Request, Response, NextFunction } from "express";
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

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin access required",
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Admin verification failed",
    });
  }
};