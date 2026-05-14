'use client';

import { MapPin, Ticket, Clock } from 'lucide-react';
import Image from 'next/image';
import { useGlobal } from '@/app/providers';

const mockDeals = [
  { id: 1, name: 'BANH MI (Chicken)', originalPrice: '30,000', newPrice: '9,000 VND', expiry: '1h 15m', discount: '70%', image: 'https://picsum.photos/seed/banhmi1/100/100' },
  { id: 2, name: 'BANH MI (Chicken)', originalPrice: '30,000', newPrice: '9,000 VND', expiry: '1h 15m', discount: '70%', image: 'https://picsum.photos/seed/banhmi2/100/100' },
];

export default function CustomerApp() {
  const { t } = useGlobal();

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      {/* Green Header Area */}
      <div className="bg-[#057A42] dark:bg-emerald-900 pt-12 pb-24 px-4 shadow-lg md:rounded-b-[40px] transition-colors duration-300">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center p-1 transition-colors duration-300">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" className="w-full h-full rounded-full bg-blue-100 dark:bg-blue-900/50" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-yellow-400 w-5 h-5 rounded-full border-2 border-[#057A42] dark:border-emerald-900 flex items-center justify-center">
                <span className="text-[10px]">⭐</span>
              </div>
            </div>
            <div>
              <div className="text-white/80 dark:text-emerald-200/80 text-xs font-semibold tracking-wider">{t('green_profile')}</div>
              <div className="text-white font-bold text-lg leading-tight uppercase tracking-wide">{t('waste_warrior_profile')}</div>
              <div className="bg-yellow-500 dark:bg-yellow-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1">
                {t('gold_member')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto">
        {/* Stats Card (Overlapping header) */}
        <div className="px-4 -mt-16 relative z-10">
          <div className="bg-[#e8f5e9] dark:bg-slate-800 rounded-2xl p-4 md:p-6 shadow-sm border border-green-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors duration-300">
            <div className="flex justify-between w-full md:w-1/2">
              <div>
                <div className="text-gray-500 dark:text-slate-400 text-xs font-bold mb-1">{t('food_rescued')}</div>
                <div className="text-black dark:text-white font-black text-xl md:text-3xl">12.5 kg</div>
              </div>
              <div className="text-right md:text-left">
                <div className="text-gray-500 dark:text-slate-400 text-xs font-bold mb-1">{t('green_credit')}</div>
                <div className="text-black dark:text-white font-black text-xl md:text-3xl">1,250</div>
              </div>
            </div>
            <button className="w-full md:w-auto px-8 bg-[#c8e6c9] dark:bg-emerald-900/50 text-[#057A42] dark:text-emerald-400 font-bold py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#a5d6a7] dark:hover:bg-emerald-800/50 transition-colors text-sm border border-transparent dark:border-emerald-800">
              <Ticket className="w-4 h-4" />
              {t('redeem_vouchers')}
            </button>
          </div>
        </div>

        <div className="px-4 mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-black dark:text-white font-extrabold text-sm mb-3">{t('flash_deals_map')}</h2>
            {/* Map Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-sm border border-gray-100 dark:border-slate-700 relative h-[250px] md:h-[400px] overflow-hidden transition-colors duration-300">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.42416741972!2d106.698399315334!3d10.7788489923192!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38f9ed887b%3A0x14aded5703768ddb!2sDistrict%201%2C%20Ho%20Chi%20Minh%20City!5e0!3m2!1sen!2svn!4v1684305710631!5m2!1sen!2svn" 
                className="absolute inset-0 w-full h-full opacity-80 dark:opacity-60 dark:invert-[.9] dark:hue-rotate-180"
                style={{ filter: 'contrast(1.1) saturate(1.2)' }}
                allowFullScreen={false}
                loading="lazy"
              />
              
              {/* Custom Map Markers over iframe */}
              <div className="absolute top-1/4 left-1/4 flex flex-col items-center">
                <div className="bg-white dark:bg-slate-700 px-2 py-1 rounded shadow-md text-[10px] font-bold text-gray-800 dark:text-gray-200 mb-1">WINMART+</div>
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-lg relative">
                  <div className="w-2 h-2 bg-white dark:bg-slate-200 rounded-full"></div>
                  <div className="absolute -bottom-2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-orange-500"></div>
                </div>
              </div>

              <div className="absolute top-1/3 right-1/4 flex flex-col items-center">
                <div className="bg-white dark:bg-slate-700 px-2 py-1 rounded shadow-md text-[10px] font-bold text-gray-800 dark:text-gray-200 mb-1">CIRCLE K</div>
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-lg relative">
                  <div className="w-2 h-2 bg-white dark:bg-slate-200 rounded-full"></div>
                  <div className="absolute -bottom-2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-orange-500"></div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-black dark:text-white font-extrabold text-sm mb-3 md:mt-0 mt-6">{t('deals_near_you')}</h2>
            {/* Deals List */}
            <div className="space-y-3">
              {mockDeals.map(deal => (
                <div key={deal.id} className="bg-white dark:bg-slate-800 rounded-2xl p-3 flex gap-3 shadow-sm border border-gray-100 dark:border-slate-700 transition-all hover:shadow-md cursor-pointer group">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden shrink-0">
                    <Image src={deal.image} alt={deal.name} width={128} height={128} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">{deal.name}</h3>
                      <span className="bg-[#ff8c00] text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded">{deal.discount} {t('off')}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-[10px] md:text-xs font-semibold border border-gray-200 dark:border-slate-600 w-fit px-2 py-0.5 rounded-md mt-1">
                      <Clock className="w-3 h-3 text-[#d97706] dark:text-[#f59e0b]" />
                      {t('ends_in')} {deal.expiry}
                    </div>
                    <div className="text-right mt-2">
                      <span className="text-gray-400 dark:text-slate-500 line-through text-xs mr-2">{deal.originalPrice}</span>
                      <span className="text-black dark:text-white font-black text-lg">{deal.newPrice}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
