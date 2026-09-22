import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse, UserLoginPayload, UserRegisterPayload } from '../../types/auth';
import { apiClient } from '../../services/apiClient';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: UserLoginPayload) => Promise<void>;
  register: (payload: UserRegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('flightguard_user');
      return saved && saved !== 'undefined' && saved !== 'null' ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('flightguard_token');
      return saved && saved !== 'undefined' ? saved : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const resp = await apiClient.get<User>('/auth/me');
          setUser(resp.data);
          localStorage.setItem('flightguard_user', JSON.stringify(resp.data));
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (payload: UserLoginPayload) => {
    const resp = await apiClient.post<AuthResponse>('/auth/login', payload);
    const { access_token, user: userData } = resp.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('flightguard_token', access_token);
    localStorage.setItem('flightguard_user', JSON.stringify(userData));
  };

  const register = async (payload: UserRegisterPayload) => {
    await apiClient.post<User>('/auth/register', payload);
    // Automatically log in after registration
    await login({ email: payload.email, password: payload.password });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('flightguard_token');
    localStorage.removeItem('flightguard_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
