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

export const favoriteService = {
  async getByUser(userId: string) { return api(`/favorites?userId=${encodeURIComponent(userId)}`); },
  async add(userId: string, productId: string) {
    return api('/favorites', { method: 'POST', body: JSON.stringify({ userId, productId }) });
  },
  async remove(userId: string, productId: string) {
    return api('/favorites', { method: 'DELETE', body: JSON.stringify({ userId, productId }) });
  },
};
