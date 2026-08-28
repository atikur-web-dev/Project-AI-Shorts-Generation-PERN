// Backend/src/services/auth-github.service.ts
import { prisma } from "../lib/prisma.js";
import { config } from "../config/index.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../utils/token.js";
import type { SessionData } from "../types/auth.types.js";
import axios from "axios";

// Generate GitHub Login URL
export const getGitHubAuthUrl = (): string => {
  const params = new URLSearchParams({
    client_id: config.GITHUB_CLIENT_ID,
    redirect_uri: config.GITHUB_REDIRECT_URL,
    scope: "user:email",
    allow_signup: "true",
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
};

// Process GitHub Callback
export const handleGitHubCallback = async (
  code: string,
): Promise<SessionData> => {
  // Get access token from GitHub
  const tokenResponse = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: config.GITHUB_CLIENT_ID,
      client_secret: config.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: config.GITHUB_REDIRECT_URL,
    },
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  const accessToken = tokenResponse.data.access_token;

  if (!accessToken) {
    throw new Error("Failed to get GitHub access token");
  }

  // Get GitHub user data
  const userResponse = await axios.get(
    "https://api.github.com/user",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    },
  );

  const githubUser = userResponse.data;

  // Get user email
  let email = githubUser.email;

  if (!email) {
    const emailResponse = await axios.get(
      "https://api.github.com/user/emails",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      },
    );

    const primaryEmail = emailResponse.data.find(
      (e: any) => e.primary && e.verified,
    );

    email =
      primaryEmail?.email ||
      `${githubUser.id}@github.user`;
  }

  if (!email) {
    throw new Error("GitHub email not found");
  }

  // Get or create free subscription
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

  // Find existing user by email
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  let user;

  if (existingUser) {
    // Existing user:
    // Update GitHub information without touching googleId.
    user = await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        name: githubUser.name || githubUser.login || "",
        picture: githubUser.avatar_url || "",
        githubId: String(githubUser.id),
        loginType: "github",
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
  } else {
    // New GitHub user.
    // IMPORTANT:
    // Do NOT set googleId to "" because googleId is unique.
    user = await prisma.user.create({
      data: {
        email,
        name: githubUser.name || githubUser.login || "",
        picture: githubUser.avatar_url || "",
        githubId: String(githubUser.id),
        loginType: "github",

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
  }

  // Create session
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

  // Generate access token
  const accessTokenJwt = generateAccessToken(user.id);

  return {
    accessToken: accessTokenJwt,
    refreshToken,
    user,
  };
};