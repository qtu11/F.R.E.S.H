'use client';

import { Wallet, CreditCard, History, Settings, ChevronRight } from 'lucide-react';
import { useGlobal } from '@/app/providers';

export default function CustomerProfile() {
  const { t } = useGlobal();

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-[#057A42] dark:bg-emerald-900 pt-12 pb-24 px-4 md:rounded-b-[40px] shadow-lg transition-colors duration-300">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
           <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center text-yellow-700 dark:text-yellow-500 font-bold text-2xl shadow-sm border-2 border-white dark:border-slate-800">
              JD
           </div>
           <div>
              <div className="text-white font-bold text-xl">John Doe</div>
              <div className="text-white/80 dark:text-emerald-200/80 text-sm">john.doe@example.com</div>
           </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-12 relative z-10">
        {/* Wallet Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 mb-6 transition-colors duration-300">
          <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 font-bold text-xs mb-2">
            <Wallet className="w-4 h-4 text-[#057A42] dark:text-emerald-400" /> {t('wallet_balance')}
          </div>
          <div className="text-black dark:text-white font-black text-3xl mb-6">345,000 VND</div>
          
          <div className="grid grid-cols-2 gap-3">
             <button className="bg-[#057A42] dark:bg-emerald-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-[#046034] dark:hover:bg-emerald-700 transition-colors">
                {t('top_up')}
             </button>
             <button className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                {t('withdraw')}
             </button>
          </div>
        </div>

        <h2 className="text-black dark:text-white font-extrabold text-sm mb-4">{t('settings_prefs')}</h2>
        
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden mb-6 transition-colors duration-300">
           {[
             { icon: CreditCard, label: t('payment_methods'), color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
             { icon: History, label: t('transaction_history'), color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30' },
             { icon: Settings, label: t('account_settings'), color: 'text-gray-500 dark:text-slate-400', bg: 'bg-gray-50 dark:bg-slate-700/50' },
           ].map((item, i) => (
             <div key={i} className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-750 cursor-pointer transition-colors">
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

        <button className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold py-4 rounded-2xl border border-red-100 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
          {t('log_out')}
        </button>

      </div>
    </div>
  );
}
