import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/token.js";

// Extend Express Request interface to include user property
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
  // 1. Get token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided",
    });
  }

  // 2. Extract the actual token by removing the "Bearer" prefix
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid token format",
    });
  }

  // 3. Verify the access token
  const decoded = verifyAccessToken(token);
  if (!decoded || !decoded.userId) { // Note: userId uses a lowercase "d"
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }

  // 4. Attach the user ID to the request object and proceed
  req.user = { id: decoded.userId };
  return next();
};