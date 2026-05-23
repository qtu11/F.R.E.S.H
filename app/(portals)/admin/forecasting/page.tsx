'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Clock, AlertTriangle, RefreshCw, BarChart3, MapPin, Lightbulb, Zap, Package, Loader2 } from 'lucide-react';
import { useGlobal } from '@/app/providers';
import { adminService } from '@/lib/data/admin';

const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

const RISK_STYLES: Record<string, string> = {
  Low: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50',
  Medium: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50',
  High: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50',
};

export default function AdminForecasting() {
  const { t } = useGlobal();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [forecast, setForecast] = useState<number[]>([]);
  const [peakHours, setPeakHours] = useState<any[]>([]);
  const [wasteHotspots, setWasteHotspots] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    setLoading(true);
    Promise.all([
      adminService.getForecasting(),
      adminService.getHeatmap('waste'),
    ]).then(([forecastData, wasteData]) => {
      if (forecastData) {
        if (Array.isArray(forecastData.demandForecast)) setForecast(forecastData.demandForecast);
        if (Array.isArray(forecastData.peakHours)) setPeakHours(forecastData.peakHours);
        if (Array.isArray(forecastData.recommendations)) setRecommendations(forecastData.recommendations);
      }
      if (Array.isArray(wasteData)) setWasteHotspots(wasteData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    Promise.all([
      adminService.getForecasting(),
      adminService.getHeatmap('waste'),
    ]).then(([forecastData, wasteData]) => {
      if (forecastData) {
        if (Array.isArray(forecastData.demandForecast)) setForecast(forecastData.demandForecast);
        if (Array.isArray(forecastData.peakHours)) setPeakHours(forecastData.peakHours);
        if (Array.isArray(forecastData.recommendations)) setRecommendations(forecastData.recommendations);
      }
      if (Array.isArray(wasteData)) setWasteHotspots(wasteData);
      setRefreshing(false);
    }).catch(err => {
      console.error(err);
      setRefreshing(false);
    });
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <div className="text-slate-300 text-sm font-medium">Recalculating AI forecasting models...</div>
        </div>
      </div>
    );
  }

  const maxDemand = forecast.length > 0 ? Math.max(...forecast) : 1;
  const predictedDemand = forecast.reduce((a, b) => a + b, 0);
  const wasteHotspotCount = wasteHotspots.filter((w: any) => w.risk === 'High').length;
  const avgPeakDemand = Math.round(forecast.slice(7, 9).concat(forecast.slice(11, 13)).concat(forecast.slice(17, 19)).reduce((a, b) => a + b, 0) / 6);

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-lg transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-white font-bold text-xl tracking-wide flex items-center gap-3">
            <Brain className="w-6 h-6" /> AI & Forecasting
          </h1>
          <button onClick={handleRefresh} disabled={refreshing} className="bg-white/10 px-5 py-2.5 rounded-xl text-white text-xs font-bold border border-white/10 backdrop-blur-md flex items-center gap-2 hover:bg-white/20 transition-all disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> {refreshing ? 'Recalculating...' : 'Refresh Forecast'}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-slate-500" />
              <span className="text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Predicted Demand</span>
            </div>
            <div className="text-2xl font-black text-slate-800 dark:text-white">{predictedDemand}</div>
            <div className="text-[10px] text-emerald-500 font-bold mt-1">Next 24 hours</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Peak Hours</span>
            </div>
            <div className="text-2xl font-black text-orange-600">{peakHours.filter(p => p.level === 'High').length} periods</div>
            <div className="text-[10px] font-bold mt-1 text-orange-500">~{avgPeakDemand} orders/hr avg</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span className="text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Waste Hotspots</span>
            </div>
            <div className="text-2xl font-black text-red-600">{wasteHotspotCount}</div>
            <div className="text-[10px] text-red-500 font-bold mt-1">High-risk districts</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-slate-500" />
              <span className="text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Inventory Alerts</span>
            </div>
            <div className="text-2xl font-black text-yellow-600">{wasteHotspots.filter((w: any) => w.risk === 'High').length}</div>
            <div className="text-[10px] text-yellow-500 font-bold mt-1">Requires attention</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-black dark:text-white font-extrabold text-sm uppercase tracking-wide flex items-center gap-2">
                <BarChart3 className="w-4 h-5 text-slate-600 dark:text-slate-400" /> Demand Forecast
              </h3>
              <span className="text-[10px] text-gray-400 bg-gray-50 dark:bg-slate-700 px-2 py-1 rounded-md font-mono">Next 24h</span>
            </div>
            <div className="relative h-48">
              <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[8px] text-gray-400 dark:text-slate-500 font-bold items-end pr-1">
                <span>{maxDemand}</span><span>{Math.round(maxDemand * 2 / 3)}</span><span>{Math.round(maxDemand / 3)}</span><span>0</span>
              </div>
              <div className="absolute left-8 right-0 top-0 bottom-6 flex items-end justify-around gap-[1px]">
                {forecast.map((val, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / maxDemand) * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.03 }}
                    className={`w-full rounded-t-sm ${val > 100 ? 'bg-orange-500' : val > 60 ? 'bg-slate-600 dark:bg-slate-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                    title={`${HOURS[i]}: ${val} orders`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-between mt-3 text-[8px] font-bold text-gray-400 dark:text-slate-500">
              <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="text-black dark:text-white font-extrabold text-sm uppercase tracking-wide flex items-center gap-2 mb-4">
              <Clock className="w-4 h-5 text-slate-600 dark:text-slate-400" /> Peak Hours Timeline
            </h3>
            <div className="relative py-6">
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200 dark:bg-slate-700 rounded-full -translate-y-1/2" />
              {peakHours.map((peak, i) => {
                const leftPct = (peak.start / 24) * 100;
                const widthPct = ((peak.end - peak.start) / 24) * 100;
                return (
                  <motion.div
                    key={i}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: `${widthPct}%`, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }}
                    className={`absolute top-1/2 -translate-y-1/2 h-10 rounded-xl flex items-center justify-center text-[10px] font-bold text-white ${peak.level === 'High' ? 'bg-orange-500' : 'bg-amber-500'}`}
                    style={{ left: `${leftPct}%`, minWidth: '60px' }}
                  >
                    {peak.label}
                  </motion.div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] font-bold text-gray-400 dark:text-slate-500 mt-2">
              <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="text-black dark:text-white font-extrabold text-sm uppercase tracking-wide flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-5 text-slate-600 dark:text-slate-400" /> Waste Hotspots
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {wasteHotspots.map((spot, i) => (
              <motion.div
                key={spot.district}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${spot.risk === 'High' ? 'bg-red-500' : spot.risk === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{spot.district || spot.name}</div>
                    <div className="text-[10px] text-gray-400 font-medium">{spot.waste || spot.orders || 0} kg predicted</div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border ${RISK_STYLES[spot.risk]}`}>
                  {spot.risk}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="text-black dark:text-white font-extrabold text-sm uppercase tracking-wide flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-5 text-amber-500" /> AI Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex items-start gap-3 p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30"
              >
                <Zap className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs font-medium text-gray-700 dark:text-slate-300">{rec}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
