/**
 * Auth Context — manages keyword-based authentication state
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (keyword: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check existing token on mount
  useEffect(() => {
    const token = api.getToken();
    if (token) {
      api.post('/auth/verify')
        .then(() => setIsAuthenticated(true))
        .catch(() => {
          api.clearToken();
          setIsAuthenticated(false);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (keyword: string) => {
    const res = await api.post<{ access_token: string }>('/auth/login', { keyword });
    api.setToken(res.access_token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    api.clearToken();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
