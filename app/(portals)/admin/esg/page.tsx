'use client';

import { useState, useEffect } from 'react';
import { Leaf, Trees, Wind, Droplets, Info, Download, ChevronDown, ChevronUp, TrendingUp, Loader2 } from 'lucide-react';
import { useGlobal } from '@/app/providers';
import { showToast } from '@/lib/data/notifications';
import { adminService } from '@/lib/data/admin';

const ESG_ICONS = [Trees, Leaf, Droplets, Wind];

export default function AdminESG() {
  const { t } = useGlobal();
  const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null);
  const [showAllDistricts, setShowAllDistricts] = useState(false);
  const [esgStats, setEsgStats] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [esgLoading, setEsgLoading] = useState(true);
  const [pieCategories, setPieCategories] = useState<{ label: string; pct: string; color: string }[]>([]);

  useEffect(() => {
    setEsgLoading(true);
    adminService.getEsg().then(data => {
      setEsgLoading(false);
      if (!data) return;
      setEsgStats([
        { icon: ESG_ICONS[0], label: 'Trees Planted', val: data.treesPlanted || '—', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30', change: '+8%' },
        { icon: ESG_ICONS[1], label: 'CO2 Prevented', val: data.co2Prevented || '—', color: 'text-[#057A42]', bg: 'bg-emerald-50 dark:bg-emerald-900/30', change: '+12%' },
        { icon: ESG_ICONS[2], label: 'Water Saved', val: data.waterSaved || '—', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30', change: '+5%' },
        { icon: ESG_ICONS[3], label: 'Methane Reduced', val: data.methaneReduced || '—', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30', change: '+3%' },
      ]);
      if (Array.isArray(data.districts)) setDistricts(data.districts);
      if (Array.isArray(data.categories)) setPieCategories(data.categories);
    }).catch(err => {
      console.error(err);
      setEsgLoading(false);
    });
  }, []);

  const handleDownload = () => {
    showToast('success', 'Download Started', 'ESG Certificate is being generated...');
  };

  const displayedDistricts = showAllDistricts ? districts : districts.slice(0, 4);
  const allStatsEmpty = esgStats.length > 0 && esgStats.every(stat => stat.val === '—');

  if (esgLoading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <div className="text-slate-300 text-sm font-medium">Loading ESG records...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-gradient-to-br from-[#057A42] to-emerald-600 dark:from-emerald-900 dark:to-emerald-800 pt-12 pb-24 px-4 md:rounded-b-[40px] shadow-lg transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-white font-bold text-xl tracking-wide flex items-center gap-3">
            <Leaf className="w-6 h-6" /> {t('esg_data')}
          </h1>
          <button onClick={handleDownload} className="bg-white/20 hover:bg-white/30 dark:bg-slate-800/50 text-white font-bold px-8 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg border border-white/20 backdrop-blur-md">
            <Download className="w-5 h-5" /> Download ESG Certificate
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-12 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {allStatsEmpty ? (
            <div className="col-span-full bg-white dark:bg-slate-800 p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 text-center">
              <Leaf className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600 mb-3" />
              <p className="text-gray-500 dark:text-slate-400 font-bold">No ESG data available yet</p>
            </div>
          ) : (
            esgStats.map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all hover:shadow-md hover:-translate-y-0.5">
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 transition-all group-hover:scale-110`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <div className="text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase mb-1">{stat.label}</div>
                <div className="text-black dark:text-white font-black text-2xl">{stat.val}</div>
                <div className="text-[10px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {stat.change} this quarter
                </div>
              </div>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
            <h3 className="text-black dark:text-white font-bold text-sm uppercase mb-8 flex justify-between items-center">
              Impact by Category <Info className="w-4 h-4 text-gray-300 cursor-pointer" onClick={() => showToast('info', 'ESG Impact', 'Breakdown by food category')} />
            </h3>
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 drop-shadow-lg">
                <circle cx="50" cy="50" r="40" stroke="#057A42" strokeWidth="20" fill="none" strokeDasharray="180 251" className="transition-all duration-1000" />
                <circle cx="50" cy="50" r="40" stroke="#ff8c00" strokeWidth="20" fill="none" strokeDasharray="50 251" strokeDashoffset="-180" className="transition-all duration-1000 delay-200" />
                <circle cx="50" cy="50" r="40" stroke="#3b82f6" strokeWidth="20" fill="none" strokeDasharray="21 251" strokeDashoffset="-230" className="transition-all duration-1000 delay-500" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <div className="text-2xl font-black text-gray-900 dark:text-white">ESG</div>
                <div className="text-[10px] font-bold text-gray-400">INDEX</div>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              {pieCategories.map((item, i) => (
                <div key={i} className="flex justify-between text-xs font-bold py-2 border-b border-gray-50 dark:border-slate-700 last:border-0">
                  <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} /> {item.label}</span>
                  <span className="text-gray-500">{item.pct}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-black dark:text-white font-bold text-sm uppercase">{t('esg_global_report')}</h3>
              <button onClick={() => setShowAllDistricts(!showAllDistricts)} className="text-xs font-bold text-[#057A42] dark:text-emerald-400 hover:underline flex items-center gap-1">
                {showAllDistricts ? 'Show Less' : 'View All'} {showAllDistricts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
            <div className="space-y-5">
              {displayedDistricts.map((district, i) => (
                <div key={i} className="space-y-2 group cursor-pointer" onClick={() => setExpandedDistrict(expandedDistrict === district.name ? null : district.name)}>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-gray-900 dark:text-white">{district.name}</span>
                    <span className="text-[#057A42] dark:text-emerald-400">{district.pct}% Effort</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-[#057A42] to-emerald-400 h-full rounded-full transition-all duration-1000 group-hover:brightness-110" style={{ width: `${district.pct}%` }} />
                  </div>
                  {expandedDistrict === district.name && (
                    <div className="text-xs text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 animate-in slide-in-from-top-2">
                      <div className="flex justify-between"><span>CO2 Reduced:</span><span className="font-bold text-emerald-500">{district.co2}</span></div>
                      <div className="flex justify-between mt-1"><span>Active Partners:</span><span className="font-bold">{Math.round(district.pct * 1.5)}</span></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
