import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');

    console.log('Callback - Access token:', accessToken ? 'present' : 'missing');

    if (accessToken) {
      authService.setAccessToken(accessToken);
      console.log('Token stored, fetching user info...');
      
      authService.getMe().then((response) => {
        console.log('User info response:', response);
        if (response.success && response.user) {
          console.log('Login successful, redirecting to dashboard');
          login(response.user, accessToken);
          navigate('/dashboard');
        } else {
          console.log('Failed to get user info');
          navigate('/login');
        }
      }).catch((error) => {
        console.error('Error fetching user info:', error);
        navigate('/login');
      });
    } else {
      console.log('No access token in URL');
      navigate('/login');
    }
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default Callback;
