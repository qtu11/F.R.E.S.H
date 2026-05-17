'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Clock, MapPin, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobal } from '@/app/providers';
import { showToast } from '@/lib/data/notifications';
import { ExpiryBar } from '@/components/ExpiryBar';
import {
  staggerContainer, staggerItem, cardHover, cardTap, buttonTap, scaleIn,
  fadeUp, useSafeReducedMotion,
} from '@/lib/animation';

const allDeals = [
  { id: 'd1', name: 'Bánh Mì Thịt Nguội', category: 'Bakery', store: 'WinMart+ D1', originalPrice: 30000, discountedPrice: 12000, discount: 60, timeLeft: 45, gradient: 'from-amber-400 to-orange-500', nearest: 0.3 },
  { id: 'd2', name: 'Croissant Bơ', category: 'Bakery', store: 'FamilyMart D3', originalPrice: 25000, discountedPrice: 10000, discount: 60, timeLeft: 60, gradient: 'from-yellow-300 to-amber-500', nearest: 0.5 },
  { id: 'd3', name: 'Gà Rán Cay', category: 'Fast Food', store: 'Circle K D1', originalPrice: 55000, discountedPrice: 22000, discount: 60, timeLeft: 30, gradient: 'from-red-400 to-orange-600', nearest: 0.2 },
  { id: 'd4', name: 'Khoai Tây Chiên', category: 'Fast Food', store: 'AEON Tân Phú', originalPrice: 35000, discountedPrice: 14000, discount: 60, timeLeft: 120, gradient: 'from-yellow-400 to-yellow-600', nearest: 2.1 },
  { id: 'd5', name: 'Rau Củ Tổng Hợp', category: 'Vegetables', store: 'Co.opmart D1', originalPrice: 45000, discountedPrice: 13500, discount: 70, timeLeft: 180, gradient: 'from-green-400 to-emerald-600', nearest: 0.8 },
  { id: 'd6', name: 'Salad Rau Trộn', category: 'Vegetables', store: 'WinMart+ D1', originalPrice: 40000, discountedPrice: 12000, discount: 70, timeLeft: 60, gradient: 'from-lime-400 to-green-500', nearest: 0.3 },
  { id: 'd7', name: 'Trái Cây Tươi', category: 'Fruits', store: 'MM Mega Market', originalPrice: 60000, discountedPrice: 18000, discount: 70, timeLeft: 240, gradient: 'from-pink-400 to-red-400', nearest: 1.5 },
  { id: 'd8', name: 'Sinh Tố Trái Cây', category: 'Fruits', store: 'Lotte Mart D7', originalPrice: 50000, discountedPrice: 25000, discount: 50, timeLeft: 120, gradient: 'from-purple-400 to-pink-500', nearest: 3.2 },
  { id: 'd9', name: 'Kem Vanilla Hộp', category: 'Frozen', store: 'AEON Tân Phú', originalPrice: 80000, discountedPrice: 32000, discount: 60, timeLeft: 300, gradient: 'from-blue-300 to-indigo-500', nearest: 2.1 },
  { id: 'd10', name: 'Cá Hồi Đông Lạnh', category: 'Frozen', store: 'Big C D2', originalPrice: 150000, discountedPrice: 60000, discount: 60, timeLeft: 360, gradient: 'from-teal-400 to-blue-600', nearest: 4.0 },
  { id: 'd11', name: 'Bánh Bao Nhân Thịt', category: 'Frozen', store: 'FamilyMart D3', originalPrice: 20000, discountedPrice: 6000, discount: 70, timeLeft: 60, gradient: 'from-gray-300 to-gray-500', nearest: 0.5 },
  { id: 'd12', name: 'Xôi Gà', category: 'Fast Food', store: 'Circle K D1', originalPrice: 25000, discountedPrice: 12500, discount: 50, timeLeft: 20, gradient: 'from-orange-300 to-red-500', nearest: 0.2 },
];

const categories = ['All', 'Bakery', 'Fast Food', 'Vegetables', 'Fruits', 'Frozen'];
type SortKey = 'ending' | 'discount' | 'nearest';

