// Backend/src/utils/token.ts
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import crypto from "crypto";
import type { AuthPayload } from "../types/auth.types.js";

// FIles are there
// Generate Access token using JWT.sing
// Generate Refresh token using crypto
// FUnction for hashing a token sung crypto
// Verifying token using jwr.verify

/**
 * 1. ACCESS TOKEN GENERATOR
 * Creates a short-term, cryptographically signed JSON Web Token (JWT).
 * It seals the user's ID inside the token payload so we can identify them later.
 */
export const generateAccessToken = (userId: string): string => { 
  return jwt.sign(
    { userId }, // Payload: The data we want to hide inside the token (using your lowercase "userId")
    config.JWT_SECRET, // Secret Key: The private signature key that only our backend server knows
    { expiresIn: "1d" } // Expiration: This token will automatically become invalid after exactly 1 day
  );
};

/**
 * 2. REFRESH TOKEN GENERATOR
 * Creates a long-term, ultra-secure random string using Node.js's native crypto library.
 * Unlike JWTs, this is just pure, unpredictable random data.
 */
export const generateRefreshToken = (): string => {
  // Generates 64 random cryptographic bytes and converts them into a clean hexadecimal string
  return crypto.randomBytes(64).toString('hex');
};

/**
 * 3. REFRESH TOKEN HASHING (One-Way Encryption)
 * Converts a raw refresh token string into a secure cryptographic hash.
 * We store this hash in the database instead of the raw text so that if a hacker 
 * steals our database rows, they still cannot use the tokens to log in.
 */
export const hashToken = (token: string): string => {
  // Uses the industry-standard SHA-256 algorithm to hash the token string into a hex output
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * 4. ACCESS TOKEN VERIFICATION (Symmetric Decryption)
 * Decodes the incoming JWT and double-checks if it was signed by our private secret key.
 * If the token is edited by a hacker or has expired, it automatically throws an error.
 */
export const verifyAccessToken = (token: string): AuthPayload | null => {
  try {
    // Verifies the signature and decodes the payload back into our original 'AuthPayload' format
    return jwt.verify(token, config.JWT_SECRET) as AuthPayload;
  } catch (error) {
    // If the token is fake, altered, or expired, safely catch the error and return null
    return null;
  }
};
