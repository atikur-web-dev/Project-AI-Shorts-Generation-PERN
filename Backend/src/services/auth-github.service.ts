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
  const param = new URLSearchParams({
    client_id: config.GITHUB_CLIENT_ID,
    redirect_url: config.GITHUB_REDIRECT_URL,
    scope: "user:email",
    allow_signup: "true",
  });
  return `https://github.com/login/oauth/authorize?${param.toString()}`;
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
      headers: { Accept: "application/json" },
    },
  );

  const accessToken = tokenResponse.data.access_token;
  if (!accessToken) {
    throw new Error("Failed to get GitHub access Token");
  }

  // Get user data
  const userResponse = await axios.get("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  const githubUser = userResponse.data;

  // Get user email (handle cases where email is private)
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
    const primaryEmail = emailResponse.data.find((e: any) => e.primary);
    email = primaryEmail?.email || `${githubUser.id}@github.user`;
  }

  if (!email) {
    throw new Error("GitHub email not found");
  }

  // Get or create free subscription
  let freeSubscription = await prisma.subscription.findUnique({
    where: { name: "free" },
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

  // Upsert user in database
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: githubUser.name || githubUser.login || "",
      picture: githubUser.avatar_url || "",
      // Cast to any to avoid TypeScript error if the Prisma schema doesn't include githubId
      // (keeps intended behavior if the field exists at runtime)
      ...( { githubId: String(githubUser.id) } as any ),
    },
    create: {
      email,
      name: githubUser.name || githubUser.login || "",
      picture: githubUser.avatar_url || "",
      // Cast to any to avoid TypeScript error if the Prisma schema doesn't include githubId
      ...( { githubId: String(githubUser.id) } as any ),
      googleId: "",
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
    },
  });

  // Create session
  const refreshToken = generateRefreshToken();
  const hashedRefreshToken = hashToken(refreshToken);

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken: hashedRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const accessTokenJwt = generateAccessToken(user.id);

  return {
    accessToken: accessTokenJwt,
    refreshToken,
    user,
  };
};
