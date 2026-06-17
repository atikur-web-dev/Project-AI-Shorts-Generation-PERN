// src/routes/auth.route.ts
import { Router } from 'express';
import {
  googleLogin,
  googleCallback,
  logout,
  refreshToken,
  getMe,
} from '../Controller/auth.controller.js';
import { authenticate } from '../Middleware/auth.middleware.js';

// Initialize the Express Router machine
const router = Router();

// ==========================================
// PUBLIC ROUTES (Anyone can access these)
// ==========================================

/**
 * STEP 1: START GOOGLE LOGIN FLOW
 * URL: GET /api/v1/auth/google/login (assuming prefix is added in app.ts)
 * When a user visits this link, the controller automatically redirects them to Google's official login page.
 */
router.get('/auth/google/login', googleLogin);

/**
 * STEP 2: HANDLE GOOGLE REDIRECTION
 * URL: GET /api/v1/auth/google/callback
 * This is the return address. Google hits this URL with a temporary code after the user logs in.
 * The controller exchanges that code for actual database user profiles and session cookies.
 */
router.get('/auth/google/callback', googleCallback);

/**
 * STEP 3: SILENT TOKEN REFRESH
 * URL: POST /api/v1/auth/refresh
 * The frontend calls this endpoint automatically in the background when the short-term Access Token expires.
 * It reads the 7-day Refresh Token cookie to rotate it and issue a brand-new set of tokens.
 */
router.post('/auth/refresh', refreshToken);

/**
 * STEP 4: USER LOGOUT
 * URL: POST /api/v1/auth/logout
 * Destroys the current user session logs inside the Prisma database and wipes out browser token cookies.
 */
router.post('/auth/logout', logout);

// ==========================================
// PROTECTED ROUTES (Requires Login Token)
// ==========================================

/**
 * STEP 5: GET CURRENT USER DASHBOARD DATA
 * URL: GET /api/v1/auth/me
 * Notice the 'authenticate' middleware sitting in the middle!
 * Before reaching 'getMe', the request MUST pass through our security guard middleware.
 * If the token is fake or expired, the guard blocks it. If it is valid, the guard passes it to 'getMe'.
 */
router.get('/auth/me', authenticate, getMe);

// Export the configured router instance so we can plug it into our main app.ts server file
export const authRouter = router;
