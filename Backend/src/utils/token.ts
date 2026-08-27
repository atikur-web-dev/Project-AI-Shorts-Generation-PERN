import jwt from "jsonwebtoken";
import crypto from "crypto";

import { config } from "../config/index.js";
import type { AuthPayload } from "../types/auth.types.js";

export const generateAccessToken = (
  userId: string,
): string => {
  return jwt.sign(
    {
      userId,
    },
    config.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
};

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString("hex");
};

export const hashToken = (token: string): string => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

export const verifyAccessToken = (
  token: string,
): AuthPayload | null => {
  try {
    const decoded = jwt.verify(
      token,
      config.JWT_SECRET,
    ) as AuthPayload;

    if (!decoded.userId) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
};