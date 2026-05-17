'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, Clock, CheckCircle, Package, Bike, UtensilsCrossed } from 'lucide-react';
import { useGlobal } from '@/app/providers';

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'picked_up' | 'completed';

interface Order {
  id: string;
  customer: string;
  items: string[];
  total: number;
  time: string;
  status: OrderStatus;
}

const statusColors: Record<OrderStatus, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  preparing: { bg: 'bg-blue-100', text: 'text-blue-700' },
  ready: { bg: 'bg-green-100', text: 'text-green-700' },
  picked_up: { bg: 'bg-purple-100', text: 'text-purple-700' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-500' },
};

const mockOrders: Order[] = [
  { id: 'ORD-001', customer: 'Alice Nguyen', items: ['Banana Bread', 'Iced Coffee'], total: 45000, time: '10:23 AM', status: 'pending' },
  { id: 'ORD-002', customer: 'Bob Tran', items: ['Avocado Toast', 'Green Smoothie'], total: 62000, time: '10:45 AM', status: 'preparing' },
  { id: 'ORD-003', customer: 'Carol Le', items: ['Croissant', 'Latte'], total: 35000, time: '11:00 AM', status: 'ready' },
  { id: 'ORD-004', customer: 'David Pham', items: ['Muffin', 'Hot Chocolate'], total: 28000, time: '11:15 AM', status: 'picked_up' },
  { id: 'ORD-005', customer: 'Eve Hoang', items: ['Sandwich', 'Cold Brew', 'Cookie'], total: 78000, time: '11:30 AM', status: 'completed' },
  { id: 'ORD-006', customer: 'Frank Vo', items: ['Bagel', 'Cappuccino'], total: 39000, time: '11:50 AM', status: 'pending' },
  { id: 'ORD-007', customer: 'Grace Bui', items: ['Panini', 'Lemonade'], total: 52000, time: '12:10 PM', status: 'preparing' },
  { id: 'ORD-008', customer: 'Henry Dang', items: ['Salad Wrap', 'Iced Tea'], total: 42000, time: '12:30 PM', status: 'pending' },
  { id: 'ORD-009', customer: 'Ivy Ngo', items: ['Brownie', 'Espresso'], total: 25000, time: '12:45 PM', status: 'ready' },
  { id: 'ORD-010', customer: 'Jack Vu', items: ['Pizza Slice', 'Soda', 'Fries'], total: 89000, time: '1:00 PM', status: 'picked_up' },
  { id: 'ORD-011', customer: 'Kim Ly', items: ['Donut', 'Matcha Latte'], total: 32000, time: '1:20 PM', status: 'completed' },
  { id: 'ORD-012', customer: 'Leo Mai', items: ['Quiche', 'Orange Juice'], total: 48000, time: '1:40 PM', status: 'preparing' },
];

const tabs: { key: OrderStatus | 'all'; icon: typeof Clock }[] = [
  { key: 'all', icon: Clock },
  { key: 'pending', icon: Clock },
  { key: 'preparing', icon: Package },
  { key: 'ready', icon: CheckCircle },
  { key: 'picked_up', icon: Bike },
  { key: 'completed', icon: UtensilsCrossed },
];

const nextStatus: Record<OrderStatus, OrderStatus | null> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'picked_up',
  picked_up: 'completed',
  completed: null,
};

export default function PartnerOrdersPage() {
  const { t } = useGlobal();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  useEffect(() => { setMounted(true); }, []);

  const filtered = orders.filter(o => {
    const matchTab = activeTab === 'all' || o.status === activeTab;
    const matchSearch = !search || o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const counts = tabs.reduce((acc, tab) => {
    const key = tab.key;
    acc[key] = key === 'all' ? orders.length : orders.filter(o => o.status === key).length;
    return acc;
  }, {} as Record<string, number>);

  const handleStatusUpdate = (id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const next = nextStatus[o.status];
      return next ? { ...o, status: next } : o;
    }));
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-700 to-emerald-500 rounded-2xl p-6 md:p-8 mb-6 shadow-lg"
      >
        <h1 className="text-white text-2xl md:text-3xl font-bold">{t('order_management')}</h1>
        <p className="text-emerald-100 text-sm mt-1">{t('manage_orders')}</p>
      </motion.div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('search_order')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${active ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              <Icon className="w-4 h-4" />
              {t(`status_${tab.key}`)}
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{counts[tab.key]}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {filtered.map((order, i) => {
          const sc = statusColors[order.status];
          const next = nextStatus[order.status];
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{order.id}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${sc.bg} ${sc.text}`}>{t(`status_${order.status}`)}</span>
                  </div>
                  <p className="text-gray-700 font-medium">{order.customer}</p>
                  <p className="text-gray-500 text-sm mt-1">{order.items.join(', ')}</p>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{order.time}</span>
                    <span className="font-semibold text-gray-800">{order.total.toLocaleString()} VNĐ</span>
                  </div>
                </div>
                {next && (
                  <button
                    onClick={() => handleStatusUpdate(order.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors whitespace-nowrap shadow-sm"
                  >
                    {t('mark_as')} {t(`status_${next}`)}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">{t('no_orders_found')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
