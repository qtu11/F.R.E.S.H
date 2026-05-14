'use client';

import { Leaf, Award, Trees } from 'lucide-react';
import { useGlobal } from '@/app/providers';

export default function CustomerImpact() {
  const { t } = useGlobal();

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-[#057A42] dark:bg-emerald-900 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-sm transition-colors duration-300">
        <div className="max-w-5xl mx-auto text-white font-bold text-xl tracking-wide flex justify-between items-center">
          <div>{t('my_esg_impact')}</div>
          <div className="bg-white/20 dark:bg-white/10 px-3 py-1 rounded-full text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-300 dark:text-yellow-400" /> {t('top_5')}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6">
        {/* Main Impact Card */}
        <div className="bg-gradient-to-br from-[#e8f5e9] to-white dark:from-slate-800 dark:to-slate-800 rounded-3xl p-6 shadow-sm border border-green-100 dark:border-slate-700 mb-6 transition-colors duration-300">
           <div className="text-center mb-6">
              <div className="w-20 h-20 bg-[#057A42] dark:bg-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800 mb-3">
                 <Leaf className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-gray-600 dark:text-slate-400 font-bold text-xs tracking-wider mb-1">{t('lifetime_co2_reduced')}</h2>
              <div className="text-black dark:text-white font-black text-4xl">145.2 kg</div>
           </div>
           
           <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 grid grid-cols-2 gap-4 border border-gray-100 dark:border-slate-700">
             <div className="text-center border-r border-gray-100 dark:border-slate-700">
                <div className="text-gray-400 dark:text-slate-500 font-bold text-[10px] mb-1">{t('equivalent_to')}</div>
                <div className="flex justify-center items-center gap-1 text-[#057A42] dark:text-emerald-400 font-black text-lg">
                  <Trees className="w-5 h-5" /> 12 {t('trees')}
                </div>
             </div>
             <div className="text-center">
                <div className="text-gray-400 dark:text-slate-500 font-bold text-[10px] mb-1">{t('food_saved')}</div>
                <div className="text-orange-500 dark:text-orange-400 font-black text-lg">
                  48 {t('meals')}
                </div>
             </div>
           </div>
        </div>

        <h2 className="text-black dark:text-white font-extrabold text-sm mb-4">{t('monthly_progress')}</h2>
        
        {/* Chart Mockup */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 mb-6 transition-colors duration-300">
          <div className="flex justify-between items-end h-32 pb-4 border-b border-gray-100 dark:border-slate-700">
             {[30, 45, 25, 60, 40, 75].map((val, i) => (
               <div key={i} className="w-8 md:w-12 bg-green-100 dark:bg-emerald-900/30 rounded-t-lg relative group transition-all hover:bg-green-200 dark:hover:bg-emerald-800/50" style={{ height: `${val}%` }}>
                 <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 dark:bg-gray-100 text-white dark:text-black text-[10px] px-2 py-1 rounded">
                   {val}kg
                 </div>
               </div>
             ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400 dark:text-slate-500">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          </div>
        </div>

      </div>
    </div>
  );
}
