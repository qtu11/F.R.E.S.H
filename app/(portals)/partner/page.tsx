'use client';

import { ScanBarcode } from 'lucide-react';
import Image from 'next/image';
import { useGlobal } from '@/app/providers';

const mockListings = [
  { id: 1, name: 'MILK 1L', stock: 5, discount: '50%', status: 'live', icon: '🥛' },
  { id: 2, name: 'HONEY 500ML', stock: 5, discount: '50%', status: 'live', icon: '🍯' },
];

export default function PartnerApp() {
  const { t } = useGlobal();

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      {/* Green Header Area */}
      <div className="bg-[#057A42] dark:bg-emerald-900 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-sm transition-colors duration-300">
        <div className="text-white font-bold text-lg text-center tracking-wide max-w-5xl mx-auto">
          {t('partner_dashboard')}
        </div>
      </div>

      <div className="px-4 py-6 max-w-5xl mx-auto space-y-6">
        
        {/* Top Section Grid for Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dashboard Card */}
          <div className="bg-[#e1f5fe] dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-blue-100 dark:border-slate-700 flex flex-col justify-center transition-colors duration-300">
            <div className="mb-6">
              <div className="text-gray-600 dark:text-slate-400 font-bold text-xs tracking-wider mb-1 uppercase">{t('todays_revenue')}</div>
              <div className="text-black dark:text-white font-black text-4xl tracking-tight">+2,500,000 VNĐ</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-600 dark:text-slate-400 font-bold text-xs tracking-wider mb-1 uppercase">{t('items_rescued')}</div>
                <div className="text-black dark:text-white font-black text-2xl">35</div>
              </div>
              
              <div>
                <div className="text-gray-600 dark:text-slate-400 font-bold text-xs tracking-wider mb-1 uppercase">{t('esg_impact_co2')}</div>
                <div className="text-black dark:text-white font-black text-2xl">45 kg</div>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="flex flex-col justify-center">
            <button className="w-full bg-[#ff8c00] dark:bg-orange-600 hover:bg-[#e67e22] dark:hover:bg-orange-700 text-white rounded-3xl py-12 flex flex-col items-center justify-center gap-4 shadow-md transition-all hover:scale-[1.02] hover:shadow-lg border border-orange-400 dark:border-orange-500">
              <ScanBarcode className="w-16 h-16" />
              <span className="font-black text-2xl tracking-wide uppercase">{t('scan_new_product')}</span>
            </button>
          </div>
        </div>

        {/* Active Listings Table */}
        <div className="mt-8">
          <h2 className="text-black dark:text-white font-bold text-sm tracking-wide mb-4 uppercase">{t('active_listings')}</h2>
          
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 overflow-x-auto transition-colors duration-300">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-4 gap-4 text-xs text-gray-500 dark:text-slate-400 font-bold mb-4 uppercase px-4 border-b border-gray-100 dark:border-slate-700 pb-2">
                <div>{t('product')}</div>
                <div className="text-center">{t('stock')}</div>
                <div className="text-center">{t('discount')}</div>
                <div className="text-right">{t('status')}</div>
              </div>
              
              <div className="space-y-4">
                {mockListings.map(item => (
                  <div key={item.id} className="grid grid-cols-4 gap-4 items-center text-base font-bold border-b border-gray-50 dark:border-slate-750 pb-4 last:border-0 last:pb-0 px-4 transition-colors hover:bg-gray-50 dark:hover:bg-slate-750 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-2xl shadow-inner border border-gray-200 dark:border-slate-600">{item.icon}</div>
                      <span className="text-gray-900 dark:text-white">{item.name}</span>
                    </div>
                    <div className="text-center text-gray-800 dark:text-slate-200">{item.stock} {t('units')}</div>
                    <div className="text-center text-[#ff8c00] dark:text-orange-400 font-black">{item.discount} {t('off')}</div>
                    <div className="text-right">
                      <span className="bg-[#e8f5e9] dark:bg-emerald-900/30 text-[#057A42] dark:text-emerald-400 border border-[#c8e6c9] dark:border-emerald-800/50 text-xs px-4 py-2 rounded-full inline-block uppercase tracking-wider font-extrabold shadow-sm">{t(item.status as any)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
