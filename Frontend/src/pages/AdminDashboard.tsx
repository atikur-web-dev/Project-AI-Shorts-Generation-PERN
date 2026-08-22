// Frontend/src/pages/AdminDashboard.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Image,
  DollarSign,
  Activity,
  ArrowLeft,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalGeneratedImages: number;
  totalRevenue: number;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProjects: 0,
    totalGeneratedImages: 0,
    totalRevenue: 0,
  });

  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");

    if (!isAdmin) {
      navigate("/admin-login");
      return;
    }

    loadAdminData();
  }, [navigate]);

  const loadAdminData = () => {
    // Temporary mock data.
    // Later this will come from the Admin API.
    setTimeout(() => {
      setStats({
        totalUsers: 156,
        totalProjects: 423,
        totalGeneratedImages: 423,
        totalRevenue: 12450,
      });

      setRecentUsers([
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          role: "USER",
          createdAt: "2024-01-15",
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          role: "USER",
          createdAt: "2024-01-14",
        },
        {
          id: "3",
          name: "Bob Johnson",
          email: "bob@example.com",
          role: "USER",
          createdAt: "2024-01-13",
        },
        {
          id: "4",
          name: "Alice Brown",
          email: "alice@example.com",
          role: "USER",
          createdAt: "2024-01-12",
        },
        {
          id: "5",
          name: "Charlie Wilson",
          email: "charlie@example.com",
          role: "USER",
          createdAt: "2024-01-11",
        },
      ]);

      setLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminEmail");

    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
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

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">

          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">
                  Total Users
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalUsers}
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

          {/* Total Projects */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">
                  Total Projects
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalProjects}
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

          {/* Generated Images */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">
                  Images Generated
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalGeneratedImages}
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
                  ${stats.totalRevenue}
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

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Users
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined Date
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {recentUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Manage Users
            </h3>

            <p className="text-gray-600 text-sm">
              View and manage all registered users
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              View Projects
            </h3>

            <p className="text-gray-600 text-sm">
              Monitor all AI image generation projects
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Revenue Reports
            </h3>

            <p className="text-gray-600 text-sm">
              View platform revenue and payment reports
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;