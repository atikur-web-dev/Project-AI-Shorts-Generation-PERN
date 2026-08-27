// Frontend/src/hooks/useAdminDashboard.ts

import { useCallback, useEffect, useState } from "react";

import {
  adminApi,
  type DashboardStats,
  type DashboardSummary,
  type TimeSeriesData,
} from "../services/admin.api";

export const useAdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [summary, setSummary] =
    useState<DashboardSummary | null>(null);
  const [timeSeries, setTimeSeries] =
    useState<TimeSeriesData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(
    async (
      period: "daily" | "weekly" | "monthly" = "daily",
    ) => {
      try {
        setLoading(true);
        setError(null);

        const [
          statsResponse,
          summaryResponse,
          timeSeriesResponse,
        ] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getDashboardSummary(),
          adminApi.getTimeSeriesStats(period),
        ]);

        if (!statsResponse.success) {
          throw new Error(
            "Failed to fetch dashboard statistics",
          );
        }

        if (!summaryResponse.success) {
          throw new Error(
            "Failed to fetch dashboard summary",
          );
        }

        if (!timeSeriesResponse.success) {
          throw new Error(
            "Failed to fetch time series statistics",
          );
        }

        setStats(statsResponse.data);
        setSummary(summaryResponse.data);
        setTimeSeries(timeSeriesResponse.data);
      } catch (err) {
        console.error("Admin dashboard error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load admin dashboard",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  return {
    stats,
    summary,
    timeSeries,
    loading,
    error,
    refresh: fetchDashboard,
  };
};