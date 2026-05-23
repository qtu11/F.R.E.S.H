'use client';

import { useState, useEffect } from 'react';
import { Ticket, Copy, Check, Clock, Gift, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobal } from '@/app/providers';
import { useAuth } from '@/app/contexts/AuthContext';
import { showToast } from '@/lib/data/notifications';
import { voucherService } from '@/lib/data/vouchers';
import { transactionService } from '@/lib/data/transactions';

type VoucherTab = 'available' | 'used' | 'expired';

const tabs: { key: VoucherTab; label: string }[] = [
  { key: 'available', label: 'Available' },
  { key: 'used', label: 'Used' },
  { key: 'expired', label: 'Expired' },
];

interface Voucher {
  id: string;
  code: string;
  title: string;
  store: string;
  discount: string;
  discountValue: number;
  minOrder: string;
  expiry: string;
  status: VoucherTab;
  icon: string;
}

export default function CustomerVouchers() {
  const { t } = useGlobal();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<VoucherTab>('available');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [spentToUnlock, setSpentToUnlock] = useState(50000);
  const [currentSpend, setCurrentSpend] = useState(0);

  useEffect(() => {
    setMounted(true);
    const uid = user?.id || '';
    transactionService.getByUser(uid).then(txs => {
      const total = (txs || []).reduce((s: number, tx: any) => s + (tx.amount || 0), 0);
      setCurrentSpend(total);
    }).catch(err => {
      console.error(err);
    });
    Promise.all([
      voucherService.getByUser(uid),
      voucherService.getAll(),
    ]).then(([userVouchers, allVouchers]) => {
      const now = new Date();
      const claimedIds = new Set(userVouchers.map((uv: any) => uv.voucherId));
      const mapped: Voucher[] = [
        ...userVouchers.map((uv: any) => {
          const v = uv.voucher || {};
          const isUsed = !!uv.usedAt;
          const isExpired = v.validUntil && new Date(v.validUntil) < now;
          const status: VoucherTab = isUsed ? 'used' : isExpired ? 'expired' : 'available';
          return {
            id: uv.id,
            code: v.code || '',
            title: v.title || 'Voucher',
            store: v.description || 'All Stores',
            discount: v.discountValue ? `${v.discountValue}% OFF` : 'Special',
            discountValue: v.discountValue || 0,
            minOrder: v.minOrder ? `${v.minOrder.toLocaleString()}đ` : '0đ',
            expiry: v.validUntil ? new Date(v.validUntil).toLocaleDateString() : 'N/A',
            status,
            icon: '🎫',
          };
        }),
        ...allVouchers
          .filter((v: any) => !claimedIds.has(v.id))
          .slice(0, 10)
          .map((v: any) => ({
            id: v.id,
            code: v.code || '',
            title: v.title || 'Voucher',
            store: v.description || 'All Stores',
            discount: v.discountValue ? `${v.discountValue}% OFF` : 'Special',
            discountValue: v.discountValue || 0,
            minOrder: v.minOrder ? `${v.minOrder.toLocaleString()}đ` : '0đ',
            expiry: v.validUntil ? new Date(v.validUntil).toLocaleDateString() : 'N/A',
            status: (v.status === 'expired' ? 'expired' : 'available') as VoucherTab,
            icon: '🎫',
          })),
      ];
      setVouchers(mapped);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      showToast('error', 'Failed to load vouchers');
      setLoading(false);
    });
  }, [user]);

  const filtered = vouchers.filter(v => v.status === activeTab);

  const copyCode = (voucher: Voucher) => {
    navigator.clipboard.writeText(voucher.code);
    setCopiedId(voucher.id);
    showToast('success', 'Code copied!', `${voucher.code} copied to clipboard.`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-[#057A42] dark:bg-emerald-900 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-sm transition-colors">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Ticket className="w-6 h-6 text-white" />
          <span className="text-white font-bold text-xl tracking-wide">Vouchers</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-4 space-y-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400">Spend {currentSpend.toLocaleString()}đ more to unlock next voucher</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${(currentSpend / spentToUnlock) * 100}%` }} transition={{ duration: 1 }}
              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 relative"
            >
              <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
            </motion.div>
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] font-bold text-gray-400 dark:text-slate-500">
            <span>{currentSpend.toLocaleString()}đ spent</span>
            <span>{spentToUnlock.toLocaleString()}đ goal</span>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 px-5 py-2.5 rounded-full text-xs font-bold border transition-all ${
                activeTab === tab.key
                  ? 'bg-[#057A42] text-white border-[#057A42] shadow-md'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-[#057A42]/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {!mounted || loading ? null : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center shadow-sm border border-gray-100 dark:border-slate-700">
            <Ticket className="w-16 h-16 mx-auto text-gray-300 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No {activeTab} vouchers</h3>
            <p className="text-gray-500 dark:text-slate-400 font-medium">Keep rescuing to earn more vouchers!</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((voucher, i) => {
                const isUnusable = voucher.status === 'used' || voucher.status === 'expired';
                return (
                  <motion.div key={voucher.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className={`bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border transition-all ${isUnusable ? 'border-gray-200 dark:border-slate-700 opacity-60' : 'border-gray-100 dark:border-slate-700 hover:shadow-md'}`}
                  >
                    <div className="flex">
                      <div className={`w-24 shrink-0 flex items-center justify-center text-3xl ${isUnusable ? 'bg-gray-100 dark:bg-slate-700' : 'bg-[#057A42]/10 dark:bg-emerald-900/30'}`}>
                        {voucher.icon}
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{voucher.title}</h3>
                            <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">{voucher.store}</p>
                          </div>
                          <span className={`text-xs font-black px-2 py-1 rounded-lg ${isUnusable ? 'text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-700' : 'text-orange-600 bg-orange-50 dark:bg-orange-900/30'}`}>
                            {voucher.discount}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-slate-500 font-medium mt-2">
                          <span className="flex items-center gap-1"><Gift className="w-3 h-3" /> Min: {voucher.minOrder}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {voucher.expiry}</span>
                        </div>
                        {!isUnusable && (
                          <div className="mt-3 flex items-center gap-2">
                            <div className="bg-gray-50 dark:bg-slate-700 border border-dashed border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-gray-700 dark:text-slate-300 tracking-wider flex-1">
                              {voucher.code}
                            </div>
                            <button onClick={() => copyCode(voucher)}
                              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                                copiedId === voucher.id
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-[#057A42] text-white hover:bg-[#046034]'
                              }`}
                            >
                              {copiedId === voucher.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              {copiedId === voucher.id ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        )}
                        {isUnusable && (
                          <div className="mt-3">
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                              voucher.status === 'used' ? 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400' : 'bg-red-50 dark:bg-red-900/20 text-red-500'
                            }`}>
                              {voucher.status === 'used' ? '✓ Used' : '✗ Expired'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
