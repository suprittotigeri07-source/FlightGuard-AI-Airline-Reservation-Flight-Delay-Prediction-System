/// <reference types="vite/client" />
import axios from 'axios';

const resolveApiBaseUrl = (): string => {
  let url = (import.meta.env.VITE_API_BASE_URL || '/api/v1').trim();
  // Strip trailing slashes
  url = url.replace(/\/+$/, '');
  // If user provided a host or URL without /api/v1, normalize it
  if (!url.endsWith('/api/v1')) {
    if (url.endsWith('/api')) {
      url += '/v1';
    } else if (!url.includes('/api/v1')) {
      url += '/api/v1';
    }
  }
  return url;
};

export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
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
