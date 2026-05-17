export type UserRole = 'customer' | 'partner' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
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
  password?: string;
  walletBalance?: number;
}

export interface AuthSession {
  user: User;
  token: string;
}

async function api(path: string, options?: RequestInit) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return res.json();
}

export const authService = {
  async login(email: string, password: string): Promise<AuthSession | null> {
    const result = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result.error) return null;
    if (typeof window !== 'undefined') {
      localStorage.setItem('fresh_session', JSON.stringify(result));
    }
    return result;
  },

  async getSession(): Promise<AuthSession | null> {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('fresh_session');
    if (!raw) return null;
    try {
      const session = JSON.parse(raw) as AuthSession;
      // verify session is still valid from server
      const user = await api(`/users?userId=${session.user.id}`);
      if (user && user.id) {
        return { user, token: session.token };
      }
      return session;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fresh_session');
    }
  },

  getUsers() {
    return api('/users');
  },

  getUserById(id: string): Promise<User | undefined> {
    return api(`/users?userId=${id}`);
  },

  async updateUserStatus(id: string, status: 'active' | 'suspended' | 'banned') {
    return api('/users', { method: 'PATCH', body: JSON.stringify({ id, status }) });
  },

  async getStats() {
    return api('/users/stats');
  },
};
