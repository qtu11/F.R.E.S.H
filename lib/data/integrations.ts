export interface Integration {
  id: string; storeId: string; name: string; type: string;
  status: string; config?: any; connectedAt: string; lastSyncAt?: string;
}
export interface WebhookLog {
  id: string; integrationId: string; event: string; status: string;
  requestBody?: string; responseBody?: string; createdAt: string;
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

export const integrationService = {
  async getByStore(storeId: string) { return api(`/integrations?storeId=${encodeURIComponent(storeId)}`); },
  async create(integration: any) { return api('/integrations', { method: 'POST', body: JSON.stringify(integration) }); },
  async update(id: string, updates: any) { return api('/integrations', { method: 'PATCH', body: JSON.stringify({ id, ...updates }) }); },
  async remove(id: string) { return api('/integrations', { method: 'DELETE', body: JSON.stringify({ id }) }); },
  async getLogs(integrationId: string) { return api(`/integrations?logs=true&storeId=${encodeURIComponent(integrationId)}`); },
};
