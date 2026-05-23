'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Package, Leaf, Trash2, Download, Calendar, Loader2 } from 'lucide-react';
import { useGlobal } from '@/app/providers';
import { useAuth } from '@/app/contexts/AuthContext';
import { orderService, Order } from '@/lib/data/orders';
import { productService, Product } from '@/lib/data/products';
import { transactionService, Transaction } from '@/lib/data/transactions';

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



const ranges: { key: DateRange; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
];

export default function PartnerAnalyticsPage() {
  const { t } = useGlobal();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [range, setRange] = useState<DateRange>('week');
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const storeId = user?.storeId || '';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!storeId || !user?.id) return;
    setLoading(true);
    Promise.all([
      orderService.getByStore(storeId),
      transactionService.getByUser(user.id),
      productService.getByStore(storeId),
    ]).then(([o, txs, prods]) => {
      setOrders(o || []);
      setTransactions(txs || []);
      setProducts(prods || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [storeId, user]);

  const topItems = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(o => o.items?.forEach(item => {
      counts[item.productName] = (counts[item.productName] || 0) + item.quantity;
    }));
    const colors = ['bg-emerald-500', 'bg-emerald-400', 'bg-emerald-300', 'bg-emerald-200', 'bg-emerald-100'];
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, sold], i) => ({ name, sold, color: colors[i] || 'bg-emerald-100' }));
  }, [orders]);

  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 7);
    const counts: Record<number, number> = {};
    orders.forEach(o => {
      const h = o.createdAt ? new Date(o.createdAt).getHours() : -1;
      if (h >= 7 && h <= 18) counts[h] = (counts[h] || 0) + 1;
    });
    const max = Math.max(...Object.values(counts), 1);
    const labels = ['7AM','8AM','9AM','10AM','11AM','12PM','1PM','2PM','3PM','4PM','5PM','6PM'];
    return labels.map((hour, i) => ({
      hour,
      value: Math.round(((counts[i + 7] || 0) / max) * 100),
    }));
  }, [orders]);

  const dailyData: DailyRow[] = useMemo(() => {
    const byDate: Record<string, DailyRow> = {};
    orders.forEach(o => {
      if (!o.createdAt) return;
      const d = new Date(o.createdAt);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      if (!byDate[key]) byDate[key] = { date: key, orders: 0, revenue: 0, items: 0 };
      byDate[key].orders += 1;
      byDate[key].revenue += o.total || 0;
      byDate[key].items += (o.items || []).reduce((s, i) => s + i.quantity, 0);
    });
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
  }, [orders]);

  const kpis: Kpi[] = useMemo(() => {
    const totalRevenue = transactions
      .filter(t => t.type === 'revenue' && t.status === 'completed')
      .reduce((s, t) => s + t.amount, 0);
    const ordersFulfilled = orders.filter(o => o.status === 'delivered').length;
    const itemsRescued = orders.reduce((s, o) => s + (o.items || []).reduce((s2, i) => s2 + i.quantity, 0), 0);
    const totalCo2Saved = products.reduce((s, p) => s + (p.co2Saved || 0), 0);
    const wasteKg = totalCo2Saved > 0 ? totalCo2Saved : Math.round(itemsRescued * 2.5);
    return [
      { label: 'Total Revenue', value: `${totalRevenue.toLocaleString()} VNĐ`, change: 12.5, icon: DollarSign, color: 'text-emerald-600' },
      { label: 'Orders Fulfilled', value: `${ordersFulfilled}`, change: 8.3, icon: Package, color: 'text-blue-600' },
      { label: 'Items Rescued', value: `${itemsRescued}`, change: 15.2, icon: Leaf, color: 'text-green-600' },
      { label: 'Waste Reduced', value: `${wasteKg} kg`, change: -3.1, icon: Trash2, color: 'text-orange-600' },
    ];
  }, [orders, transactions]);

  const maxSold = Math.max(...topItems.map(i => i.sold), 1);
  const maxHourly = Math.max(...hourlyData.map(h => h.value), 1);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <div className="text-gray-900 dark:text-white text-sm font-medium">Loading analytics...</div>
        </div>
      </div>
    );
  }

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
