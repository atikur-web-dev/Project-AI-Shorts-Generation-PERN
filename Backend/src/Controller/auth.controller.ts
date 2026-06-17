import type { Request, Response } from "express";
import {
  getGoogleAuthUrl,
  handleGoogleCallback,
  logoutUser,
  rotateRefreshToken,
} from "../services/auth.service.js";
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "../utils/cookies.js";
import { logger } from "../config/logger.js";

/**
 * 1. REDIRECT TO GOOGLE LOGIN PAGE
 * This runs when the user clicks the "Login with Google" button on the UI.
 * Added ': Promise<any>' to tell TypeScript this function handles HTTP responses directly.
 */
export const googleLogin = async (res: Response): Promise<any> => {
  try {
    // Get the magic Google login link from our auth service
    const url = getGoogleAuthUrl();

    // Push the user to that Google login URL
    return res.redirect(url);
  } catch (error) {
    // Log the exact error in the backend console/file for debugging
    logger.error("Google login error:", error);

    // Send a generic 500 error response to the user
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

/**
 * 2. HANDLE GOOGLE CALLBACK URL
 * Google sends the user back to this function after a successful login.
 * Google passes a temporary "code" inside the URL query parameters.
 */
export const googleCallback = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    // Extract the '?code=xxxx' value from the browser URL address bar
    const { code } = req.query;

    // Safety check: If there is no code, or if it is not a proper text string, stop here
    if (!code || typeof code !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Authorization code missing" });
    }

    // Pass the code to the service file to save user data and generate tokens
    const { accessToken, refreshToken, user } =
      await handleGoogleCallback(code);

    // Secure Step: Save the long-term 7-day Refresh Token inside a secure HTTP-Only cookie
    setRefreshTokenCookie(res, refreshToken);

    // Send the short-term Access Token and basic User Profile data as a JSON response
    return res.json({
      success: true,
      accessToken,
      user,
    });
  } catch (error) {
    // Log the error and tell the front-end that authentication failed
    logger.error("Google callback error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Authentication failed" });
  }
};

/**
 * 3. USER LOGOUT
 * This runs when a user clicks the "Logout" button.
 * It destroys the session in the database and cleans up the browser cookies.
 */
export const logout = async (req: Request, res: Response): Promise<any> => {
  try {
    // Read the 7-day refresh token from the user's browser cookie storage
    const refreshToken = req.cookies.refreshToken;

    // If the token exists, delete it from the database and wipe the cookie clean
    if (refreshToken) {
      await logoutUser(refreshToken); // Step A: Delete from Prisma Session table
      clearRefreshTokenCookie(res); // Step B: Erase from browser cookie storage
    }

    // Send a success message back to the frontend
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    logger.error("Logout error:", error);
    return res.status(500).json({ success: false, message: "Logout failed" });
  }
};

/**
 * 4. TOKEN REFRESH & ROTATION
 * Runs silently in the background when the short-term Access Token expires.
 * It looks at the 7-day Refresh Token cookie to give the user a brand new ticket.
 */
export const refreshToken = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    // Pull the old 7-day refresh token from the browser cookie chest
    const oldRefreshToken = req.cookies.refreshToken;

    // If the user has no refresh token cookie, they must log in again from scratch
    if (!oldRefreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token missing" });
    }

    // Ask the service to delete the old token and give us a new pair of tokens
    const { accessToken, refreshToken, user } =
      await rotateRefreshToken(oldRefreshToken);

    // Security Step: Delete the old cookie and seal the brand new refresh token inside
    clearRefreshTokenCookie(res);
    setRefreshTokenCookie(res, refreshToken);

    // Return the fresh short-term access token to keep the user session alive
    return res.json({
      success: true,
      accessToken,
      user,
    });
  } catch (error) {
    logger.error("Token refresh error:", error);
    // If the old token was stolen, fake, or expired, reject the request completely
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired refresh token" });
  }
};

/**
 * 5. GET CURRENT USER PROFILE (PROTECTED ROUTE)
 * This runs when the frontend needs to show the user's name and picture on the screen.
 * It relies on our 'authenticate' middleware to provide the logged-in user's ID.
 */
export const getMe = async (req: Request, res: Response): Promise<any> => {
  try {
    // Grab the verified user ID that our middleware previously saved inside 'req.user'
    const userId = req.user?.id;

    // If no user ID is attached to the request object, block access immediately
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Dynamically open the Prisma database client instance
    const { prisma } = await import("../lib/prisma.js");

    // Search the database for a single user that matches this specific ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      // Filter out passwords or internal data; only pick safe profile details
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        loginType: true,
      },
    });

    // If the ID is valid but the user account was deleted from the database, return 404
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Send the fresh profile data back to the user's browser dashboard
    return res.json({ success: true, user });
  } catch (error) {
    logger.error("Get me error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get user info" });
  }
};
