'use client';

import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col items-center justify-center transition-colors duration-300">
      <div className="relative w-24 h-24">
         <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-[#057A42]/10 dark:border-white/5 rounded-[2rem]"
         />
         <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 border-t-4 border-[#057A42] dark:border-emerald-500 rounded-2xl"
         />
         <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-black text-[#057A42] dark:text-emerald-400 italic">F</span>
         </div>
      </div>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-gray-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse"
      >
        Initializing F.R.E.S.H AI...
      </motion.div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 border border-gray-100 dark:border-white/5 shadow-sm space-y-4 animate-pulse">
       <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-xl" />
       <div className="space-y-2">
          <div className="w-3/4 h-4 bg-gray-100 dark:bg-slate-700 rounded-md" />
          <div className="w-1/2 h-3 bg-gray-50 dark:bg-slate-750 rounded-md" />
       </div>
       <div className="w-full h-10 bg-gray-100 dark:bg-slate-700 rounded-xl mt-4" />
    </div>
  );
}
