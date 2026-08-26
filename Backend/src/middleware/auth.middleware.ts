// Backend/src/middleware/auth.middleware.ts
import type { NextFunction, Request, Response } from "express";
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
  
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided",
    });
  }
  const token = authHeader.split(" ")[1];
  
  // SECURITY CHECK B: Ensure that the token part is not an empty string or completely missing.
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid token format",
    });
  }
  const decoded = verifyAccessToken(token);
  if (!decoded || !decoded.userId) { 
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
  req.user = { id: decoded.userId };
  
  return next();
};
