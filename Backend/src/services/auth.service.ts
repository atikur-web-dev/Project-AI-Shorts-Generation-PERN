import { google } from "googleapis";
import { prisma } from "../lib/prisma.js";
import { config } from "../config/index.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hastToken,
} from "../utils/token.js";
import type { GoogleUserInfo, SessionData } from "../types/auth.types.js";
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL } = config;
