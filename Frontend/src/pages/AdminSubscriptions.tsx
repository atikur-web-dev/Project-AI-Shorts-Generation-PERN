// Frontend/src/pages/AdminSubscriptions.tsx
import React, { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Users,
  ShoppingCart,
  Coins,
} from "lucide-react";
import api from "../services/api";

interface Subscription {
  id: string;
  name: string;
  price: number;
  credits: number;
  createdAt: string;
  updatedAt: string;
  subscriber_count: number;
  order_count: number;
}

interface SubscriptionForm {
  name: string;
  price: string;
  credits: string;
}

const AdminSubscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);

  const [form, setForm] = useState<SubscriptionForm>({
    name: "",
    price: "",
    credits: "",
  });

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/subscriptions");

      if (response.data.success) {
        setSubscriptions(response.data.data);
      } else {
        setError(
          response.data.message || "Failed to fetch subscriptions",
        );
      }
    } catch (err: any) {
      console.error("Fetch subscriptions error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to fetch subscriptions",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      credits: "",
    });

    setEditingSubscription(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
    setError("");
    setSuccess("");
  };

  const openEditModal = (subscription: Subscription) => {
    setEditingSubscription(subscription);

    setForm({
      name: subscription.name,
      price: String(subscription.price),
      credits: String(subscription.credits),
    });

    setShowModal(true);
    setError("");
    setSuccess("");
  };

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    resetForm();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const name = form.name.trim();
    const price = Number(form.price);
    const credits = Number(form.credits);

    if (!name) {
      setError("Subscription name is required.");
      return false;
    }

    if (!form.price || Number.isNaN(price) || price < 0) {
      setError("Please enter a valid price.");
      return false;
    }

    if (
      !form.credits ||
      Number.isNaN(credits) ||
      credits < 1 ||
      !Number.isInteger(credits)
    ) {
      setError("Credits must be a positive whole number.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        credits: Number(form.credits),
      };

      if (editingSubscription) {
        const response = await api.patch(
          `/admin/subscriptions/${editingSubscription.id}`,
          payload,
        );

        if (!response.data.success) {
          throw new Error(
            response.data.message ||
              "Failed to update subscription",
          );
        }

        setSuccess("Subscription updated successfully.");
      } else {
        const response = await api.post(
          "/admin/subscriptions",
          payload,
        );

        if (!response.data.success) {
          throw new Error(
            response.data.message ||
              "Failed to create subscription",
          );
        }

        setSuccess("Subscription created successfully.");
      }

      setShowModal(false);
      resetForm();

      await fetchSubscriptions();
    } catch (err: any) {
      console.error("Save subscription error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save subscription",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (subscription: Subscription) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${subscription.name}"?`,
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await api.delete(
        `/admin/subscriptions/${subscription.id}`,
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            "Failed to delete subscription",
        );
      }

      setSuccess("Subscription deleted successfully.");

      await fetchSubscriptions();
    } catch (err: any) {
      console.error("Delete subscription error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete subscription",
      );
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return `$${Number(price).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
          <p className="text-sm text-gray-600">
            Loading subscriptions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Subscriptions
              </h1>

              <p className="mt-1 text-gray-600">
                Manage subscription plans, pricing, and credits.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchSubscriptions}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw size={17} />
                Refresh
              </button>

              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                <Plus size={18} />
                Add Subscription
              </button>
            </div>
          </div>

          {error && !showModal && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && !showModal && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="border-b border-gray-100 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {subscription.name}
                      </h2>

                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        {formatPrice(subscription.price)}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-100 p-3">
                      <Coins
                        size={22}
                        className="text-gray-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Coins size={17} />
                      Credits
                    </div>

                    <span className="font-semibold text-gray-900">
                      {subscription.credits}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users size={17} />
                      Subscribers
                    </div>

                    <span className="font-semibold text-gray-900">
                      {subscription.subscriber_count}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ShoppingCart size={17} />
                      Orders
                    </div>

                    <span className="font-semibold text-gray-900">
                      {subscription.order_count}
                    </span>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs text-gray-500">
                      Created {formatDate(subscription.createdAt)}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Updated {formatDate(subscription.updatedAt)}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        openEditModal(subscription)
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(subscription)
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {subscriptions.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                No subscriptions found
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Create your first subscription plan to get started.
              </p>

              <button
                type="button"
                onClick={openCreateModal}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                <Plus size={18} />
                Add Subscription
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingSubscription
                    ? "Edit Subscription"
                    : "Create Subscription"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingSubscription
                    ? "Update the subscription details."
                    : "Add a new subscription plan."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Subscription Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Premium"
                  disabled={submitting}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Price
                </label>

                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleInputChange}
                  placeholder="299"
                  disabled={submitting}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="credits"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Credits
                </label>

                <input
                  id="credits"
                  name="credits"
                  type="number"
                  min="1"
                  step="1"
                  value={form.credits}
                  onChange={handleInputChange}
                  placeholder="75"
                  disabled={submitting}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
                />
              </div>

              <div className="flex gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : editingSubscription
                      ? "Update Subscription"
                      : "Create Subscription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;
