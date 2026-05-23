'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, Layers, TrendingUp, Leaf, TriangleAlert, Award, AlertTriangle, Loader2 } from 'lucide-react';
import { useGlobal } from '@/app/providers';
import { adminService } from '@/lib/data/admin';

export default function AdminHeatmap() {
  const { t } = useGlobal();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [districts, setDistricts] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    setLoading(true);
    adminService.getHeatmap().then(data => {
      if (Array.isArray(data)) setDistricts(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const wasteValues = districts.map(d => d.waste || 0);
  const MAX_WASTE = Math.max(...wasteValues, 1);
  const MIN_WASTE = Math.min(...wasteValues, 0);

  function getWasteColor(waste: number): string {
    const ratio = (waste - MIN_WASTE) / (MAX_WASTE - MIN_WASTE);
    if (ratio < 0.33) return 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800/30';
    if (ratio < 0.66) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/30';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30';
  }

  function getWasteDot(waste: number): string {
    const ratio = (waste - MIN_WASTE) / (MAX_WASTE - MIN_WASTE);
    if (ratio < 0.33) return 'bg-green-500';
    if (ratio < 0.66) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  const sortedByRescue = [...districts].sort((a, b) => (b.rescueRate || 0) - (a.rescueRate || 0));
  const sortedByWaste = [...districts].sort((a, b) => (b.waste || 0) - (a.waste || 0));
  const top5Rescue = sortedByRescue.slice(0, 5);
  const bottom5Waste = sortedByWaste.slice(-5).reverse();
  const totalOrders = districts.reduce((s, d) => s + (d.orders || 0), 0);
  const avgRescue = districts.length ? Math.round(districts.reduce((s, d) => s + (d.rescueRate || 0), 0) / districts.length) : 0;
  const totalSaved = districts.reduce((s, d) => s + (d.orders || 0), 0) * 2.5;

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <div className="text-slate-300 text-sm font-medium">Generating regional activity heatmap...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-lg transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-white font-bold text-xl tracking-wide flex items-center gap-3">
            <Map className="w-6 h-6" /> Heatmap & GIS
          </h1>
          <div className="bg-white/10 px-5 py-2.5 rounded-xl text-white text-xs font-bold border border-white/10 backdrop-blur-md flex items-center gap-2">
            <Layers className="w-3 h-3" /> {districts.length} Districts
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-slate-400">
            <Layers className="w-4 h-4" /> Legend:
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-slate-400">
              <div className="w-4 h-4 rounded bg-green-100 border border-green-300" /> Low Waste
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-slate-400">
              <div className="w-4 h-4 rounded bg-yellow-50 border border-yellow-300" /> Medium
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-slate-400">
              <div className="w-4 h-4 rounded bg-red-50 border border-red-300" /> High Waste
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {districts.map((district, i) => (
            <motion.div
              key={district.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md hover:-translate-y-0.5 ${getWasteColor(district.waste)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">{district.name}</h3>
                <div className={`w-3 h-3 rounded-full ${getWasteDot(district.waste)}`} />
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-slate-400 font-medium">Orders</span>
                  <span className="font-bold text-gray-800 dark:text-slate-200">{district.orders.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-slate-400 font-medium">Waste</span>
                  <span className="font-bold text-red-600 dark:text-red-400">{district.waste} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-slate-400 font-medium">Rescue Rate</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{district.rescueRate}%</span>
                </div>
              </div>
              <div className="mt-3 w-full bg-gray-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${district.rescueRate}%` }} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="text-black dark:text-white font-extrabold text-xs uppercase tracking-wide mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-5 text-emerald-500" /> Top 5 by Rescue Rate
            </h3>
            <div className="space-y-3">
              {top5Rescue.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="text-xs font-bold text-gray-800 dark:text-slate-200">{d.name}</span>
                  </div>
                  <span className="text-xs font-black text-emerald-600">{d.rescueRate}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="text-black dark:text-white font-extrabold text-xs uppercase tracking-wide mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-5 text-red-500" /> Bottom 5 by Waste
            </h3>
            <div className="space-y-3">
              {bottom5Waste.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="text-xs font-bold text-gray-800 dark:text-slate-200">{d.name}</span>
                  </div>
                  <span className="text-xs font-black text-red-500">{d.waste} kg</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="text-black dark:text-white font-extrabold text-xs uppercase tracking-wide mb-4 flex items-center gap-2">
              <Award className="w-4 h-5 text-amber-500" /> Performance Summary
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
                <div className="text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase mb-1">Total Orders in Area</div>
                <div className="text-xl font-black text-gray-900 dark:text-white">{totalOrders.toLocaleString()}</div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
                <div className="text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase mb-1">Avg Rescue Rate</div>
                <div className="text-xl font-black text-emerald-600">{avgRescue}%</div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
                <div className="text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase mb-1">Total Food Saved</div>
                <div className="text-xl font-black text-blue-600">{(totalSaved / 1000).toFixed(1)}k kg</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
