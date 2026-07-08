import { prisma } from '../lib/prisma.js';
import { generateAccessToken, generateRefreshToken, hashToken } from '../utils/token.js';
import { logger } from '../config/logger.js';

/**
 * ১. নতুন সেশন তৈরি করার ফাংশন
 * ইউজার লগইন করলে এই ফাংশনটি কল হয়।
 */
export const createSession = async (userId: string) => {
  try {
    // নতুন রিফ্রেশ টোকেন তৈরি করা হচ্ছে
    const refreshToken = generateRefreshToken();
    
    // সিকিউরিটির জন্য রিফ্রেশ টোকেনটিকে হ্যাস (Hash) বা এনক্রিপ্ট করা হচ্ছে
    const hashedRefreshToken = hashToken(refreshToken);

    // Prisma Transaction ব্যবহার করে একসাথে দুটি কাজ করা হচ্ছে (পারফরম্যান্স ও সেফটির জন্য)
    await prisma.$transaction([
      // ক) ইউজারের আগের ডিভাইস বা ব্রাউজারের সব পুরানো সেশন ডিলিট করা হচ্ছে
      prisma.session.deleteMany({ where: { userId } }),
      
      // খ) ডাটাবেজে নতুন সেশনের তথ্য সেভ করা হচ্ছে
      prisma.session.create({
        data: {
          userId, // কার সেশন তার আইডি
          refreshToken: hashedRefreshToken, // হ্যাস করা টোকেন
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // টোকেনের মেয়াদ আজ থেকে ৭ দিন
        },
      }),
    ]);

    // ইউজারের জন্য একটি নতুন অ্যাক্সেস টোকেন তৈরি করা হচ্ছে (যা অল্প সময়ের জন্য ভ্যালিড থাকে)
    const accessToken = generateAccessToken(userId);

    // ফ্রন্টএন্ডে ব্যবহারের জন্য অ্যাক্সেস টোকেন এবং মূল রিফ্রেশ টোকেনটি পাঠানো হচ্ছে
    return { accessToken, refreshToken };
  } catch (error) {
    // কোনো ভুল বা এরর হলে তা লগারে রেকর্ড করা হচ্ছে
    logger.error(`❌ Error creating session for user ${userId}:`, error);
    throw new Error('Could not create session');
  }
};

/**
 * ২. টোকেন রোটেশন (Token Rotation) ফাংশন
 * অ্যাক্সেস টোকেনের মেয়াদ শেষ হলে, ইউজারকে লগআউট না করিয়ে নতুন টোকেন দেওয়ার জন্য এটি কাজ করে।
 */
export const rotateRefreshToken = async (oldRefreshToken: string) => {
  try {
    // ইউজার যে পুরানো টোকেনটি পাঠিয়েছে, সেটিকে হ্যাস করা হচ্ছে ডাটাবেজের সাথে মিলানোর জন্য
    const hashedOldToken = hashToken(oldRefreshToken);

    // ডাটাবেজ থেকে এই টোকেনের সেশন এবং ইউজারের তথ্য খুঁজে বের করা হচ্ছে
    const session = await prisma.session.findFirst({
      where: { refreshToken: hashedOldToken },
      include: { user: true }, // সেশনের সাথে ইউজারের মেইন প্রোফাইলও নিয়ে আসা হচ্ছে
    });

    // সেশন যদি খুঁজে না পাওয়া যায় অথবা সেশনের মেয়াদ শেষ হয়ে যায়, তবে এরর দেওয়া হবে
    if (!session || session.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    // সম্পূর্ণ নতুন আরেকটি রিফ্রেশ টোকেন তৈরি করা হচ্ছে
    const newRefreshToken = generateRefreshToken();
    const hashedNewToken = hashToken(newRefreshToken);

    // ট্রানজেকশনের মাধ্যমে পুরানো সেশন ডিলিট এবং নতুন সেশন তৈরি একসাথে করা হচ্ছে (Race Condition এড়াতে)
    await prisma.$transaction([
      // ক) ব্যবহৃত পুরানো সেশনটি ডিলিট করা হচ্ছে (যাতে কেউ এটি চুরি করে আবার ব্যবহার করতে না পারে)
      prisma.session.delete({ where: { id: session.id } }),
      
      // খ) নতুন টোকেন দিয়ে নতুন সেশন ডাটাবেজে সেভ করা হচ্ছে
      prisma.session.create({
        data: {
          userId: session.userId,
          refreshToken: hashedNewToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // আবার নতুন ৭ দিনের মেয়াদ
        },
      }),
    ]);

    // টোকেন সফলভাবে পরিবর্তন হয়েছে তা সিস্টেমে লগ করা হচ্ছে
    logger.info(`🔄 Token rotated for user: ${session.userId}`);

    // নতুন আরেকটি অ্যাক্সেস টোকেন জেনারেট করা হচ্ছে
    const newAccessToken = generateAccessToken(session.userId);

    // নতুন টোকেনগুলো এবং ইউজারের ডাটা রিটার্ন করা হচ্ছে
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: session.user,
    };
  } catch (error) {
    logger.error('❌ Token rotation failed:', error);
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
