
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

console.log("API Base URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    console.error("API Error:", error);

    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    if (status === 401) {
      // Authentication endpoints should handle their own errors.
      const isAuthRequest =
        requestUrl.includes("/auth/admin/login") ||
        requestUrl.includes("/auth/refresh") ||
        requestUrl.includes("/auth/logout") ||
        requestUrl.includes("/auth/google") ||
        requestUrl.includes("/auth/github");

      if (!isAuthRequest) {
        const isAdminRequest =
          requestUrl.includes("/admin/");

        // Clear invalid authentication data.
        localStorage.removeItem("accessToken");

        if (isAdminRequest) {
          // Clear admin-specific session data.
          localStorage.removeItem("isAdmin");
          localStorage.removeItem("adminEmail");
          localStorage.removeItem("adminUser");

          // Send admin back to admin login.
          window.location.href = "/admin-login";
        } else {
          // Normal user session expired.
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
