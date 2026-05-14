'use client';

import { Server, Cpu, Database, Activity, HardDrive, RefreshCw, AlertCircle } from 'lucide-react';
import { useGlobal } from '@/app/providers';

export default function AdminSystem() {
  const { t } = useGlobal();

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-[#057A42] dark:bg-emerald-900 pt-12 pb-24 px-4 md:rounded-b-[40px] shadow-sm transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-white font-bold text-xl tracking-wide flex items-center gap-3">
            <Server className="w-6 h-6" /> {t('system_health')}
          </h1>
          <button className="bg-white/20 hover:bg-white/30 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all border border-white/20">
            <RefreshCw className="w-5 h-5" /> Flush System Cache
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-12 space-y-6">
        
        {/* Resource Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
              <div className="flex justify-between items-start mb-6">
                 <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
                    <Cpu className="w-8 h-8" />
                 </div>
                 <span className="text-xs font-black text-emerald-500">99.9% Uptime</span>
              </div>
              <div className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">{t('ai_engine_load')}</div>
              <div className="text-black dark:text-white font-black text-4xl mb-4">42%</div>
              <div className="w-full bg-gray-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                 <div className="bg-blue-500 h-full" style={{ width: '42%' }} />
              </div>
           </div>

           <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
              <div className="flex justify-between items-start mb-6">
                 <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
                    <Database className="w-8 h-8" />
                 </div>
                 <span className="text-xs font-black text-emerald-500">Online</span>
              </div>
              <div className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">Database Queries</div>
              <div className="text-black dark:text-white font-black text-4xl mb-4">12.5k <span className="text-sm font-bold opacity-40">/sec</span></div>
              <div className="w-full bg-gray-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                 <div className="bg-[#057A42] h-full" style={{ width: '65%' }} />
              </div>
           </div>

           <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
              <div className="flex justify-between items-start mb-6">
                 <div className="p-3 bg-orange-50 dark:bg-orange-900/30 text-orange-600 rounded-2xl">
                    <HardDrive className="w-8 h-8" />
                 </div>
                 <span className="text-xs font-black text-orange-500">Normal</span>
              </div>
              <div className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">Storage Usage</div>
              <div className="text-black dark:text-white font-black text-4xl mb-4">1.2 <span className="text-sm font-bold opacity-40">TB</span></div>
              <div className="w-full bg-gray-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                 <div className="bg-orange-500 h-full" style={{ width: '82%' }} />
              </div>
           </div>
        </div>

        {/* System Activity */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
           <h3 className="text-black dark:text-white font-black text-sm uppercase mb-8 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" /> Infrastructure Real-time Monitor
           </h3>
           <div className="space-y-4">
              {[
                { s: 'Primary Database Cluster', status: 'Healthy', ping: '12ms' },
                { s: 'AI Inference Node (Hanoi-1)', status: 'Healthy', ping: '45ms' },
                { s: 'AI Inference Node (HCMC-1)', status: 'Healthy', ping: '8ms' },
                { s: 'Global CDN Edge', status: 'High Load', ping: '120ms' },
              ].map((node, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700">
                   <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${node.status === 'Healthy' ? 'bg-emerald-500' : 'bg-orange-500'} animate-pulse`} />
                      <span className="font-bold text-gray-800 dark:text-slate-200 text-sm">{node.s}</span>
                   </div>
                   <div className="flex items-center gap-6">
                      <span className="text-[10px] font-mono text-gray-400">{node.ping}</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${node.status === 'Healthy' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{node.status}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}
