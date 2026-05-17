'use client';

import { useState, useEffect } from 'react';
import { Heart, ShoppingBag, MapPin, Clock, X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobal } from '@/app/providers';
import { showToast } from '@/lib/data/notifications';

const savedDeals = [
  { id: 'd1', name: 'Bánh Mì Thịt Nguội', store: 'WinMart+ D1', originalPrice: 30000, discountedPrice: 12000, discount: 60, timeLeft: '45m', gradient: 'from-amber-400 to-orange-500' },
  { id: 'd3', name: 'Gà Rán Cay', store: 'Circle K D1', originalPrice: 55000, discountedPrice: 22000, discount: 60, timeLeft: '30m', gradient: 'from-red-400 to-orange-600' },
  { id: 'd5', name: 'Rau Củ Tổng Hợp', store: 'Co.opmart D1', originalPrice: 45000, discountedPrice: 13500, discount: 70, timeLeft: '3h', gradient: 'from-green-400 to-emerald-600' },
  { id: 'd7', name: 'Trái Cây Tươi', store: 'MM Mega Market', originalPrice: 60000, discountedPrice: 18000, discount: 70, timeLeft: '4h', gradient: 'from-pink-400 to-red-400' },
  { id: 'd9', name: 'Kem Vanilla Hộp', store: 'AEON Tân Phú', originalPrice: 80000, discountedPrice: 32000, discount: 60, timeLeft: '5h', gradient: 'from-blue-300 to-indigo-500' },
  { id: 'd2', name: 'Croissant Bơ', store: 'FamilyMart D3', originalPrice: 25000, discountedPrice: 10000, discount: 60, timeLeft: '1h', gradient: 'from-yellow-300 to-amber-500' },
  { id: 'd11', name: 'Bánh Bao Nhân Thịt', store: 'FamilyMart D3', originalPrice: 20000, discountedPrice: 6000, discount: 70, timeLeft: '1h', gradient: 'from-gray-300 to-gray-500' },
  { id: 'd10', name: 'Cá Hồi Đông Lạnh', store: 'Big C D2', originalPrice: 150000, discountedPrice: 60000, discount: 60, timeLeft: '6h', gradient: 'from-teal-400 to-blue-600' },
];

export default function CustomerFavorites() {
  const { t } = useGlobal();
  const [mounted, setMounted] = useState(false);
  const [favorites, setFavorites] = useState(savedDeals);

  useEffect(() => { setMounted(true); }, []);

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(d => d.id !== id));
    showToast('info', 'Removed from favorites');
  };

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-[#057A42] dark:bg-emerald-900 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-sm transition-colors">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Heart className="w-6 h-6 text-white fill-white" />
          <span className="text-white font-bold text-xl tracking-wide">Favorites ({favorites.length})</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6">
        {!mounted ? null : favorites.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center shadow-sm border border-gray-100 dark:border-slate-700">
            <Heart className="w-16 h-16 mx-auto text-gray-300 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No favorites yet</h3>
            <p className="text-gray-500 dark:text-slate-400 font-medium mb-6">Save your favorite deals for quick access!</p>
            <Link href="/customer/search">
              <button className="px-8 py-3 bg-[#057A42] text-white rounded-xl font-bold text-sm hover:bg-[#046034] transition-colors shadow-md">Discover Deals</button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {favorites.map((deal, i) => (
                <motion.div key={deal.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ delay: i * 0.03 }}
                  className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all group"
                >
                  <Link href={`/customer/deals/${deal.id}`}>
                    <div className={`h-32 bg-gradient-to-br ${deal.gradient} relative flex items-center justify-center`}>
                      <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-xs font-black px-2 py-1 rounded-lg text-orange-600">-{deal.discount}%</div>
                      <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded-lg text-gray-600 dark:text-slate-300">
                        <Clock className="w-3 h-3" /> {deal.timeLeft}
                      </div>
                      <button onClick={(e) => { e.preventDefault(); removeFavorite(deal.id); }}
                        className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </Link>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Link href={`/customer/deals/${deal.id}`}>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm hover:text-[#057A42] transition-colors">{deal.name}</h3>
                      </Link>
                      <Heart className="w-5 h-5 text-red-500 fill-red-500 shrink-0" />
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-slate-400 text-[10px] font-semibold mb-3">
                      <MapPin className="w-3 h-3" /> {deal.store}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-gray-400 dark:text-slate-500 line-through text-xs mr-2">{deal.originalPrice.toLocaleString()}đ</span>
                        <span className="text-gray-900 dark:text-white font-black text-lg">{deal.discountedPrice.toLocaleString()}đ</span>
                      </div>
                      <button onClick={() => { showToast('success', 'Added to cart!'); }}
                        className="text-[10px] bg-[#057A42] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#046034] transition-colors shadow-md shadow-[#057A42]/20"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
