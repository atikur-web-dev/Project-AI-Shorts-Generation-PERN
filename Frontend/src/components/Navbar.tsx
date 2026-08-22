import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  Shield,
  ChevronDown,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const HomeIcon: React.FC<{ size?: number }> = ({ size = 17 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10.5Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M9 21V13H15V21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [imageError, setImageError] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";

    return name
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Brand */}
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-sm font-bold text-white shadow-sm transition group-hover:bg-primary-700">
              AI
            </div>

            <div className="hidden sm:block">
              <p className="text-base font-bold tracking-tight text-gray-900">
                AI Shorts
              </p>

              <p className="-mt-1 text-[10px] font-medium uppercase tracking-wider text-gray-400">
                Generator
              </p>
            </div>
          </button>

          {/* Right Side */}
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">

              {/* Home */}
              <button
                onClick={() => navigate("/")}
                className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 sm:flex"
              >
                <HomeIcon size={17} />
                Home
              </button>

              {/* Dashboard */}
              <button
                onClick={() => navigate("/dashboard")}
                className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 sm:flex"
              >
                <LayoutDashboard size={17} />
                Dashboard
              </button>

              {/* Admin */}
              {user.role === "ADMIN" && (
                <button
                  onClick={() => navigate("/admin")}
                  className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 sm:flex"
                >
                  <Shield size={17} />
                  Admin
                </button>
              )}

              {/* Divider */}
              <div className="hidden h-7 w-px bg-gray-200 sm:block" />

              {/* Profile */}
              <div className="group relative">

                {/* Profile Button */}
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-gray-50"
                >
                  {/* Avatar */}
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary-100 ring-2 ring-white">
                    {user.picture && !imageError ? (
                      <img
                        src={user.picture}
                        alt={user.name || "User"}
                        className="h-full w-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <span className="text-xs font-bold text-primary-700">
                        {getInitials(user.name)}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <div className="hidden text-left md:block">
                    <p className="max-w-32 truncate text-sm font-semibold text-gray-800">
                      {user.name || "User"}
                    </p>

                    <p className="text-[11px] text-gray-400">
                      {user.role === "ADMIN"
                        ? "Administrator"
                        : "Account"}
                    </p>
                  </div>

                  <ChevronDown
                    size={15}
                    className="hidden text-gray-400 md:block"
                  />
                </button>

                {/* Dropdown */}
                <div className="invisible absolute right-0 top-full mt-2 w-56 translate-y-1 rounded-xl border border-gray-200 bg-white p-2 opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">

                  {/* Profile Info */}
                  <div className="border-b border-gray-100 px-3 py-2.5">
                    <div className="flex items-center gap-3">

                      {/* Dropdown Avatar */}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100">
                        {user.picture && !imageError ? (
                          <img
                            src={user.picture}
                            alt={user.name || "User"}
                            className="h-full w-full object-cover"
                            onError={() => setImageError(true)}
                          />
                        ) : (
                          <span className="text-xs font-bold text-primary-700">
                            {getInitials(user.name)}
                          </span>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {user.name || "User"}
                        </p>

                        <p className="truncate text-xs text-gray-500">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Home */}
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                  >
                    <HomeIcon size={17} />
                    Home
                  </button>

                  {/* Dashboard */}
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                  >
                    <LayoutDashboard size={17} />
                    Dashboard
                  </button>

                  {/* Admin */}
                  {user.role === "ADMIN" && (
                    <button
                      type="button"
                      onClick={() => navigate("/admin")}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                    >
                      <Shield size={17} />
                      Admin Panel
                    </button>
                  )}

                  {/* Logout */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut size={17} />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Login */
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-md active:translate-y-0"
            >
              <UserRound size={17} />
              Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;