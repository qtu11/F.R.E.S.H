'use client';

import { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, History, Download, CreditCard, ChevronDown, ChevronUp, TrendingUp, Loader2 } from 'lucide-react';
import { useGlobal } from '@/app/providers';
import { useAuth } from '@/app/contexts/AuthContext';
import { transactionService, Transaction } from '@/lib/data/transactions';
import { showToast } from '@/lib/data/notifications';

export default function PartnerFinance() {
  const { t } = useGlobal();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([
      transactionService.getByUser(user.id),
      transactionService.getBalance(user.id)
    ]).then(([txs, bal]) => {
      setTransactions(txs || []);
      setBalance(bal || 0);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [user]);

  const handleWithdraw = () => {
    if (!user?.id) {
      showToast('error', 'Error', 'User not authenticated');
      return;
    }
    if (withdrawAmount <= 0 || withdrawAmount > balance) {
      showToast('error', 'Invalid amount', 'Please enter a valid withdrawal amount');
      return;
    }
    transactionService.addTransaction({
      userId: user.id, type: 'withdrawal', amount: -withdrawAmount,
      date: new Date().toISOString(), status: 'pending', description: 'Withdrawal to bank account',
    }).then(() => {
      setBalance(prev => prev - withdrawAmount);
      setShowWithdrawModal(false);
      setWithdrawAmount(0);
      showToast('success', 'Withdrawal Requested', `${withdrawAmount.toLocaleString()} VND - Processing (2-4 hours)`);
    }).catch(err => {
      console.error(err);
      showToast('error', 'Error', 'Failed to request withdrawal');
    });
  };

  const handleExport = () => {
    showToast('info', 'Export Report', 'Downloading financial report...');
  };

  const displayedTxs = showAll ? transactions : transactions.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <div className="text-gray-900 dark:text-white text-sm font-medium">Loading financial data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-gradient-to-br from-[#057A42] to-emerald-700 dark:from-emerald-900 dark:to-emerald-800 pt-12 pb-24 px-4 md:rounded-b-[40px] shadow-lg transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-white font-bold text-xl tracking-wide flex items-center gap-2">
            <Wallet className="w-6 h-6" /> {t('finance')}
          </h1>
          <button onClick={handleExport} className="bg-white/20 hover:bg-white/30 dark:bg-slate-800/50 text-white font-bold px-8 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg border border-white/20 backdrop-blur-md">
            <Download className="w-5 h-5" /> Export Report
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-12 space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-xl border border-gray-100 dark:border-slate-700 relative overflow-hidden group transition-all hover:shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#057A42]/5 to-transparent dark:from-emerald-500/5 rounded-bl-full -z-0" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-tr-full -z-0" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <div className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">{t('total_balance')}</div>
              <div className="text-black dark:text-white font-black text-5xl tracking-tight transition-all group-hover:scale-105 origin-left duration-300">{balance.toLocaleString()} <span className="text-xl font-bold opacity-60">VNĐ</span></div>
              <div className="flex items-center gap-2 mt-4 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center animate-pulse">
                  <TrendingUp className="w-4 h-4" />
                </div>
                {'\u2014'}
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <button onClick={() => setShowWithdrawModal(true)} className="bg-gradient-to-r from-[#ff8c00] to-orange-500 dark:from-orange-600 dark:to-orange-700 text-white font-black px-10 py-4 rounded-2xl shadow-[0_10px_20px_rgba(255,140,0,0.2)] hover:scale-[1.02] hover:shadow-[0_15px_30px_rgba(255,140,0,0.3)] transition-all flex items-center justify-center gap-3">
                <CreditCard className="w-5 h-5" /> {t('withdrawal')}
              </button>
              <div className="text-[10px] text-gray-400 dark:text-slate-500 font-bold text-center animate-pulse">Processing time: 2-4 hours</div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="text-black dark:text-white font-black text-sm uppercase tracking-wide flex items-center gap-2">
              <History className="w-4 h-4 text-[#057A42] dark:text-emerald-400" /> {t('recent_transactions')}
            </h2>
            <button onClick={() => setShowAll(!showAll)} className="text-xs font-bold text-[#057A42] dark:text-emerald-400 hover:underline flex items-center gap-1">
              {showAll ? 'Show Less' : 'View All'} {showAll ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {displayedTxs.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center shadow-sm border border-gray-100 dark:border-slate-700">
              <Wallet className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600 mb-3" />
              <p className="text-gray-500 dark:text-slate-400 font-bold">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedTxs.map((tx, i) => (
                <div key={tx.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between transition-all hover:translate-x-1 hover:shadow-md group" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 ${tx.type === 'revenue' || tx.type === 'topup' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' : 'bg-orange-50 dark:bg-orange-900/30 text-orange-600'}`}>
                      {tx.type === 'revenue' || tx.type === 'topup' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white text-base capitalize">{tx.type}</div>
                      <div className="text-xs text-gray-400 dark:text-slate-500 font-semibold">{tx.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-black text-lg ${tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} đ
                    </div>
                    <div className={`text-[10px] font-bold uppercase tracking-widest ${tx.status === 'completed' ? 'text-emerald-500' : tx.status === 'pending' ? 'text-orange-500' : 'text-red-500'}`}>
                      {tx.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowWithdrawModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-gray-900 dark:text-white text-lg mb-2">{t('withdrawal')}</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-6">Available balance: <span className="font-bold text-[#057A42]">{balance.toLocaleString()} VND</span></p>
            <input type="number" value={withdrawAmount || ''} onChange={e => setWithdrawAmount(parseInt(e.target.value) || 0)} placeholder={t('enter_amount_placeholder')} className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl px-4 py-3 text-lg font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#057A42] mb-4" />
            <div className="flex gap-2 mb-4">
              {[1000000, 5000000, 10000000].map(amt => (
                <button key={amt} onClick={() => setWithdrawAmount(amt)} className="flex-1 py-2 text-xs font-bold bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-gray-700 dark:text-slate-300">
                  {amt.toLocaleString()}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={handleWithdraw} className="flex-1 bg-[#057A42] text-white py-3 rounded-xl font-bold hover:bg-[#046034] transition-colors">{t('confirm')}</button>
              <button onClick={() => setShowWithdrawModal(false)} className="px-6 py-3 rounded-xl font-bold bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">{t('cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
