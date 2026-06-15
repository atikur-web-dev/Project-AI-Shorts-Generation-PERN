// src/routes/auth.route.ts
import { Router } from 'express';
import {
  googleLogin,
  googleCallback,
  logout,
  refreshToken,
  getMe,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// পাবলিক রাউট
router.get('/auth/google/login', googleLogin);
router.get('/auth/google/callback', googleCallback);
router.post('/auth/refresh', refreshToken);
router.post('/auth/logout', logout);

// প্রটেক্টেড রাউট (লগইন লাগবে)
router.get('/auth/me', authenticate, getMe);

export const authRouter = router;