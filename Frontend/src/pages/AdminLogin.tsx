
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Info } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [credentials, setCredentials] = useState({
    email: "admin@aishorts.com",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post(
        "/auth/admin/login",
        credentials,
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Admin login failed",
        );
      }

      const { accessToken, user } = response.data;

      if (!accessToken || !user) {
        throw new Error(
          "Invalid response received from server",
        );
      }

      // Store admin authentication through AuthContext
      login(user, accessToken);

      // Keep admin information locally for UI purposes
      localStorage.setItem(
        "adminUser",
        JSON.stringify(user),
      );

      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminEmail", user.email);

      navigate("/admin");
    } catch (error: any) {
      console.error("Admin login error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Invalid admin credentials",
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>

              <input
                type="email"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials((previous) => ({
                    ...previous,
                    email: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="Enter admin email"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <input
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
                required
                disabled={loading}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Logging in..."
                : "Login to Admin Dashboard"}
            </button>

            {/* Public Demo Credentials */}
            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <Info
                  size={20}
                  className="text-blue-600 mt-0.5 flex-shrink-0"
                />

                <div className="text-sm">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Demo Admin Credentials
                  </h3>

                  <div className="space-y-1 text-blue-900">
                    <p>
                      <span className="font-medium">
                        Email:
                      </span>{" "}
                      <span className="font-semibold">
                        admin@aishorts.com
                      </span>
                    </p>

                    <p>
                      <span className="font-medium">
                        Password:
                      </span>{" "}
                      <span className="font-semibold">
                        admin123
                      </span>
                    </p>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-blue-800">
                    These credentials are intentionally displayed
                    publicly for demonstration and testing purposes.
                    This is a demo admin account provided so reviewers
                    and visitors can directly access and test the
                    admin dashboard.
                  </p>
                </div>
              </div>
            </div>
          </form>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-primary-600 hover:text-primary-700 font-medium"
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
