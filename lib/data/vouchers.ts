export interface Voucher {
  id: string; code: string; title: string; description?: string;
  discountType: string; discountValue: number; minOrder: number;
  maxDiscount?: number; usageLimit: number; usedCount: number;
  validFrom: string; validUntil: string; status: string; image?: string;
}
export interface UserVoucher {
  id: string; userId: string; voucherId: string; claimedAt: string;
  usedAt?: string; orderId?: string; voucher?: Voucher;
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

export const voucherService = {
  async getAll() { return api('/vouchers'); },
  async getByUser(userId: string) { return api(`/vouchers?userId=${encodeURIComponent(userId)}`); },
  async claim(userId: string, voucherId: string) {
    return api('/vouchers', { method: 'POST', body: JSON.stringify({ userId, voucherId }) });
  },
  async use(userId: string, voucherId: string, orderId: string) {
    return api('/vouchers', { method: 'PATCH', body: JSON.stringify({ userId, voucherId, used_at: new Date().toISOString(), order_id: orderId }) });
  },
};
