// Backend/src/Controller/auth-github.controller.ts
import type { Request, Response } from "express";
import {
  getGitHubAuthUrl,
  handleGitHubCallback,
} from "../services/auth-github.service.js";
import { setRefreshTokenCookie } from "../utils/cookies.js";
import { logger } from "../config/logger.js";


export const githubLogin = async (req: Request, res: Response): Promise<any> => {
  try {
    const url = getGitHubAuthUrl();
    return res.redirect(url);
  } catch (error) {
    logger.error("GitHub login error:", error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

export const githubCallback = async (req: Request, res: Response): Promise<any> => {
  try {
    const { code } = req.query;

    console.log("GitHub callback received, code:", code ? "present" : "missing");

    if (!code || typeof code !== "string") {
      console.log("Authorization code missing");
      return res
        .status(400)
        .json({ success: false, message: "Authorization code missing" });
    }

    const { accessToken, refreshToken, user } = await handleGitHubCallback(code);
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
    console.error("GitHub callback error:", error);
    logger.error("GitHub callback error:", error);
    return res
      .status(500)
      .json({ success: false, message: "GitHub authentication failed" });
  }
};