import rateLimit from "express-rate-limit";
import { config } from "../config/index.js";

// General API limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP, Please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// strict limiter for AI endpoints
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 10,
  message: {
    success: false,
    message: "AI Generation Limit reached, Please Try again after 1 hrs",
  },
});

// for authentication or login , so that hackers cannot retry it again and again
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20,
  message: {
    success: false,
    message: "Too many authentication attempt, please try again later",
  },
});
