// src/controllers/auth.controller.ts
import type { Request, Response } from 'express';
import { 
  getGoogleAuthUrl, 
  handleGoogleCallback, 
  logoutUser,
  rotateRefreshToken 
} from '../services/auth.service.js';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/cookies.js';
import { logger } from '../config/logger.js';

// ১. Google লগইন পেজে রিডাইরেক্ট করো
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const url = getGoogleAuthUrl();
    res.redirect(url);
  } catch (error) {
    logger.error('Google login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

// ২. Google Callback হ্যান্ডেল করো
export const googleCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, message: 'Authorization code missing' });
    }

    const { accessToken, refreshToken, user } = await handleGoogleCallback(code);
    
    // Refresh Token কুকিতে সেট করো
    setRefreshTokenCookie(res, refreshToken);
    
    // Access Token JSON রেসপন্সে দাও
    res.json({
      success: true,
      accessToken,
      user,
    });
  } catch (error) {
    logger.error('Google callback error:', error);
    res.status(500).json({ success: false, message: 'Authentication failed' });
  }
};

// ৩. লগআউট করো
export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      await logoutUser(refreshToken);
      clearRefreshTokenCookie(res);
    }
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
};

// ৪. Refresh Token দিয়ে নতুন Access Token নাও (Token Refresh)
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    
    if (!oldRefreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token missing' });
    }

    const { accessToken, refreshToken, user } = await rotateRefreshToken(oldRefreshToken);
    
    // পুরনো Refresh Token রিপ্লেস করো (Rotation)
    clearRefreshTokenCookie(res);
    setRefreshTokenCookie(res, refreshToken);
    
    res.json({
      success: true,
      accessToken,
      user,
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

// ৫. বর্তমান ইউজারের তথ্য নাও (প্রটেক্টেড রুট)
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    // ইউজার তথ্য ডাটাবেস থেকে নাও
    const { prisma } = await import('../lib/prisma.js');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, picture: true, loginType: true },
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    logger.error('Get me error:', error);
    res.status(500).json({ success: false, message: 'Failed to get user info' });
  }
};