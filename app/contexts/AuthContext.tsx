'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, authService } from '@/lib/data/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'customer' | 'partner' | 'admin';
  phone?: string;
  address?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const session = await authService.getMe();
      if (session) {
        setUser(session.user);
      }
    } catch (err) {
      console.error('Failed to refresh user session', err);
    }
  }, []);

  useEffect(() => {
    authService.getMe().then(session => {
      if (session) setUser(session.user);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const session = await authService.login(email, password);
      if (session) {
        setUser(session.user);
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      const session = await authService.register(data);
      if (session) {
        setUser(session.user);
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

