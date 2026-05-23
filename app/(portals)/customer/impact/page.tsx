'use client';

import { useState, useEffect } from 'react';
import { Leaf, Award, Trees, TrendingUp } from 'lucide-react';
import { useGlobal } from '@/app/providers';
import { orderService, Order } from '@/lib/data/orders';
import { useAuth } from '@/app/contexts/AuthContext';

export default function CustomerImpact() {
  const { t } = useGlobal();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getByUser(user?.id || '').then(data => {
      setOrders(data.filter(o => o.status === 'delivered'));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [user]);

  // ~0.003 kg CO2 per VND spent (estimation constant based on avg food emissions)
  const totalCO2 = orders.reduce((sum, o) => sum + o.total * 0.003, 0);
  const totalFoodSaved = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
  // ~21 kg CO2 absorbed per mature tree per year (estimation constant)
  const treeEquivalent = Math.round(totalCO2 / 21);
  // Each rescued item saves ~2 meals (estimation constant based on avg portion size)
  const mealEquivalent = totalFoodSaved * 2;

  const monthlyData = (() => {
    const months = Array(6).fill(0);
    const now = new Date();
    orders.forEach(o => {
      const d = new Date(o.createdAt);
      const monthIndex = now.getMonth() - d.getMonth() + (now.getFullYear() - d.getFullYear()) * 12;
      if (monthIndex >= 0 && monthIndex < 6) {
        months[5 - monthIndex] += Math.round(o.total * 0.003); // 0.003 kg CO2/VND estimation
      }
    });
    return months;
  })();

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-[#057A42] dark:bg-emerald-900 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-sm transition-colors">
        <div className="max-w-5xl mx-auto text-white font-bold text-xl tracking-wide flex justify-between items-center">
          <div>{t('my_esg_impact')}</div>
          <div className="bg-white/20 dark:bg-white/10 px-3 py-1 rounded-full text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-300 dark:text-yellow-400" /> {t('top_5')}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6">
        {loading ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 animate-pulse">
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-slate-700 mx-auto mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mx-auto mb-2" />
            <div className="h-8 bg-gray-100 dark:bg-slate-700 rounded w-1/3 mx-auto" />
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-[#e8f5e9] to-white dark:from-slate-800 dark:to-slate-800 rounded-3xl p-6 shadow-sm border border-green-100 dark:border-slate-700 mb-6 transition-colors">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-[#057A42] dark:bg-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800 mb-3">
                  <Leaf className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-gray-600 dark:text-slate-400 font-bold text-xs tracking-wider mb-1">{t('lifetime_co2_reduced')}</h2>
                <div className="text-black dark:text-white font-black text-4xl">{totalCO2.toFixed(1)} kg</div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 grid grid-cols-2 gap-4 border border-gray-100 dark:border-slate-700">
                <div className="text-center border-r border-gray-100 dark:border-slate-700">
                  <div className="text-gray-400 dark:text-slate-500 font-bold text-[10px] mb-1">{t('equivalent_to')}</div>
                  <div className="flex justify-center items-center gap-1 text-[#057A42] dark:text-emerald-400 font-black text-lg">
                    <Trees className="w-5 h-5" /> {treeEquivalent} {t('trees')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 dark:text-slate-500 font-bold text-[10px] mb-1">{t('food_saved')}</div>
                  <div className="text-orange-500 dark:text-orange-400 font-black text-lg">
                    {mealEquivalent} {t('meals')}
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-black dark:text-white font-extrabold text-sm mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#057A42]" /> {t('monthly_progress')}
            </h2>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 mb-6 transition-colors">
              <div className="flex justify-between items-end h-32 pb-4 border-b border-gray-100 dark:border-slate-700">
                {monthlyData.map((val, i) => (
                  <div key={i} className="w-8 md:w-12 bg-green-100 dark:bg-emerald-900/30 rounded-t-lg relative group transition-all hover:bg-green-200 dark:hover:bg-emerald-800/50 cursor-pointer" style={{ height: `${val}%` }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 dark:bg-gray-100 text-white dark:text-black text-[10px] px-2 py-1 rounded whitespace-nowrap">
                      {val}kg CO2
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400 dark:text-slate-500">
                {Array.from({ length: 6 }, (_, i) => {
                  const d = new Date(); d.setMonth(d.getMonth() - 5 + i);
                  return <span key={i}>{d.toLocaleString('en', { month: 'short' })}</span>;
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
              <h3 className="text-black dark:text-white font-bold text-sm mb-4">Impact Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-slate-400">Total Orders Rescued</span>
                  <span className="font-bold text-gray-900 dark:text-white">{orders.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-slate-400">Items Saved from Landfill</span>
                  <span className="font-bold text-gray-900 dark:text-white">{totalFoodSaved}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-slate-400">Money Saved</span>
                  <span className="font-bold text-[#057A42] dark:text-emerald-400">{orders.reduce((s, o) => s + o.total, 0).toLocaleString()}đ</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
