// Frontend/src/pages/LandingPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Sparkles,
  Image,
  Zap,
  Shield,
  CreditCard,
  ArrowRight,
} from "lucide-react";

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const handleSubscriptionPlans = () => {
    navigate("/subscriptions");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles size={16} />
            AI-Powered Product Photography
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Create Professional
            <span className="text-primary-600"> AI-Powered Images</span>
            <br />
            for Your Brand
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Upload your product and model images, and let AI create stunning,
            professional visuals for your brand, products, and marketing campaigns.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Free Trial */}
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg"
            >
              <Sparkles size={20} />
              Start Free Trial
            </button>

            {/* Subscription Plans */}
            <button
              onClick={handleSubscriptionPlans}
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 border-2 border-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              <CreditCard size={20} />
              View Subscription Plans
              <ArrowRight size={18} />
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Start with 30 free AI credits or choose a subscription plan.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">

          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="text-primary-600" size={24} />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              AI-Powered Generation
            </h3>

            <p className="text-gray-600 leading-relaxed">
              Combine your product and model images with AI to create
              professional-looking brand visuals without expensive photoshoots.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Image className="text-primary-600" size={24} />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Brand-Ready Visuals
            </h3>

            <p className="text-gray-600 leading-relaxed">
              Generate polished product images suitable for e-commerce,
              social media, advertisements, and digital marketing campaigns.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Zap className="text-primary-600" size={24} />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Fast & Simple
            </h3>

            <p className="text-gray-600 leading-relaxed">
              Upload your images, describe your vision, and let AI generate
              your professional visual in just a few moments.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-10">

            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Upload Your Images
              </h3>

              <p className="text-gray-600">
                Upload your product image and model image to get started.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Describe Your Vision
              </h3>

              <p className="text-gray-600">
                Tell the AI how you want your product to appear using a simple
                text prompt.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Get Your AI Image
              </h3>

              <p className="text-gray-600">
                Gemini AI generates a professional visual ready for your brand
                and marketing needs.
              </p>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
            Perfect for Modern Brands
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* E-Commerce */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center">
              <h3 className="font-semibold text-gray-900 mb-2">
                E-Commerce
              </h3>

              <p className="text-sm text-gray-600">
                Create professional product visuals for your online store.
              </p>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center">
              <h3 className="font-semibold text-gray-900 mb-2">
                Social Media
              </h3>

              <p className="text-sm text-gray-600">
                Generate engaging visuals for Instagram, Facebook and more.
              </p>
            </div>

            {/* Advertising */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center">
              <h3 className="font-semibold text-gray-900 mb-2">
                Advertising
              </h3>

              <p className="text-sm text-gray-600">
                Create campaign-ready images for your marketing efforts.
              </p>
            </div>

            {/* Brand Content */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center">
              <h3 className="font-semibold text-gray-900 mb-2">
                Brand Content
              </h3>

              <p className="text-sm text-gray-600">
                Produce consistent visual content for your brand.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary-600 rounded-2xl p-10 md:p-12 text-center">
          <div className="flex justify-center mb-4">
            <Shield className="text-white" size={32} />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Create Your Next Brand Visual?
          </h2>

          <p className="text-primary-100 mb-8 text-lg max-w-2xl mx-auto">
            Upload your product and model images and let AI transform them
            into professional marketing visuals.
          </p>

          <button
            onClick={handleGetStarted}
            className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            Start Creating Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
