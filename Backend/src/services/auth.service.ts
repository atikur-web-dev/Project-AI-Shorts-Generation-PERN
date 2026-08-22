import { google } from "googleapis";
import { prisma } from "../lib/prisma.js";
import { config } from "../config/index.js";

import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../utils/token.js";

import type { SessionData } from "../types/auth.types.js";


// Google OAuth Configuration
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URL,
} = config;

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URL,
);


// Google Login URL
export const getGoogleAuthUrl = (): string => {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "select_account",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "openid",
    ],
  });
};


// Google OAuth Callback
export const handleGoogleCallback = async (
  code: string,
): Promise<SessionData> => {
  // Exchange authorization code for Google tokens
  const { tokens } = await oauth2Client.getToken(code);

  oauth2Client.setCredentials(tokens);

  // Fetch Google user profile
  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: "v2",
  });

  const { data } = await oauth2.userinfo.get();

  if (!data.email) {
    throw new Error("Email could not be found");
  }


  // Get or create Free Subscription
  let freeSubscription = await prisma.subscription.findUnique({
    where: {
      name: "free",
    },
  });

  if (!freeSubscription) {
    freeSubscription = await prisma.subscription.create({
      data: {
        name: "free",
        price: 0,
        credits: 30,
      },
    });
  }


  // Create / Update User
  const user = await prisma.user.upsert({
    where: {
      email: data.email,
    },

    // Existing user
    update: {
      name: data.name || "",
      picture: data.picture || "",
      googleId: data.id || "",
      loginType: "google",
    },

    // New user
    create: {
      email: data.email,
      name: data.name || "",
      picture: data.picture || "",
      googleId: data.id || "",


      loginType: "google",

      userSubscription: {
        create: {
          credits: 30,

          subscription: {
            connect: {
              id: freeSubscription.id,
            },
          },
        },
      },
    },

    select: {
      id: true,
      email: true,
      name: true,
      picture: true,
      loginType: true,
      role: true,
    },
  });

  // Create Refresh Token
  const refreshToken = generateRefreshToken();

  const hashedRefreshToken = hashToken(refreshToken);

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken: hashedRefreshToken,
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ),
    },
  });

 
  // Create Access Token
  const accessToken = generateAccessToken(user.id);

  return {
    accessToken,
    refreshToken,
    user,
  };
};


// Logout User
export const logoutUser = async (
  refreshToken: string,
): Promise<void> => {
  const hashedRefreshToken = hashToken(refreshToken);

  await prisma.session.deleteMany({
    where: {
      refreshToken: hashedRefreshToken,
    },
  });
};


// Rotate Refresh Token
export const rotateRefreshToken = async (
  oldRefreshToken: string,
): Promise<SessionData> => {
  const hashedOldRefreshToken = hashToken(oldRefreshToken);

  // Find existing session
  const session = await prisma.session.findFirst({
    where: {
      refreshToken: hashedOldRefreshToken,
      expiresAt: {
        gt: new Date(),
      },
    },

    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          picture: true,
          loginType: true,
          role: true,
        },
      },
    },
  });

  if (!session) {
    throw new Error("Invalid or expired refresh token");
  }


  // Generate new refresh token
 const newRefreshToken = generateRefreshToken();

  const hashedNewRefreshToken = hashToken(newRefreshToken);


  // Update existing session
  await prisma.session.update({
    where: {
      id: session.id,
    },

    data: {
      refreshToken: hashedNewRefreshToken,

      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ),
    },
  });


  // Generate new access token
  const accessToken = generateAccessToken(session.user.id);

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: session.user,
  };
};