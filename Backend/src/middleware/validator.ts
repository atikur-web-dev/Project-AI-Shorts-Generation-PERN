// Backend/src/middleware/validator.ts

import type { Request, Response, NextFunction } from "express";

import { ZodType, ZodError } from "zod";

export const validate = (Schema: ZodType) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await Schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation Failed",
          errors: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });

        return;
      }

      return next(error);
    }
  };
};