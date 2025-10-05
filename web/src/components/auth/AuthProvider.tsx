'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService, Pastor } from '@/lib/auth';

interface AuthContextType {
  pastor: Pastor | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [pastor, setPastor] = useState<Pastor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (username: string, password: string) => {
    const result = await AuthService.login(username, password);
    setPastor(result.pastor);
  };

  const logout = async () => {
    await AuthService.logout();
    setPastor(null);
  };

  const refreshAuth = async () => {
    try {
      const currentPastor = await AuthService.getCurrentPastor();
      setPastor(currentPastor);
    } catch (error) {
      setPastor(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentPastor = await AuthService.getCurrentPastor();
        setPastor(currentPastor);
      } catch (error) {
        setPastor(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh token periodically
  useEffect(() => {
    if (!pastor) return;

    const interval = setInterval(async () => {
      try {
        await AuthService.refreshToken();
      } catch (error) {
        // Token refresh failed, logout user
        setPastor(null);
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [pastor]);

  return (
    <AuthContext.Provider value={{ pastor, isLoading, login, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
