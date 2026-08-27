// Frontend/src/pages/LoginPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Chrome, Github, Shield, X } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState('atikuradmin@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }

    // Handle OAuth callback
    const accessToken = searchParams.get('accessToken');

    if (accessToken) {
      authService.setAccessToken(accessToken);

      authService.getMe().then((response) => {
        if (response.success && response.user) {
          login(response.user, accessToken);
          navigate('/dashboard');
        }
      });
    }
  }, [user, navigate, login, searchParams]);


const handleAdminLogin = async (
  event: React.FormEvent<HTMLFormElement>,
) => {
  event.preventDefault();

  setAdminError("");
  setAdminLoading(true);

  try {
    const response = await authService.adminLogin(
      adminEmail,
      adminPassword,
    );

    // Validate admin login response
    if (
      !response.success ||
      !response.accessToken ||
      !response.user
    ) {
      throw new Error(
        response.message || "Admin login failed",
      );
    }

    // Make absolutely sure the authenticated account
    // is actually an administrator.
    if (response.user.role !== "ADMIN") {
      throw new Error(
        "This account does not have administrator access.",
      );
    }

    // Store the real JWT access token
    authService.setAccessToken(
      response.accessToken,
    );

    // IMPORTANT:
    // Update AuthContext with the authenticated admin.
    // AdminRoute depends on this user state.
    login(
      response.user,
      response.accessToken,
    );

    // Optional admin session markers
    localStorage.setItem(
      "isAdmin",
      "true",
    );

    localStorage.setItem(
      "adminUser",
      JSON.stringify(response.user),
    );

    localStorage.setItem(
      "adminEmail",
      response.user.email,
    );

    // Close admin modal
    setShowAdminModal(false);

    // Clear password field
    setAdminPassword("");

    // Clear previous error
    setAdminError("");

    // IMPORTANT:
    // Directly navigate to the admin dashboard.
    navigate("/admin", {
      replace: true,
    });
  } catch (error: any) {
    console.error(
      "Admin login error:",
      error,
    );

    setAdminError(
      error.response?.data?.message ||
        error.message ||
        "Admin login failed",
    );
  } finally {
    setAdminLoading(false);
  }
};

  const closeAdminModal = () => {
    if (adminLoading) {
      return;
    }

    setShowAdminModal(false);
    setAdminPassword('');
    setAdminError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h1>

              <p className="text-gray-600">
                Sign in to continue to AI Shorts Generator
              </p>
            </div>

            {/* User Login */}
            <div className="space-y-4">
              <button
                onClick={authService.loginWithGoogle}
                className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <Chrome
                  className="text-gray-700"
                  size={24}
                />

                <span className="text-gray-700 font-medium">
                  Continue with Google
                </span>
              </button>

              <button
                onClick={authService.loginWithGitHub}
                className="w-full flex items-center justify-center space-x-3 bg-gray-900 text-white rounded-lg px-4 py-3 hover:bg-gray-800 transition-colors"
              >
                <Github size={24} />

                <span className="font-medium">
                  Continue with GitHub
                </span>
              </button>
            </div>

            {/* Admin Login Button */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setAdminError('');
                  setShowAdminModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors font-medium"
              >
                <Shield size={20} />

                <span>Administrator</span>
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                By continuing, you agree to our Terms of
                Service and Privacy Policy
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Admin Login Modal */}
      {showAdminModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAdminModal();
            }
          }}
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative">
            {/* Close Button */}
            <button
              type="button"
              onClick={closeAdminModal}
              disabled={adminLoading}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-50"
              aria-label="Close admin login"
            >
              <X size={22} />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="bg-primary-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield
                  className="text-primary-600"
                  size={28}
                />
              </div>

              <h2 className="text-2xl font-bold text-gray-900">
                Administrator Login
              </h2>

              <p className="text-gray-600 mt-1">
                Sign in to access the admin dashboard
              </p>
            </div>

            <form
              onSubmit={handleAdminLogin}
              className="space-y-4"
            >
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Email
                </label>

                <input
                  type="email"
                  value={adminEmail}
                  onChange={(event) =>
                    setAdminEmail(event.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter admin email"
                  required
                  disabled={adminLoading}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>

                <input
                  type="password"
                  value={adminPassword}
                  onChange={(event) =>
                    setAdminPassword(event.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter admin password"
                  required
                  disabled={adminLoading}
                />
              </div>

              {/* Error */}
              {adminError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {adminError}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={adminLoading}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adminLoading
                  ? 'Logging in...'
                  : 'Login as Administrator'}
              </button>
            </form>

            {/* Public Demo Credentials Notice */}
            <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm font-semibold text-yellow-800 mb-2">
                Demo Admin Credentials
              </p>

              <div className="text-sm text-yellow-800 space-y-1">
                <p>
                  <span className="font-medium">
                    Email:
                  </span>{' '}
                  atikuradmin@gmail.com
                </p>

                <p>
                  <span className="font-medium">
                    Password:
                  </span>{' '}
                  atikur123
                </p>
              </div>

              <p className="text-xs text-yellow-700 mt-3 leading-relaxed">
                These credentials are intentionally shown
                publicly because this admin account is provided
                as a demo/test account for project evaluation.
                They should not be used for a production
                administrator account.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginPage;