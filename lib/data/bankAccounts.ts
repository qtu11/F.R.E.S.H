export interface BankAccount {
  id: string;
  userId: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branch?: string;
  isDefault: boolean;
  addedAt: string;
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

export const bankAccountService = {
  async getByUser(userId: string): Promise<BankAccount[]> {
    return api(`/bank-accounts?userId=${encodeURIComponent(userId)}`);
  },

  async add(account: Omit<BankAccount, 'id' | 'addedAt'>): Promise<BankAccount> {
    return api('/bank-accounts', {
      method: 'POST',
      body: JSON.stringify(account),
    });
  },

  async remove(id: string): Promise<void> {
    await api('/bank-accounts', { method: 'DELETE', body: JSON.stringify({ id }) });
  },

  async setDefault(id: string, userId: string): Promise<void> {
    await api('/bank-accounts', {
      method: 'PATCH',
      body: JSON.stringify({ id, isDefault: true, userId }),
    });
  },
};
