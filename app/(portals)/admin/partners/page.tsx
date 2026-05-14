'use client';

import { Users, Check, X, Store, MapPin, Phone, ExternalLink } from 'lucide-react';
import { useGlobal } from '@/app/providers';

const mockPendingPartners = [
  { id: 1, name: 'Bách Hóa Xanh - Quận 7', owner: 'Nguyễn Văn A', location: '123 Nguyễn Thị Thập, Q7', phone: '0901234567', date: '2h ago' },
  { id: 2, name: 'FamilyMart - Thảo Điền', owner: 'Trần Thị B', location: '45 Xuân Thủy, Q2', phone: '0987654321', date: '5h ago' },
  { id: 3, name: 'GS25 - Vinhomes Central Park', owner: 'Lê Văn C', location: 'P1, Q.Bình Thạnh', phone: '0912345678', date: 'Yesterday' },
];

export default function AdminPartners() {
  const { t } = useGlobal();

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-[#057A42] dark:bg-emerald-900 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-sm transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-white font-bold text-xl tracking-wide flex items-center gap-3">
            <Users className="w-6 h-6" /> {t('partners_approvals')}
          </h1>
          <div className="bg-white/20 dark:bg-white/10 px-4 py-2 rounded-xl text-white text-xs font-bold border border-white/20">
            {mockPendingPartners.length} {t('pending_approvals')}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-6">
        
        {/* Table List */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('store_name')}</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('location')}</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">{t('action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {mockPendingPartners.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-750 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                             <Store className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">{item.name}</div>
                            <div className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase">{item.owner}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-slate-400 font-medium">
                           <MapPin className="w-3.5 h-3.5 text-[#057A42] dark:text-emerald-400" /> {item.location}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="text-xs font-bold text-gray-800 dark:text-slate-300 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400" /> {item.phone}
                         </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <div className="flex items-center justify-end gap-2">
                            <button className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-800/50 transition-colors" title={t('approve')}>
                               <Check className="w-5 h-5" />
                            </button>
                            <button className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors" title={t('reject')}>
                               <X className="w-5 h-5" />
                            </button>
                            <button className="p-2 bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                               <ExternalLink className="w-4 h-4" />
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
