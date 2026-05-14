'use client';

import { ShieldAlert, AlertTriangle, Terminal, Search, Info, Map as MapIcon } from 'lucide-react';
import { useGlobal } from '@/app/providers';

const mockFraudLogs = [
  { id: 1, type: 'Multiple Account Abuse', store: 'WinMart+ D1', risk: 'High', score: 92, time: '10m ago' },
  { id: 2, type: 'Dynamic Price Manipulation', store: 'Circle K D3', risk: 'Medium', score: 65, time: '45m ago' },
  { id: 3, type: 'Voucher Farming', store: 'GS25 - Dist 1', risk: 'Critical', score: 98, time: '1h ago' },
];

export default function AdminFraud() {
  const { t } = useGlobal();

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-[#057A42] dark:bg-emerald-900 pt-12 pb-24 px-4 md:rounded-b-[40px] shadow-sm transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-white font-bold text-xl tracking-wide flex items-center gap-3">
            <ShieldAlert className="w-6 h-6" /> {t('fraud_log')}
          </h1>
          <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 px-6 py-2.5 rounded-2xl text-white font-bold text-sm backdrop-blur-md">
             <AlertTriangle className="w-5 h-5 text-yellow-400" /> 12 Active Alerts
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-12 space-y-6">
        
        {/* Anomaly Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Terminal View */}
           <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800 font-mono text-xs overflow-hidden h-[350px] relative">
              <div className="flex items-center gap-2 mb-4 text-slate-500 border-b border-slate-800 pb-2">
                 <Terminal className="w-4 h-4" /> AI_FRAUD_ENGINE_V2_LOGS
              </div>
              <div className="space-y-1 text-emerald-500">
                 <div>[DEBUG] Initializing Anomaly Scanner...</div>
                 <div>[INFO] Pattern matching against 15.4k transactions...</div>
                 <div className="text-yellow-400 font-bold">[WARN] Potential Sybil Attack detected at store_id: 8829</div>
                 <div className="text-red-500 font-black animate-pulse">[FATAL] High Frequency Vulnerability triggered (Score: 98)</div>
                 <div>[INFO] Blocking IP: 112.44.55.xxx...</div>
                 <div>[INFO] Session terminated for uid: user_88219</div>
                 <div className="text-slate-500 mt-4">_</div>
              </div>
           </div>

           {/* Hotspot Map Mock */}
           <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col h-[350px]">
              <h3 className="text-black dark:text-white font-bold text-sm uppercase mb-4 flex items-center gap-2">
                 <MapIcon className="w-4 h-4 text-orange-500" /> Fraud Hotspots
              </h3>
              <div className="flex-1 bg-gray-100 dark:bg-slate-900 rounded-2xl relative overflow-hidden flex items-center justify-center">
                 <div className="absolute top-1/3 left-1/2 w-20 h-20 bg-red-500/20 rounded-full animate-ping" />
                 <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-orange-500/20 rounded-full animate-pulse" />
                 <span className="text-[10px] font-bold text-gray-400 dark:text-slate-600">HCMC DISTRICT HEATMAP</span>
              </div>
           </div>
        </div>

        {/* Alerts Table */}
        <div className="mt-8">
           <h2 className="text-black dark:text-white font-black text-sm uppercase tracking-wide mb-4">{t('fraud_alerts')}</h2>
           <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
              <div className="space-y-0 divide-y divide-gray-50 dark:divide-slate-750">
                 {mockFraudLogs.map(log => (
                   <div key={log.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-750 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${log.risk === 'Critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600'}`}>
                            <ShieldAlert className="w-7 h-7" />
                         </div>
                         <div>
                            <div className="font-bold text-gray-900 dark:text-white text-lg">{log.type}</div>
                            <div className="text-xs text-gray-500 dark:text-slate-400 font-semibold">{log.store} • {log.time}</div>
                         </div>
                      </div>
                      <div className="flex items-center gap-6 w-full md:w-auto">
                         <div className="text-center px-4 border-r border-gray-100 dark:border-slate-700">
                            <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">{t('risk_score')}</div>
                            <div className={`text-xl font-black ${log.score > 90 ? 'text-red-600' : 'text-orange-500'}`}>{log.score}</div>
                         </div>
                         <button className="flex-1 md:flex-none bg-black dark:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl text-sm group-hover:bg-red-600 transition-colors">
                            Investigate
                         </button>
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
