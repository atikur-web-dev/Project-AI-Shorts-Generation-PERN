import React, { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  CreditCard,
  User,
  Calendar,
  Hash,
  Filter,
  AlertCircle,
} from "lucide-react";
import api from "../services/api";

interface Order {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number | string;
  status: string;
  transactionId: string | null;
  createdAt: string;
  updatedAt: string;
  user_name: string;
  user_email: string;
  user_picture: string | null;
  subscription_name: string;
  subscription_price: number | string;
  subscription_credits: number;
}

interface OrdersMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const ORDER_STATUSES = [
  "pending",
  "completed",
  "failed",
] as const;

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<OrdersMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState("");

  const fetchOrders = useCallback(
    async (page = currentPage) => {
      try {
        setError("");

        if (orders.length === 0) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        const response = await api.get("/admin/orders", {
          params: {
            page,
            limit: meta.limit,
            ...(search.trim() ? { search: search.trim() } : {}),
            ...(status ? { status } : {}),
          },
        });

        if (!response.data?.success) {
          throw new Error(
            response.data?.message || "Failed to fetch orders",
          );
        }

        setOrders(response.data.data || []);
        setMeta(response.data.meta);
      } catch (err: any) {
        console.error("Fetch orders error:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch orders",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentPage, meta.limit, orders.length, search, status],
  );

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, status, fetchOrders]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();

    if (currentPage !== 1) {
      setCurrentPage(1);
      return;
    }

    fetchOrders(1);
  };

  const handleStatusFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setStatus(event.target.value);
    setCurrentPage(1);
  };

  const handleOrderStatusUpdate = async (
    orderId: string,
    newStatus: string,
  ) => {
    const currentOrder = orders.find(
      (order) => order.id === orderId,
    );

    if (!currentOrder) {
      return;
    }

    if (currentOrder.status === newStatus) {
      return;
    }

    try {
      setError("");
      setUpdatingOrderId(orderId);

      const response = await api.patch(
        `/admin/orders/${orderId}/status`,
        {
          status: newStatus,
        },
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to update order status",
        );
      }

      const updatedOrder = response.data.data;

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: updatedOrder?.status ?? newStatus,
                updatedAt:
                  updatedOrder?.updatedAt ?? order.updatedAt,
              }
            : order,
        ),
      );
    } catch (err: any) {
      console.error("Update order status error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update order status",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleRefresh = () => {
    fetchOrders(currentPage);
  };

  const handlePreviousPage = () => {
    if (meta.hasPrev) {
      setCurrentPage((previous) => previous - 1);
    }
  };

  const handleNextPage = () => {
    if (meta.hasNext) {
      setCurrentPage((previous) => previous + 1);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number | string) => {
    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
      return "$0.00";
    }

    return `$${numericAmount.toFixed(2)}`;
  };

  const getStatusClasses = (orderStatus: string) => {
    switch (orderStatus.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";

      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";

      case "failed":
        return "bg-red-100 text-red-700 border-red-200";

      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (orderStatus: string) => {
    return (
      orderStatus.charAt(0).toUpperCase() +
      orderStatus.slice(1)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
          <p className="mt-4 text-sm text-gray-500">
            Loading orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-primary-100 p-3 rounded-lg">
                <ShoppingCart
                  size={24}
                  className="text-primary-600"
                />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Orders
                </h1>

                <p className="text-gray-600 mt-1">
                  View and manage platform orders
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing || updatingOrderId !== null}
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw
              size={18}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className="text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-900">
              Search & Filters
            </h2>
          </div>

          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 lg:grid-cols-4 gap-4"
          >
            <div className="lg:col-span-3">
              <label
                htmlFor="order-search"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Search Orders
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="order-search"
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search by user, email, order ID or transaction ID"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="order-status"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Status
              </label>

              <select
                id="order-status"
                value={status}
                onChange={handleStatusFilterChange}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
              >
                <option value="">All statuses</option>

                {ORDER_STATUSES.map((orderStatus) => (
                  <option
                    key={orderStatus}
                    value={orderStatus}
                  >
                    {getStatusLabel(orderStatus)}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-4 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                <Search size={18} />
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle
              size={20}
              className="text-red-600 mt-0.5 shrink-0"
            />

            <div>
              <p className="font-medium text-red-800">
                Order operation failed
              </p>

              <p className="text-sm text-red-700 mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Orders
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {meta.total}
                </p>
              </div>

              <div className="bg-primary-100 p-3 rounded-lg">
                <ShoppingCart
                  size={22}
                  className="text-primary-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Current Page
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {meta.page}
                  <span className="text-base font-normal text-gray-400">
                    {" "}
                    / {meta.totalPages || 1}
                  </span>
                </p>
              </div>

              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar
                  size={22}
                  className="text-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Showing
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {orders.length}
                  <span className="text-base font-normal text-gray-400">
                    {" "}
                    orders
                  </span>
                </p>
              </div>

              <div className="bg-green-100 p-3 rounded-lg">
                <CreditCard
                  size={22}
                  className="text-green-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              Order List
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Review customer orders and subscription details
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <div className="mx-auto w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingCart
                  size={26}
                  className="text-gray-400"
                />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No orders found
              </h3>

              <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
                {search || status
                  ? "No orders match your current search or filter."
                  : "There are currently no orders in the system."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscription
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Hash
                            size={15}
                            className="text-gray-400"
                          />

                          <span
                            className="text-sm font-medium text-gray-900 max-w-[150px] truncate"
                            title={order.id}
                          >
                            {order.id}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {order.user_picture ? (
                            <img
                              src={order.user_picture}
                              alt={order.user_name}
                              className="w-9 h-9 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                              <User
                                size={17}
                                className="text-gray-500"
                              />
                            </div>
                          )}

                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {order.user_name}
                            </p>

                            <p className="text-xs text-gray-500 mt-0.5">
                              {order.user_email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.subscription_name}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {order.subscription_credits} credits
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatAmount(order.amount)}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          disabled={
                            updatingOrderId === order.id
                          }
                          onChange={(event) =>
                            handleOrderStatusUpdate(
                              order.id,
                              event.target.value,
                            )
                          }
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${getStatusClasses(
                            order.status,
                          )}`}
                          aria-label={`Update status for order ${order.id}`}
                        >
                          {ORDER_STATUSES.map(
                            (orderStatus) => (
                              <option
                                key={orderStatus}
                                value={orderStatus}
                              >
                                {getStatusLabel(orderStatus)}
                              </option>
                            ),
                          )}
                        </select>

                        {updatingOrderId === order.id && (
                          <span className="ml-2 inline-flex items-center align-middle">
                            <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-primary-600" />
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.transactionId ? (
                          <span
                            className="text-sm text-gray-600 max-w-[180px] truncate block"
                            title={order.transactionId}
                          >
                            {order.transactionId}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">
                            —
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar
                            size={15}
                            className="text-gray-400"
                          />

                          <span className="text-sm text-gray-600">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {orders.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                Page{" "}
                <span className="font-medium text-gray-700">
                  {meta.page}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-700">
                  {meta.totalPages}
                </span>{" "}
                · {meta.total} total orders
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={!meta.hasPrev}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={17} />
                  Previous
                </button>

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={!meta.hasNext}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;