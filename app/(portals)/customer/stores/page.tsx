'use client';

import { useState, useEffect } from 'react';
import { Store, Search, MapPin, Phone, Star, Clock, ChevronRight, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGlobal } from '@/app/providers';
import { showToast } from '@/lib/data/notifications';

const stores = [
  { id: 's1', name: 'WinMart+', address: '123 Nguyễn Huệ, D1', distance: '0.3 km', rating: 4.5, open: true, yearsOpen: 5, dealsCount: 8, phone: '028 3825 6789', color: 'from-blue-500 to-blue-700' },
  { id: 's2', name: 'Co.opmart', address: '45 Lê Lợi, D1', distance: '0.8 km', rating: 4.3, open: true, yearsOpen: 12, dealsCount: 5, phone: '028 3829 0123', color: 'from-red-500 to-red-700' },
  { id: 's3', name: 'AEON', address: '1 Tân Phú, D7', distance: '2.1 km', rating: 4.6, open: true, yearsOpen: 8, dealsCount: 12, phone: '028 5413 6789', color: 'from-emerald-500 to-emerald-700' },
  { id: 's4', name: 'MM Mega Market', address: '78 Nam Kỳ Khởi Nghĩa, D3', distance: '1.5 km', rating: 4.2, open: true, yearsOpen: 15, dealsCount: 4, phone: '028 3930 4567', color: 'from-orange-500 to-orange-700' },
  { id: 's5', name: 'FamilyMart', address: '56 Nguyễn Đình Chiểu, D3', distance: '0.5 km', rating: 4.0, open: true, yearsOpen: 3, dealsCount: 6, phone: '028 3823 8901', color: 'from-green-500 to-green-700' },
  { id: 's6', name: 'Circle K', address: '12 Lý Tự Trọng, D1', distance: '0.2 km', rating: 3.8, open: true, yearsOpen: 2, dealsCount: 3, phone: '028 3825 2345', color: 'from-red-600 to-red-800' },
  { id: 's7', name: 'Lotte Mart', address: '469 Nguyễn Hữu Thọ, D7', distance: '3.2 km', rating: 4.4, open: false, yearsOpen: 10, dealsCount: 7, phone: '028 3771 5678', color: 'from-yellow-500 to-yellow-700' },
  { id: 's8', name: 'Big C', address: '88 Nguyễn Văn Linh, D7', distance: '4.0 km', rating: 4.1, open: true, yearsOpen: 6, dealsCount: 9, phone: '028 5410 1234', color: 'from-cyan-500 to-cyan-700' },
];

export default function CustomerStores() {
  const { t } = useGlobal();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { setMounted(true); }, []);

  const filtered = stores.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-slate-600'}`} />
    ));
  };

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-[#057A42] dark:bg-emerald-900 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-sm transition-colors">
        <div className="max-w-5xl mx-auto flex items-center gap-3 mb-4">
          <Store className="w-6 h-6 text-white" />
          <span className="text-white font-bold text-xl tracking-wide">Stores Near You</span>
        </div>
        <div className="max-w-5xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('search_stores_placeholder')}
            className="w-full bg-white/20 backdrop-blur-sm text-white placeholder:text-white/50 rounded-2xl pl-12 pr-4 py-3.5 font-bold outline-none focus:ring-2 focus:ring-white/40 transition-all"
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6 space-y-3">
        {!mounted ? null : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center shadow-sm border border-gray-100 dark:border-slate-700">
            <Store className="w-16 h-16 mx-auto text-gray-300 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No stores found</h3>
            <p className="text-gray-500 dark:text-slate-400 font-medium">Try a different search term</p>
          </motion.div>
        ) : (
          filtered.map((store, i) => (
            <motion.div key={store.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all"
            >
              <div className="flex">
                <div className={`w-20 shrink-0 bg-gradient-to-b ${store.color} flex items-center justify-center`}>
                  <Store className="w-8 h-8 text-white/80" />
                </div>
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{store.name}</h3>
                      <div className="flex items-center gap-1 text-gray-500 dark:text-slate-400 text-xs mt-0.5">
                        <MapPin className="w-3 h-3" /> {store.address}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {renderStars(store.rating)}
                      <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 ml-1">{store.rating}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] font-medium">
                    <div className="flex items-center gap-1 text-gray-500 dark:text-slate-400">
                      <MapPin className="w-3 h-3 text-[#057A42]" /> {store.distance}
                    </div>
                    <div className={`flex items-center gap-1 ${store.open ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                      <Clock className="w-3 h-3" /> {store.open ? 'Open' : 'Closed'}
                    </div>
                    <div className="text-gray-500 dark:text-slate-400">
                      Open since {store.yearsOpen} years
                    </div>
                    <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-bold">
                      <Tag className="w-3 h-3" /> {store.dealsCount} active deals
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={() => showToast('info', 'Calling', `${store.phone}`)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-slate-700 rounded-xl text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      <Phone className="w-3 h-3" /> Call
                    </button>
                    <button onClick={() => showToast('info', 'Map', `Navigating to ${store.name}`)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#057A42] text-white rounded-xl text-xs font-bold hover:bg-[#046034] transition-colors"
                    >
                      <MapPin className="w-3 h-3" /> Map
                    </button>
                    <button onClick={() => showToast('info', 'Deals', `${store.dealsCount} deals at ${store.name}`)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl text-xs font-bold hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors ml-auto"
                    >
                      <Tag className="w-3 h-3" /> {store.dealsCount} deals
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
