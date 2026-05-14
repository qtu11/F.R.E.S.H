'use client';

import { ArrowLeft, Share2, Heart, Clock, Leaf, Info, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGlobal } from '@/app/providers';
import { motion } from 'framer-motion';

export default function ProductDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { t } = useGlobal();

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen pb-24 transition-colors duration-300">
      {/* Header Image Area */}
      <div className="relative h-[40vh] md:h-[50vh] w-full bg-gray-100 dark:bg-slate-900 transition-colors">
         <div className="absolute top-12 left-4 z-20">
            <button onClick={() => router.back()} className="w-12 h-12 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md flex items-center justify-center text-gray-900 dark:text-white shadow-lg">
               <ArrowLeft className="w-6 h-6" />
            </button>
         </div>
         <div className="absolute top-12 right-4 z-20 flex gap-3">
            <button className="w-12 h-12 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md flex items-center justify-center text-gray-900 dark:text-white shadow-lg">
               <Share2 className="w-6 h-6" />
            </button>
            <button className="w-12 h-12 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md flex items-center justify-center text-gray-900 dark:text-white shadow-lg text-red-500">
               <Heart className="w-6 h-6" />
            </button>
         </div>

         {/* Placeholder Image */}
         <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500/10 to-blue-500/10">
            <div className="text-9xl opacity-20">🍱</div>
         </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-10 relative z-10">
         {/* Main Card */}
         <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-2xl border border-gray-100 dark:border-slate-800 transition-colors">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
               <div>
                  <div className="flex items-center gap-2 mb-2">
                     <span className="bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest">{t('ends_in')} 45m</span>
                     <span className="bg-emerald-100 dark:bg-emerald-900/40 text-[#057A42] dark:text-emerald-400 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest flex items-center gap-1">
                        <Leaf className="w-3 h-3" /> ESG Verified
                     </span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Premium Bento Box</h1>
                  <p className="text-gray-400 dark:text-slate-500 font-bold flex items-center gap-1.5 mt-1">
                     WinMart+ • District 1, HCMC
                  </p>
               </div>
               <div className="text-right flex flex-col items-end">
                  <div className="text-gray-400 line-through text-sm font-bold decoration-orange-500/50 decoration-2">45,000 đ</div>
                  <div className="text-4xl font-black text-gray-900 dark:text-white">15,000 đ</div>
                  <div className="text-xs font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full mt-2">65% {t('off')}</div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-y border-gray-100 dark:border-slate-800 py-8">
               <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                     <Clock className="w-4 h-4" /> Freshness Timeline
                  </h3>
                  <div className="w-full bg-gray-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
                     <div className="bg-emerald-500 h-full w-[70%]" />
                     <div className="bg-orange-500 h-full w-[20%]" />
                     <div className="bg-red-500 h-full w-[10%]" />
                  </div>
                  <p className="text-xs font-bold text-gray-500 dark:text-slate-400">
                     Best consumed within <span className="text-orange-500">2 hours</span> for peak quality.
                  </p>
               </div>
               <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                     <Leaf className="w-4 h-4" /> ESG Impact
                  </h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl flex items-center gap-4">
                     <div className="w-12 h-12 bg-[#057A42] text-white rounded-xl flex items-center justify-center">
                        <Leaf className="w-6 h-6" />
                     </div>
                     <div>
                        <div className="text-sm font-black text-[#057A42] dark:text-emerald-400">0.8kg CO2 Saved</div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Equivalent to 2.5km driving</div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <h3 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Info className="w-4 h-4" /> AI Nutrition Insight
               </h3>
               <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Calories', val: '450', unit: 'kcal' },
                    { label: 'Protein', val: '18', unit: 'g' },
                    { label: 'Carbon', val: '52', unit: 'g' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl text-center border border-gray-100 dark:border-slate-700">
                       <div className="text-gray-400 dark:text-slate-500 text-[9px] font-black uppercase mb-1">{stat.label}</div>
                       <div className="text-lg font-black text-gray-900 dark:text-white">{stat.val}<span className="text-[10px] ml-0.5 opacity-50">{stat.unit}</span></div>
                    </div>
                  ))}
               </div>
               <p className="text-sm text-gray-500 dark:text-slate-400 font-medium leading-relaxed">
                  Our AI vision system has analyzed this bento. It contains high protein and moderate carbs, ideal for a post-work meal. All ingredients are fresh from WinMart local supply chain.
               </p>
            </div>
         </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 inset-x-0 px-6 z-50">
         <div className="max-w-4xl mx-auto flex gap-4">
            <button className="flex-1 bg-[#ff8c00] hover:bg-[#e67e22] text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-orange-500/30 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] uppercase tracking-widest text-sm">
               <ShoppingBag className="w-5 h-5" /> Rescue Now
            </button>
            <button className="w-20 bg-black dark:bg-white text-white dark:text-black rounded-[2rem] flex items-center justify-center shadow-xl transition-all hover:scale-105">
               <ShieldCheck className="w-6 h-6" />
            </button>
         </div>
      </div>
    </div>
  );
}
