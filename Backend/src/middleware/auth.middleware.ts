
import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { verifyAccessToken } from "../utils/token.js";

/*
|--------------------------------------------------------------------------
| Express Request Type Extension
|--------------------------------------------------------------------------
|
| After successful authentication:
|
| req.user = {
|   id: "user-id"
| }
|
*/

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

/*
|--------------------------------------------------------------------------
| Authentication Middleware
|--------------------------------------------------------------------------
|
| This middleware:
|
| 1. Reads the Authorization header
| 2. Validates Bearer token format
| 3. Verifies the JWT
| 4. Extracts userId
| 5. Stores it in req.user
|
*/

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | Get Authorization Header
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Extract Token
    |--------------------------------------------------------------------------
    */

    const token = authHeader.slice("Bearer ".length).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid token format",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Verify JWT
    |--------------------------------------------------------------------------
    */

    const decoded = verifyAccessToken(token);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message:
          "Unauthorized: Invalid or expired token",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Attach Authenticated User
    |--------------------------------------------------------------------------
    */

    req.user = {
      id: decoded.userId,
    };

    /*
    |--------------------------------------------------------------------------
    | Continue
    |--------------------------------------------------------------------------
    */

    return next();
  } catch (error) {
    console.error(
      "Authentication middleware error:",
      error,
    );

    return res.status(401).json({
      success: false,
      message:
        "Unauthorized: Authentication failed",
    });
  }
};
