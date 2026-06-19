// Backend/src/Controller/auth-github.controller.ts
import type { Request, Response } from "express";
import {
  getGitHubAuthUrl,
  handleGitHubCallback,
} from "../services/auth.service.js";
import { setRefreshTokenCookie } from "../utils/cookies.js";
import { logger } from "../config/logger.js";

/**
 * GITHUB LOGIN - Redirect to GitHub OAuth Page
 * This runs when the user clicks "Login with GitHub" button
 */
export const githubLogin = async (req: Request, res: Response): Promise<any> => {
  try {
    const url = getGitHubAuthUrl();
    return res.redirect(url);
  } catch (error) {
    logger.error("GitHub login error:", error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

/**
 * GITHUB CALLBACK - Handle GitHub's Redirect After Authentication
 * GitHub sends the user back here with a temporary authorization code
 */
export const githubCallback = async (req: Request, res: Response): Promise<any> => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Authorization code missing" });
    }

    const { accessToken, refreshToken, user } = await handleGitHubCallback(code);

    // Store refresh token in HTTP-only cookie
    setRefreshTokenCookie(res, refreshToken);

    return res.json({
      success: true,
      accessToken,
      user,
    });
  } catch (error) {
    logger.error("GitHub callback error:", error);
    return res
      .status(500)
      .json({ success: false, message: "GitHub authentication failed" });
  }
};