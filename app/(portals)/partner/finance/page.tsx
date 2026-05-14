'use client';

import { Wallet, ArrowUpRight, ArrowDownLeft, History, Download, CreditCard } from 'lucide-react';
import { useGlobal } from '@/app/providers';

const mockTransactions = [
  { id: 1, type: 'revenue', amount: '+1,200,000', date: '2026-05-14 12:30', status: 'completed' },
  { id: 2, type: 'withdrawal', amount: '-5,000,000', date: '2026-05-13 15:45', status: 'completed' },
  { id: 3, type: 'revenue', amount: '+850,000', date: '2026-05-13 10:20', status: 'completed' },
];

export default function PartnerFinance() {
  const { t } = useGlobal();

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-[#057A42] dark:bg-emerald-900 pt-12 pb-24 px-4 md:rounded-b-[40px] shadow-sm transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-white font-bold text-xl tracking-wide flex items-center gap-2">
            <Wallet className="w-6 h-6" /> {t('finance')}
          </h1>
          <button className="bg-white dark:bg-slate-800 text-[#057A42] dark:text-emerald-400 font-bold px-8 py-3 rounded-2xl flex items-center gap-2 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all shadow-lg border border-transparent dark:border-slate-700">
            <Download className="w-5 h-5" /> Export Report
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-12 space-y-6">
        
        {/* Balance Card */}
        <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-xl border border-gray-100 dark:border-slate-700 relative overflow-hidden transition-all group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#057A42]/5 dark:bg-emerald-500/5 rounded-bl-full -z-0" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <div className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">{t('total_balance')}</div>
              <div className="text-black dark:text-white font-black text-5xl tracking-tight">45,850,000 <span className="text-xl font-bold opacity-60">VNĐ</span></div>
              <div className="flex items-center gap-2 mt-4 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                +15.4% from last month
              </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full md:w-auto">
               <button className="bg-[#ff8c00] dark:bg-orange-600 text-white font-black px-10 py-4 rounded-2xl shadow-[0_10px_20px_rgba(255,140,0,0.2)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                  <CreditCard className="w-5 h-5" /> {t('withdrawal')}
               </button>
               <div className="text-[10px] text-gray-400 dark:text-slate-500 font-bold text-center">Processing time: 2-4 hours</div>
            </div>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="text-black dark:text-white font-black text-sm uppercase tracking-wide flex items-center gap-2">
              <History className="w-4 h-4 text-[#057A42] dark:text-emerald-400" /> {t('recent_transactions')}
            </h2>
            <button className="text-xs font-bold text-[#057A42] dark:text-emerald-400 hover:underline">View All</button>
          </div>
          
          <div className="space-y-3">
             {mockTransactions.map(tx => (
               <div key={tx.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between transition-all hover:translate-x-1">
                  <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tx.type === 'revenue' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' : 'bg-orange-50 dark:bg-orange-900/30 text-orange-600'}`}>
                        {tx.type === 'revenue' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                     </div>
                     <div>
                        <div className="font-bold text-gray-900 dark:text-white text-base capitalize">{tx.type}</div>
                        <div className="text-xs text-gray-400 dark:text-slate-500 font-semibold">{tx.date}</div>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className={`font-black text-lg ${tx.type === 'revenue' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>{tx.amount} đ</div>
                     <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{tx.status}</div>
                  </div>
               </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
}
