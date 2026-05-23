'use client';

import { useState, useEffect } from 'react';
import { Wallet, CreditCard, History, Settings, ChevronRight, LogOut, ArrowUpFromLine, Plus, X, Check, Pencil, Trash2 } from 'lucide-react';
import { useGlobal } from '@/app/providers';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { transactionService, Transaction } from '@/lib/data/transactions';
import { showToast } from '@/lib/data/notifications';
import { bankAccountService } from '@/lib/data/bankAccounts';

export default function CustomerProfile() {
  const { t } = useGlobal();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [savedCards, setSavedCards] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    const uid = user?.id || '';
    if (!uid) return;
    transactionService.getBalance(uid).then(setBalance).catch(console.error);
    transactionService.getByUser(uid).then(setTransactions).catch(console.error);
    bankAccountService.getByUser(uid).then(data => {
      setSavedCards((data || []).map((a: any, i: number) => ({
        id: a.id || i,
        type: a.bankName || 'Bank',
        last4: a.accountNumber?.slice(-4) || '0000',
        expiry: 'N/A',
        isDefault: a.isDefault || i === 0,
      })));
    }).catch(console.error);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    showToast('info', 'Logged out');
  };

  const handleSaveSettings = () => {
    showToast('success', 'Profile Updated', 'Your profile has been saved successfully');
    setShowSettingsModal(false);
  };

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-[#057A42] dark:bg-emerald-900 pt-12 pb-24 px-4 md:rounded-b-[40px] shadow-lg transition-colors">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center text-yellow-700 dark:text-yellow-500 font-bold text-2xl shadow-sm border-2 border-white dark:border-slate-800 overflow-hidden shrink-0">
            {user?.avatar && user.avatar.startsWith('http') ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={user.avatar} alt={user.name || 'User'} className="w-full h-full rounded-full object-cover" />
            ) : (
              user?.name ? user.name.charAt(0).toUpperCase() : 'U'
            )}
          </div>
          <div>
            <div className="text-white font-bold text-xl">{user?.name || 'John Doe'}</div>
            <div className="text-white/80 dark:text-emerald-200/80 text-sm">{user?.email || 'john.doe@example.com'}</div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-12 relative z-10">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 mb-6 transition-colors">
          <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 font-bold text-xs mb-2">
            <Wallet className="w-4 h-4 text-[#057A42] dark:text-emerald-400" /> {t('wallet_balance')}
          </div>
          <div className="text-black dark:text-white font-black text-3xl mb-6">{balance.toLocaleString()} VND</div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => router.push('/customer/wallet?action=deposit')} className="bg-[#057A42] dark:bg-emerald-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-[#046034] dark:hover:bg-emerald-700 transition-colors">
              <Plus className="w-4 h-4" /> {t('top_up')}
            </button>
            <button onClick={() => router.push('/customer/wallet?action=withdraw')} className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
              <ArrowUpFromLine className="w-4 h-4" /> {t('withdraw')}
            </button>
          </div>
        </div>

        <h2 className="text-black dark:text-white font-extrabold text-sm mb-4">{t('settings_prefs')}</h2>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden mb-6 transition-colors">
          {[
            { icon: CreditCard, label: t('payment_methods'), color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', onClick: () => setShowPaymentModal(true) },
            { icon: History, label: t('transaction_history'), color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30', onClick: () => showToast('info', 'Transaction History', `Showing last ${transactions.length} transactions.`) },
            { icon: Settings, label: t('account_settings'), color: 'text-gray-500 dark:text-slate-400', bg: 'bg-gray-50 dark:bg-slate-700/50', onClick: () => setShowSettingsModal(true) },
          ].map((item, i) => (
            <div key={i} onClick={item.onClick} className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="font-bold text-gray-900 dark:text-white">{item.label}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 dark:text-slate-600" />
            </div>
          ))}
        </div>

        <button onClick={handleLogout} className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold py-4 rounded-2xl border border-red-100 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2">
          <LogOut className="w-5 h-5" /> {t('log_out')}
        </button>
      </div>

      {/* Payment Methods Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-t-3xl md:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-500" /> {t('payment_methods')}
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl">
                <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
              </button>
            </div>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {savedCards.map(card => (
                <div key={card.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${card.isDefault ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50' : 'bg-gray-50 dark:bg-slate-700 border-gray-100 dark:border-slate-600'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs ${card.type === 'Visa' ? 'bg-blue-600' : card.type === 'Mastercard' ? 'bg-red-600' : 'bg-pink-500'}`}>
                      {card.type === 'Momo' ? 'M' : card.type[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{card.type} •••• {card.last4}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Expires {card.expiry}</p>
                    </div>
                    {card.isDefault && <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">Default</span>}
                  </div>
                  <button className="p-2 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
              <button className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl text-gray-500 dark:text-slate-400 font-bold text-sm hover:border-[#057A42] hover:text-[#057A42] dark:hover:border-emerald-400 dark:hover:text-emerald-400 transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add New Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowSettingsModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-t-3xl md:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-500" /> {t('account_settings')}
              </h3>
              <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl">
                <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="flex gap-2 mt-1">
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#057A42]" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Email</label>
                <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#057A42]" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Phone</label>
                <input type="tel" defaultValue={user?.phone || ''} className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#057A42]" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleSaveSettings} className="flex-1 bg-[#057A42] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#046034] transition-colors flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Save Changes
                </button>
                <button onClick={() => setShowSettingsModal(false)} className="px-6 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
