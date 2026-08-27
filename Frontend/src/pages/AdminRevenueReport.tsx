// Frontend/src/pages/AdminRevenueReport.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle,
  Clock,
  DollarSign,
  RefreshCw,
  ShoppingCart,
  XCircle,
} from "lucide-react";

import { adminApi, type DashboardStats, type TimeSeriesData } from "../services/admin.api";

const AdminRevenueReport: React.FC = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData | null>(null);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">(
    "daily",
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenueData = async () => {
    try {
      setError(null);

      const [statsResponse, timeSeriesResponse] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getTimeSeriesStats(period),
      ]);

      if (!statsResponse.success) {
        throw new Error("Failed to fetch dashboard statistics");
      }

      if (!timeSeriesResponse.success) {
        throw new Error("Failed to fetch revenue data");
      }

      setStats(statsResponse.data);
      setTimeSeries(timeSeriesResponse.data);
    } catch (err) {
      console.error("Revenue report error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load revenue report",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchRevenueData();
  }, [period]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRevenueData();
  };

  const formatCurrency = (amount: number) => {
    return `৳${Number(amount || 0).toLocaleString()}`;
  };

  const revenueData = timeSeries?.orders ?? [];

  const periodRevenue = useMemo(() => {
    return revenueData.reduce(
      (total, item) => total + Number(item.total_amount || 0),
      0,
    );
  }, [revenueData]);

  const periodOrders = useMemo(() => {
    return revenueData.reduce(
      (total, item) => total + Number(item.order_count || 0),
      0,
    );
  }, [revenueData]);

  const averageOrderValue =
    periodOrders > 0 ? periodRevenue / periodOrders : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
          <p className="mt-4 text-gray-600">
            Loading revenue report...
          </p>
        </div>
      </div>
    );
  }

  if (error || !stats || !timeSeries) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <XCircle
            size={48}
            className="mx-auto text-red-500"
          />

          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Failed to Load Revenue Report
          </h2>

          <p className="mt-2 text-gray-600">
            {error || "Something went wrong."}
          </p>

          <button
            onClick={handleRefresh}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 font-medium text-white hover:bg-primary-700"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => navigate("/admin")}
              className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              Back to Admin Dashboard
            </button>

            <h1 className="text-3xl font-bold text-gray-900">
              Revenue Reports
            </h1>

            <p className="mt-1 text-gray-600">
              Analyze platform revenue and order performance
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw
              size={18}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Period Selector */}
        <div className="mb-8 flex flex-wrap gap-3">
          {(["daily", "weekly", "monthly"] as const).map(
            (item) => (
              <button
                key={item}
                onClick={() => setPeriod(item)}
                className={`rounded-lg px-5 py-2.5 font-medium capitalize transition-colors ${
                  period === item
                    ? "bg-primary-600 text-white"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {item}
              </button>
            ),
          )}
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Revenue
                </p>

                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>

              <div className="rounded-lg bg-green-100 p-3">
                <DollarSign
                  size={24}
                  className="text-green-600"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Period Revenue
                </p>

                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {formatCurrency(periodRevenue)}
                </p>
              </div>

              <div className="rounded-lg bg-blue-100 p-3">
                <BarChart3
                  size={24}
                  className="text-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Period Orders
                </p>

                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {periodOrders}
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

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Average Order Value
                </p>

                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {formatCurrency(averageOrderValue)}
                </p>
              </div>

              <div className="rounded-lg bg-yellow-100 p-3">
                <CreditCardIcon />
              </div>
            </div>
          </div>
        </div>

        {/* Order Status */}
        <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-gray-900">
            Order Performance
          </h2>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-100 p-3">
                <CheckCircle
                  size={24}
                  className="text-green-600"
                />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Completed
                </p>

                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedOrders}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-yellow-100 p-3">
                <Clock
                  size={24}
                  className="text-yellow-600"
                />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Pending
                </p>

                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingOrders}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-red-100 p-3">
                <XCircle
                  size={24}
                  className="text-red-600"
                />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Failed
                </p>

                <p className="text-2xl font-bold text-gray-900">
                  {stats.failedOrders}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Table */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Revenue Breakdown
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Revenue from completed orders by day
            </p>
          </div>

          {revenueData.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No revenue data available for this period.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      Orders
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      Revenue
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {revenueData.map((item) => (
                    <tr
                      key={item.date}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(
                          item.date,
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        {item.order_count}
                      </td>

                      <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(item.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot className="border-t border-gray-200 bg-gray-50">
                  <tr>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      Total
                    </td>

                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      {periodOrders}
                    </td>

                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      {formatCurrency(periodRevenue)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CreditCardIcon = () => {
  return (
    <div className="text-yellow-600">
      <DollarSign size={24} />
    </div>
  );
};

export default AdminRevenueReport;