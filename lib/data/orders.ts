export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'in_transit' | 'delivered' | 'cancelled';
export type DeliveryMethod = 'pickup' | 'delivery';
export type PaymentMethod = 'momo' | 'zalopay' | 'vnpay' | 'applepay' | 'wallet';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  storeName: string;
  storeId: string;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  createdAt: string;
  estimatedDelivery: string;
  deliveredAt?: string;
  qrCode?: string;
  notes?: string;
  address?: string;
  trackingSteps: { status: OrderStatus; time: string; completed: boolean }[];
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

export const orderService = {
  async getByUser(userId: string): Promise<Order[]> {
    return api(`/orders/by-user?userId=${encodeURIComponent(userId)}`);
  },

  async getById(id: string): Promise<Order | undefined> {
    const res = await api(`/orders/${id}`);
    return res && res.id ? res : undefined;
  },

  async getByStore(storeId: string): Promise<Order[]> {
    return api(`/orders/by-store?storeId=${encodeURIComponent(storeId)}`);
  },

  async getByStatus(status: OrderStatus): Promise<Order[]> {
    return api(`/orders?status=${encodeURIComponent(status)}`);
  },

  async create(order: Omit<Order, 'id' | 'createdAt' | 'status' | 'estimatedDelivery' | 'trackingSteps'>): Promise<Order> {
    return api('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order | undefined> {
    const res = await api('/orders/update-status', {
      method: 'PATCH',
      body: JSON.stringify({ id, status }),
    });
    return res && res.id ? res : undefined;
  },

  async getAll(): Promise<Order[]> {
    return api('/orders');
  },

  async getStats(): Promise<any> {
    return api('/orders/stats');
  },
};
