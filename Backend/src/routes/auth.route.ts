import { Router } from "express";

import {
  googleLogin,
  googleCallback,
  githubLogin,
  githubCallback,
  logout,
  refreshToken,
  getMe,
  adminLoginController,
} from "../controller/index.js";

import { authenticate } from "../middleware/auth.middleware.js";

// Initialize the Express Router
const router = Router();

// Google routes
router.get("/auth/google/login", googleLogin);
router.get("/auth/google/callback", googleCallback);

// GitHub routes
router.get("/auth/github/login", githubLogin);
router.get("/auth/github/callback", githubCallback);

// Common routes
router.post("/auth/refresh", refreshToken);
router.post("/auth/logout", logout);

// Admin login
router.post("/auth/admin/login", adminLoginController);

// Protected routes
router.get("/auth/me", authenticate, getMe);

// Export the configured router
export const authRouter = router;