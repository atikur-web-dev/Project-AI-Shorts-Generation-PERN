import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import crypto from "crypto";
import type { AuthPayload } from "../types/auth.types.js";

// Access token generator 
export const generateAccessToken = (userId: string): string => { 
  return jwt.sign(
    { userId }, 
    config.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// Refresh token generator
export const generateRefreshToken = (): string => {
  return crypto.pseudoRandomBytes(64).toString("hex");
};

// Refresh token hashed
export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Access token verify
export const verifyAccessToken = (token: string): AuthPayload | null => {
  try {
    return jwt.verify(token, config.JWT_SECRET) as AuthPayload;
  } catch (error) {
    return null;
  }
};
