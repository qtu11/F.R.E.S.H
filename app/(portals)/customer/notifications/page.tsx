'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Tag, ShoppingBag, Ticket, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobal } from '@/app/providers';
import { showToast, notificationService } from '@/lib/data/notifications';

type TabType = 'all' | 'deals' | 'orders' | 'vouchers';

const tabs: { key: TabType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'deals', label: 'Deals' },
  { key: 'orders', label: 'Orders' },
  { key: 'vouchers', label: 'Vouchers' },
];

const typeIconMap: Record<string, any> = {
  deal: Tag,
  order: ShoppingBag,
  voucher: Ticket,
};

const typeColorMap: Record<string, string> = {
  deal: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  order: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  voucher: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
};

const typeTabMap: Record<string, string> = {
  deal: 'deals',
  order: 'orders',
  voucher: 'vouchers',
};

export default function CustomerNotifications() {
  const { t } = useGlobal();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [readIds, setReadIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    notificationService.getAll().then(data => {
      setNotifications((data || []).map((n: any) => ({
        id: n.id,
        type: typeTabMap[n.type] || n.type || 'deals',
        icon: typeIconMap[n.type] || Tag,
        title: n.title || '',
        desc: n.message || '',
        time: n.time || '',
        color: typeColorMap[n.type] || 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      })));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      showToast('error', 'Failed to load notifications');
      setLoading(false);
    });
  }, []);

  const filtered = activeTab === 'all' ? notifications : notifications.filter((n: any) => n.type === activeTab);
  const unreadCount = notifications.filter((n: any) => !readIds.includes(n.id)).length;

  const markAllRead = async () => {
    setReadIds(notifications.map((n: any) => n.id));
    await notificationService.markAllAsRead();
    showToast('success', 'All notifications marked as read');
  };

  const markRead = (id: string) => {
    if (!readIds.includes(id)) {
      setReadIds(prev => [...prev, id]);
      notificationService.markAsRead(id);
    }
  };

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-[#057A42] dark:bg-emerald-900 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-sm transition-colors">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-white" />
            <div>
              <span className="text-white font-bold text-xl tracking-wide">Notifications</span>
              {unreadCount > 0 && <span className="ml-2 bg-white/30 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount} new</span>}
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-white/80 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors">
              <BellOff className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-4">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 mb-4">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 px-5 py-2.5 rounded-full text-xs font-bold border transition-all ${
                activeTab === tab.key
                  ? 'bg-[#057A42] text-white border-[#057A42] shadow-md'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-[#057A42]/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {!mounted || loading ? null : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center shadow-sm border border-gray-100 dark:border-slate-700 mt-4">
            <Bell className="w-16 h-16 mx-auto text-gray-300 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No notifications</h3>
            <p className="text-gray-500 dark:text-slate-400 font-medium">You&apos;re all caught up!</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filtered.map((notif, i) => {
                const isRead = readIds.includes(notif.id);
                const Icon = notif.icon;
                return (
                  <motion.div key={notif.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: i * 0.03 }}
                    onClick={() => markRead(notif.id)}
                    className={`bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border transition-all hover:shadow-md cursor-pointer flex gap-4 items-start ${
                      isRead ? 'border-gray-100 dark:border-slate-700' : 'border-l-4 border-l-[#057A42] dark:border-l-emerald-500 border-gray-100 dark:border-slate-700'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${notif.color} flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm ${isRead ? 'font-medium text-gray-600 dark:text-slate-400' : 'font-bold text-gray-900 dark:text-white'}`}>{notif.title}</h4>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 shrink-0">{notif.time}</span>
                      </div>
                      <p className={`text-xs mt-0.5 ${isRead ? 'text-gray-400 dark:text-slate-500' : 'text-gray-500 dark:text-slate-400'}`}>{notif.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600 mt-2 shrink-0" />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
