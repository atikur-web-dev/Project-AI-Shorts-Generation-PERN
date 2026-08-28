
// Frontend/src/components/Navbar.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  ChevronDown,
  UserRound,
  Home,
  Info,
  Briefcase,
  Mail,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

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

  const isAdmin = user?.role === "ADMIN";

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Brand */}
          <button
            type="button"
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

          {!user ? (

  
            <div className="flex items-center gap-1 sm:gap-2">

              {/* Home */}
              <button
                type="button"
                onClick={() => navigate("/")}
                className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 sm:flex"
              >
                <Home size={17} />
                Home
              </button>

              {/* About */}
              <button
                type="button"
                onClick={() => navigate("/about")}
                className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 sm:flex"
              >
                <Info size={17} />
                About
              </button>

              {/* Services */}
              <button
                type="button"
                onClick={() => navigate("/services")}
                className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 sm:flex"
              >
                <Briefcase size={17} />
                Services
              </button>

              {/* Contact */}
              <button
                type="button"
                onClick={() => navigate("/contact")}
                className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 sm:flex"
              >
                <Mail size={17} />
                Contact
              </button>

              {/* Sign In */}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="ml-1 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-md active:translate-y-0"
              >
                <UserRound size={17} />
                Sign in
              </button>
            </div>

          ) : (

            /* =================================
               LOGGED-IN USER / ADMIN
            ================================== */
            <div className="flex items-center gap-2 sm:gap-3">

              {/* Home */}
              <button
                type="button"
                onClick={() => navigate("/")}
                className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 sm:flex"
              >
                <Home size={17} />
                Home
              </button>

              {/* Dashboard */}
              <button
                type="button"
                onClick={() =>
                  navigate(isAdmin ? "/admin" : "/dashboard")
                }
                className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 sm:flex"
              >
                <LayoutDashboard size={17} />
                Dashboard
              </button>

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
                      {isAdmin ? "Administrator" : "Account"}
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

                      {/* Avatar */}
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
                    <Home size={17} />
                    Home
                  </button>

                  {/* Dashboard */}
                  <button
                    type="button"
                    onClick={() =>
                      navigate(isAdmin ? "/admin" : "/dashboard")
                    }
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                  >
                    <LayoutDashboard size={17} />
                    Dashboard
                  </button>

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
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

