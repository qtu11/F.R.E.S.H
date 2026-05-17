export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export type NotificationType = 'deal' | 'order' | 'voucher' | 'system' | 'community' | 'ai';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
  actionUrl?: string;
}

let listeners: ((toast: Toast) => void)[] = [];

export function subscribeToasts(listener: (toast: Toast) => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

export function showToast(type: ToastType, title: string, message?: string, duration = 4000) {
  const toast: Toast = { id: `t${Date.now()}`, type, title, message, duration };
  listeners.forEach(l => l(toast));
}

async function api(path: string, options?: RequestInit) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return res.json();
}

export const notificationService = {
  async getAll(): Promise<AppNotification[]> {
    return api('/notifications');
  },

  async getByType(type: NotificationType): Promise<AppNotification[]> {
    return api(`/notifications?type=${type}`);
  },

  async getUnread(): Promise<AppNotification[]> {
    return api('/notifications?unread=true');
  },

  async markAsRead(id: string): Promise<void> {
    await api('/notifications', { method: 'PATCH', body: JSON.stringify({ id }) });
  },

  async markAllAsRead(): Promise<void> {
    await api('/notifications', { method: 'PATCH', body: JSON.stringify({ markAll: true }) });
  },

  async getStats(): Promise<any> {
    return api('/notifications/stats');
  },
};
