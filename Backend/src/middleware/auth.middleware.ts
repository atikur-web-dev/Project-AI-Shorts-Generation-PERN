import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { verifyAccessToken } from "../utils/token.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    const token = authHeader
      .slice("Bearer ".length)
      .trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid token format",
      });
    }

    const decoded = verifyAccessToken(token);

    if (!decoded?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid or expired token",
      });
    }

    req.user = {
      id: decoded.userId,
    };

    return next();
  } catch (error) {
    console.error(
      "Authentication middleware error:",
      error,
    );

    return res.status(401).json({
      success: false,
      message: "Unauthorized: Authentication failed",
    });
  }
};