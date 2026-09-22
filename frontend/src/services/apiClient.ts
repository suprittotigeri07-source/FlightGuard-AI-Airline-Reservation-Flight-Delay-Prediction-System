/// <reference types="vite/client" />
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to append JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('flightguard_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto-clear invalid session
      localStorage.removeItem('flightguard_token');
      localStorage.removeItem('flightguard_user');
    }
    return Promise.reject(error);
  }
);
