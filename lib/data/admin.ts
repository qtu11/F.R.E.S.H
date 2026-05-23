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

export const adminService = {
  async getRoles() { return api('/roles'); },
  async createRole(role: any) { return api('/roles', { method: 'POST', body: JSON.stringify(role) }); },
  async updateRole(id: string, updates: any) { return api('/roles', { method: 'PATCH', body: JSON.stringify({ id, ...updates }) }); },
  async getCommission() { return api('/commission'); },
  async createInvoice(invoice: any) { return api('/commission', { method: 'POST', body: JSON.stringify(invoice) }); },
  async updateInvoice(id: string, updates: any) { return api('/commission', { method: 'PATCH', body: JSON.stringify({ id, ...updates }) }); },
  async getEsg() { return api('/esg'); },
  async getForecasting() { return api('/forecasting'); },
  async getHeatmap(type?: string) { return api(`/heatmap${type ? `?type=${encodeURIComponent(type)}` : ''}`); },
  async getSystemHealth() { return api('/system-health'); },
  async getInvoices(storeId?: string) { return api(`/invoices${storeId ? `?storeId=${encodeURIComponent(storeId)}` : ''}`); },
};
