// src/services/auth.service.ts
import { google } from "googleapis";
import { prisma } from "../lib/prisma.js";
import { config } from "../config/index.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../utils/token.js";
import type { SessionData } from "../types/auth.types.js";

// =========================================================================
// === PART 1: CONFIGURATION & GOOGLE LOGIN URL SETUP
// =========================================================================

// 1. Destructure Google credentials from the central configuration file
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL } = config;

// 2. Initialize the official Google OAuth2 client machine/manager instance
// We pass our ID, Secret Key, and Return Address so Google knows who we are.
const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URL,
);

// 3. Generate the magic Google Login URL
// This function creates the link that we send to the frontend button.
export const getGoogleAuthUrl = (): string => {
  return oauth2Client.generateAuthUrl({
    access_type: "offline", // Essential to receive a Refresh Token from Google
    prompt: "select_account", // Forces Google to show the account chooser box
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",   // Permission to see user email
      "https://www.googleapis.com/auth/userinfo.profile", // Permission to see user name/picture
      "openid", // Standard protocol requirement to verify user identity token
    ],
  });
};

// =========================================================================
// === PART 2: PROCESSING GOOGLE LOGIN DATA & SESSION CREATION
// =========================================================================

// 4. Process the Google Callback data
// This function runs right after the user successfully logs into Google.
export const handleGoogleCallback = async (
  code: string,
): Promise<SessionData> => {
  
  // STEP A: Exchange the temporary coupon code for actual security tokens
  const { tokens } = await oauth2Client.getToken(code);
  // Feed the newly received tokens into our Google manager client memory
  oauth2Client.setCredentials(tokens);

  // STEP B: Fetch the real profile information from the Google server database
  const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
  const { data } = await oauth2.userinfo.get();
  
  // Security check: Every account must have an email; if missing, throw an error
  if (!data.email) {
    throw new Error("Email could not found");
  }

  // STEP C: Save the user inside our local database using Prisma Upsert
  // If the email exists, update profile data. If it does not exist, create a new row.
  const user = await prisma.user.upsert({
    where: { email: data.email }, // Search key
    update: {
      name: data.name || "",
      picture: data.picture || "",
      googleId: data.id || "",
    },
    create: {
      email: data.email,
      name: data.name || "",
      picture: data.picture || "",
      googleId: data.id || "",
      loginType: "google", // Mark them as a Google-based login user
    },
    // Filter the response data to return only safe public user profiles
    select: {
      id: true,
      email: true,
      name: true,
      picture: true,
    },
  });

  // STEP D: Generate a secure 7-day long-term Refresh Token session
  const refreshToken = generateRefreshToken(); // Create random 64-byte text string
  const hashedRefreshToken = hashToken(refreshToken); // Hash it for database safety
  
  // Create a brand new active session row inside the Prisma Session table
  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken: hashedRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Valid for exactly 7 days
    },
  });

  // STEP E: Generate the short-term Access Token ticket for API communication
  const accessToken = generateAccessToken(user.id);
  
  // Return the full payload bundle back to our controller file
  return {
    accessToken,
    refreshToken,
    user,
  };
};

// =========================================================================
// === PART 3: LOGOUT & TOKEN ROTATION SYSTEMS
// =========================================================================

// 5. Terminate user session (Logout)
// Deletes the active token log directly from the database schema.
export const logoutUser = async (refreshToken: string): Promise<boolean> => {
  // Convert the input token into a hash format to match the stored database records
  const hashedToken = hashToken(refreshToken);
  
  // Find and completely destroy any sessions holding this specific token hash
  const { count } = await prisma.session.deleteMany({
    where: { refreshToken: hashedToken },
  });
  
  // Returns true if a session row was successfully found and deleted; else false
  return count > 0;
};

// 6. Generate a fresh Access Token using Token Rotation
// Deletes the used refresh token and replaces it with a completely new set.
export const rotateRefreshToken = async (
  oldRefreshToken: string,
): Promise<SessionData> => {
  // Hash the incoming token text to prepare for the database look-up query
  const hashedOldToken = hashToken(oldRefreshToken);

  // Search for the old active session inside the database
  const session = await prisma.session.findFirst({
    where: { refreshToken: hashedOldToken },
  });

  // Security test: If session does not exist or has expired past the deadline, block it
  if (!session || session.expiresAt < new Date()) {
    throw new Error("Invalid or expired refresh token");
  }

  // TOKEN ROTATION STEP: Instantly kill the old session row so it can never be reused
  await prisma.session.delete({ where: { id: session.id } });

  // STEP F: Build an entirely new session block for the user
  const newRefreshToken = generateRefreshToken(); // Generate fresh random string
  const hashedNewToken = hashToken(newRefreshToken); // Secure hash it

  // Insert the newly generated session credentials into the database for another 7 days
  await prisma.session.create({
    data: {
      userId: session.userId,
      refreshToken: hashedNewToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // STEP G: Create a brand new short-term Access Token ticket
  const newAccessToken = generateAccessToken(session.userId);

  // Fetch the up-to-date user account data from the profile table
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, picture: true },
  });

  // Fallback check: If the user profile row was deleted while session was active
  if (!user) throw new Error("User not found");

  // Send the completely new active keys packet back to the app controller
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user,
  };
};
