// Backend/src/config/rate-limit.ts
import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many request form this IP, please try again lager",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 5,
  message: {
    success: false,
    message: "AI generation limit reached. Please try again after 1 hour",
  },
});
