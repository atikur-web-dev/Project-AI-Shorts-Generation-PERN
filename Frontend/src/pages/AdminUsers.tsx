// Frontend/src/pages/AdminUsers.tsx
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  RefreshCw,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  SlidersHorizontal,
} from "lucide-react";
import api from "../services/api";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  loginType: string;
  picture?: string | null;
  createdAt: string;
  project_count: number;
  order_count: number;
  total_spent: number;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UsersResponse {
  success: boolean;
  data: User[];
  meta: PaginationMeta;
}

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loginType, setLoginType] = useState("");

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [page, setPage] = useState(1);
  const limit = 10;

  const [showFilters, setShowFilters] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params: Record<string, string | number> = {
        page,
        limit,
        sortBy,
        sortOrder,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (role) {
        params["filter.role"] = role;
      }

      if (loginType) {
        params["filter.loginType"] = loginType;
      }

      const response = await api.get<UsersResponse>(
        "/admin/users/search",
        {
          params,
        },
      );

      if (!response.data.success) {
        throw new Error("Failed to fetch users");
      }

      setUsers(response.data.data);
      setMeta(response.data.meta);
    } catch (error: any) {
      console.error("Load users error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load users",
      );
    } finally {
      setLoading(false);
    }
  }, [
    page,
    search,
    role,
    loginType,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");

    if (!isAdmin) {
      navigate("/admin-login");
      return;
    }

    loadUsers();
  }, [navigate, loadUsers]);

  const handleSearch = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleRoleChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setRole(event.target.value);
    setPage(1);
  };

  const handleLoginTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setLoginType(event.target.value);
    setPage(1);
  };

  const handleSortChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSortBy(event.target.value);
    setPage(1);
  };

  const handleSortOrderChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSortOrder(event.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setRole("");
    setLoginType("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return `৳${Number(amount || 0).toLocaleString()}`;
  };

  const getRoleStyle = (userRole: string) => {
    if (userRole === "ADMIN") {
      return "bg-purple-100 text-purple-800";
    }

    return "bg-blue-100 text-blue-800";
  };

  const getLoginTypeStyle = (type: string) => {
    if (type.toLowerCase() === "google") {
      return "bg-red-100 text-red-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="bg-primary-100 p-3 rounded-lg">
                <Users
                  className="text-primary-600"
                  size={28}
                />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Manage Users
                </h1>

                <p className="text-gray-600 mt-1">
                  View and manage all registered users
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={loadUsers}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">

          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Search
            </button>

            <button
              type="button"
              onClick={() =>
                setShowFilters((previous) => !previous)
              }
              className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal size={18} />
              Filters
            </button>
          </form>

          {showFilters && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>

                <select
                  value={role}
                  onChange={handleRoleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Roles</option>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              {/* Login Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Login Type
                </label>

                <select
                  value={loginType}
                  onChange={handleLoginTypeChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Login Types</option>
                  <option value="GOOGLE">Google</option>
                  <option value="EMAIL">Email</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>

                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="createdAt">
                    Created Date
                  </option>
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="role">Role</option>
                  <option value="loginType">
                    Login Type
                  </option>
                  <option value="project_count">
                    Projects
                  </option>
                  <option value="order_count">
                    Orders
                  </option>
                  <option value="total_spent">
                    Total Spent
                  </option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>

                <select
                  value={sortOrder}
                  onChange={handleSortOrderChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="desc">
                    Descending
                  </option>
                  <option value="asc">
                    Ascending
                  </option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-4">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle
              className="text-red-500 flex-shrink-0"
              size={22}
            />

            <p className="text-red-700 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

          <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Users
              </h2>

              {meta && (
                <p className="text-sm text-gray-500 mt-1">
                  Showing{" "}
                  {users.length > 0
                    ? (meta.page - 1) * meta.limit + 1
                    : 0}{" "}
                  -{" "}
                  {Math.min(
                    meta.page * meta.limit,
                    meta.total,
                  )}{" "}
                  of {meta.total} users
                </p>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto" />
                <p className="text-gray-500 mt-3">
                  Loading users...
                </p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <Users
                size={48}
                className="mx-auto text-gray-300"
              />

              <h3 className="text-lg font-medium text-gray-900 mt-4">
                No users found
              </h3>

              <p className="text-gray-500 mt-1">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Login
                    </th>

                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Projects
                    </th>

                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Spent
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* User */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {user.picture ? (
                            <img
                              src={user.picture}
                              alt={user.name || "User"}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <Users
                                size={18}
                                className="text-gray-500"
                              />
                            </div>
                          )}

                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.name || "Unnamed User"}
                            </p>

                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${getRoleStyle(
                            user.role,
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* Login Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${getLoginTypeStyle(
                            user.loginType,
                          )}`}
                        >
                          {user.loginType}
                        </span>
                      </td>

                      {/* Projects */}
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                        {user.project_count}
                      </td>

                      {/* Orders */}
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                        {user.order_count}
                      </td>

                      {/* Spent */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {formatCurrency(user.total_spent)}
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">

              <p className="text-sm text-gray-500">
                Page {meta.page} of {meta.totalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={!meta.hasPreviousPage || loading}
                  onClick={() =>
                    setPage((previous) =>
                      Math.max(previous - 1, 1),
                    )
                  }
                  className="inline-flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>

                <button
                  disabled={!meta.hasNextPage || loading}
                  onClick={() =>
                    setPage((previous) => previous + 1)
                  }
                  className="inline-flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
