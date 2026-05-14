'use client';

import { Leaf, Trees, Wind, Droplets, PieChart, Info, Download } from 'lucide-react';
import { useGlobal } from '@/app/providers';

export default function AdminESG() {
  const { t } = useGlobal();

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-[#057A42] dark:bg-emerald-900 pt-12 pb-24 px-4 md:rounded-b-[40px] shadow-sm transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-white font-bold text-xl tracking-wide flex items-center gap-3">
            <Leaf className="w-6 h-6" /> {t('esg_data')}
          </h1>
          <button className="bg-white dark:bg-slate-800 text-[#057A42] dark:text-emerald-400 font-bold px-8 py-3 rounded-2xl flex items-center gap-2 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all shadow-lg border border-transparent dark:border-slate-700">
            <Download className="w-5 h-5" /> Download ESG Certificate
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-12 space-y-6">
        
        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { icon: Trees, label: 'Trees Planted', val: '12,500', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30' },
             { icon: Leaf, label: 'CO2 Prevented', val: '45.2 Tons', color: 'text-[#057A42]', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
             { icon: Droplets, label: 'Water Saved', val: '150k Liters', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
             { icon: Wind, label: 'Methane Reduced', val: '8.4 Tons', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30' },
           ].map((stat, i) => (
             <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                   <stat.icon className="w-7 h-7" />
                </div>
                <div className="text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase mb-1">{stat.label}</div>
                <div className="text-black dark:text-white font-black text-2xl">{stat.val}</div>
             </div>
           ))}
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Pie Chart Mock */}
           <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
              <h3 className="text-black dark:text-white font-bold text-sm uppercase mb-8 flex justify-between items-center">
                 Impact by Category <Info className="w-4 h-4 text-gray-300" />
              </h3>
              <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                 <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" stroke="#057A42" strokeWidth="20" fill="none" strokeDasharray="180 251" />
                    <circle cx="50" cy="50" r="40" stroke="#ff8c00" strokeWidth="20" fill="none" strokeDasharray="50 251" strokeDashoffset="-180" />
                    <circle cx="50" cy="50" r="40" stroke="#3b82f6" strokeWidth="20" fill="none" strokeDasharray="21 251" strokeDashoffset="-230" />
                 </svg>
                 <div className="absolute flex flex-col items-center">
                    <div className="text-2xl font-black text-gray-900 dark:text-white">ESG</div>
                    <div className="text-[10px] font-bold text-gray-400">INDEX</div>
                 </div>
              </div>
              <div className="mt-8 space-y-2">
                 <div className="flex justify-between text-xs font-bold">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#057A42]" /> Bakery</span>
                    <span className="text-gray-500">72%</span>
                 </div>
                 <div className="flex justify-between text-xs font-bold">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#ff8c00]" /> Dairy</span>
                    <span className="text-gray-500">20%</span>
                 </div>
                 <div className="flex justify-between text-xs font-bold">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Produce</span>
                    <span className="text-gray-500">8%</span>
                 </div>
              </div>
           </div>

           {/* District Performance */}
           <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
              <h3 className="text-black dark:text-white font-bold text-sm uppercase mb-8">{t('esg_global_report')}</h3>
              <div className="space-y-6">
                 {['District 1', 'District 7', 'District 2', 'Binh Thanh'].map((district, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm font-bold">
                         <span className="text-gray-900 dark:text-white">{district}</span>
                         <span className="text-[#057A42] dark:text-emerald-400">{(100 - i * 15)}% Effort</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                         <div className="bg-[#057A42] h-full rounded-full" style={{ width: `${100 - i * 15}%` }} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
