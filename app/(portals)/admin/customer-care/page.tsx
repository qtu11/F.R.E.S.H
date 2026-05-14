'use client';

import { Headphones, Activity, AlertCircle } from 'lucide-react';
import { useGlobal } from '@/app/providers';

export default function CustomerCareDashboard() {
  const { t } = useGlobal();

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-[#057A42] dark:bg-emerald-900 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-sm transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-3">
               <Headphones className="w-6 h-6" />
               {t('customer_care')}
            </h1>
          </div>
          <div className="bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 px-4 py-2 rounded-xl text-white text-sm font-semibold flex items-center gap-2 transition-colors">
             <span className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
             AI Engine: Full Capacity
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
           <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
               <div className="text-gray-500 dark:text-slate-400 text-xs font-bold mb-1">{t('live_tickets')}</div>
               <div className="text-3xl text-black dark:text-white font-black mb-1">245</div>
               <div className="text-[10px] font-bold text-blue-500 dark:text-blue-400">+12% vs last hour</div>
           </div>
           <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
               <div className="text-gray-500 dark:text-slate-400 text-xs font-bold mb-1">{t('ai_resolution_rate')}</div>
               <div className="text-3xl text-[#057A42] dark:text-emerald-400 font-black mb-1">86%</div>
               <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500">{t('target')} &gt; 85%</div>
           </div>
           <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
               <div className="text-gray-500 dark:text-slate-400 text-xs font-bold mb-1">{t('human_handoff_rate')}</div>
               <div className="text-3xl text-orange-500 dark:text-orange-400 font-black mb-1">14%</div>
               <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500">Primarily dispute related</div>
           </div>
           <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
               <div className="text-gray-500 dark:text-slate-400 text-xs font-bold mb-1">{t('avg_resolution_time')}</div>
               <div className="text-3xl text-black dark:text-white font-black mb-1">1.2m</div>
               <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500">AI responds in &lt; 1s</div>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col transition-colors">
           <div className="flex items-center gap-2 text-black dark:text-white font-extrabold text-sm mb-4">
               <AlertCircle className="w-5 h-5 text-orange-500 dark:text-orange-400" />
               {t('live_system_alerts')}
           </div>
           <div className="space-y-3">
               {[1,2,3].map((i) => (
                   <div key={i} className="bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 p-4 rounded-2xl transition-colors">
                       <div className="flex items-start justify-between mb-2">
                           <span className="bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded transition-colors">{t('handoff_request')}</span>
                           <span className="text-xs text-gray-400 dark:text-slate-500 font-semibold">{t('just_now')}</span>
                       </div>
                       <p className="text-sm text-gray-600 dark:text-slate-400 font-medium">{t('customer_frustrated')}</p>
                       <button className="mt-3 bg-orange-500 dark:bg-orange-600 hover:bg-orange-600 dark:hover:bg-orange-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all">{t('take_over')}</button>
                   </div>
               ))}
           </div>
        </div>

      </div>
    </div>
  );
}
