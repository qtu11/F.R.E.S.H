'use client';

import { Zap, TrendingUp, BarChart3, Settings, Info, PlayCircle } from 'lucide-react';
import { useGlobal } from '@/app/providers';

export default function PartnerPricing() {
  const { t } = useGlobal();

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-[#057A42] dark:bg-emerald-900 pt-12 pb-24 px-4 md:rounded-b-[40px] shadow-sm transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-white font-bold text-xl tracking-wide flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-300" /> {t('pricing')}
            </h1>
            <p className="text-white/70 text-sm mt-1">Real-time dynamic pricing powered by AI.</p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 dark:bg-slate-900/40 p-1.5 rounded-2xl border border-white/20 dark:border-slate-700">
             <button className="px-6 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-[#057A42] dark:text-emerald-400 font-bold text-sm shadow-md transition-all">
                {t('auto_pilot')}
             </button>
             <button className="px-6 py-2.5 rounded-xl text-white font-bold text-sm hover:bg-white/10 transition-all">
                {t('cancel')}
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-12 space-y-6">
        
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all">
             <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                   <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <Info className="w-4 h-4 text-gray-300 dark:text-slate-600" />
             </div>
             <div className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">{t('sales_prediction')}</div>
             <div className="text-black dark:text-white font-black text-3xl">+85% <span className="text-xs text-green-500 font-bold ml-1">Lift</span></div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all">
             <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
                   <Zap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <Info className="w-4 h-4 text-gray-300 dark:text-slate-600" />
             </div>
             <div className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">{t('ai_confidence')}</div>
             <div className="text-black dark:text-white font-black text-3xl">98.4%</div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all">
             <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-xl">
                   <BarChart3 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <Info className="w-4 h-4 text-gray-300 dark:text-slate-600" />
             </div>
             <div className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">Optimizations Done</div>
             <div className="text-black dark:text-white font-black text-3xl">1,240</div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700 min-h-[400px] flex flex-col transition-colors">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-black dark:text-white font-bold text-lg tracking-tight uppercase">{t('revenue_chart')}</h3>
             <div className="flex gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-slate-400">
                   <div className="w-3 h-3 bg-[#057A42] rounded-full" /> AI Price
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-slate-400">
                   <div className="w-3 h-3 bg-gray-200 dark:bg-slate-600 rounded-full" /> Fixed Price
                </span>
             </div>
          </div>
          
          <div className="relative flex-1 border-l-2 border-b-2 border-gray-100 dark:border-slate-700 mt-4 mb-8">
             <svg viewBox="0 0 100 40" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                <path d="M 0 35 L 20 28 L 40 32 L 60 15 L 80 18 L 100 5" fill="none" stroke="#057A42" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeDasharray="0" />
                <path d="M 0 35 L 100 35" fill="none" stroke="#e2e8f0" strokeWidth="0.5" vectorEffect="non-scaling-stroke" strokeDasharray="4 4" />
             </svg>
             <div className="absolute inset-0 flex justify-around items-end pt-4 pb-1">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="group relative flex flex-col items-center">
                    <div className="w-2 h-2 bg-[#057A42] rounded-full shadow-[0_0_8px_rgba(5,122,66,0.5)] cursor-pointer hover:scale-150 transition-transform" />
                    <div className="absolute -top-10 scale-0 group-hover:scale-100 bg-black dark:bg-slate-900 text-white px-2 py-1 rounded text-[10px] transition-transform whitespace-nowrap z-20">Price: 15.4k đ</div>
                  </div>
                ))}
             </div>
          </div>
          
          <div className="flex justify-between px-2 text-[10px] font-bold text-gray-400 dark:text-slate-500">
             <span>08:00</span><span>10:00</span><span>12:00</span><span>14:00</span><span>16:00</span><span>18:00</span>
          </div>
        </div>

      </div>
    </div>
  );
}
