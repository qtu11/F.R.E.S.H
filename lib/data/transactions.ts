export type TransactionType = 'revenue' | 'withdrawal' | 'topup' | 'payment' | 'refund' | 'commission';
export type TransactionStatus = 'completed' | 'pending' | 'failed';
export type PaymentMethod = 'momo' | 'zalopay' | 'vnpay' | 'applepay' | 'wallet' | 'bank';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  date: string;
  status: TransactionStatus;
  description: string;
  paymentMethod?: PaymentMethod;
  reference?: string;
}

async function api(path: string, options?: RequestInit) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return res.json();
}

export const transactionService = {
  async getByUser(userId: string): Promise<Transaction[]> {
    return api(`/transactions?userId=${userId}`);
  },

  async getBalance(userId: string): Promise<number> {
    return api(`/transactions/balance?userId=${userId}`);
  },

  async addTransaction(tx: Omit<Transaction, 'id'>): Promise<Transaction> {
    return api('/transactions', {
      method: 'POST',
      body: JSON.stringify(tx),
    });
  },

  async getAll(): Promise<Transaction[]> {
    return api('/transactions');
  },

  async getByType(type: TransactionType): Promise<Transaction[]> {
    return api(`/transactions?type=${type}`);
  },

  async getStats(): Promise<any> {
    const all = await api('/transactions');
    const arr = all || [];
    return {
      totalRevenue: arr.filter((t: Transaction) => t.type === 'revenue' && t.status === 'completed').reduce((s: number, t: Transaction) => s + t.amount, 0),
      totalWithdrawals: Math.abs(arr.filter((t: Transaction) => t.type === 'withdrawal' && t.status === 'completed').reduce((s: number, t: Transaction) => s + t.amount, 0)),
      totalTopups: arr.filter((t: Transaction) => t.type === 'topup' && t.status === 'completed').reduce((s: number, t: Transaction) => s + t.amount, 0),
      pendingCount: arr.filter((t: Transaction) => t.status === 'pending').length,
    };
  },
};
