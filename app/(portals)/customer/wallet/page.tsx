'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownLeft, Banknote, CreditCard, Plus, ArrowLeft, Check, X, Loader2, History, AlertTriangle } from 'lucide-react';
import { useGlobal } from '@/app/providers';
import { useAuth } from '@/app/contexts/AuthContext';
import { transactionService, Transaction } from '@/lib/data/transactions';
import { bankAccountService, BankAccount } from '@/lib/data/bankAccounts';
import { showToast } from '@/lib/data/notifications';
import { staggerContainer, staggerItem, fadeUp, scaleIn, slideUp, buttonTap, useSafeReducedMotion } from '@/lib/animation';

type TabType = 'all' | 'topup' | 'payment' | 'withdrawal' | 'refund';

const TYPE_ICONS: Record<string, string> = { topup: '💳', payment: '🛒', withdrawal: '🏦', refund: '↩️', revenue: '💰', commission: '📊' };
const TYPE_COLORS: Record<string, string> = { topup: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30', payment: 'text-red-600 bg-red-100 dark:bg-red-900/30', withdrawal: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30', refund: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', revenue: 'text-green-600 bg-green-100 dark:bg-green-900/30', commission: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' };

function WalletPageContent() {
  const { t } = useGlobal();
  const { user } = useAuth();
  const reduced = useSafeReducedMotion();
  const searchParams = useSearchParams();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [mounted, setMounted] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [depositAccount, setDepositAccount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (bankAccounts.length > 0) {
      const defaultAcc = bankAccounts.find(a => a.isDefault) || bankAccounts[0];
      setDepositAccount(defaultAcc.id);
    } else {
      setDepositAccount('');
    }
  }, [bankAccounts, showDeposit]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'deposit') {
      setShowDeposit(true);
    } else if (action === 'withdraw') {
      setShowWithdraw(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      transactionService.getByUser(user.id),
      transactionService.getBalance(user.id),
      bankAccountService.getByUser(user.id),
    ]).then(([txs, bal, banks]) => {
      setTransactions(txs);
      setBalance(bal);
      setBankAccounts(banks);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      showToast('error', 'Failed to load wallet data');
      setLoading(false);
    });
  }, [user]);

  const filtered = activeTab === 'all' ? transactions : transactions.filter(t => t.type === activeTab);

  const handleDeposit = async () => {
    const amount = parseInt(depositAmount);
    if (!amount || amount < 10000) { showToast('error', 'Minimum deposit is 10,000đ'); return; }
    if (!depositAccount) { showToast('error', 'Vui lòng liên hệ Admin để cấu hình tài khoản ngân hàng liên kết.'); return; }
    setProcessing(true);
    try {
      const account = bankAccounts.find(a => a.id === depositAccount);
      await transactionService.addTransaction({
        userId: user!.id, type: 'topup', amount,
        date: new Date().toISOString(), status: 'completed',
        description: `Nạp tiền tự động từ ngân hàng ${account?.bankName} (${account?.accountNumber})`,
        paymentMethod: 'bank',
      });
      const newBal = await transactionService.getBalance(user!.id);
      setBalance(newBal);
      const txs = await transactionService.getByUser(user!.id);
      setTransactions(txs);
      setShowDeposit(false);
      setDepositAmount('');
      showToast('success', 'Nạp tiền thành công', `${amount.toLocaleString()}đ đã được cộng vào ví của bạn.`);
    } catch { showToast('error', 'Nạp tiền thất bại'); }
    setProcessing(false);
  };

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount);
    if (!amount || amount < 50000) { showToast('error', 'Minimum withdrawal is 50,000đ'); return; }
    if (amount > balance) { showToast('error', 'Insufficient balance'); return; }
    if (!withdrawAccount) { showToast('error', 'Please select a bank account'); return; }
    setProcessing(true);
    try {
      const account = bankAccounts.find(a => a.id === withdrawAccount);
      await transactionService.addTransaction({
        userId: user!.id, type: 'withdrawal', amount: -amount,
        date: new Date().toISOString(), status: 'completed',
        description: `Withdrawal to ${account?.bankName} (${account?.accountNumber})`,
        paymentMethod: 'bank',
      });
      const newBal = await transactionService.getBalance(user!.id);
      setBalance(newBal);
      const txs = await transactionService.getByUser(user!.id);
      setTransactions(txs);
      setShowWithdraw(false);
      setWithdrawAmount('');
      setWithdrawAccount('');
      showToast('success', 'Withdrawal Initiated', `${amount.toLocaleString()}đ will be transferred to your bank account`);
    } catch { showToast('error', 'Withdrawal failed'); }
    setProcessing(false);
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'topup', label: 'Top-up' },
    { key: 'payment', label: 'Payment' },
    { key: 'withdrawal', label: 'Withdraw' },
    { key: 'refund', label: 'Refund' },
  ];

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white mb-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/20 to-transparent rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full -ml-16 -mb-16" />
        <motion.div variants={fadeUp} initial="hidden" animate={mounted ? 'visible' : 'hidden'} className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold text-slate-300">{t('wallet')}</span>
          </div>
          <motion.div initial={reduced ? {} : { scale: 0.8, opacity: 0 }} animate={reduced ? {} : { scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 100, delay: 0.2 }} className="mt-3">
            <div className="text-4xl md:text-5xl font-black tracking-tight">
              {balance.toLocaleString()} <span className="text-lg font-semibold text-slate-400">đ</span>
            </div>
            <div className="text-sm text-slate-400 mt-1">{t('available_balance')}</div>
          </motion.div>
          <div className="flex gap-3 mt-6">
            <motion.button onClick={() => setShowDeposit(true)} whileHover={reduced ? {} : { scale: 1.02 }} whileTap={buttonTap}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/25"
            >
              <Plus className="w-4 h-4" /> {t('deposit')}
            </motion.button>
            <motion.button onClick={() => setShowWithdraw(true)} whileHover={reduced ? {} : { scale: 1.02 }} whileTap={buttonTap}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors backdrop-blur-sm border border-white/10"
            >
              <ArrowUpRight className="w-4 h-4" /> {t('withdraw')}
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <motion.div variants={staggerContainer} initial="hidden" animate={mounted ? 'visible' : 'hidden'} className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: t('total_topup'), value: transactions.filter(t => t.type === 'topup' && t.status === 'completed').reduce((s, t) => s + t.amount, 0), icon: '💳', color: 'from-emerald-500 to-emerald-600' },
          { label: t('total_payment'), value: Math.abs(transactions.filter(t => t.type === 'payment' && t.status === 'completed').reduce((s, t) => s + t.amount, 0)), icon: '🛒', color: 'from-blue-500 to-blue-600' },
          { label: t('total_withdrawn'), value: Math.abs(transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((s, t) => s + t.amount, 0)), icon: '🏦', color: 'from-orange-500 to-orange-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} variants={staggerItem}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 text-center"
          >
            <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-lg mx-auto mb-2 shadow-sm`}>{stat.icon}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400 font-semibold mb-1">{stat.label}</div>
            <div className="text-sm font-black text-gray-900 dark:text-white">{stat.value.toLocaleString()}đ</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Bank Accounts Quick View */}
      {bankAccounts.length > 0 && (
        <motion.div variants={scaleIn} initial="hidden" animate={mounted ? 'visible' : 'hidden'}
          className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-500" /> {t('linked_banks')}
            </h3>
            <span className="text-xs text-gray-500 dark:text-slate-400 font-semibold">{bankAccounts.length} {t('accounts')}</span>
          </div>
          {bankAccounts.slice(0, 2).map(acc => (
            <div key={acc.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors -mx-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">{acc.bankName.slice(0, 2).toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{acc.bankName}</div>
                <div className="text-xs text-gray-500 dark:text-slate-400">••••{acc.accountNumber.slice(-4)}</div>
              </div>
              {acc.isDefault && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">{t('default')}</span>}
            </div>
          ))}
          <motion.a href="/customer/profile" whileHover={{ x: 4 }}
            className="block text-center text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-2 pt-2 border-t border-gray-100 dark:border-slate-700 hover:underline"
          >
            {t('manage_bank_accounts')} →
          </motion.a>
        </motion.div>
      )}

      {/* Transaction History */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-500" /> {t('transaction_history')}
          </h3>
          <span className="text-xs text-gray-500 dark:text-slate-400 font-semibold">{transactions.length} {t('transactions')}</span>
        </div>
        <div className="flex gap-1 px-4 py-3 border-b border-gray-100 dark:border-slate-700 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeTab === tab.key ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="divide-y divide-gray-100 dark:divide-slate-700/50 max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <History className="w-10 h-10 mx-auto text-gray-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-slate-400 font-semibold">{t('no_transactions')}</p>
            </div>
          ) : (
            filtered.map((tx, i) => (
              <motion.div key={tx.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${TYPE_COLORS[tx.type] || 'text-gray-600 bg-gray-100'}`}>
                  {TYPE_ICONS[tx.type] || '💳'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{tx.description}</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">{tx.date} {tx.paymentMethod && `• ${tx.paymentMethod.toUpperCase()}`}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-black ${tx.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {tx.amount >= 0 ? '+' : ''}{tx.amount.toLocaleString()}đ
                  </div>
                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                    tx.status === 'completed' ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' :
                    tx.status === 'pending' ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' :
                    'text-red-600 bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {tx.status}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDeposit(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">{t('deposit')}</h2>
              <button onClick={() => setShowDeposit(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {bankAccounts.length === 0 ? (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-850/50 rounded-2xl text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-red-600 dark:text-red-400">Chưa liên kết ngân hàng</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Tài khoản của bạn chưa được Admin cấu hình tài khoản ngân hàng liên kết. Vui lòng liên hệ Admin để liên kết ngân hàng trước khi thực hiện nạp tiền tự động.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 block">{t('amount')}</label>
                  <div className="relative">
                    <input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="100,000"
                      className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-2xl font-black text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-500">đ</span>
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  {[100000, 200000, 500000, 1000000].map(amt => (
                    <button key={amt} onClick={() => setDepositAmount(amt.toString())}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${depositAmount === amt.toString() ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-500' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-2 border-transparent hover:border-gray-300'}`}
                    >
                      {amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 block">Tài khoản ngân hàng của bạn dùng nạp tự động</label>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {bankAccounts.map(acc => (
                      <button key={acc.id} onClick={() => setDepositAccount(acc.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${depositAccount === acc.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'}`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">{acc.bankName.slice(0, 2).toUpperCase()}</div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">{acc.bankName}</div>
                          <div className="text-xs text-gray-500 dark:text-slate-400">{acc.accountNumber} - {acc.accountHolder}</div>
                        </div>
                        {depositAccount === acc.id && <Check className="w-5 h-5 text-emerald-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <motion.button onClick={handleDeposit} disabled={processing || bankAccounts.length === 0} whileHover={{ scale: 1.01 }} whileTap={buttonTap}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/25"
            >
              {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              {processing ? t('processing') : 'Xác nhận nạp tiền tự động'}
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowWithdraw(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">{t('withdraw')}</h2>
              <button onClick={() => setShowWithdraw(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="mb-4">
              <label className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 block">{t('amount')}</label>
              <div className="relative">
                <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="50,000"
                  className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-2xl font-black text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-500">đ</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400 mt-2">{t('available')}: {balance.toLocaleString()}đ</div>
            </div>
            <div className="mb-6">
              <label className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 block">{t('bank_account')}</label>
              {bankAccounts.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-slate-400 p-3 bg-gray-50 dark:bg-slate-900 rounded-xl">
                  {t('no_bank_accounts')}
                  <a href="/customer/profile" className="text-emerald-600 dark:text-emerald-400 font-bold ml-1 hover:underline">{t('add_now')}</a>
                </div>
              ) : (
                <div className="space-y-2">
                  {bankAccounts.map(acc => (
                    <button key={acc.id} onClick={() => setWithdrawAccount(acc.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${withdrawAccount === acc.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'}`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">{acc.bankName.slice(0, 2).toUpperCase()}</div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">{acc.bankName}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">{acc.accountNumber}</div>
                      </div>
                      {withdrawAccount === acc.id && <Check className="w-5 h-5 text-emerald-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <motion.button onClick={handleWithdraw} disabled={processing || bankAccounts.length === 0} whileHover={{ scale: 1.01 }} whileTap={buttonTap}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 transition-all shadow-lg shadow-orange-500/25"
            >
              {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUpRight className="w-5 h-5" />}
              {processing ? t('processing') : t('confirm_withdrawal')}
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    }>
      <WalletPageContent />
    </Suspense>
  );
}
