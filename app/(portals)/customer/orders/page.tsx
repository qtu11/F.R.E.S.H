'use client';

import { Package, Truck, CheckCircle2, Clock, ShoppingBag } from 'lucide-react';
import { useGlobal } from '@/app/providers';

const mockOrders = [
  { id: 'ORD-2026-0891', store: 'WinMart+ D1', statusKey: 'in_transit', total: '45,000 VND', time: '14:30' },
  { id: 'ORD-2026-0890', store: 'Circle K D3', statusKey: 'delivered', total: '12,000 VND', time: 'Yesterday' },
];

export default function CustomerOrders() {
  const { t } = useGlobal();

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-[#057A42] dark:bg-emerald-900 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-sm transition-colors duration-300">
        <div className="max-w-5xl mx-auto text-white font-bold text-xl tracking-wide">
          {t('my_orders')}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6">
        {/* Active Order Tracking */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 mb-6 relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 dark:bg-orange-500/10 rounded-bl-full -z-0" />
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <div className="text-gray-500 dark:text-slate-400 text-xs font-bold mb-1">{t('current_order')}</div>
              <div className="text-black dark:text-white font-black text-lg">ORD-2026-0891</div>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-xs font-bold border border-orange-200 dark:border-orange-800/50">
              {t('in_transit')}
            </div>
          </div>
          
          <div className="relative pt-4 pb-2 z-10">
             <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-slate-700" />
             
             <div className="flex gap-4 mb-6 relative">
               <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-emerald-900/30 border-2 border-green-500 dark:border-emerald-500 flex items-center justify-center shrink-0 z-10">
                 <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-emerald-400" />
               </div>
               <div>
                 <div className="font-bold text-gray-900 dark:text-white">{t('order_confirmed')}</div>
                 <div className="text-xs text-gray-500 dark:text-slate-400">14:15 - WinMart+ D1</div>
               </div>
             </div>

             <div className="flex gap-4 mb-6 relative">
               <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-500 flex items-center justify-center shrink-0 z-10 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                 <Truck className="w-6 h-6 text-orange-600 dark:text-orange-400" />
               </div>
               <div>
                 <div className="font-bold text-gray-900 dark:text-white">{t('on_the_way')}</div>
                 <div className="text-xs text-orange-600 dark:text-orange-400 font-semibold mb-1">{t('ai_prediction')} 12 mins</div>
                 <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5 mt-2">
                   <div className="bg-orange-500 h-1.5 rounded-full w-[60%]" />
                 </div>
               </div>
             </div>

             <div className="flex gap-4 relative opacity-50 dark:opacity-40">
               <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 flex items-center justify-center shrink-0 z-10">
                 <Package className="w-6 h-6 text-gray-400 dark:text-slate-400" />
               </div>
               <div>
                 <div className="font-bold text-gray-900 dark:text-white">{t('delivered')}</div>
                 <div className="text-xs text-gray-500 dark:text-slate-400">{t('pending')}</div>
               </div>
             </div>
          </div>
        </div>

        <h2 className="text-black dark:text-white font-extrabold text-sm mb-4">{t('past_orders')}</h2>
        
        <div className="space-y-3">
          {mockOrders.map((order, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between transition-colors hover:bg-gray-50 dark:hover:bg-slate-750 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{order.store}</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> {order.time}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-gray-900 dark:text-white">{order.total}</div>
                <div className="text-[10px] font-bold text-green-600 dark:text-emerald-400 uppercase mt-1 bg-green-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md inline-block">{t(order.statusKey as any)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
