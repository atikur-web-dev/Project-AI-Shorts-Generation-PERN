import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Video, Zap, Shield } from 'lucide-react';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Create Stunning AI-Powered
            <span className="text-primary-600"> Short Videos</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your product images into engaging short videos using cutting-edge AI technology.
            Simple, fast, and professional.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg"
          >
            Get Started Free
          </button>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="text-primary-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Generation</h3>
            <p className="text-gray-600">
              Our advanced AI creates professional-quality videos from your product images in minutes.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Video className="text-primary-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Multiple Formats</h3>
            <p className="text-gray-600">
              Export in various aspect ratios including 9:16 for TikTok, Reels, and Shorts.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Zap className="text-primary-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-gray-600">
              Get your videos in minutes, not hours. Our optimized pipeline ensures quick turnaround.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-lg p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Images</h3>
              <p className="text-gray-600">Upload your product and model images</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Processing</h3>
              <p className="text-gray-600">Our AI generates stunning visuals</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Download Video</h3>
              <p className="text-gray-600">Export and share your video</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Create Amazing Videos?</h2>
          <p className="text-primary-100 mb-8 text-lg">
            Join thousands of creators using AI Shorts Generator
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
