// Backend/src/types/auth.types.ts
import type { JwtPayload } from "jsonwebtoken";

/**
 * 1. JWT PAYLOAD DATA STRUCTURE
 * Defines the structure of the data hidden inside the decoded Access Token.
 * It extends the default jsonwebtoken 'JwtPayload' type.
 */
export interface AuthPayload extends JwtPayload {
  userId: string; //  FIXED: Changed from userID to userId (lowercase "d") to match token.ts and auth.middleware.ts
}

/**
 * 2. GOOGLE USER RAW INFORMATION
 * Defines the exact shape of the profile data object returned to us 
 * by the official Google OAuth2 userinfo endpoint api.
 */
export interface GoogleUserInfo {
  id: string;      // The unique Google account ID number
  email: string;   // The user's Gmail address
  name: string;    // The user's full name
  picture: string; // The URL link to the user's Google profile avatar photo
}

/**
 * 3. TOKEN PAIR CONTAINER
 * A simple container structure used when returning both the short-term 
 * access token and long-term refresh token together.
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * 4. COMPLETE SESSION RESPONSE DATA
 * Defines the final structural payload returned by handleGoogleCallback and rotateRefreshToken.
 * This is exactly what the controller expects to bundle and send back to the client browser.
 */
export interface SessionData {
  accessToken: string;  // Short-term authentication ticket string
  refreshToken: string; // Long-term 7-day session token string
  user: {
    id: string;          // Our local database system user unique identifier string
    email: string;       // User email address
    name: string;        // User display profile name
    picture: string | null; // User profile image link (can be null if not provided)
  };
}
