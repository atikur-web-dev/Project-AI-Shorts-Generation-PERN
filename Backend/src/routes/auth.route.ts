// src/routes/auth.route.ts
import { Router } from "express";
import {
  googleLogin,
  googleCallback,
  logout,
  refreshToken,
  getMe,
  githubCallback,
  githubLogin,
} from "../Controller/auth.controller.js";
import { authenticate } from "../Middleware/auth.middleware.js";

// Initialize the Express Router machine
const router = Router();

// Google routes
router.get("/auth/google/login", googleLogin);
router.get("/auth/google/callback", googleCallback);

// Github routes
router.get("/auth/github/login", githubLogin);
router.get("auth/github/callback", githubCallback);

// common routes
router.post("/auth/refresh", refreshToken);
router.post("/auth/logout", logout);

// Protected routes
router.get("/auth/me", authenticate, getMe);

// Export the configured router instance so we can plug it into our main app.ts server file
export const authRouter = router;
