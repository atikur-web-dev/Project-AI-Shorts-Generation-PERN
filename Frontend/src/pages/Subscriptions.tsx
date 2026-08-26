// Frontend/src/pages/Subscriptions.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Sparkles,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  subscriptionService,
  type Subscription,
} from "../services/subscriptionService";
import { orderService } from "../services/orderService";

const Subscriptions: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);
  const [buyingSubscriptionId, setBuyingSubscriptionId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      loadSubscriptions();
    }
  }, [user, loading, navigate]);

  const loadSubscriptions = async () => {
    try {
      setLoadingSubscriptions(true);

      const response = await subscriptionService.getSubscriptions();

      console.log("SUBSCRIPTION RESPONSE:", response);

      if (response.success && Array.isArray(response.data)) {
        setSubscriptions(response.data);
      } else {
        setSubscriptions([]);
      }
    } catch (error) {
      console.error("Failed to load subscriptions:", error);
      setSubscriptions([]);
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  const handleBuySubscription = async (subscription: Subscription) => {
    try {
      if (Number(subscription.price) === 0) {
        navigate("/dashboard");
        return;
      }

      setBuyingSubscriptionId(subscription.id);

      const response = await orderService.createOrder(subscription.id);

      console.log("CREATE ORDER RESPONSE:", response);

      if (!response.success || !response.data?.orderId) {
        throw new Error(response.message || "Failed to create order");
      }

      const orderId = response.data.orderId;

      const paymentURL = `${import.meta.env.VITE_API_URL}/ssl/${orderId}`;

      window.location.href = paymentURL;
    } catch (error) {
      console.error("Subscription purchase failed:", error);

      const message =
        error instanceof Error ? error.message : "Failed to start payment";

      alert(message);

      setBuyingSubscriptionId(null);
    }
  };

  if (loading || loadingSubscriptions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary-600" size={42} />

          <p className="text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors mb-10"
        >
          <ArrowLeft size={18} />
          Back to Home
        </button>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-5">
            <Sparkles size={16} />
            AI Credit Plans
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">
            Choose Your
            <span className="text-primary-600"> AI Plan</span>
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed">
            Get more AI credits and create professional product visuals for your
            brand, marketing campaigns, and social media.
          </p>
        </div>

        {/* Plans */}
        {subscriptions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-xl mx-auto">
            <CreditCard className="mx-auto text-gray-400 mb-5" size={48} />

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No subscription plans available
            </h2>

            <p className="text-gray-500 mb-6">
              There are currently no subscription plans available. Please check
              again later.
            </p>

            <button
              onClick={() => navigate("/")}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {subscriptions.map((subscription, index) => {
              const isBuying = buyingSubscriptionId === subscription.id;

              const isPopular =
                subscriptions.length > 1 &&
                index === Math.floor(subscriptions.length / 2);

              return (
                <div
                  key={subscription.id}
                  className={`relative bg-white rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    isPopular
                      ? "border-primary-500 shadow-lg"
                      : "border-gray-200 shadow-sm"
                  }`}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-primary-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-md">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Plan Icon */}
                  <div className="bg-primary-100 w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                    <Sparkles className="text-primary-600" size={24} />
                  </div>

                  {/* Plan Name */}
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {subscription.name}
                  </h2>

                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-primary-600">
                      ৳{subscription.price}
                    </span>
                  </div>

                  {/* Credits */}
                  <div className="bg-primary-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-100 p-2 rounded-lg">
                        <Sparkles className="text-primary-600" size={20} />
                      </div>

                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {subscription.credits}
                        </p>

                        <p className="text-sm text-gray-600">AI Credits</p>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="bg-green-100 rounded-full p-1">
                        <Check className="text-green-600" size={14} />
                      </div>

                      <span>{subscription.credits} AI image generations</span>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="bg-green-100 rounded-full p-1">
                        <Check className="text-green-600" size={14} />
                      </div>

                      <span>Professional AI visuals</span>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="bg-green-100 rounded-full p-1">
                        <Check className="text-green-600" size={14} />
                      </div>

                      <span>Instant credit activation</span>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="bg-green-100 rounded-full p-1">
                        <Check className="text-green-600" size={14} />
                      </div>

                      <span>Use credits anytime</span>
                    </div>
                  </div>

                  {/* Buy Button */}
                  <button
                    onClick={() => handleBuySubscription(subscription)}
                    disabled={isBuying}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                      isPopular
                        ? "bg-primary-600 text-white hover:bg-primary-700"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    {isBuying ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={20} />
                        <span>
                          {Number(subscription.price) === 0
                            ? "Start Free Trial"
                            : "Buy Now"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Security / Info */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-gray-500 mt-12">
          <ShieldCheck className="text-green-600" size={20} />

          <span>Secure payment powered by SSLCommerz</span>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10">
          <p className="text-gray-500 mb-3">Already have enough credits?</p>

          <button
            onClick={() => navigate("/dashboard")}
            className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
          >
            Go to Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
