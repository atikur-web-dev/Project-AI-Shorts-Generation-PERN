// Backend/src/utils/cookies.ts
import type { Response } from "express";
import { config } from "../config/index.js";

const COOKIE_PATH = "/api/v1/auth";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

// Refresh token cookie te set
export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "strict",
    path: COOKIE_PATH,
    maxAge: COOKIE_MAX_AGE,
  });
};

// Clear refresh token
export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie("refreshToken", {
    path: COOKIE_PATH,
  });
};
 