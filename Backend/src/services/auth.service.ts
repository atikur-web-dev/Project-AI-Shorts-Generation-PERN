import { google } from "googleapis";
import { prisma } from "../lib/prisma.js";
import { config } from "../config/index.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hastToken,
} from "../utils/token.js";
import type { GoogleUserInfo, SessionData } from "../types/auth.types.js";
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL } = config;

// Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URL,
);

// Generate Google Login URL
export const getGoogleAuthUrl = (): string => {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "select_account",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "openid",
    ],
  });
};

// Processing google callback ( create user + token from code)
export const handleGoogleCallback = async (
  code: string,
): Promise<SessionData> => {
  // taking token from the code
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
};
