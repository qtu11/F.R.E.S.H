'use client';

import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, Clock, ShoppingBag } from 'lucide-react';
import { useGlobal } from '@/app/providers';
import { useAuth } from '@/app/contexts/AuthContext';
import { orderService, Order } from '@/lib/data/orders';

function formatDate(iso: string) {
  try {
    const date = new Date(iso);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

const statusIcons: Record<string, React.ElementType> = {
  confirmed: CheckCircle2,
  in_transit: Truck,
  delivered: Package,
  cancelled: Clock,
};

const statusColors: Record<string, string> = {
  confirmed: 'border-green-500 bg-green-100 dark:bg-emerald-900/30 text-green-600 dark:text-emerald-400',
  in_transit: 'border-orange-500 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  delivered: 'border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-400',
  cancelled: 'border-red-500 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
};

export default function CustomerOrders() {
  const { t } = useGlobal();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [remainingMin, setRemainingMin] = useState(0);

  useEffect(() => {
    setMounted(true);
    orderService.getByUser(user?.id || '').then(data => {
      setOrders(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    if (!mounted || !orders.length) return;
    const active = orders.find(o => o.status === 'in_transit' || o.status === 'confirmed');
    if (!active) return;
    const update = () => setRemainingMin(Math.max(0, Math.ceil((new Date(active.estimatedDelivery).getTime() - Date.now()) / 60000)));
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, [mounted, orders]);

  const getProgressWidth = (status: string) => {
    const map: Record<string, string> = {
      pending: 'w-[10%]',
      confirmed: 'w-[25%]',
      preparing: 'w-[45%]',
      ready: 'w-[60%]',
      in_transit: 'w-[80%]',
      delivered: 'w-[100%]',
    };
    return map[status] || 'w-[0%]';
  };

  const activeOrder = orders.find(o => o.status === 'in_transit' || o.status === 'confirmed');
  const pastOrders = orders.filter(o => o.status === 'delivered' || o.status === 'cancelled');

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-[#057A42] dark:bg-emerald-900 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-sm transition-colors">
        <div className="max-w-5xl mx-auto text-white font-bold text-xl tracking-wide">{t('my_orders')}</div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6">
        {loading ? (
          <div className="space-y-4">
            {[1,2].map(i => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-3" />
                <div className="h-8 bg-gray-100 dark:bg-slate-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {activeOrder && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 mb-6 relative overflow-hidden transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 dark:bg-orange-500/10 rounded-bl-full -z-0" />
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <div className="text-gray-500 dark:text-slate-400 text-xs font-bold mb-1">{t('current_order')}</div>
                    <div className="text-black dark:text-white font-black text-lg">{activeOrder.id}</div>
                  </div>
                  <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-xs font-bold border border-orange-200 dark:border-orange-800/50">
                    {t('in_transit')}
                  </div>
                </div>

                <div className="relative pt-4 pb-2 z-10">
                  <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-slate-700" />

                  <div className="flex gap-4 mb-6 relative">
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${statusColors.confirmed}`}>
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{t('order_confirmed')}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">{mounted ? formatDate(activeOrder.createdAt) : ''} - {activeOrder.storeName}</div>
                    </div>
                  </div>

                  <div className="flex gap-4 mb-6 relative">
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${statusColors.in_transit} shadow-[0_0_15px_rgba(249,115,22,0.3)]`}>
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{t('on_the_way')}</div>
                      <div className="text-xs text-orange-600 dark:text-orange-400 font-semibold mb-1">{t('ai_prediction')} {mounted ? remainingMin : 0} mins</div>
                        <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5 mt-2">
                          <div className={`bg-orange-500 h-1.5 rounded-full ${getProgressWidth(activeOrder.status)}`} />
                        </div>
                    </div>
                  </div>

                  <div className="flex gap-4 relative opacity-50 dark:opacity-40">
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${statusColors.delivered}`}>
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{t('delivered')}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">{t('pending')}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <h2 className="text-black dark:text-white font-extrabold text-sm mb-4">{t('past_orders')}</h2>

            {pastOrders.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center shadow-sm border border-gray-100 dark:border-slate-700">
                <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600 mb-3" />
                <p className="text-gray-500 dark:text-slate-400 font-bold">No past orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pastOrders.map(order => {
                  const StatusIcon = statusIcons[order.status] || Clock;
                  return (
                    <div key={order.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between transition-colors hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 text-2xl">
                           {order.items[0]?.productImage || '📦'}
                         </div>
                         <div>
                            <div className="font-bold text-gray-900 dark:text-white">{(order.items || []).map(i => i.productName).join(', ')}</div>
                          <div className="text-xs text-gray-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" /> {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-gray-900 dark:text-white">{order.total.toLocaleString()}đ</div>
                        <div className="text-[10px] font-bold text-green-600 dark:text-emerald-400 uppercase mt-1 bg-green-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md inline-block">
                          {order.status === 'delivered' ? t('delivered') : t('cancelled')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
