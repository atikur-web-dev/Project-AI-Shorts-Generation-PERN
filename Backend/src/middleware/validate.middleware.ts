// Backend/src/middleware/validate.middleware.ts
// src/middleware/validate.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";

/**
 * মিডলওয়্যার যা Zod schema ব্যবহার করে রিকোয়েস্ট বডি/কুয়েরি/প্যারাম ভ্যালিডেট করে
 * যদি ভ্যালিডেশন ফেইল হয়, তাহলে ৪০০ বিচার সহ Error রিটার্ন করে
 */
export const validate = (schema: ZodObject<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // রিকোয়েস্টের body, query এবং params যাচাই করো
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      // ZodError হলে ফরম্যাট করে পাঠাও
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};
