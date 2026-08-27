// Backend/src/controller/admin/auth.controller.ts
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../../utils/token.js";
import { setRefreshTokenCookie } from "../../utils/cookies.js";

export const adminLoginController = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await prisma.user.findUnique({
      where: { email },
    });

    if (!admin || admin.role !== "ADMIN") {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    if (!admin.passwordHash) {
      return res.status(401).json({
        success: false,
        message: "Admin password is not configured",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      admin.passwordHash,
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    const accessToken = generateAccessToken(admin.id);
    const refreshToken = generateRefreshToken();

    await prisma.session.create({
      data: {
        userId: admin.id,
        refreshToken: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      accessToken,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        picture: admin.picture,
        loginType: admin.loginType,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Admin login failed",
    });
  }
};