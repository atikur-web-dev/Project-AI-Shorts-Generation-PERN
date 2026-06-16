// Backend/src/utils/cookies.ts
import type { Response } from "express";
import { config } from "../config/index.js";

// Global constants for cookie configuration
const COOKIE_PATH = "/api/v1/auth";            // The cookie will only be sent to this specific API endpoint route
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // Lifespan of the cookie: exactly 7 days in milliseconds

/**
 * 1. SET REFRESH TOKEN INSIDE BROWSER COOKIES
 * Securely saves the 7-day token inside the client's browser using advanced security rules.
 */
export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie("refreshToken", token, {
    httpOnly: true, // Crucial Security: Prevents frontend JavaScript from reading this cookie (blocks XSS attacks)
    secure: config.NODE_ENV === "production", // Security: If true, cookie is only transmitted over secure HTTPS links
    sameSite: "strict", // Security: Prevents the browser from sending this cookie along with cross-site requests (blocks CSRF attacks)
    path: COOKIE_PATH, // Scope: Limits this cookie so it is only visible and sent to our auth API paths
    maxAge: COOKIE_MAX_AGE, // Expiration: Tells the browser to automatically destroy this cookie after 7 days
  });
};

/**
 * 2. WIPE REFRESH TOKEN COOKIE FROM BROWSER STORAGE
 * Removes the token from browser memory completely during a user logout sequence.
 */
export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie("refreshToken", {
    path: COOKIE_PATH, // Target Scope: Must exactly match the original path used when creating the cookie to successfully wipe it
  });
};
