'use client';

import { Plus, Search, Filter, Edit2, Trash2, Calendar, Package } from 'lucide-react';
import { useGlobal } from '@/app/providers';

const mockInventory = [
  { id: 1, name: 'Bánh Mì Gà', category: 'Bakery', stock: 12, originalPrice: '30,000', aiPrice: '15,000', expiry: '2026-05-15 18:00', status: 'live' },
  { id: 2, name: 'Sữa Tươi 1L', category: 'Dairy', stock: 8, originalPrice: '45,000', aiPrice: '22,000', expiry: '2026-05-16 09:00', status: 'live' },
  { id: 3, name: 'Salad Trộn', category: 'Produce', stock: 0, originalPrice: '55,000', aiPrice: '25,000', expiry: '2026-05-14 22:00', status: 'out_of_stock' },
];

export default function PartnerInventory() {
  const { t } = useGlobal();

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-[#057A42] dark:bg-emerald-900 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-sm transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-white font-bold text-xl tracking-wide">{t('inventory')}</h1>
          <button className="bg-white dark:bg-slate-800 text-[#057A42] dark:text-emerald-400 font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all shadow-md">
            <Plus className="w-5 h-5" /> {t('add_product')}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-6">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('search')} 
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#057A42] dark:focus:ring-emerald-500 transition-all text-gray-900 dark:text-white"
            />
          </div>
          <button className="bg-white dark:bg-slate-800 px-6 py-3 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm flex items-center gap-2 font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-750 transition-all">
            <Filter className="w-5 h-5" /> {t('filter')}
          </button>
        </div>

        {/* Inventory List */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('product')}</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('stock')}</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('price_original')}</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{t('price_ai')}</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('expiry_date')}</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">{t('action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {mockInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-750 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-xl shadow-inner">
                           <Package className="w-6 h-6 text-[#057A42] dark:text-emerald-400" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">{item.name}</div>
                          <div className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold">{item.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <span className={`px-2 py-1 rounded-md text-xs font-bold ${item.stock > 0 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                          {item.stock} {t('units')}
                       </span>
                    </td>
                    <td className="px-6 py-5 font-bold text-gray-600 dark:text-slate-400">{item.originalPrice} đ</td>
                    <td className="px-6 py-5 font-black text-[#057A42] dark:text-emerald-400">{item.aiPrice} đ</td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 font-bold">
                          <Calendar className="w-3 h-3" /> {item.expiry}
                       </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 transition-colors" title={t('edit')}>
                             <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 transition-colors" title={t('delete')}>
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
