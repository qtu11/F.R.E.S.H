'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CreditCard, TrendingUp, Percent, Download, CheckCircle, Filter, BarChart3, FileText, Loader2 } from 'lucide-react';
import { useGlobal } from '@/app/providers';
import { adminService } from '@/lib/data/admin';
import { showToast } from '@/lib/data/notifications';

const MONTHS = ['Dec', 'Nov', 'Oct', 'Sep', 'Aug', 'Jul'];

const FILTERS = ['All', 'Pending', 'Paid'];

function formatVND(n: number) {
  return n.toLocaleString('vi-VN') + 'đ';
}

function compactVND(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B₫';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + 'M₫';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K₫';
  return n.toLocaleString('vi-VN') + '₫';
}

export default function AdminCommission() {
  const { t } = useGlobal();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number[]>([]);
  const [feeRate, setFeeRate] = useState(15);

  useEffect(() => {
    setMounted(true);
    setLoading(true);
    adminService.getCommission().then(data => {
      if (!data) {
        setLoading(false);
        return;
      }
      if (Array.isArray(data.transactions)) setTransactions(data.transactions);
      if (Array.isArray(data.invoices)) setInvoices(data.invoices);
      if (Array.isArray(data.monthlyRevenue)) setMonthlyRevenue(data.monthlyRevenue);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const filtered = transactions.filter(tx => {
    if (filter === 'Pending') return tx.status === 'Pending';
    if (filter === 'Paid') return tx.status === 'Paid';
    return true;
  });

  const totalPending = transactions.filter(tx => tx.status === 'Pending').reduce((s, tx) => s + tx.net, 0);
  const totalPaid = transactions.filter(tx => tx.status === 'Paid').reduce((s, tx) => s + tx.net, 0);
  const revenueThisMonth = transactions.reduce((s, tx) => s + tx.fee, 0);

  const maxRev = Math.max(...monthlyRevenue, 1);
  const hasRevenueData = monthlyRevenue.length > 0;
  const yLabels = hasRevenueData
    ? (() => {
        const order = Math.pow(10, Math.floor(Math.log10(maxRev)));
        const ceiling = Math.ceil(maxRev / order) * order;
        const step = ceiling / 4;
        return Array.from({ length: 5 }, (_, i) => Math.round(step * (4 - i)));
      })()
    : null;

  const handleMarkPaid = async (id: string) => {
    try {
      const invoiceId = id.startsWith('TX-') ? id.slice(3) : id;
      await adminService.updateInvoice(invoiceId, { status: 'Paid' });
      setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: 'Paid' as const } : tx));
      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'Paid' } : inv));
      showToast('success', 'Đã thanh toán', `Hóa đơn ${invoiceId} đã được đánh dấu là Đã thanh toán.`);
    } catch (err) {
      console.error(err);
      showToast('error', 'Lỗi', 'Không thể cập nhật trạng thái hóa đơn');
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <div className="text-slate-300 text-sm font-medium">Loading commission reports...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-lg transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-white font-bold text-xl tracking-wide flex items-center gap-3">
            <DollarSign className="w-6 h-6" /> Commission & Payouts
          </h1>
          <div className="bg-white/10 px-5 py-2.5 rounded-xl text-white text-xs font-bold border border-white/10 backdrop-blur-md flex items-center gap-2">
            <TrendingUp className="w-3 h-3" /> {formatVND(revenueThisMonth)} This Month
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Platform Revenue</div>
            <div className="text-2xl font-black text-emerald-600">{formatVND(revenueThisMonth)}</div>
            <div className="text-[10px] text-emerald-500 font-bold mt-1">This month</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Pending Payout</div>
            <div className="text-2xl font-black text-yellow-600">{formatVND(totalPending)}</div>
            <div className="text-[10px] text-yellow-500 font-bold mt-1">{transactions.filter(tx => tx.status === 'Pending').length} transactions</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Paid</div>
            <div className="text-2xl font-black text-blue-600">{formatVND(totalPaid)}</div>
            <div className="text-[10px] text-blue-500 font-bold mt-1">All time</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Platform Fee Rate</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-gray-900 dark:text-white">{feeRate}%</span>
              <div className="flex gap-1">
                <button onClick={() => setFeeRate(Math.min(30, feeRate + 1))} className="w-6 h-6 rounded-md bg-gray-100 dark:bg-slate-700 text-xs font-bold hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-gray-600 dark:text-slate-300">+</button>
                <button onClick={() => setFeeRate(Math.max(5, feeRate - 1))} className="w-6 h-6 rounded-md bg-gray-100 dark:bg-slate-700 text-xs font-bold hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-gray-600 dark:text-slate-300">-</button>
              </div>
            </div>
            <div className="text-[10px] text-gray-400 font-bold mt-1">Configurable</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-black dark:text-white font-extrabold text-sm uppercase tracking-wide flex items-center gap-2">
                <BarChart3 className="w-4 h-5 text-slate-600 dark:text-slate-400" /> Monthly Revenue
              </h3>
              <span className="text-[10px] text-gray-400 bg-gray-50 dark:bg-slate-700 px-2 py-1 rounded-md font-mono">Last 6 months</span>
            </div>
            <div className="relative h-48">
              <div className="absolute left-0 top-0 bottom-8 w-10 flex flex-col justify-between text-[10px] text-gray-400 dark:text-slate-500 font-bold items-end pr-2">
                {hasRevenueData ? yLabels!.map(v => <span key={v}>{compactVND(v)}</span>) : <><span>—</span><span>—</span><span>—</span><span>—</span><span>—</span></>}
              </div>
              <div className="absolute left-10 right-0 top-0 bottom-8 flex items-end justify-around gap-2">
                {monthlyRevenue.map((val, i) => (
                  <div key={i} className="w-full flex flex-col items-center gap-1 group">
                    <span className="text-[8px] font-bold text-gray-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">{formatVND(val)}</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(val / maxRev) * 100}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="w-full bg-gradient-to-t from-slate-700 to-slate-500 dark:from-slate-600 dark:to-slate-400 rounded-t-md group-hover:brightness-110 transition-all"
                    />
                    <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400">{MONTHS[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="text-black dark:text-white font-extrabold text-sm uppercase tracking-wide flex items-center gap-2 mb-4">
              <FileText className="w-4 h-5 text-slate-600 dark:text-slate-400" /> Recent Invoices
            </h3>
            <div className="space-y-3">
              {invoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700">
                  <div>
                    <div className="text-xs font-bold text-gray-900 dark:text-white">{inv.store}</div>
                    <div className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">{inv.id} &middot; {inv.period}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-gray-800 dark:text-slate-200">{formatVND(inv.amount)}</span>
                    <button className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <h3 className="font-extrabold text-sm uppercase tracking-wide text-gray-700 dark:text-slate-300">Payout Transactions</h3>
          <div className="flex gap-2">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === f ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-800 rounded-[32px] shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Store</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Commission Earned</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Platform Fee ({feeRate}%)</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Net Payout</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filtered.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-white text-sm">{tx.store}</div>
                      <div className="text-[10px] text-gray-400 dark:text-slate-500 font-bold">{tx.id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-slate-200">{formatVND(tx.earned)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-red-500">{formatVND(tx.fee)}</td>
                    <td className="px-6 py-4 text-sm font-black text-emerald-600">{formatVND(tx.net)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border ${tx.status === 'Paid' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-slate-400">{tx.date}</td>
                    <td className="px-6 py-4 text-right">
                      {tx.status === 'Pending' && (
                        <button onClick={() => handleMarkPaid(tx.id)} className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-emerald-100 dark:hover:bg-emerald-800/50 transition-all hover:scale-105 flex items-center gap-1.5 ml-auto">
                          <CheckCircle className="w-3.5 h-3.5" /> Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-12 text-center">
              <CreditCard className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600 mb-3" />
              <p className="text-gray-500 dark:text-slate-400 font-bold">No transactions match your filter</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
