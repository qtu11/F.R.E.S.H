'use client';

import { useState, useEffect } from 'react';
import { Heart, ShoppingBag, MapPin, Clock, X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobal } from '@/app/providers';
import { useAuth } from '@/app/contexts/AuthContext';
import { showToast } from '@/lib/data/notifications';
import { favoriteService } from '@/lib/data/favorites';

export default function CustomerFavorites() {
  const { t } = useGlobal();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getTimeLeft = (expiry?: string) => {
    if (!expiry) return 'N/A';
    const diff = new Date(expiry).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const mins = Math.floor(diff / 60000);
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h}h ${m}m`;
    }
    return `${mins}m`;
  };

  const categoryGradients: Record<string, string> = {
    Bakery: 'from-amber-400 to-orange-600',
    'Fast Food': 'from-orange-400 to-red-600',
    Vegetables: 'from-emerald-400 to-green-600',
    Fruits: 'from-yellow-400 to-green-600',
    Frozen: 'from-cyan-400 to-blue-600',
    Beverages: 'from-sky-400 to-blue-600',
    Dairy: 'from-blue-100 to-blue-500',
    Meals: 'from-orange-400 to-red-500',
    Snacks: 'from-yellow-300 to-amber-600',
    Produce: 'from-lime-400 to-green-600',
  };

  useEffect(() => {
    setMounted(true);
    const uid = user?.id || '';
    favoriteService.getByUser(uid).then(data => {
      setFavorites((data || []).map((f: any) => {
        const p = f.product || f;
        return {
          id: p.id || f.id,
          name: p.name || 'Product',
          store: p.storeName || 'Store',
          storeId: p.storeId || '',
          originalPrice: p.originalPrice || 0,
          discountedPrice: p.aiPrice || p.discountedPrice || 0,
          discount: p.discount || 0,
          timeLeft: getTimeLeft(p.expiry),
          gradient: categoryGradients[p.category] || 'from-emerald-400 to-green-600',
        };
      }));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      showToast('error', 'Failed to load favorites');
      setLoading(false);
    });
  }, [user]);

  const removeFavorite = async (id: string) => {
    try {
      await favoriteService.remove(user?.id || '', id);
      setFavorites(prev => prev.filter(d => d.id !== id));
      showToast('info', 'Removed from favorites');
    } catch { showToast('error', 'Failed to remove'); }
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
        {!mounted || loading ? null : favorites.length === 0 ? (
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
                      <button onClick={() => {
                        const currentCart = localStorage.getItem('fresh_cart');
                        const cartItems = currentCart ? JSON.parse(currentCart) : [];
                        const existing = cartItems.find((item: any) => item.id === deal.id);
                        if (existing) {
                          existing.quantity += 1;
                        } else {
                          cartItems.push({
                            id: deal.id,
                            name: deal.name,
                            store: deal.store,
                            storeId: deal.storeId || '',
                            price: deal.discountedPrice,
                            originalPrice: deal.originalPrice,
                            quantity: 1,
                            gradient: deal.gradient,
                            discount: deal.discount
                          });
                        }
                        localStorage.setItem('fresh_cart', JSON.stringify(cartItems));
                        showToast('success', 'Added to cart!', `${deal.name} added to cart`);
                      }}
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
