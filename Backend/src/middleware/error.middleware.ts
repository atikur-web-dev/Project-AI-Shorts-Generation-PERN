// Backend/src/middleware/error.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';
import { config } from '../config/index.js';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // ২. Zod validation error hand
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  // ৩. Prisma ডাটাবেজ এরর হ্যান্ডলিং
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Duplicate entry. This already exists.',
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Record not found.',
      });
    }
  }

  // ৪. Multer ফাইল সাইজ এরর হ্যান্ডলিং
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 10MB.',
    });
  }

  // ৫. JWT টোকেন এরর হ্যান্ডলিং
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired. Please login again.',
    });
  }

  // ৬. ডিফল্ট বা অন্যান্য অজানা এরর হ্যান্ডলিং
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: config.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};
