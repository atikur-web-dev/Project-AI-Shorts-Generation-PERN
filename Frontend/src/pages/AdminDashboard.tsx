// Frontend/src/pages/AdminDashboard.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Image,
  DollarSign,
  Activity,
  ShoppingCart,
  Video,
  CreditCard,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAdminDashboard } from "../hooks/useAdminDashboard";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const {
    stats,
    summary,
    loading,
    error,
    refresh,
  } = useAdminDashboard();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  const formatCurrency = (amount: number) => {
    return `৳${Number(amount || 0).toLocaleString()}`;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
          <p className="mt-4 text-gray-600">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error || !stats || !summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <AlertCircle
            size={48}
            className="mx-auto text-red-500"
          />

          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Failed to Load Dashboard
          </h2>

          <p className="mt-2 text-gray-600">
            {error || "Something went wrong."}
          </p>

          <button
            onClick={handleRefresh}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-700"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { today, recentActivity } = summary;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <button
              onClick={() => navigate("/")}
              className="mb-4 flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </button>

            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>

            <p className="mt-1 text-gray-600">
              Monitor and manage your AI Shorts platform
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {/* Users */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Total Users
                </p>
                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {stats.totalUsers}
                </p>
              </div>

              <div className="rounded-lg bg-primary-100 p-3">
                <Users
                  size={24}
                  className="text-primary-600"
                />
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Total Projects
                </p>
                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {stats.totalProjects}
                </p>
              </div>

              <div className="rounded-lg bg-blue-100 p-3">
                <Image
                  size={24}
                  className="text-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Total Revenue
                </p>
                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>

              <div className="rounded-lg bg-yellow-100 p-3">
                <DollarSign
                  size={24}
                  className="text-yellow-600"
                />
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Total Orders
                </p>
                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {stats.totalOrders}
                </p>
              </div>

              <div className="rounded-lg bg-purple-100 p-3">
                <ShoppingCart
                  size={24}
                  className="text-purple-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Activity
                size={22}
                className="text-green-600"
              />

              <div>
                <p className="text-sm text-gray-500">
                  Images Generated
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {summary.stats.generated_images}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Video
                size={22}
                className="text-indigo-600"
              />

              <div>
                <p className="text-sm text-gray-500">
                  Videos Generated
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {summary.stats.generated_videos}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <CreditCard
                size={22}
                className="text-orange-600"
              />

              <div>
                <p className="text-sm text-gray-500">
                  Active Subscriptions
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {stats.activeSubscriptions}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Order Status
            </p>

            <div className="mt-2 flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle size={15} />
                {stats.completedOrders}
              </span>

              <span className="text-yellow-600">
                Pending: {stats.pendingOrders}
              </span>

              <span className="flex items-center gap-1 text-red-600">
                <XCircle size={15} />
                {stats.failedOrders}
              </span>
            </div>
          </div>
        </div>

        {/* Today's Overview */}
        <div className="mb-8 rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Today's Overview
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-b border-gray-100 p-6 sm:border-r">
              <p className="text-sm text-gray-500">
                New Users
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {today.new_users_today}
              </p>
            </div>

            <div className="border-b border-gray-100 p-6 lg:border-r">
              <p className="text-sm text-gray-500">
                Projects Created
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {today.projects_today}
              </p>
            </div>

            <div className="border-b border-gray-100 p-6 lg:border-r lg:border-b-0">
              <p className="text-sm text-gray-500">
                Orders
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {today.orders_today}
              </p>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-500">
                Revenue
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatCurrency(today.revenue_today)}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Activity
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Latest activity across the platform
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {recentActivity.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No recent activity found.
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={`${activity.type}-${activity.id}`}
                  className="flex items-center justify-between p-5 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-gray-100 p-3">
                      {activity.type === "user" ? (
                        <Users
                          size={20}
                          className="text-gray-600"
                        />
                      ) : activity.type === "project" ? (
                        <Image
                          size={20}
                          className="text-blue-600"
                        />
                      ) : (
                        <ShoppingCart
                          size={20}
                          className="text-purple-600"
                        />
                      )}
                    </div>

                    <div>
                      <p className="font-medium text-gray-900">
                        {activity.title}
                      </p>

                      <p className="text-xs capitalize text-gray-500">
                        {activity.type}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500">
                    {formatDate(activity.created_at)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <button
            onClick={() => navigate("/admin/users")}
            className="rounded-xl border border-gray-100 bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-md"
          >
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Manage Users
            </h3>

            <p className="text-sm text-gray-600">
              View and manage all registered users.
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/projects")}
            className="rounded-xl border border-gray-100 bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-md"
          >
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              View Projects
            </h3>

            <p className="text-sm text-gray-600">
              Monitor all AI generation projects.
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/reports/revenue")}
            className="rounded-xl border border-gray-100 bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-md"
          >
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Revenue Reports
            </h3>

            <p className="text-sm text-gray-600">
              View platform revenue and payment reports.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;