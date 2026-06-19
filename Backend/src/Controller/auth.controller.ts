// Backend/src/Controller/auth.controller.ts
import type { Request, Response } from "express";
import {
  logoutUser,
  rotateRefreshToken,
} from "../services/auth.service.js";
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "../utils/cookies.js";
import { logger } from "../config/logger.js";

// Re-export Google & GitHub controllers for convenience
export { googleLogin, googleCallback } from "./auth-google.controller.js";
export { githubLogin, githubCallback } from "./auth-github.controller.js";

/**
 * LOGOUT - Terminate User Session
 * Destroys the session in database and clears browser cookies
 */
export const logout = async (req: Request, res: Response): Promise<any> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await logoutUser(refreshToken);
      clearRefreshTokenCookie(res);
    }

    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    logger.error("Logout error:", error);
    return res.status(500).json({ success: false, message: "Logout failed" });
  }
};

/**
 * REFRESH TOKEN - Generate New Access Token
 * Runs when short-term Access Token expires, uses 7-day Refresh Token
 */
export const refreshToken = async (req: Request, res: Response): Promise<any> => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token missing" });
    }

    const { accessToken, refreshToken, user } = await rotateRefreshToken(oldRefreshToken);

    // Replace old cookie with new refresh token
    clearRefreshTokenCookie(res);
    setRefreshTokenCookie(res, refreshToken);

    return res.json({
      success: true,
      accessToken,
      user,
    });
  } catch (error) {
    logger.error("Token refresh error:", error);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired refresh token" });
  }
};

/**
 * GET CURRENT USER PROFILE - Protected Route
 * Returns authenticated user's profile data
 */
export const getMe = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { prisma } = await import("../lib/prisma.js");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        loginType: true,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, user });
  } catch (error) {
    logger.error("Get me error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get user info" });
  }
};