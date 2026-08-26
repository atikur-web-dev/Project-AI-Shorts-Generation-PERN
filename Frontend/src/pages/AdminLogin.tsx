// Frontend/src/pages/AdminLogin.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import api from "../services/api";

interface AdminLoginResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
    picture: string | null;
    loginType: string;
    role: string;
  };
}

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    email: "admin@aishorts.com",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post<AdminLoginResponse>(
        "/auth/admin/login",
        {
          email: credentials.email.trim(),
          password: credentials.password,
        },
      );

      const data = response.data;

      if (!data.success || !data.accessToken || !data.user) {
        throw new Error(
          data.message || "Admin login failed",
        );
      }

      // Extra frontend safety check.
      // Backend already verifies that the user has ADMIN role.
      if (data.user.role !== "ADMIN") {
        throw new Error("You are not authorized as an admin.");
      }

      // Store authentication information
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminEmail", data.user.email);
      localStorage.setItem("adminUser", JSON.stringify(data.user));

      // Redirect to admin dashboard
      navigate("/admin");
    } catch (err: any) {
      console.error("Admin login error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Admin login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield
                className="text-primary-600"
                size={32}
              />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Login
            </h1>

            <p className="text-gray-600">
              Access the admin dashboard
            </p>
          </div>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Admin Email
              </label>

              <input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials((previous) => ({
                    ...previous,
                    email: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="admin@aishorts.com"
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials((previous) => ({
                    ...previous,
                    password: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="Enter admin password"
                disabled={loading}
                autoComplete="current-password"
                required
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Logging in..."
                : "Login to Admin Dashboard"}
            </button>
          </form>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              disabled={loading}
              className="text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
