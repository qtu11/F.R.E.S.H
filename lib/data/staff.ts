export interface StaffMember {
  id: string; storeId: string; name: string; email: string;
  phone?: string; role: string; permissions: string[];
  status: string; createdAt: string; lastActive?: string;
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

export const staffService = {
  async getByStore(storeId: string) { return api(`/staff?storeId=${encodeURIComponent(storeId)}`); },
  async create(staff: Partial<StaffMember>) { return api('/staff', { method: 'POST', body: JSON.stringify(staff) }); },
  async update(id: string, updates: Partial<StaffMember>) {
    return api('/staff', { method: 'PATCH', body: JSON.stringify({ id, ...updates }) });
  },
  async remove(id: string) { return api('/staff', { method: 'DELETE', body: JSON.stringify({ id }) }); },
};
