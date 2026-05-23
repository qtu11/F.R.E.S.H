export interface Campaign {
  id: string; title: string; description?: string; type: string;
  status: string; discountRate?: number; budget: number; spent: number;
  startDate: string; endDate: string; image?: string;
  targetImpressions?: number; targetConversions?: number;
  actualImpressions?: number; actualConversions?: number;
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

export const campaignService = {
  async getAll() { return api('/campaigns'); },
  async getByStore(storeId: string) { return api(`/campaigns?storeId=${encodeURIComponent(storeId)}`); },
  async create(campaign: Partial<Campaign>) {
    return api('/campaigns', { method: 'POST', body: JSON.stringify(campaign) });
  },
  async update(id: string, updates: Partial<Campaign>) {
    return api('/campaigns', { method: 'PATCH', body: JSON.stringify({ id, ...updates }) });
  },
  async getBanners() { return api('/banners'); },
};
