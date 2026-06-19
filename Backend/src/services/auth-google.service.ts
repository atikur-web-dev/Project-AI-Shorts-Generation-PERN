// src/services/auth-google.service.ts
import { google } from "googleapis";
import { prisma } from "../lib/prisma.js";
import { config } from "../config/index.js";
import { generateAccessToken, generateRefreshToken, hashToken } from "../utils/token.js";
import type { SessionData } from "../types/auth.types.js";

// Google OAuth Configuration
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL } = config;

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

// Process Google Callback
export const handleGoogleCallback = async (code: string): Promise<SessionData> => {
  // Exchange code for tokens
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Fetch user profile
  const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
  const { data } = await oauth2.userinfo.get();

  if (!data.email) {
    throw new Error("Email could not found");
  }

  // Upsert user in database
  const user = await prisma.user.upsert({
    where: { email: data.email },
    update: {
      name: data.name || "",
      picture: data.picture || "",
      googleId: data.id || "",
    },
    create: {
      email: data.email,
      name: data.name || "",
      picture: data.picture || "",
      googleId: data.id || "",
      githubId: "",
      loginType: "google",
    },
    select: {
      id: true,
      email: true,
      name: true,
      picture: true,
    },
  });

  // Create session
  const refreshToken = generateRefreshToken();
  console.log("👉 REAL RAW REFRESH TOKEN IS:", refreshToken);

  const hashedRefreshToken = hashToken(refreshToken);

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken: hashedRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const accessToken = generateAccessToken(user.id);

  return {
    accessToken,
    refreshToken,
    user,
  };
};