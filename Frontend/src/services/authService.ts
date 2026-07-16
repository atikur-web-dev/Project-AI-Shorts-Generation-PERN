import api from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  loginWithGoogle: () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    const loginUrl = `${apiUrl}/auth/google/login`;
    console.log('Attempting Google login to:', loginUrl);
    console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);
    window.location.href = loginUrl;
  },

  loginWithGitHub: () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    const loginUrl = `${apiUrl}/auth/github/login`;
    console.log('Attempting GitHub login to:', loginUrl);
    console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);
    window.location.href = loginUrl;
  },

  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    window.location.href = '/';
  },

  getMe: async (): Promise<{ success: boolean; user?: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  setAccessToken: (token: string) => {
    localStorage.setItem('accessToken', token);
  },

  getAccessToken: () => {
    return localStorage.getItem('accessToken');
  },

  clearAccessToken: () => {
    localStorage.removeItem('accessToken');
  },
};
