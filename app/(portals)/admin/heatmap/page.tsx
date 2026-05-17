'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, Layers, TrendingUp, Leaf, TriangleAlert, Award, AlertTriangle } from 'lucide-react';
import { useGlobal } from '@/app/providers';

const DISTRICTS = [
  { name: 'District 1', orders: 12540, waste: 145, rescueRate: 92, lat: 10.7769, lng: 106.7009 },
  { name: 'District 2', orders: 8930, waste: 112, rescueRate: 78, lat: 10.7933, lng: 106.7494 },
  { name: 'District 3', orders: 10780, waste: 89, rescueRate: 85, lat: 10.7797, lng: 106.6917 },
  { name: 'District 7', orders: 15420, waste: 76, rescueRate: 95, lat: 10.7373, lng: 106.7261 },
  { name: 'Binh Thanh', orders: 9670, waste: 134, rescueRate: 72, lat: 10.8038, lng: 106.7079 },
  { name: 'Thu Duc', orders: 11230, waste: 62, rescueRate: 88, lat: 10.8536, lng: 106.7623 },
  { name: 'Tan Binh', orders: 6850, waste: 48, rescueRate: 81, lat: 10.8021, lng: 106.6469 },
  { name: 'Phu Nhuan', orders: 7940, waste: 35, rescueRate: 90, lat: 10.7967, lng: 106.6787 },
  { name: 'Go Vap', orders: 5430, waste: 28, rescueRate: 86, lat: 10.8378, lng: 106.6648 },
  { name: 'District 5', orders: 4560, waste: 52, rescueRate: 74, lat: 10.7558, lng: 106.6613 },
];

const MAX_WASTE = Math.max(...DISTRICTS.map(d => d.waste));
const MIN_WASTE = Math.min(...DISTRICTS.map(d => d.waste));

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

export default function AdminHeatmap() {
  const { t } = useGlobal();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const sortedByRescue = [...DISTRICTS].sort((a, b) => b.rescueRate - a.rescueRate);
  const sortedByWaste = [...DISTRICTS].sort((a, b) => b.waste - a.waste);
  const top5Rescue = sortedByRescue.slice(0, 5);
  const bottom5Waste = sortedByWaste.slice(-5).reverse();
  const totalOrders = DISTRICTS.reduce((s, d) => s + d.orders, 0);
  const avgRescue = Math.round(DISTRICTS.reduce((s, d) => s + d.rescueRate, 0) / DISTRICTS.length);
  const totalSaved = DISTRICTS.reduce((s, d) => s + d.orders, 0) * 2.5;

  if (!mounted) return null;

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-lg transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-white font-bold text-xl tracking-wide flex items-center gap-3">
            <Map className="w-6 h-6" /> Heatmap & GIS
          </h1>
          <div className="bg-white/10 px-5 py-2.5 rounded-xl text-white text-xs font-bold border border-white/10 backdrop-blur-md flex items-center gap-2">
            <Layers className="w-3 h-3" /> {DISTRICTS.length} Districts
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
          {DISTRICTS.map((district, i) => (
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
