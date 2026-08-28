// Frontend/src/services/authService.ts
import api from "./api";

import type { User } from "../types";

export const authService = {
  loginWithGoogle: () => {
    const apiUrl =
      import.meta.env.VITE_API_URL ||
      "http://localhost:8000/api/v1";

    const loginUrl = `${apiUrl}/auth/google/login`;

    console.log(
      "Attempting Google login to:",
      loginUrl,
    );

    console.log(
      "VITE_API_URL from env:",
      import.meta.env.VITE_API_URL,
    );

    window.location.href = loginUrl;
  },

  loginWithGitHub: () => {
    const apiUrl =
      import.meta.env.VITE_API_URL ||
      "http://localhost:8000/api/v1";

    const loginUrl = `${apiUrl}/auth/github/login`;

    console.log(
      "Attempting GitHub login to:",
      loginUrl,
    );

    console.log(
      "VITE_API_URL from env:",
      import.meta.env.VITE_API_URL,
    );

    window.location.href = loginUrl;
  },

  adminLogin: async (
    email: string,
    password: string,
  ): Promise<{
    success: boolean;
    message?: string;
    accessToken?: string;
    user?: User;
  }> => {
    const response = await api.post(
      "/auth/admin/login",
      {
        email,
        password,
      },
    );

    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error(
        "Logout API error:",
        error,
      );
    } finally {
      localStorage.removeItem("accessToken");
    }
  },

  getMe: async (): Promise<{
    success: boolean;
    user?: User;
    message?: string;
  }> => {
    const response =
      await api.get("/auth/me");

    return response.data;
  },

  setAccessToken: (token: string) => {
    localStorage.setItem(
      "accessToken",
      token,
    );
  },

  getAccessToken: () => {
    return localStorage.getItem(
      "accessToken",
    );
  },

  clearAccessToken: () => {
    localStorage.removeItem(
      "accessToken",
    );
  },
};