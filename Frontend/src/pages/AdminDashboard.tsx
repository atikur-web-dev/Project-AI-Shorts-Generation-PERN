// Frontend/src/pages/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import api from "../services/api";

interface DashboardStats {
  total_users: number;
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
  failed_orders: number;
  total_revenue: number;
  total_projects: number;
  generated_images: number;
  generated_videos: number;
  active_subscriptions: number;
}

interface TodayStats {
  new_users_today: number;
  projects_today: number;
  orders_today: number;
  revenue_today: number;
}

interface RecentActivity {
  type: "user" | "project" | "order";
  id: string;
  title: string;
  created_at: string;
}

interface DashboardResponse {
  success: boolean;
  data: {
    stats: DashboardStats;
    today: TodayStats;
    recentActivity: RecentActivity[];
  };
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [dashboard, setDashboard] =
    useState<DashboardResponse["data"] | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<DashboardResponse>(
        "/admin/dashboard",
      );

      if (!response.data.success) {
        throw new Error("Failed to load dashboard");
      }

      setDashboard(response.data.data);
    } catch (error: any) {
      console.error("Dashboard API error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load dashboard data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");

    if (!isAdmin) {
      navigate("/admin-login");
      return;
    }

    loadDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("accessToken");

    navigate("/");
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return `৳${Number(amount || 0).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <AlertCircle
            className="mx-auto text-red-500"
            size={48}
          />

          <h2 className="text-xl font-semibold text-gray-900 mt-4">
            Failed to Load Dashboard
          </h2>

          <p className="text-gray-600 mt-2">
            {error || "Something went wrong."}
          </p>

          <button
            onClick={loadDashboard}
            className="mt-6 inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { stats, today, recentActivity } = dashboard;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </button>

            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>

            <p className="text-gray-600 mt-1">
              Monitor and manage your AI image generation platform
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboard}
              className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={18} />
              Refresh
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {/* Users */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">
                  Total Users
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.total_users}
                </p>
              </div>

              <div className="bg-primary-100 p-3 rounded-lg">
                <Users
                  className="text-primary-600"
                  size={24}
                />
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">
                  Total Projects
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.total_projects}
                </p>
              </div>

              <div className="bg-blue-100 p-3 rounded-lg">
                <Image
                  className="text-blue-600"
                  size={24}
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">
                  Images Generated
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.generated_images}
                </p>
              </div>

              <div className="bg-green-100 p-3 rounded-lg">
                <Activity
                  className="text-green-600"
                  size={24}
                />
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">
                  Total Revenue
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats.total_revenue)}
                </p>
              </div>

              <div className="bg-yellow-100 p-3 rounded-lg">
                <DollarSign
                  className="text-yellow-600"
                  size={24}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center gap-3">
              <ShoppingCart
                className="text-purple-600"
                size={22}
              />

              <div>
                <p className="text-sm text-gray-500">
                  Total Orders
                </p>

                <p className="text-xl font-bold text-gray-900">
                  {stats.total_orders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center gap-3">
              <Video
                className="text-indigo-600"
                size={22}
              />

              <div>
                <p className="text-sm text-gray-500">
                  Videos Generated
                </p>

                <p className="text-xl font-bold text-gray-900">
                  {stats.generated_videos}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center gap-3">
              <CreditCard
                className="text-orange-600"
                size={22}
              />

              <div>
                <p className="text-sm text-gray-500">
                  Active Subscriptions
                </p>

                <p className="text-xl font-bold text-gray-900">
                  {stats.active_subscriptions}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div>
              <p className="text-sm text-gray-500">
                Pending Orders
              </p>

              <p className="text-xl font-bold text-yellow-600">
                {stats.pending_orders}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Completed: {stats.completed_orders}
              </p>
            </div>
          </div>
        </div>

        {/* Today */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              Today's Overview
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 border-b sm:border-b-0 sm:border-r border-gray-100">
              <p className="text-sm text-gray-500">
                New Users
              </p>

              <p className="text-2xl font-bold text-gray-900 mt-1">
                {today.new_users_today}
              </p>
            </div>

            <div className="p-6 border-b sm:border-b-0 lg:border-r border-gray-100">
              <p className="text-sm text-gray-500">
                Projects Created
              </p>

              <p className="text-2xl font-bold text-gray-900 mt-1">
                {today.projects_today}
              </p>
            </div>

            <div className="p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
              <p className="text-sm text-gray-500">
                Orders
              </p>

              <p className="text-2xl font-bold text-gray-900 mt-1">
                {today.orders_today}
              </p>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-500">
                Revenue
              </p>

              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(today.revenue_today)}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Activity
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Latest activity across the platform
              </p>
            </div>
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
                  className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 rounded-lg p-3">
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

                      <p className="text-xs text-gray-500 capitalize">
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
        <div className="mt-8 grid md:grid-cols-3 gap-6">

          <button
            onClick={() => navigate("/admin/users")}
            className="text-left bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Manage Users
            </h3>

            <p className="text-gray-600 text-sm">
              View and manage all registered users
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/projects")}
            className="text-left bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              View Projects
            </h3>

            <p className="text-gray-600 text-sm">
              Monitor all AI image generation projects
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/reports/revenue")}
            className="text-left bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Revenue Reports
            </h3>

            <p className="text-gray-600 text-sm">
              View platform revenue and payment reports
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
