export interface FraudAlert {
  id: string;
  type: string;
  store: string;
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  score: number;
  time: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
}

export interface SystemNode {
  name: string;
  status: 'Healthy' | 'High Load' | 'Warning' | 'Down';
  ping: string;
  uptime: string;
}

export interface SupportTicket {
  id: string;
  customer: string;
  issue: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'open' | 'resolved' | 'escalated';
  createdAt: string;
  category: 'delivery' | 'payment' | 'product' | 'account' | 'technical';
  responses?: { fromText: string; message: string; time: string }[];
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

export const alertService = {
  async getFraudAlerts(): Promise<FraudAlert[]> {
    return api('/fraud-alerts');
  },

  async getTickets(): Promise<SupportTicket[]> {
    return api('/support-tickets');
  },

  async getTicketsByStatus(status: SupportTicket['status']): Promise<SupportTicket[]> {
    return api(`/support-tickets?status=${encodeURIComponent(status)}`);
  },

  async resolveTicket(id: string): Promise<SupportTicket | undefined> {
    return api('/support-tickets', { method: 'PATCH', body: JSON.stringify({ id, status: 'resolved' }) });
  },

  async addResponse(ticketId: string, from: string, message: string): Promise<SupportTicket | undefined> {
    return api('/support-tickets/respond', { method: 'POST', body: JSON.stringify({ ticketId, from, message }) });
  },

  async getStats(): Promise<any> {
    return api('/support-tickets/stats');
  },
};
