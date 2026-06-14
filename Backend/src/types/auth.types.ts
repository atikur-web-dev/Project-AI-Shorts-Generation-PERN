import type { JwtPayload } from "jsonwebtoken";

export interface AuthPayload extends JwtPayload {
  userID: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    picture: string | null;
  };
}
