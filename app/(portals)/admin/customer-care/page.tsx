'use client';

import { useState, useEffect } from 'react';
import { Headphones, Activity, AlertCircle, RefreshCw, CheckCircle, ChevronRight, Clock, Filter } from 'lucide-react';
import { useGlobal } from '@/app/providers';
import { alertService, SupportTicket } from '@/lib/data/alerts';
import { showToast } from '@/lib/data/notifications';

const priorityColors: Record<string, string> = {
  Low: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600',
  Medium: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600',
  High: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600',
  Urgent: 'bg-red-50 dark:bg-red-900/30 text-red-600 animate-pulse',
};

export default function CustomerCareDashboard() {
  const { t } = useGlobal();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  useEffect(() => {
    alertService.getTickets().then(data => {
      setTickets(data);
      setLoading(false);
    });
  }, []);

  const handleResolve = async (id: string) => {
    await alertService.resolveTicket(id);
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' as const } : t));
    setSelectedTicket(null);
    showToast('success', 'Ticket Resolved', 'Support ticket has been marked as resolved');
  };

  const filteredTickets = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    escalated: tickets.filter(t => t.status === 'escalated').length,
  };

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-gradient-to-br from-[#057A42] to-emerald-600 dark:from-emerald-900 dark:to-emerald-800 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-lg transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-3">
              <Headphones className="w-6 h-6" /> {t('customer_care')}
            </h1>
          </div>
          <div className="bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 px-5 py-2 rounded-xl text-white text-sm font-semibold flex items-center gap-2 backdrop-blur-md">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            AI Engine: Full Capacity
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all hover:shadow-md">
            <div className="text-gray-500 dark:text-slate-400 text-xs font-bold mb-1">{t('live_tickets')}</div>
            <div className="text-3xl text-black dark:text-white font-black mb-1">{stats.open}</div>
            <div className="text-[10px] font-bold text-blue-500 dark:text-blue-400">Active tickets</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all hover:shadow-md">
            <div className="text-gray-500 dark:text-slate-400 text-xs font-bold mb-1">{t('ai_resolution_rate')}</div>
            <div className="text-3xl text-[#057A42] dark:text-emerald-400 font-black mb-1">86%</div>
            <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500">{t('target')} &gt; 85% ✓</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all hover:shadow-md">
            <div className="text-gray-500 dark:text-slate-400 text-xs font-bold mb-1">{t('human_handoff_rate')}</div>
            <div className="text-3xl text-orange-500 dark:text-orange-400 font-black mb-1">14%</div>
            <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500">Primarily dispute related</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all hover:shadow-md">
            <div className="text-gray-500 dark:text-slate-400 text-xs font-bold mb-1">{t('avg_resolution_time')}</div>
            <div className="text-3xl text-black dark:text-white font-black mb-1">1.2m</div>
            <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500">AI responds in &lt; 1s</div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700 animate-pulse space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 dark:bg-slate-700 rounded-2xl" />)}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-black dark:text-white font-extrabold text-sm">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                {t('live_system_alerts')}
              </div>
              <div className="flex gap-2">
                {(['all', 'open', 'resolved'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase transition-colors ${filter === f ? 'bg-[#057A42] text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredTickets.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto text-emerald-400 mb-3" />
                  <p className="text-gray-500 dark:text-slate-400 font-bold">All tickets resolved!</p>
                </div>
              ) : (
                filteredTickets.map((ticket, i) => (
                  <div key={ticket.id} className="bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 p-5 rounded-2xl transition-all hover:shadow-md cursor-pointer group" onClick={() => setSelectedTicket(ticket)} style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg ${priorityColors[ticket.priority]}`}>{ticket.priority}</span>
                        <span className="text-xs text-gray-400 dark:text-slate-500 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${ticket.status === 'open' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600'}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-slate-300 font-medium">{ticket.issue}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs font-bold text-gray-400">{ticket.customer}</span>
                      {ticket.status === 'open' && (
                        <button onClick={(e) => { e.stopPropagation(); handleResolve(ticket.id); }} className="text-xs bg-[#057A42] text-white font-bold px-4 py-2 rounded-lg hover:bg-[#046034] transition-colors flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" /> {t('take_over')}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedTicket(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Headphones className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 dark:text-white text-lg">{selectedTicket.customer}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${priorityColors[selectedTicket.priority]}`}>{selectedTicket.priority} Priority</span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-slate-900 rounded-2xl p-5 mb-6">
              <p className="text-sm text-gray-700 dark:text-slate-300 font-medium">{selectedTicket.issue}</p>
            </div>
            <div className="flex gap-3">
              {selectedTicket.status === 'open' && (
                <button onClick={() => handleResolve(selectedTicket.id)} className="flex-1 bg-[#057A42] text-white font-bold py-3 rounded-xl hover:bg-[#046034] transition-colors flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Resolve Ticket
                </button>
              )}
              <button onClick={() => setSelectedTicket(null)} className="flex-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
