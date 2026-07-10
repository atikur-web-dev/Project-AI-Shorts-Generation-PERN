// Backend/src/utils/token.ts
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import crypto from "crypto";
import type { AuthPayload } from "../types/auth.types.js";

export const generateAccessToken = (userId: string): string => { 
  return jwt.sign(
    { userId }, 
    config.JWT_SECRET, 
    { expiresIn: "1d" } 
  );
};

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString('hex');
};

export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const verifyAccessToken = (token: string): AuthPayload | null => {
  try {
    return jwt.verify(token, config.JWT_SECRET) as AuthPayload;
  } catch (error) {
    return null;
  }
};
