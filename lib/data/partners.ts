export type PartnerStatus = 'pending' | 'approved' | 'rejected';

export interface Partner {
  id: string;
  name: string;
  owner: string;
  location: string;
  phone: string;
  email: string;
  status: PartnerStatus;
  createdAt: string;
  approvedAt?: string;
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

export const partnerService = {
  async getAll(): Promise<Partner[]> {
    return api('/partners');
  },

  async getPending(): Promise<Partner[]> {
    return api('/partners/pending');
  },

  async approve(id: string): Promise<Partner | undefined> {
    return api('/partners', { method: 'PATCH', body: JSON.stringify({ id, status: 'approved' }) });
  },

  async reject(id: string): Promise<Partner | undefined> {
    return api('/partners', { method: 'PATCH', body: JSON.stringify({ id, status: 'rejected' }) });
  },
};
