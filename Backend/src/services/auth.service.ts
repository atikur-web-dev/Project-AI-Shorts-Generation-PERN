// src/services/auth.service.ts
import { google } from "googleapis";
import { prisma } from "../lib/prisma.js";
import { config } from "../config/index.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../utils/token.js";
import type { GoogleUserInfo, SessionData } from "../types/auth.types.js";

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL } = config;

// Google OAuth2 ক্লায়েন্ট
const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URL,
);

// Google লগইন URL জেনারেট করো
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

// Process Google callback ( create user from code + Token)
export const handleGoogleCallback = async (
  code: string,
): Promise<SessionData> => {
  // Collect token from code
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Take info from google
  const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
  const { data } = await oauth2.userinfo.get();
  if (!data.email) {
    throw new Error("Email could not found");
  }

  // create user or update it
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
      loginType: "google",
    },
    select: {
      id: true,
      email: true,
      name: true,
      picture: true,
    },
  });

  // Create session (refresh token save in DB)
  const refreshToken = generateRefreshToken();
  const hashedRefreshToken = hashToken(refreshToken);
  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken: hashedRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // ৭ দিন
    },
  });
  // generate access token
  const accessToken = generateAccessToken(user.id);
  return {
    accessToken,
    refreshToken,
    user,
  };
};

// Do logout ( session delete)
export const logoutUser = async (refreshToken: string): Promise<boolean> => {
  const hashedToken = hashToken(refreshToken);
  const { count } = await prisma.session.deleteMany({
    where: { refreshToken: hashedToken },
  });
  return count > 0;
};

// Generate AccessToken using Refresh token (Token Rotation)
export const rotateRefreshToken = async (oldRefreshToken: string): Promise<SessionData> => {
  const hashedOldToken = hashToken(oldRefreshToken);
  
  // search the old token
  const session = await prisma.session.findFirst({
    where: { refreshToken: hashedOldToken },
  });

  if (!session || session.expiresAt < new Date()) {
    throw new Error('Invalid or expired refresh token');
  }

  // delete old session (Token Rotation)
  await prisma.session.delete({ where: { id: session.id } });

  //create new session
  const newRefreshToken = generateRefreshToken();
  const hashedNewToken = hashToken(newRefreshToken);
  
  await prisma.session.create({
    data: {
      userId: session.userId,
      refreshToken: hashedNewToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // create new Access Token 
  const newAccessToken = generateAccessToken(session.userId);

  // take user info
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, picture: true },
  });

  if (!user) throw new Error('User not found');

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user,
  };
};
