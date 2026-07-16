import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, LayoutDashboard, Shield } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-bold text-primary-800 hover:text-primary-600 transition-colors"
            >
              AI Shorts Generator
            </button>
          </div>

          {user ? (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <LayoutDashboard size={20} />
                <span className="hidden sm:inline">Dashboard</span>
              </button>

              {user.role === 'ADMIN' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <Shield size={20} />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}

              <div className="flex items-center space-x-2">
                {user.picture && (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-gray-700 font-medium">{user.name}</span>
                {user.role === 'ADMIN' && (
                  <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">Admin</span>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut size={20} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
