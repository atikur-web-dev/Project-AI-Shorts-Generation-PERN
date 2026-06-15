// src/middleware/auth.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token.js';

// এক্সপ্রেস রিকোয়েস্টে ইউজার প্রপার্টি যোগ করার জন্য
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // হেডার থেকে টোকেন নাও
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized: No token provided' 
    });
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized: Invalid token format' 
    });
  }

  // টোকেন ভেরিফাই করো
  const decoded = verifyAccessToken(token);
  
  if (!decoded || !decoded.userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized: Invalid or expired token' 
    });
  }

  // ইউজার আইডি রিকোয়েস্টে যোগ করো
  req.user = { id: decoded.userId };
  next();
};