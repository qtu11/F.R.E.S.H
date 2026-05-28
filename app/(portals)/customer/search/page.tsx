'use client';

import { useState, useEffect } from 'react';
import { Search as SearchIcon, X, Clock, MapPin, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobal } from '@/app/providers';
import { useAuth } from '@/app/contexts/AuthContext';
import { productService } from '@/lib/data/products';
import { showToast } from '@/lib/data/notifications';

const categories = ['Bakery', 'Fast Food', 'Vegetables', 'Fruits', 'Frozen'];
const filterOptions = [
  { key: 'under_50k', label: 'Under 50k' },
  { key: 'vegan', label: 'Vegan' },
  { key: 'halal', label: 'Halal' },
  { key: 'under_1h', label: 'Under 1 hour' },
  { key: 'over_70', label: 'Over 70% off' },
];

const categoryGradients: Record<string, string> = {
  Bakery: 'from-amber-400 to-orange-500',
  'Fast Food': 'from-red-400 to-orange-600',
  Vegetables: 'from-green-400 to-emerald-600',
  Fruits: 'from-pink-400 to-red-400',
  Frozen: 'from-blue-300 to-indigo-500',
  Beverages: 'from-cyan-400 to-blue-500',
  Dairy: 'from-yellow-200 to-yellow-500',
  Meals: 'from-orange-300 to-red-500',
  Snacks: 'from-purple-400 to-pink-500',
  Produce: 'from-lime-400 to-green-500',
};

export default function CustomerSearch() {
  const { t } = useGlobal();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    productService.getAll().then(data => {
      const filteredData = (data || []).filter(
        (p: any) => !p.id.startsWith('p') || p.id.startsWith('rp')
      );
      setProducts(filteredData.map((p: any) => {
        const tags: string[] = [];
        if (p.aiPrice < 50000) tags.push('under_50k');
        if (p.discount >= 70) tags.push('over_70');
        return {
          id: p.id,
          name: p.name,
          category: p.category,
          store: p.storeName,
          storeId: p.storeId || '',
          originalPrice: p.originalPrice,
          discountedPrice: p.aiPrice,
          discount: p.discount,
          timeLeft: '2h',
          gradient: categoryGradients[p.category] || 'from-emerald-400 to-green-600',
          tags,
          image: p.image,
        };
      }));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      showToast('error', 'Failed to load products');
      setLoading(false);
    });
  }, []);

  const toggleFilter = (key: string) => {
    setActiveFilters(prev => prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]);
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const filtered = products.filter(p => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.store.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (activeFilters.length > 0 && !activeFilters.every(f => p.tags.includes(f))) return false;
    return true;
  });

  const clearAll = () => { setSearchQuery(''); setSelectedCategory(null); setActiveFilters([]); };

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-[#057A42] dark:bg-emerald-900 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-sm transition-colors">
        <div className="max-w-5xl mx-auto text-white font-bold text-xl tracking-wide mb-4">{t('search')}</div>
        <div className="max-w-5xl mx-auto relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('search_deals_placeholder')}
            className="w-full bg-white/20 backdrop-blur-sm text-white placeholder:text-white/50 rounded-2xl pl-12 pr-10 py-3.5 font-bold outline-none focus:ring-2 focus:ring-white/40 transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-4 space-y-4">
        <AnimatePresence>
          {(selectedCategory || activeFilters.length > 0) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap items-center gap-2">
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 bg-[#057A42]/10 text-[#057A42] dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full border border-[#057A42]/20 dark:border-emerald-700">
                  {selectedCategory} <button onClick={() => setSelectedCategory(null)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {activeFilters.map(f => (
                <span key={f} className="inline-flex items-center gap-1 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-bold px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-800">
                  {filterOptions.find(o => o.key === f)?.label} <button onClick={() => toggleFilter(f)}><X className="w-3 h-3" /></button>
                </span>
              ))}
              <button onClick={clearAll} className="text-xs text-gray-500 dark:text-slate-400 font-bold hover:text-red-500 transition-colors">Clear all</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                selectedCategory === cat
                  ? 'bg-[#057A42] text-white border-[#057A42] shadow-md'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-[#057A42]/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {filterOptions.map(opt => (
            <button key={opt.key} onClick={() => toggleFilter(opt.key)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                activeFilters.includes(opt.key)
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-orange-500/30'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" /> {opt.label}
            </button>
          ))}
        </div>

        {!mounted || loading ? null : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center shadow-sm border border-gray-100 dark:border-slate-700 mt-8">
            <SearchIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No results found</h3>
            <p className="text-gray-500 dark:text-slate-400 font-medium mb-6">Try adjusting your search or filters</p>
            <button onClick={clearAll} className="px-6 py-3 bg-[#057A42] text-white rounded-xl font-bold text-sm hover:bg-[#046034] transition-colors">Clear All Filters</button>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {filtered.map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} layout className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all group">
                <Link href={`/customer/deals/${product.id}`}>
                  <div className={`h-32 bg-gradient-to-br ${product.gradient} relative flex items-center justify-center overflow-hidden`}>
                    {product.image && (product.image.startsWith('http') || product.image.startsWith('/')) ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <span className="text-5xl opacity-40 select-none group-hover:scale-110 transition-transform">{product.image || '🍱'}</span>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-xs font-black px-2 py-1 rounded-lg text-orange-600">-{product.discount}%</div>
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded-lg text-gray-600 dark:text-slate-300">
                      <Clock className="w-3 h-3" /> {product.timeLeft}
                    </div>
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Link href={`/customer/deals/${product.id}`}>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm hover:text-[#057A42] transition-colors">{product.name}</h3>
                    </Link>
                    <button onClick={() => toggleFavorite(product.id)} className="shrink-0">
                      <svg className={`w-5 h-5 transition-colors ${favorites.includes(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-300 dark:text-slate-600'}`} viewBox="0 0 24 24" fill={favorites.includes(product.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 dark:text-slate-400 text-[10px] font-semibold mb-3">
                    <MapPin className="w-3 h-3" /> {product.store}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-400 dark:text-slate-500 line-through text-xs mr-2">{product.originalPrice.toLocaleString()}đ</span>
                      <span className="text-gray-900 dark:text-white font-black text-lg">{product.discountedPrice.toLocaleString()}đ</span>
                    </div>
                    <Link href={`/customer/deals/${product.id}`}>
                      <button className="text-[10px] bg-[#057A42] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#046034] transition-colors shadow-md shadow-[#057A42]/20">Rescue Now</button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
