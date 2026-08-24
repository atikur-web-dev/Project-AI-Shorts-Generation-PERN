// Frontend/src/pages/AdminOrders.tsx
import React, { useEffect, useState } from "react";
import { ArrowLeft, RefreshCw, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface Order {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
  subscription?: {
    name: string;
  };
}

const AdminOrders: React.FC = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/orders");

      setOrders(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (
    orderId: string,
    status: string,
  ) => {
    try {
      setUpdatingId(orderId);

      await api.patch(`/admin/orders/${orderId}/status`, {
        status,
      });

      await fetchOrders();
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";

      case "pending":
        return "bg-yellow-100 text-yellow-800";

      case "failed":
        return "bg-red-100 text-red-800";

      case "cancelled":
        return "bg-gray-100 text-gray-800";

      default:
        return "bg-blue-100 text-blue-800";
    }
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>

            <div className="flex items-center gap-3">
              <div className="bg-primary-100 p-3 rounded-lg">
                <ShoppingCart
                  size={26}
                  className="text-primary-600"
                />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Orders
                </h1>

                <p className="text-gray-600 mt-1">
                  Manage platform orders and payment status
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">
              Total Orders
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              {orders.length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">
              Completed Orders
            </p>

            <p className="text-3xl font-bold text-green-600 mt-2">
              {
                orders.filter(
                  (order) =>
                    order.status.toLowerCase() === "completed",
                ).length
              }
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">
              Total Revenue
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              $
              {orders
                .filter(
                  (order) =>
                    order.status.toLowerCase() === "completed",
                )
                .reduce(
                  (total, order) => total + Number(order.amount),
                  0,
                )
                .toFixed(2)}
            </p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              All Orders
            </h2>
          </div>

          {orders.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingCart
                size={42}
                className="mx-auto text-gray-300 mb-4"
              />

              <p className="text-gray-500">
                No orders found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">

                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Order ID
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Plan
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">

                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-gray-700">
                          {order.id.slice(0, 8)}...
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.user?.name || "Unknown"}
                          </p>

                          <p className="text-xs text-gray-500">
                            {order.user?.email || "N/A"}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {order.subscription?.name || "N/A"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          ${Number(order.amount).toFixed(2)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) =>
                            updateOrderStatus(
                              order.id,
                              e.target.value,
                            )
                          }
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border-0 focus:ring-2 focus:ring-primary-500 ${getStatusClass(
                            order.status,
                          )}`}
                        >
                          <option value="pending">
                            Pending
                          </option>

                          <option value="completed">
                            Completed
                          </option>

                          <option value="failed">
                            Failed
                          </option>

                          <option value="cancelled">
                            Cancelled
                          </option>
                        </select>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(
                          order.createdAt,
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;