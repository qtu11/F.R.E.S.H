'use client';

import { useState, useEffect } from 'react';
import { Server, Cpu, Database, Activity, HardDrive, RefreshCw, Wifi, Clock, Thermometer, Zap } from 'lucide-react';
import { useGlobal } from '@/app/providers';
import { showToast } from '@/lib/data/notifications';

interface Node { s: string; status: string; ping: string; uptime?: string; }

const initialNodes: Node[] = [
  { s: 'Primary Database Cluster', status: 'Healthy', ping: '12ms', uptime: '99.99%' },
  { s: 'AI Inference Node (Hanoi-1)', status: 'Healthy', ping: '45ms', uptime: '99.95%' },
  { s: 'AI Inference Node (HCMC-1)', status: 'Healthy', ping: '8ms', uptime: '99.98%' },
  { s: 'Global CDN Edge', status: 'High Load', ping: '120ms', uptime: '99.90%' },
  { s: 'Redis Cache Cluster', status: 'Healthy', ping: '2ms', uptime: '100%' },
  { s: 'WebSocket Gateway', status: 'Healthy', ping: '15ms', uptime: '99.97%' },
];

export default function AdminSystem() {
  const { t } = useGlobal();
  const [mounted, setMounted] = useState(false);
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [aiLoad, setAiLoad] = useState(42);
  const [dbLabel, setDbLabel] = useState('12k');
  const [dbSub, setDbSub] = useState('800/sec');
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setMounted(true);
    setLastUpdated(new Date().toLocaleTimeString());
    setDbLabel(`${Math.floor(Math.random() * 5 + 10)}k`);
    setDbSub(`${Math.floor(Math.random() * 1000 + 500)}/sec`);
    const interval = setInterval(() => {
      setAiLoad(prev => Math.max(20, Math.min(95, prev + Math.floor(Math.random() * 10) - 5)));
      setNodes(prev => prev.map(n => ({
        ...n,
        ping: `${Math.floor(Math.random() * 50 + 2)}ms`,
        status: Math.random() > 0.85 ? 'High Load' : 'Healthy',
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFlushCache = () => {
    showToast('info', 'Flushing Cache', 'System cache cleared successfully');
  };

  const handleRefresh = () => {
    showToast('success', 'System Refreshed', 'All nodes are responding');
  };

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 pt-12 pb-24 px-4 md:rounded-b-[40px] shadow-lg transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-white font-bold text-xl tracking-wide flex items-center gap-3">
            <Server className="w-6 h-6" /> {t('system_health')}
          </h1>
          <div className="flex gap-3">
            <button onClick={handleRefresh} className="bg-white/10 hover:bg-white/20 border border-white/20 p-2.5 rounded-xl transition-all">
              <RefreshCw className="w-5 h-5 text-white" />
            </button>
            <button onClick={handleFlushCache} className="bg-white/20 hover:bg-white/30 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all border border-white/20 backdrop-blur-md">
              <RefreshCw className="w-5 h-5" /> Flush System Cache
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-12 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Cpu, label: t('ai_engine_load'), value: `${aiLoad}%`, color: 'bg-blue-500', barColor: 'bg-blue-500', sub: '99.9% Uptime', subIcon: Clock },
            { icon: Database, label: 'Database Queries', value: dbLabel, color: 'bg-emerald-500', barColor: 'bg-[#057A42]', sub: dbSub, subIcon: Activity },
            { icon: HardDrive, label: 'Storage Usage', value: `1.2 TB`, color: 'bg-orange-500', barColor: 'bg-orange-500', sub: '82% Used', subIcon: Thermometer },
          ].map((card, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-slate-700 transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl ${card.color === 'bg-blue-500' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : card.color === 'bg-emerald-500' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' : 'bg-orange-50 dark:bg-orange-900/30 text-orange-600'}`}>
                  <card.icon className="w-8 h-8" />
                </div>
                <span className="text-xs font-black text-emerald-500 flex items-center gap-1">
                  <card.subIcon className="w-3 h-3" /> {card.sub}
                </span>
              </div>
              <div className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">{card.label}</div>
              <div className="text-black dark:text-white font-black text-4xl mb-4">{card.value}</div>
              <div className="w-full bg-gray-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div className={`${card.barColor} h-full rounded-full transition-all duration-1000`} style={{ width: card.label === t('ai_engine_load') ? `${aiLoad}%` : card.label === 'Storage Usage' ? '82%' : '65%' }} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
            <h3 className="text-black dark:text-white font-black text-sm uppercase mb-8 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500 animate-pulse" /> Infrastructure Real-time Monitor
            </h3>
            <div className="space-y-3">
              {nodes.map((node, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700 transition-all hover:bg-gray-100 dark:hover:bg-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${node.status === 'Healthy' ? 'bg-emerald-500' : 'bg-orange-500'} animate-pulse`} />
                    <span className="font-bold text-gray-800 dark:text-slate-200 text-sm">{node.s}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                      <Wifi className="w-3 h-3" /> {node.ping}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> {node.uptime}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1.5 rounded-md ${node.status === 'Healthy' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'}`}>
                      {node.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
            <h3 className="text-black dark:text-white font-black text-sm uppercase mb-6 flex items-center gap-2">
              <Cpu className="w-4 h-5 text-emerald-500" /> System Metrics
            </h3>
            <div className="space-y-6">
              {[
                { label: 'CPU Usage', value: `${aiLoad}%`, color: 'bg-blue-500' },
                { label: 'Memory', value: '6.2/8 GB', color: 'bg-emerald-500' },
                { label: 'Disk I/O', value: '240 MB/s', color: 'bg-purple-500' },
                { label: 'Network', value: '1.2 Gbps', color: 'bg-orange-500' },
              ].map((metric, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-gray-600 dark:text-slate-400">{metric.label}</span>
                    <span className="font-bold text-gray-900 dark:text-white font-mono">{metric.value}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className={`${metric.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${aiLoad - i * 5}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Last updated: {mounted ? lastUpdated : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
