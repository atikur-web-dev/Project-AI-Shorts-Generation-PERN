import { prisma } from '../lib/prisma.js';
import { generateAccessToken, generateRefreshToken, hashToken } from '../utils/token.js';
import { logger } from '../config/logger.js';


export const createSession = async (userId: string) => {
  try {
    
    const refreshToken = generateRefreshToken();
    const hashedRefreshToken = hashToken(refreshToken);
    await prisma.$transaction([
    
      prisma.session.deleteMany({ where: { userId } }),
      prisma.session.create({
        data: {
          userId, 
          refreshToken: hashedRefreshToken, 
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),  
        },
      }),
    ]);

    
    const accessToken = generateAccessToken(userId);
    return { accessToken, refreshToken };
  } catch (error) {
    logger.error(`Error creating session for user ${userId}:`, error);
    throw new Error('Could not create session');
  }
};

export const rotateRefreshToken = async (oldRefreshToken: string) => {
  try {
    
    const hashedOldToken = hashToken(oldRefreshToken);
    const session = await prisma.session.findFirst({
      where: { refreshToken: hashedOldToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }
    const newRefreshToken = generateRefreshToken();
    const hashedNewToken = hashToken(newRefreshToken);

  
    await prisma.$transaction([
      prisma.session.delete({ where: { id: session.id } }),
      prisma.session.create({
        data: {
          userId: session.userId,
          refreshToken: hashedNewToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // আবার নতুন ৭ দিনের মেয়াদ
        },
      }),
    ]);

    logger.info(` Token rotated for user: ${session.userId}`);

    const newAccessToken = generateAccessToken(session.userId);
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: session.user,
    };
  } catch (error) {
    logger.error('Token rotation failed:', error);
    throw error;
  }
};

export const revokeAllSessions = async (userId: string) => {
  try {
   
    await prisma.session.deleteMany({ where: { userId } });
    logger.info(`All sessions revoked for user: ${userId}`);
  } catch (error) {
    logger.error(` Failed to revoke sessions for user ${userId}:`, error);
    throw new Error('Could not revoke sessions');
  }
};

export const getSessionByRefreshToken = async (refreshToken: string) => {
  try {
   
    const hashedToken = hashToken(refreshToken);
    
   
    const session = await prisma.session.findFirst({
      where: { refreshToken: hashedToken },
      include: { user: true },
    });

    
    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return session;
  } catch (error) {
    logger.error('Error fetching session:', error);
    return null;
  }
};
