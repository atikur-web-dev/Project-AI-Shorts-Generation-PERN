// Frontend/src/pages/Dashboard.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { projectService } from "../services/projectService";
import { orderService } from "../services/orderService";
import type { Project } from "../types";
import { Plus, Image, CheckCircle, Sparkles, CreditCard } from "lucide-react";
import {
  subscriptionService,
  type Subscription,
} from "../services/subscriptionService";

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

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
      loadProjects();
      loadSubscriptions();
    }
  }, [user, loading, navigate]);

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);

      const response = await projectService.getProjects();

      console.log("GET PROJECTS RESPONSE:", response);
      console.log("PROJECT DATA:", response.data);

      if (response.success && Array.isArray(response.data)) {
        setProjects(response.data);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadSubscriptions = async () => {
    try {
      setLoadingSubscriptions(true);

      const response = await subscriptionService.getSubscriptions();

      console.log("GET SUBSCRIPTIONS RESPONSE:", response);

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

  const handleBuySubscription = async (subscriptionId: string) => {
    try {
      setBuyingSubscriptionId(subscriptionId);

      const response = await orderService.createOrder(subscriptionId);

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
    } finally {
      setBuyingSubscriptionId(null);
    }
  };

  if (loading || loadingProjects) {
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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

            <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
          </div>

          <button
            onClick={() => navigate("/create-project")}
            className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <Plus size={20} />
            <span>New Image</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Total Projects */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Projects</p>

                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {projects.length}
                </p>
              </div>

              <div className="bg-primary-100 p-3 rounded-lg">
                <Image className="text-primary-600" size={24} />
              </div>
            </div>
          </div>

          {/* Images Generated */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Images Generated</p>

                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {projects.filter((project) => project.generatedImage).length}
                </p>
              </div>

              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          {/* Credits */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">AI Credits</p>

                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {user?.userSubscription?.credits ?? 0}
                </p>

                <p className="text-xs text-gray-500 mt-1">Available credits</p>
              </div>

              <div className="bg-yellow-100 p-3 rounded-lg">
                <Sparkles className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-primary-100 p-3 rounded-lg">
                <CreditCard className="text-primary-600" size={24} />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Buy AI Credits
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Choose a subscription plan and start creating AI-powered
                  visuals.
                </p>
              </div>
            </div>
          </div>

          {loadingSubscriptions ? (
            <div className="p-10 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="p-10 text-center">
              <CreditCard className="mx-auto text-gray-400 mb-4" size={42} />

              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No subscription plans available
              </h3>

              <p className="text-gray-500">Please check again later.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {subscriptions.map((subscription) => {
                const isBuying = buyingSubscriptionId === subscription.id;

                return (
                  <div
                    key={subscription.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="mb-5">
                      <h3 className="text-xl font-bold text-gray-900">
                        {subscription.name}
                      </h3>

                      <div className="mt-3">
                        <span className="text-3xl font-bold text-primary-600">
                          ৳{subscription.price}
                        </span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Sparkles size={18} className="text-yellow-500" />

                        <span>
                          <strong>{subscription.credits}</strong> AI Credits
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuySubscription(subscription.id)}
                      disabled={isBuying}
                      className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isBuying ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard size={18} />
                          <span>Buy Now</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Your Projects
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Your AI-generated image projects
              </p>
            </div>

            <button
              onClick={() => navigate("/create-project")}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Create New
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="p-12 text-center">
              <Image className="mx-auto text-gray-400 mb-4" size={48} />

              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No projects yet
              </h3>

              <p className="text-gray-600 mb-4">
                Create your first AI-generated image project to get started.
              </p>

              <button
                onClick={() => navigate("/create-project")}
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus size={18} />
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    {project.generatedImage ? (
                      <img
                        src={project.generatedImage}
                        alt={project.projectName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Image size={40} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">
                      {project.projectName}
                    </h3>

                    <p className="text-sm text-gray-600 mb-3 truncate">
                      {project.productName}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                        <CheckCircle size={12} />
                        Image Generated
                      </span>

                      {project.generatedImage && (
                        <button
                          onClick={() =>
                            window.open(project.generatedImage, "_blank")
                          }
                          className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded hover:bg-primary-700 transition-colors"
                        >
                          View Image
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
