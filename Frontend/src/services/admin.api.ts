// Frontend/src/services/admin.api.ts
import api from "./api";

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalProjects: number;
  totalRevenue: number;
  completedOrders: number;
  pendingOrders: number;
  failedOrders: number;
  activeSubscriptions: number;
  recentOrders: Array<{
    id: string;
    amount: number;
    status: string;
    transaction_id: string | null;
    created_at: string;
    user_name: string;
    user_email: string;
    subscription_name: string;
  }>;
}

export interface DashboardSummary {
  stats: {
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
  };
  today: {
    new_users_today: number;
    projects_today: number;
    orders_today: number;
    revenue_today: number;
  };
  recentActivity: Array<{
    type: string;
    id: string;
    title: string;
    created_at: string;
  }>;
}

export interface TimeSeriesData {
  orders: Array<{
    date: string;
    order_count: number;
    total_amount: number;
  }>;
  users: Array<{
    date: string;
    new_users: number;
  }>;
  projects: Array<{
    date: string;
    new_projects: number;
  }>;
  period: string;
  days: number;
}

export const adminApi = {
  getDashboardStats: async () => {
    const response = await api.get<{
      success: boolean;
      data: DashboardStats;
      cached: boolean;
    }>("/admin/stats");

    return response.data;
  },

  getDashboardSummary: async () => {
    const response = await api.get<{
      success: boolean;
      data: DashboardSummary;
    }>("/admin/dashboard");

    return response.data;
  },

  getTimeSeriesStats: async (
    period: "daily" | "weekly" | "monthly" = "daily",
  ) => {
    const response = await api.get<{
      success: boolean;
      data: TimeSeriesData;
    }>("/admin/stats/timeseries", {
      params: {
        period,
      },
    });

    return response.data;
  },
};
