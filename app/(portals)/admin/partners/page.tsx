'use client';

import { useState, useEffect } from 'react';
import { Users, Check, X, Store, MapPin, Phone, ExternalLink, Search, Clock, AlertCircle } from 'lucide-react';
import { useGlobal } from '@/app/providers';
import { partnerService, Partner } from '@/lib/data/partners';
import { showToast } from '@/lib/data/notifications';

export default function AdminPartners() {
  const { t } = useGlobal();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);

  useEffect(() => {
    partnerService.getAll().then(data => {
      setPartners(data);
      setLoading(false);
    });
  }, []);

  const handleApprove = async (id: string) => {
    await partnerService.approve(id);
    setPartners(prev => prev.map(p => p.id === id ? { ...p, status: 'approved', approvedAt: new Date().toISOString() } : p));
    setConfirmAction(null);
    showToast('success', 'Partner Approved', 'The partner has been approved successfully');
  };

  const handleReject = async (id: string) => {
    await partnerService.reject(id);
    setPartners(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p));
    setConfirmAction(null);
    showToast('info', 'Partner Rejected', 'The partner request has been rejected');
  };

  const pending = partners.filter(p => p.status === 'pending');
  const filtered = search ? partners.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.owner.toLowerCase().includes(search.toLowerCase())) : partners;

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-gradient-to-br from-[#057A42] to-emerald-700 dark:from-emerald-900 dark:to-slate-900 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-lg transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-white font-bold text-xl tracking-wide flex items-center gap-3">
            <Users className="w-6 h-6" /> {t('partners_approvals')}
          </h1>
          <div className="bg-white/20 dark:bg-white/10 px-5 py-2.5 rounded-xl text-white text-xs font-bold border border-white/20 backdrop-blur-md flex items-center gap-2">
            <Clock className="w-3 h-3 animate-pulse" /> {pending.length} {t('pending_approvals')}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search_partners_placeholder')} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#057A42] text-sm font-bold text-gray-900 dark:text-white" />
        </div>

        {loading ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden animate-pulse p-8 space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-200 dark:bg-slate-700 rounded-2xl" />)}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('store_name')}</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('location')}</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">{t('action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {filtered.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600' : item.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-50 dark:bg-red-900/30 text-red-600'}`}>
                            <Store className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">{item.name}</div>
                            <div className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase">{item.owner}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-slate-400 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#057A42] dark:text-emerald-400" /> {item.location}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs font-bold text-gray-800 dark:text-slate-300 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" /> {item.phone}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${item.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50' : item.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.status === 'pending' && (
                            <>
                              <button onClick={() => setConfirmAction({ id: item.id, action: 'approve' })} className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-800/50 transition-all hover:scale-110" title={t('approve')}>
                                <Check className="w-5 h-5" />
                              </button>
                              <button onClick={() => setConfirmAction({ id: item.id, action: 'reject' })} className="p-2.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all hover:scale-110" title={t('reject')}>
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button className="p-2 bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600 mb-3" />
                <p className="text-gray-500 dark:text-slate-400 font-bold">{search ? 'No partners match your search' : 'No partner requests'}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmAction(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-slate-700 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gray-100 dark:bg-slate-700">
              <AlertCircle className={`w-8 h-8 ${confirmAction.action === 'approve' ? 'text-emerald-500' : 'text-red-500'}`} />
            </div>
            <h3 className="font-black text-gray-900 dark:text-white text-lg mb-2">Confirm {confirmAction.action === 'approve' ? 'Approval' : 'Rejection'}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Are you sure you want to {confirmAction.action} this partner?</p>
            <div className="flex gap-3">
              <button onClick={() => confirmAction.action === 'approve' ? handleApprove(confirmAction.id) : handleReject(confirmAction.id)} className={`flex-1 py-3 rounded-xl font-bold text-white transition-all ${confirmAction.action === 'approve' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}>
                Yes, {confirmAction.action}
              </button>
              <button onClick={() => setConfirmAction(null)} className="flex-1 py-3 rounded-xl font-bold bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
