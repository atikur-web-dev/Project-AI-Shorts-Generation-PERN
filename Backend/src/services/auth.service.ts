// src/services/auth.service.ts
import { prisma } from "../lib/prisma.js";
import { generateAccessToken, generateRefreshToken, hashToken } from "../utils/token.js";
import type { SessionData } from "../types/auth.types.js";

// Re-export Google & GitHub services for convenience
export { getGoogleAuthUrl, handleGoogleCallback } from "./auth-google.service.js";
export { getGitHubAuthUrl, handleGitHubCallback } from "./auth-github.service.js";

// Logout user - Delete session
export const logoutUser = async (refreshToken: string): Promise<boolean> => {
  const hashedToken = hashToken(refreshToken);
  
  const deleteResult = await prisma.session.deleteMany({
    where: { 
      refreshToken: hashedToken
    },
  });

  return deleteResult.count > 0;
};

// Token Rotation - Generate fresh tokens
export const rotateRefreshToken = async (
  oldRefreshToken: string,
): Promise<SessionData> => {
  const hashedOldToken = hashToken(oldRefreshToken);

  const session = await prisma.session.findFirst({
    where: { refreshToken: hashedOldToken },
  });

  if (!session || session.expiresAt < new Date()) {
    throw new Error("Invalid or expired refresh token");
  }

  // Delete old session
  await prisma.session.delete({ where: { id: session.id } });

  // Create new session
  const newRefreshToken = generateRefreshToken();
  const hashedNewToken = hashToken(newRefreshToken);

  await prisma.session.create({
    data: {
      userId: session.userId,
      refreshToken: hashedNewToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const newAccessToken = generateAccessToken(session.userId);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, picture: true },
  });

  if (!user) throw new Error("User not found");

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user,
  };
};