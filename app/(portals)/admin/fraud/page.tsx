'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Terminal, Map as MapIcon, RefreshCw, ChevronRight, Search, Loader2 } from 'lucide-react';
import { useGlobal } from '@/app/providers';
import { alertService, FraudAlert } from '@/lib/data/alerts';
import { showToast } from '@/lib/data/notifications';

export default function AdminFraud() {
  const { t } = useGlobal();
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);

  useEffect(() => {
    setLoading(true);
    alertService.getFraudAlerts().then(data => {
      setAlerts(data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleInvestigate = (alert: FraudAlert) => {
    setSelectedAlert(alert);
    showToast('info', 'Investigation Started', `Investigating: ${alert.type}`);
  };

  const handleRefresh = () => {
    setLoading(true);
    alertService.getFraudAlerts().then(data => {
      setAlerts(data || []);
      setLoading(false);
      showToast('success', 'Alerts Refreshed');
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  const riskColors = {
    Low: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600',
    Medium: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600',
    High: 'bg-red-50 dark:bg-red-900/30 text-red-600',
    Critical: 'bg-red-100 dark:bg-red-900/50 text-red-700 animate-pulse',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <div className="text-slate-300 text-sm font-medium">Scanning for anomalous platform activity...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-gradient-to-br from-[#057A42] via-emerald-700 to-slate-900 dark:from-emerald-900 dark:to-slate-950 pt-12 pb-24 px-4 md:rounded-b-[40px] shadow-lg transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-white font-bold text-xl tracking-wide flex items-center gap-3">
            <ShieldAlert className="w-6 h-6" /> {t('fraud_log')}
          </h1>
          <div className="flex items-center gap-3">
            <button onClick={handleRefresh} className="bg-white/10 hover:bg-white/20 border border-white/20 p-2.5 rounded-xl transition-all">
              <RefreshCw className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 px-6 py-2.5 rounded-2xl text-white font-bold text-sm backdrop-blur-md">
              <AlertTriangle className="w-5 h-5 text-yellow-400 animate-pulse" /> {alerts.length} Active Alerts
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-12 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800 font-mono text-xs overflow-hidden h-[350px] relative group">
            <div className="flex items-center justify-between mb-4 text-slate-500 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2"><Terminal className="w-4 h-4" /> AI_FRAUD_ENGINE_V2_LOGS</div>
              <div className="flex items-center gap-1 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
              </div>
            </div>
            <div className="space-y-1.5">
              {alerts.length === 0 ? (
                <div className="text-slate-500">No active alerts. System nominal.</div>
              ) : (
                alerts.slice(0, 5).map((alert, i) => (
                  <div key={alert.id} className={
                    alert.risk === 'Critical' ? 'text-red-500 font-black animate-pulse' :
                    alert.risk === 'High' ? 'text-yellow-400 font-bold' :
                    'text-emerald-400'
                  }>
                    [{alert.risk === 'Critical' ? 'FATAL' : alert.risk === 'High' ? 'WARN' : 'INFO'}] {alert.type} - Score: {alert.score} | {alert.store}
                  </div>
                ))
              )}
              <div className="text-slate-500 animate-pulse mt-4">_</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col h-[350px]">
            <h3 className="text-black dark:text-white font-bold text-sm uppercase mb-4 flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-orange-500" /> Fraud Hotspots
            </h3>
            <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center">
              <div className="absolute top-1/3 left-1/2 w-20 h-20 bg-red-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-orange-500/20 rounded-full animate-pulse" />
              <div className="absolute bottom-1/4 right-1/3 w-16 h-16 bg-red-500/10 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
              <span className="text-[10px] font-bold text-gray-400 dark:text-slate-600 z-10 bg-white/50 dark:bg-slate-900/50 px-3 py-1 rounded-full backdrop-blur-sm">HCMC DISTRICT HEATMAP</span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-black dark:text-white font-black text-sm uppercase tracking-wide mb-4">{t('fraud_alerts')}</h2>
          {loading ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 animate-pulse p-8 space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-slate-700 rounded-2xl" />)}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
              {alerts.map((log, i) => (
                <div key={log.id} className={`p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all cursor-pointer group border-b border-gray-50 dark:border-slate-700 last:border-0 ${i === 0 ? 'bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-900/10' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${log.risk === 'Critical' || log.risk === 'High' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600'}`}>
                      <ShieldAlert className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white text-lg">{log.type}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400 font-semibold">{log.store} &bull; {log.time}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="text-center px-4 border-r border-gray-100 dark:border-slate-700">
                      <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">{t('risk_score')}</div>
                      <div className={`text-xl font-black ${log.score > 90 ? 'text-red-600' : 'text-orange-500'}`}>{log.score}</div>
                    </div>
                    <button onClick={() => handleInvestigate(log)} className="flex-1 md:flex-none bg-black dark:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl text-sm group-hover:bg-red-600 dark:group-hover:bg-red-600 transition-all flex items-center gap-2">
                      Investigate <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  {log.risk === 'Critical' && (
                    <div className="absolute top-0 right-0 w-1 h-full bg-red-500 rounded-l-full" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Investigation Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedAlert(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${selectedAlert.risk === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 dark:text-white text-lg">{selectedAlert.type}</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">{selectedAlert.store}</p>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-slate-900 rounded-2xl p-5 space-y-3 mb-6">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Risk Score</span><span className={`font-black ${selectedAlert.score > 90 ? 'text-red-600' : 'text-orange-500'}`}>{selectedAlert.score}/100</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Risk Level</span><span className="font-black">{selectedAlert.risk}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Detected</span><span className="font-black">{selectedAlert.time}</span></div>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all">Block Account</button>
              <button className="flex-1 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 font-bold py-3 rounded-xl transition-all" onClick={() => setSelectedAlert(null)}>Dismiss</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
