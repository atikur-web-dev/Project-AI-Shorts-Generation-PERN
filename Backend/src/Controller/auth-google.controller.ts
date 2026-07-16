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
    console.log("Google login endpoint called");
    const url = getGoogleAuthUrl();
    console.log("Generated Google Auth URL:", url);
    return res.redirect(url);
  } catch (error) {
    console.error("Google login error:", error);
    logger.error("Google login error:", error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};


export const googleCallback = async (req: Request, res: Response): Promise<any> => {
  try {
    const { code } = req.query;
    
    console.log("Google callback received, code:", code ? "present" : "missing");
    
    if (!code || typeof code !== "string") {
      console.log("Authorization code missing");
      return res
        .status(400)
        .json({ success: false, message: "Authorization code missing" });
    }

    const { accessToken, refreshToken, user } = await handleGoogleCallback(code);
    console.log("Real Access Token : ", accessToken);
    console.log("User created:", user.email);

    // Store refresh token in HTTP-only cookie
    setRefreshTokenCookie(res, refreshToken);

    // Redirect to frontend callback page with access token
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/callback?accessToken=${accessToken}`;
    console.log("Redirecting to:", redirectUrl);
    
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("Google callback error:", error);
    logger.error("Google callback error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Authentication failed" });
  }
};