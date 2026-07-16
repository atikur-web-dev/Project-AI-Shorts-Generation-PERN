import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Chrome, Github } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }

    // Handle OAuth callback
    const accessToken = searchParams.get('accessToken');
    if (accessToken) {
      authService.setAccessToken(accessToken);
      authService.getMe().then((response) => {
        if (response.success && response.user) {
          login(response.user, accessToken);
          navigate('/dashboard');
        }
      });
    }
  }, [user, navigate, login, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to continue to AI Shorts Generator</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={authService.loginWithGoogle}
              className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <Chrome className="text-gray-700" size={24} />
              <span className="text-gray-700 font-medium">Continue with Google</span>
            </button>

            <button
              onClick={authService.loginWithGitHub}
              className="w-full flex items-center justify-center space-x-3 bg-gray-900 text-white rounded-lg px-4 py-3 hover:bg-gray-800 transition-colors"
            >
              <Github size={24} />
              <span className="font-medium">Continue with GitHub</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