export default function CustomerDeals() {
  const { t, lang } = useGlobal();
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sort, setSort] = useState<SortKey>('ending');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const reduced = useSafeReducedMotion();

  useEffect(() => { setMounted(true); }, []);

  const filtered = allDeals
    .filter(d => selectedCategory === 'All' || d.category === selectedCategory)
    .sort((a, b) => {
      if (sort === 'ending') return a.timeLeft - b.timeLeft;
      if (sort === 'discount') return b.discount - a.discount;
      return a.nearest - b.nearest;
    });

  const sortLabels: Record<SortKey, string> = {
    ending: lang === 'vi' ? 'Sắp hết' : 'Ending Soon',
    discount: lang === 'vi' ? 'Giảm nhiều nhất' : 'Biggest Discount',
    nearest: lang === 'vi' ? 'Gần nhất' : 'Nearest',
  };

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <motion.div variants={fadeUp} initial="hidden" animate={mounted ? 'visible' : 'hidden'}
        className="bg-gradient-to-br from-[#057A42] to-emerald-700 dark:from-emerald-900 dark:to-emerald-950 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-sm transition-colors"
      >
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <motion.div initial={reduced ? {} : { rotate: -20, scale: 0 }} animate={reduced ? {} : { rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
            <ShoppingBag className="w-6 h-6 text-white" />
          </motion.div>
          <span className="text-white font-bold text-xl tracking-wide">{t('deals_near_you')}</span>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 mt-4 space-y-4">
        <motion.div variants={fadeUp} initial="hidden" animate={mounted ? 'visible' : 'hidden'}
          className="flex gap-2 overflow-x-auto hide-scrollbar pb-2"
        >
          {categories.map(cat => (
            <motion.button key={cat} onClick={() => setSelectedCategory(cat)} whileTap={buttonTap}
              whileHover={reduced ? {} : { scale: 1.05 }}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                selectedCategory === cat
                  ? 'bg-[#057A42] text-white border-[#057A42] shadow-md shadow-[#057A42]/20'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-[#057A42]/30'
              }`}
            >
              {cat === 'All' ? t('all') : cat}
            </motion.button>
          ))}
          <div className="relative">
            <motion.button onClick={() => setShowSortMenu(!showSortMenu)} whileTap={buttonTap}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-orange-500/30 transition-all"
            >
              <ArrowUpDown className="w-3 h-3" /> {sortLabels[sort]}
            </motion.button>
            <AnimatePresence>
              {showSortMenu && (
                <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  className="absolute top-12 left-0 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-2 z-20 min-w-[180px]"
                >
                  {(['ending', 'discount', 'nearest'] as SortKey[]).map(key => (
                    <motion.button key={key} onClick={() => { setSort(key); setShowSortMenu(false); }} whileTap={buttonTap}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        sort === key ? 'bg-[#057A42]/10 text-[#057A42] dark:text-emerald-400' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {sortLabels[key]}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {!mounted ? null : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((deal) => {
                const expiryHours = Math.round(deal.timeLeft / 60 * 10) / 10;
                return (
                  <motion.div key={deal.id} layout variants={staggerItem} whileHover={reduced ? {} : cardHover} whileTap={reduced ? {} : cardTap}
                    className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-shadow group"
                  >
                    <Link href={`/customer/deals/${deal.id}`}>
                      <motion.div className={`h-36 bg-gradient-to-br ${deal.gradient} relative flex items-center justify-center overflow-hidden`}>
                        <motion.div initial={reduced ? {} : { x: 40, opacity: 0 }} animate={reduced ? {} : { x: 0, opacity: 1 }} transition={{ delay: 0.15 }}
                          className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-lg shadow-orange-500/30"
                        >
                          -{deal.discount}%
                        </motion.div>
                        <motion.div initial={reduced ? {} : { x: -40, opacity: 0 }} animate={reduced ? {} : { x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                          className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1.5 rounded-lg text-gray-700 dark:text-slate-200"
                        >
                          <Clock className="w-3 h-3" /> {deal.timeLeft}m
                        </motion.div>
                      </motion.div>
                    </Link>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-1">
                        <Link href={`/customer/deals/${deal.id}`}>
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm hover:text-[#057A42] dark:hover:text-emerald-400 transition-colors">{deal.name}</h3>
                        </Link>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 text-[10px] font-semibold mb-2">
                        <MapPin className="w-3 h-3" /> {deal.store}
                        <span className="text-[#057A42] dark:text-emerald-400">{deal.nearest} km</span>
                      </div>
                      <ExpiryBar hours={expiryHours} size="sm" />
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-gray-900 dark:text-white font-black text-lg">{deal.discountedPrice.toLocaleString()}đ</span>
                          <span className="text-gray-400 dark:text-slate-500 line-through text-xs">{deal.originalPrice.toLocaleString()}đ</span>
                        </div>
                        <Link href={`/customer/deals/${deal.id}`}>
                          <motion.button whileHover={reduced ? {} : { scale: 1.05 }} whileTap={buttonTap}
                            className="text-xs bg-gradient-to-r from-[#057A42] to-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:from-[#046034] hover:to-emerald-700 transition-all shadow-md shadow-[#057A42]/20 hover:shadow-lg hover:shadow-[#057A42]/30"
                          >
                            {lang === 'vi' ? 'Giải cứu' : 'Rescue Now'}
                          </motion.button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
