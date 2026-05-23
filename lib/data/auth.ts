export type UserRole = 'customer' | 'partner' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  storeId?: string;
  phone?: string;
  address?: string;
  joinDate?: string;
  lastActive?: string;
  status?: 'active' | 'suspended' | 'banned';
  greenPoints?: number;
  foodRescued?: number;
  co2Reduced?: number;
  totalOrders?: number;
  totalSpent?: number;
  walletBalance?: number;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'customer' | 'partner' | 'admin';
  phone?: string;
  address?: string;
}

async function api(path: string, options?: RequestInit) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return res.json();
}

export const authService = {
  async login(email: string, password: string): Promise<AuthSession> {
    const result = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return result;
  },

  async register(data: RegisterData): Promise<AuthSession> {
    const result = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result;
  },

  async getMe(): Promise<AuthSession | null> {
    try {
      const result = await api('/auth/me');
      if (!result || !result.user) return null;
      return result;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
    }
  },

  getUsers() {
    return api('/users');
  },

  getUserById(id: string): Promise<User | undefined> {
    return api(`/users?userId=${encodeURIComponent(id)}`);
  },

  async updateUserStatus(id: string, status: 'active' | 'suspended' | 'banned') {
    return api('/users', { method: 'PATCH', body: JSON.stringify({ id, status }) });
  },

  async getStats() {
    return api('/users/stats');
  },
};
