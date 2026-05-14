'use client';

import { Menu } from 'lucide-react';
import Image from 'next/image';
import { useGlobal } from '@/app/providers';

export default function AdminApp() {
  const { t } = useGlobal();

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      {/* Green Header Area */}
      <div className="bg-[#057A42] dark:bg-emerald-900 pt-12 pb-6 px-4 flex items-center gap-4 md:rounded-b-[40px] shadow-sm transition-colors duration-300">
        <div className="max-w-6xl mx-auto w-full flex items-center gap-4">
          <button className="md:hidden text-white hover:bg-white/10 p-1 rounded transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <div className="text-white font-bold text-lg tracking-wide uppercase">
            {t('admin_console')}
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 mt-4">
        
        {/* Top Impact and Status Row for Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Impact Card */}
          <div className="lg:col-span-2 bg-[#e1f5fe] dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-blue-100 dark:border-slate-700 flex flex-col justify-center transition-colors duration-300">
            <h3 className="text-black dark:text-white font-extrabold text-sm uppercase tracking-wide mb-4 border-b border-blue-200 dark:border-slate-700 pb-3">
              {t('global_impact')}
            </h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-gray-600 dark:text-slate-400 font-bold text-xs tracking-wider mb-2 uppercase">{t('total_food_rescued')}</div>
                <div className="text-black dark:text-white font-black text-4xl">1500 kg</div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-slate-400 font-bold text-xs tracking-wider mb-2 uppercase">{t('total_co2_reduced')}</div>
                <div className="text-black dark:text-white font-black text-4xl">5400 kg</div>
              </div>
            </div>
          </div>

          {/* AI Logs */}
          <div className="bg-gray-800 dark:bg-slate-900 rounded-3xl p-6 text-xs text-green-400 font-semibold space-y-2 font-mono shadow-inner border border-gray-700 dark:border-slate-800 flex flex-col justify-end">
             <div className="text-gray-400 dark:text-slate-500 mb-2 border-b border-gray-700 dark:border-slate-800 pb-2">{t('system_logs')}</div>
            <div>{t('ai_pricing_status')}</div>
            <div>{t('ai_pricing_status')}</div>
            <div>{t('ai_pricing_status')}</div>
            <div>{t('ai_pricing_status')}</div>
            <div className="animate-pulse text-white mt-2">_</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Line Chart Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col min-h-[250px] transition-colors duration-300">
            <h3 className="text-black dark:text-white font-extrabold text-xs uppercase tracking-wide mb-4 leading-tight">
              {t('network_co2')}
            </h3>
            <div className="relative flex-1 mt-4">
               <div className="absolute left-0 top-0 bottom-8 w-6 flex flex-col justify-between text-[10px] text-gray-400 dark:text-slate-500 font-bold items-end pr-2">
                 <span>600</span><span>400</span><span>200</span><span>0</span>
               </div>
               <div className="absolute left-8 right-4 top-0 bottom-8 border-l border-b border-gray-200 dark:border-slate-700">
                  <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible preserve-3d" preserveAspectRatio="none">
                     <path d="M 0 100 L 20 80 L 40 75 L 60 40 L 80 30 L 100 10" fill="none" stroke="#057A42" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                     <path d="M 0 100 L 20 80 L 40 75 L 60 40 L 80 30 L 100 10 L 100 100 Z" fill="#e8f5e9" className="dark:fill-emerald-900/40" opacity="0.6" />
                  </svg>
               </div>
            </div>
          </div>

          {/* Map Chart Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col min-h-[250px] transition-colors duration-300">
            <h3 className="text-black dark:text-white font-extrabold text-xs uppercase tracking-wide mb-4 leading-tight">
              {t('growth_district')}
            </h3>
            <div className="relative flex-1 flex items-center justify-center p-4">
               <svg viewBox="0 0 100 100" className="w-full h-full opacity-90 dark:opacity-70 drop-shadow-md" fill="none" stroke="#ffffff" strokeWidth="1.5">
                 <path d="M 20 50 Q 30 30 50 40 T 80 50 T 60 80 Z" fill="#b2dfdb" />
                 <path d="M 50 40 Q 60 20 80 30 T 90 60 T 60 80 Z" fill="#057A42" />
                 <path d="M 20 50 Q 10 60 30 80 T 60 80 Z" fill="#ffcc80" />
                 <path d="M 60 80 Q 80 90 90 60 Z" fill="#ff8c00" />
               </svg>
            </div>
          </div>

          {/* Bar Chart Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col min-h-[250px] lg:col-span-1 md:col-span-2 transition-colors duration-300">
            <h3 className="text-black dark:text-white font-extrabold text-xs uppercase tracking-wide mb-6">
              {t('dynamic_pricing_perf')}
            </h3>
            <div className="relative flex-1 ml-8 mb-6 mt-2">
              <div className="absolute -left-8 top-0 bottom-0 w-6 flex flex-col justify-between text-[9px] text-gray-400 dark:text-slate-500 font-bold items-end pr-2">
                <span>1200</span><span>800</span><span>400</span><span>0</span>
              </div>
              <div className="absolute left-0 right-0 top-0 bottom-0 border-l border-b border-gray-200 dark:border-slate-700 flex items-end justify-around px-2 gap-2">
                {[
                  { h1: '60%', h2: '40%' },
                  { h1: '80%', h2: '30%' },
                  { h1: '90%', h2: '50%' },
                  { h1: '70%', h2: '60%' },
                ].map((bar, i) => (
                  <div key={i} className="w-full flex items-end gap-[2px] h-full pt-4">
                    <div className="w-1/2 bg-[#057A42] rounded-t-sm" style={{ height: bar.h1 }}></div>
                    <div className="w-1/2 bg-[#ff8c00] rounded-t-sm" style={{ height: bar.h2 }}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
