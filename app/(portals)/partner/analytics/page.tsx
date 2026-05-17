'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Package, Leaf, Trash2, Download, Calendar } from 'lucide-react';
import { useGlobal } from '@/app/providers';

type DateRange = 'today' | 'week' | 'month';

interface Kpi {
  label: string;
  value: string;
  change: number;
  icon: typeof DollarSign;
  color: string;
}

interface DailyRow {
  date: string;
  orders: number;
  revenue: number;
  items: number;
}

const topItems = [
  { name: 'Banana Bread', sold: 48, color: 'bg-emerald-500' },
  { name: 'Avocado Toast', sold: 36, color: 'bg-emerald-400' },
  { name: 'Croissant', sold: 32, color: 'bg-emerald-300' },
  { name: 'Iced Coffee', sold: 29, color: 'bg-emerald-200' },
  { name: 'Muffin', sold: 22, color: 'bg-emerald-100' },
];

const hourlyData = [
  { hour: '7AM', value: 20 }, { hour: '8AM', value: 55 }, { hour: '9AM', value: 80 },
  { hour: '10AM', value: 95 }, { hour: '11AM', value: 100 }, { hour: '12PM', value: 90 },
  { hour: '1PM', value: 70 }, { hour: '2PM', value: 45 }, { hour: '3PM', value: 30 },
  { hour: '4PM', value: 25 }, { hour: '5PM', value: 40 }, { hour: '6PM', value: 35 },
];

const dailyData: DailyRow[] = [
  { date: 'May 10', orders: 12, revenue: 485000, items: 18 },
  { date: 'May 11', orders: 15, revenue: 532000, items: 22 },
  { date: 'May 12', orders: 10, revenue: 378000, items: 14 },
  { date: 'May 13', orders: 18, revenue: 694000, items: 27 },
  { date: 'May 14', orders: 21, revenue: 815000, items: 33 },
  { date: 'May 15', orders: 14, revenue: 503000, items: 20 },
  { date: 'May 16', orders: 8, revenue: 296000, items: 11 },
];

const ranges: { key: DateRange; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
];

export default function PartnerAnalyticsPage() {
  const { t } = useGlobal();
  const [mounted, setMounted] = useState(false);
  const [range, setRange] = useState<DateRange>('week');

  useEffect(() => { setMounted(true); }, []);

  const kpis: Kpi[] = [
    { label: 'Total Revenue', value: '8,240,000 VNĐ', change: 12.5, icon: DollarSign, color: 'text-emerald-600' },
    { label: 'Orders Fulfilled', value: '98', change: 8.3, icon: Package, color: 'text-blue-600' },
    { label: 'Items Rescued', value: '145', change: 15.2, icon: Leaf, color: 'text-green-600' },
    { label: 'Waste Reduced', value: '362 kg', change: -3.1, icon: Trash2, color: 'text-orange-600' },
  ];

  const maxSold = Math.max(...topItems.map(i => i.sold));
  const maxHourly = Math.max(...hourlyData.map(h => h.value));

  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-700 to-emerald-500 rounded-2xl p-6 md:p-8 mb-6 shadow-lg"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-white text-2xl md:text-3xl font-bold">Analytics</h1>
            <p className="text-emerald-100 text-sm mt-1">Performance metrics & insights</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-xl transition-colors backdrop-blur-sm">
            <Download className="w-4 h-4" />
            Download Report
          </button>
        </div>
      </motion.div>

      <div className="flex gap-2 mb-6">
        {ranges.map(r => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${range === r.key ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            <Calendar className="w-4 h-4" />
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          const isUp = kpi.change >= 0;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-xl bg-gray-50 ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{kpi.label}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
              <div className={`flex items-center gap-1 text-xs font-semibold mt-1 ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
                {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {Math.abs(kpi.change)}% vs last period
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="font-bold text-gray-900 mb-4">Top Selling Items</h3>
          <div className="space-y-3">
            {topItems.map(item => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{item.name}</span>
                  <span className="text-gray-500">{item.sold}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full ${item.color} transition-all duration-500`} style={{ width: `${(item.sold / maxSold) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="font-bold text-gray-900 mb-4">Best Selling Hours</h3>
          <div className="flex items-end gap-1.5 h-40">
            {hourlyData.map(h => (
              <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-emerald-500 rounded-t-md transition-all duration-500 hover:bg-emerald-600"
                  style={{ height: `${(h.value / maxHourly) * 100}%` }}
                />
                <span className="text-[10px] text-gray-400 -rotate-45 origin-left whitespace-nowrap">{h.hour}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-x-auto"
      >
        <h3 className="font-bold text-gray-900 mb-4">Daily Revenue</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 text-gray-500 font-medium uppercase tracking-wider">Date</th>
              <th className="text-right py-3 px-4 text-gray-500 font-medium uppercase tracking-wider">Orders</th>
              <th className="text-right py-3 px-4 text-gray-500 font-medium uppercase tracking-wider">Revenue</th>
              <th className="text-right py-3 px-4 text-gray-500 font-medium uppercase tracking-wider">Items</th>
            </tr>
          </thead>
          <tbody>
            {dailyData.map((row, i) => (
              <tr key={row.date} className={`border-b border-gray-50 ${i === dailyData.length - 1 ? '' : ''}`}>
                <td className="py-3 px-4 text-gray-900 font-medium">{row.date}</td>
                <td className="py-3 px-4 text-right text-gray-700">{row.orders}</td>
                <td className="py-3 px-4 text-right text-gray-900 font-semibold">{row.revenue.toLocaleString()} VNĐ</td>
                <td className="py-3 px-4 text-right text-gray-700">{row.items}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
