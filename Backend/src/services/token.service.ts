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

/**
 * ৩. সব সেশন ডিলিট বা ইউজারকে সব ডিভাইস থেকে লগআউট করার ফাংশন
 */
export const revokeAllSessions = async (userId: string) => {
  try {
    // ডাটাবেজ থেকে ওই ইউজারের সমস্ত সেশন রো (Row) ডিলিট করে দেওয়া হচ্ছে
    await prisma.session.deleteMany({ where: { userId } });
    logger.info(`🗑️ All sessions revoked for user: ${userId}`);
  } catch (error) {
    logger.error(`❌ Failed to revoke sessions for user ${userId}:`, error);
    throw new Error('Could not revoke sessions');
  }
};

/**
 * ৪. রিফ্রেশ টোকেন দিয়ে সেশন চেক করার ফাংশন
 * ফ্রন্টএন্ড থেকে পাঠানো রিফ্রেশ টোকেনটি আসলেই ডাটাবেজে আছে কি না তা যাচাই করে।
 */
export const getSessionByRefreshToken = async (refreshToken: string) => {
  try {
    // চেক করার জন্য রিফ্রেশ টোকেনটিকে হ্যাস করা হচ্ছে
    const hashedToken = hashToken(refreshToken);
    
    // ডাটাবেজ থেকে সেশন এবং ইউজারের তথ্য খোঁজা হচ্ছে
    const session = await prisma.session.findFirst({
      where: { refreshToken: hashedToken },
      include: { user: true },
    });

    // সেশন না পাওয়া গেলে অথবা মেয়াদ শেষ হয়ে গেলে null (কিছুই না) রিটার্ন করবে
    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    // সেশন ঠিক থাকলে পুরো সেশনের অবজেক্টটি রিটার্ন করবে
    return session;
  } catch (error) {
    logger.error('❌ Error fetching session:', error);
    return null;
  }
};
