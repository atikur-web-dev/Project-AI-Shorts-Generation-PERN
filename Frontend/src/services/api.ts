// Frontend/src/services/api.ts
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000/api/v1";

console.log("API Base URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    console.error("API Error:", error);

    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || "";

      // Do not redirect when the failed request itself
      // is an authentication endpoint.
      const isAuthRequest =
        requestUrl.includes("/auth/admin/login") ||
        requestUrl.includes("/auth/refresh") ||
        requestUrl.includes("/auth/logout") ||
        requestUrl.includes("/auth/google") ||
        requestUrl.includes("/auth/github");

      if (!isAuthRequest) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("adminEmail");
        localStorage.removeItem("adminUser");

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
