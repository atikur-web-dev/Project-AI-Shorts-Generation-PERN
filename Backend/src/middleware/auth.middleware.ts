import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/token.js";

// ==========================================
// EXPRESS TYPES EXTENSION (Declaration Merging)
// ==========================================
// By default, Express 'Request' object does not have a 'user' property.
// We are telling TypeScript to open up the global Express namespace
// and add a new optional 'user' object that holds an 'id' string.
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  
  // STEP 1: READ THE AUTHORIZATION HEADER
  // Look into the incoming request headers to find the 'authorization' key.
  const authHeader = req.headers.authorization;
  
  // SECURITY CHECK A: Does the header exist? Does it start with the standard word "Bearer "?
  // If it is completely missing or formatted incorrectly, block the user right here.
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided",
    });
  }

  // STEP 2: EXTRACT THE CLEAN ACCESS TOKEN TEXT
  // The header value looks like this: "Bearer eyJhbGciOi...".
  // We use .split(" ")[1] to cut the text at the blank space and grab index 1 (the actual token string).
  const token = authHeader.split(" ")[1];
  
  // SECURITY CHECK B: Ensure that the token part is not an empty string or completely missing.
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid token format",
    });
  }

  // STEP 3: CRYPTOGRAPHIC VERIFICATION
  // Pass the raw token string to our utility function to decode and verify its integrity.
  const decoded = verifyAccessToken(token);
  
  // SECURITY CHECK C: If the token is fake, altered, or expired, 'decoded' will return null.
  // We also make sure it successfully contains a valid 'userId' (lowercase "d").
  if (!decoded || !decoded.userId) { 
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }

  // STEP 4: MEMORIZE USER IDENTITY & OPEN THE GATE
  // Save the verified user ID inside the special Express request pocket we declared above.
  // This allows any controller downstream to immediately know who is making this request via 'req.user.id'.
  req.user = { id: decoded.userId };
  
  // Trigger the 'next()' function to tell Express that everything is perfect,
  // and it is completely safe to pass the request to the actual controller.
  return next();
};
