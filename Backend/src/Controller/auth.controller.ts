// Backend/src/controller/auth.controller.ts
import type { Request, Response } from "express";

import { prisma } from "../lib/prisma.js";

import {
  logoutUser,
  rotateRefreshToken,
  adminLogin,
} from "../services/auth.service.js";

import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "../utils/cookies.js";

import { logger } from "../config/logger.js";

export {
  googleLogin,
  googleCallback,
} from "./auth-google.controller.js";

export {
  githubLogin,
  githubCallback,
} from "./auth-github.controller.js";

export const logout = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await logoutUser(refreshToken);
    }

    clearRefreshTokenCookie(res);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    logger.error("Logout error:", error);

    clearRefreshTokenCookie(res);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const oldRefreshToken = req.cookies?.refreshToken;

    if (!oldRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    const {
      accessToken,
      refreshToken,
      user,
    } = await rotateRefreshToken(oldRefreshToken);

    clearRefreshTokenCookie(res);
    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      accessToken,
      user,
    });
  } catch (error) {
    logger.error("Token refresh error:", error);

    clearRefreshTokenCookie(res);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};

export const getMe = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        loginType: true,
        role: true,
        userSubscription: {
          select: {
            id: true,
            credits: true,
            subscriptionId: true,
            userId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    logger.error("Get me error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get user info",
    });
  }
};

export const adminLoginController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const {
      accessToken,
      refreshToken,
      user,
    } = await adminLogin(
      email.trim().toLowerCase(),
      password,
    );

    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      accessToken,
      user,
    });
  } catch (error) {
    logger.error("Admin login error:", error);

    return res.status(401).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Invalid admin credentials",
    });
  }
};