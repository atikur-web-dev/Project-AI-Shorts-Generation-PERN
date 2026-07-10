// Backend/src/Controller/auth-google.controller.ts
import type { Request, Response } from "express";
import {
  getGoogleAuthUrl,
  handleGoogleCallback,
} from "../services/auth.service.js";
import { setRefreshTokenCookie } from "../utils/cookies.js";
import { logger } from "../config/logger.js";

export const googleLogin = async (req: Request, res: Response): Promise<any> => {
  try {
    const url = getGoogleAuthUrl();
    return res.redirect(url);
  } catch (error) {
    logger.error("Google login error:", error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};


export const googleCallback = async (req: Request, res: Response): Promise<any> => {
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Authorization code missing" });
    }

    const { accessToken, refreshToken, user } = await handleGoogleCallback(code);
    console.log("Real Access Token : ", accessToken)

    // Store refresh token in HTTP-only cookie
    setRefreshTokenCookie(res, refreshToken);

    return res.json({
      success: true,
      accessToken,
      user,
    });
  } catch (error) {
    logger.error("Google callback error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Authentication failed" });
  }
};